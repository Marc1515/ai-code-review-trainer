"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/auth";
import type { ReviewResult } from "@/modules/reviews/domain/types";
import {
  cleanupExpiredReviewGenerations,
  completeReviewGeneration,
  failReviewGeneration,
  getReviewGenerationByClientRequestId,
  startReviewGeneration,
} from "@/modules/reviews/infrastructure/db/review-generation-repository";
import { reviewInputSchema } from "@/modules/reviews/schemas/review.schema";
import { findCompletedReviewForUser } from "@/modules/reviews/infrastructure/db/review-repository";
import { createCodeReview } from "@/modules/reviews/use-cases/create-review";
import { checkRateLimit } from "@/shared/security/rate-limiter";

type ReviewErrorCode = Extract<ReviewActionState, { status: "error" }>["code"];

export type ReviewActionState =
  | { status: "idle" }
  | {
      status: "error";
      code:
        | "validation"
        | "provider"
        | "rate-limit"
        | "provider-busy"
        | "provider-timeout"
        | "provider-unavailable";
    }
  | { status: "success"; result: ReviewResult; saved: boolean };

export type ReviewReconciliationState =
  | { status: "pending" }
  | { status: "error"; code: ReviewErrorCode }
  | { status: "success"; result: ReviewResult; saved: boolean };

const clientRequestIdSchema = z
  .string()
  .min(8)
  .max(100)
  .regex(/^[a-zA-Z0-9_-]+$/);

const relaxedReviewReconciliationSchema = z.object({
  clientRequestId: clientRequestIdSchema.optional(),
  code: z.string().optional(),
  language: z.string().max(50).optional(),
  reviewType: reviewInputSchema.shape.reviewType.optional(),
  startedAt: z.number().int().positive().optional(),
});

function toReviewErrorCode(err: unknown): ReviewErrorCode {
  if (err instanceof Error && "code" in err) {
    const code = (err as { code: string }).code;
    if (code === "OLLAMA_BUSY") return "provider-busy";
    if (code === "OLLAMA_TIMEOUT") return "provider-timeout";
    if (code === "OLLAMA_UNAVAILABLE") return "provider-unavailable";
  }

  return "provider";
}

function captureExpectedProviderError(err: unknown, code: ReviewErrorCode) {
  if (!(err instanceof Error)) return;

  if (code === "provider-busy") return;
  if (code === "provider-timeout") {
    console.error("[provider] timeout");
    Sentry.captureException(err);
    return;
  }
  if (code === "provider-unavailable") {
    console.error("[provider] unavailable");
    Sentry.captureException(err);
    return;
  }
  if ("code" in err && (err as { code: string }).code === "OLLAMA_INVALID_RESPONSE") {
    console.error("[provider] invalid response");
    Sentry.captureException(err);
  }
}

export async function reviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  // Resolve session first — needed to pick the correct rate-limit tier.
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id ?? undefined;
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured; proceed as anonymous.
  }

  const requestHeaders = await headers();
  const { allowed } = checkRateLimit(userId, requestHeaders);
  if (!allowed) {
    console.error("[rate-limit] blocked");
    return { status: "error", code: "rate-limit" };
  }

  const languageRaw = formData.get("language");
  const skipSave = formData.get("skipSave") === "true";
  const clientRequestIdRaw = formData.get("clientRequestId");
  let clientRequestId: string | undefined;
  if (typeof clientRequestIdRaw === "string") {
    const parsedClientRequestId = clientRequestIdSchema.safeParse(clientRequestIdRaw);
    if (!parsedClientRequestId.success) return { status: "error", code: "validation" };
    clientRequestId = parsedClientRequestId.data;
  }

  const parsed = reviewInputSchema.safeParse({
    code: formData.get("code"),
    language:
      typeof languageRaw === "string" && languageRaw.trim() ? languageRaw.trim() : undefined,
    reviewType: formData.get("reviewType"),
  });

  if (!parsed.success) {
    return { status: "error", code: "validation" };
  }

  if (clientRequestId) {
    await cleanupExpiredReviewGenerations();
    await startReviewGeneration({
      clientRequestId,
      input: parsed.data,
      userId,
    });
  }

  try {
    const { result, saved, reviewId } = await createCodeReview(
      parsed.data,
      userId,
      skipSave,
      clientRequestId,
    );

    if (clientRequestId) {
      await completeReviewGeneration({
        clientRequestId,
        result,
        saved,
        savedReviewId: reviewId,
      });
    }

    return { status: "success", result, saved };
  } catch (err) {
    const code = toReviewErrorCode(err);

    if (clientRequestId) {
      await failReviewGeneration(clientRequestId, code);
    }

    captureExpectedProviderError(err, code);
    if (code === "provider") {
      Sentry.captureException(err);
      console.error("[provider] unexpected error");
    }

    return { status: "error", code };
  }
}

export async function reconcileReviewAction(payload: unknown): Promise<ReviewReconciliationState> {
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id ?? undefined;
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured; no saved review can be reconciled.
  }

  const parsed = relaxedReviewReconciliationSchema.safeParse(payload);
  if (!parsed.success) return { status: "pending" };

  try {
    await cleanupExpiredReviewGenerations();

    if (parsed.data.clientRequestId) {
      const generation = await getReviewGenerationByClientRequestId(parsed.data.clientRequestId);

      if (generation) {
        if (generation.status === "success" && generation.result) {
          return {
            status: "success",
            saved: generation.saved,
            result: generation.result,
          };
        }

        if (generation.status === "error") {
          return {
            status: "error",
            code: (generation.errorCode as ReviewErrorCode | undefined) ?? "provider",
          };
        }

        return { status: "pending" };
      }
    }

    if (!userId) {
      return { status: "pending" };
    }

    if (!parsed.data.code || !parsed.data.reviewType) return { status: "pending" };

    const review = await findCompletedReviewForUser({
      userId,
      clientRequestId: parsed.data.clientRequestId,
      input: {
        code: parsed.data.code ?? "",
        language: parsed.data.language,
        reviewType: parsed.data.reviewType ?? "general",
      },
      startedAt:
        parsed.data.startedAt !== undefined ? new Date(parsed.data.startedAt - 5_000) : undefined,
    });

    if (!review) return { status: "pending" };

    return {
      status: "success",
      saved: true,
      result: {
        reviewType: review.reviewType as ReviewResult["reviewType"],
        summary: review.summary,
        findings: review.findings,
      },
    };
  } catch (err) {
    Sentry.captureException(err);
    return { status: "pending" };
  }
}
