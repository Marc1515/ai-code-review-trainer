import { beforeEach, describe, expect, it, vi } from "vitest";

// Tests use dynamic import() after vi.resetModules() so that each test gets a
// fresh module instance with its own env cache. No real Ollama is called —
// the factory only constructs the provider object; it does not call .review().

describe("getAiReviewProvider", () => {
  beforeEach(() => {
    // Reset module registry so getServerEnv() re-reads process.env fresh.
    vi.resetModules();
    // Ensure the minimum required env var is present after each reset.
    process.env.AUTH_SECRET = "test-secret-for-vitest";
  });

  it('returns MockAiReviewProvider when AI_PROVIDER is "mock"', async () => {
    process.env.AI_PROVIDER = "mock";
    const { getAiReviewProvider } =
      await import("@/modules/reviews/infrastructure/ai/provider-factory");
    const { MockAiReviewProvider } =
      await import("@/modules/reviews/infrastructure/ai/mock-ai-review-provider");
    expect(getAiReviewProvider()).toBeInstanceOf(MockAiReviewProvider);
  });

  it('returns OllamaAiReviewProvider when AI_PROVIDER is "ollama"', async () => {
    process.env.AI_PROVIDER = "ollama";
    const { getAiReviewProvider } =
      await import("@/modules/reviews/infrastructure/ai/provider-factory");
    const { OllamaAiReviewProvider } =
      await import("@/modules/reviews/infrastructure/ai/ollama-ai-review-provider");
    expect(getAiReviewProvider()).toBeInstanceOf(OllamaAiReviewProvider);
  });

  it("defaults to OllamaAiReviewProvider when AI_PROVIDER is not set", async () => {
    delete process.env.AI_PROVIDER;
    const { getAiReviewProvider } =
      await import("@/modules/reviews/infrastructure/ai/provider-factory");
    const { OllamaAiReviewProvider } =
      await import("@/modules/reviews/infrastructure/ai/ollama-ai-review-provider");
    expect(getAiReviewProvider()).toBeInstanceOf(OllamaAiReviewProvider);
  });

  it("never returns a paid-provider instance for any supported config", async () => {
    const SUPPORTED: Array<string | undefined> = ["mock", "ollama", undefined];

    for (const aiProvider of SUPPORTED) {
      vi.resetModules();
      process.env.AUTH_SECRET = "test-secret-for-vitest";

      if (aiProvider !== undefined) {
        process.env.AI_PROVIDER = aiProvider;
      } else {
        delete process.env.AI_PROVIDER;
      }

      const { getAiReviewProvider } =
        await import("@/modules/reviews/infrastructure/ai/provider-factory");
      const instance = getAiReviewProvider();

      // Must be one of the two zero-cost providers — never a paid cloud provider.
      expect(instance.constructor.name).toMatch(/^(MockAiReviewProvider|OllamaAiReviewProvider)$/);
    }
  });
});
