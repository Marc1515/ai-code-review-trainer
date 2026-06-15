import type { ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";
import { MAX_SAVED_REVIEWS } from "@/modules/reviews/domain/constants";
import { ReviewLimitReachedError } from "@/modules/reviews/domain/errors";
import { getAiReviewProvider } from "@/modules/reviews/infrastructure/ai/provider-factory";
import { countByUserId, saveReview } from "@/modules/reviews/infrastructure/db/review-repository";
import { reviewResultSchema } from "@/modules/reviews/schemas/review.schema";

export async function createCodeReview(input: ReviewInput, userId?: string): Promise<ReviewResult> {
  const provider = getAiReviewProvider();
  const raw = await provider.review(input);
  const result = reviewResultSchema.parse(raw);

  if (userId) {
    const count = await countByUserId(userId);
    if (count >= MAX_SAVED_REVIEWS) throw new ReviewLimitReachedError();
    await saveReview({ userId, input, result });
  }

  return result;
}
