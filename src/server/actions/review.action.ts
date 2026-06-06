"use server";

import { auth } from "@/auth";
import type { ReviewResult } from "@/modules/reviews/domain/types";
import { reviewInputSchema } from "@/modules/reviews/schemas/review.schema";
import { createCodeReview } from "@/modules/reviews/use-cases/create-review";

export type ReviewActionState =
  | { status: "idle" }
  | { status: "error"; code: "validation" | "provider" }
  | { status: "success"; result: ReviewResult };

export async function reviewAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
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

  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id ?? undefined;
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured; proceed as anonymous.
  }

  try {
    const result = await createCodeReview(parsed.data, userId);
    return { status: "success", result };
  } catch {
    return { status: "error", code: "provider" };
  }
}
