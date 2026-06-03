"use server";

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

  try {
    const result = await createCodeReview(parsed.data);
    return { status: "success", result };
  } catch {
    return { status: "error", code: "provider" };
  }
}
