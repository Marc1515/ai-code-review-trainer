import type { ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";
import { MAX_SAVED_REVIEWS } from "@/modules/reviews/domain/constants";
import { getAiReviewProvider } from "@/modules/reviews/infrastructure/ai/provider-factory";
import { countByUserId, saveReview } from "@/modules/reviews/infrastructure/db/review-repository";
import { reviewResultSchema } from "@/modules/reviews/schemas/review.schema";

export interface CreateReviewResult {
  result: ReviewResult;
  saved: boolean;
  reviewId?: string;
}

export async function createCodeReview(
  input: ReviewInput,
  userId?: string,
  skipSave = false,
  clientRequestId?: string,
): Promise<CreateReviewResult> {
  const provider = getAiReviewProvider();
  const raw = await provider.review(input);
  const result = reviewResultSchema.parse(raw);

  let saved = false;
  let reviewId: string | undefined;
  if (userId && !skipSave) {
    const count = await countByUserId(userId);
    if (count < MAX_SAVED_REVIEWS) {
      reviewId = await saveReview({ userId, input, result, clientRequestId });
      saved = true;
    }
  }

  return { result, saved, reviewId };
}
