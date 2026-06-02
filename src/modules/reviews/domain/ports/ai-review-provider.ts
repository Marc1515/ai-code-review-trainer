import type { ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";

/**
 * Port: the boundary the application depends on to obtain a review.
 *
 * This is a domain contract — it depends only on domain types, never on a
 * concrete provider. Adapters in `../../infrastructure/ai` implement it
 * (MockAiReviewProvider for the MVP, a future BYOK provider that calls a real
 * model). Use-cases depend on this port only, so providers can be swapped
 * without touching application logic.
 */
export interface AiReviewProvider {
  review(input: ReviewInput): Promise<ReviewResult>;
}
