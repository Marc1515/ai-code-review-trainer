import "server-only";
import { BYOKAiReviewProvider } from "@/modules/reviews/infrastructure/ai/byok-ai-review-provider";
import { MockAiReviewProvider } from "@/modules/reviews/infrastructure/ai/mock-ai-review-provider";
import { getUserProviderConfig } from "@/modules/reviews/infrastructure/db/user-provider-config-repository";
import type { AiReviewProvider } from "@/modules/reviews/domain/ports/ai-review-provider";
import { decrypt } from "@/shared/security/crypto";

// Anonymous users and authenticated users with no saved config always get the
// mock provider — the owner never pays AI costs for any user.
export async function getAiReviewProvider(userId?: string): Promise<AiReviewProvider> {
  if (!userId) return new MockAiReviewProvider();

  const config = await getUserProviderConfig(userId);
  if (!config) return new MockAiReviewProvider();

  // Only "anthropic" is supported in Phase 11. Unknown provider names fall back
  // to mock rather than throwing, so a stale DB row never breaks reviews.
  if (config.providerName !== "anthropic") return new MockAiReviewProvider();

  // decrypt throws if ENCRYPTION_KEY is absent — propagate so the error is
  // captured by Sentry rather than silently falling back.
  const apiKey = decrypt(config.encryptedApiKey);
  return new BYOKAiReviewProvider(apiKey, config.providerModel);
}
