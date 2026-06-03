import type { ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";
import { getAiReviewProvider } from "@/modules/reviews/infrastructure/ai/provider-factory";
import { reviewResultSchema } from "@/modules/reviews/schemas/review.schema";

export async function createCodeReview(input: ReviewInput): Promise<ReviewResult> {
  const provider = getAiReviewProvider();
  const raw = await provider.review(input);
  return reviewResultSchema.parse(raw);
}
