import type { AiReviewProvider } from "@/modules/reviews/domain/ports/ai-review-provider";
import { MockAiReviewProvider } from "@/modules/reviews/infrastructure/ai/mock-ai-review-provider";

/**
 * Selects the active AI review provider.
 *
 * The MVP always returns the MockAiReviewProvider (cost policy: the owner
 * never pays for public users). A future BYOK provider will be selected here
 * based on the authenticated user's configuration — without any caller change.
 */
export function getAiReviewProvider(): AiReviewProvider {
  return new MockAiReviewProvider();
}
