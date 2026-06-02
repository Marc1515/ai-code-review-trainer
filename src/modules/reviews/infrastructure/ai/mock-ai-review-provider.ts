import type { AiReviewProvider } from "@/modules/reviews/domain/ports/ai-review-provider";
import type { ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";

/**
 * Default MVP adapter. Returns a deterministic, canned review so the platform
 * owner never incurs AI usage costs for public users.
 *
 * Phase 0 skeleton — the real mock heuristics/templates land in Phase 1.
 * NOTE: user-submitted `code` is data, never executed or interpolated into
 * any instruction. See SECURITY.md and PROMPTS.md.
 */
export class MockAiReviewProvider implements AiReviewProvider {
  async review(input: ReviewInput): Promise<ReviewResult> {
    // TODO(phase-1): produce a structured, mentor-style mock review.
    return {
      reviewType: input.reviewType,
      summary: "Mock provider not yet implemented.",
      findings: [],
    };
  }
}
