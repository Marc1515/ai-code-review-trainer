import "server-only";
import { MockAiReviewProvider } from "@/modules/reviews/infrastructure/ai/mock-ai-review-provider";
import { OllamaAiReviewProvider } from "@/modules/reviews/infrastructure/ai/ollama-ai-review-provider";
import type { AiReviewProvider } from "@/modules/reviews/domain/ports/ai-review-provider";
import { getServerEnv } from "@/config/env";

export function getAiReviewProvider(): AiReviewProvider {
  const { AI_PROVIDER } = getServerEnv();
  if (AI_PROVIDER === "mock") return new MockAiReviewProvider();
  return new OllamaAiReviewProvider();
}
