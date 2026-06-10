import type { ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";
import { getAiReviewProvider } from "@/modules/reviews/infrastructure/ai/provider-factory";
import { saveReview } from "@/modules/reviews/infrastructure/db/review-repository";
import { reviewResultSchema } from "@/modules/reviews/schemas/review.schema";

export async function createCodeReview(input: ReviewInput, userId?: string): Promise<ReviewResult> {
  const provider = await getAiReviewProvider(userId);
  const raw = await provider.review(input);
  const result = reviewResultSchema.parse(raw);

  if (userId) {
    await saveReview({ userId, input, result });
  }

  return result;
}
