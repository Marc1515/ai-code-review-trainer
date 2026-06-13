"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

import { auth } from "@/auth";
import type { ReviewResult } from "@/modules/reviews/domain/types";
import { reviewInputSchema } from "@/modules/reviews/schemas/review.schema";
import { createCodeReview } from "@/modules/reviews/use-cases/create-review";
import { checkRateLimit } from "@/shared/security/rate-limiter";

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
  | { status: "success"; result: ReviewResult };

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

  const parsed = reviewInputSchema.safeParse({
    code: formData.get("code"),
    language:
      typeof languageRaw === "string" && languageRaw.trim() ? languageRaw.trim() : undefined,
    reviewType: formData.get("reviewType"),
  });

  if (!parsed.success) {
    return { status: "error", code: "validation" };
  }

  try {
    const result = await createCodeReview(parsed.data, userId);
    return { status: "success", result };
  } catch (err) {
    Sentry.captureException(err);
    console.error("[provider] review failed");

    if (err instanceof Error && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "OLLAMA_BUSY") return { status: "error", code: "provider-busy" };
      if (code === "OLLAMA_TIMEOUT") return { status: "error", code: "provider-timeout" };
      if (code === "OLLAMA_UNAVAILABLE") return { status: "error", code: "provider-unavailable" };
    }

    return { status: "error", code: "provider" };
  }
}
