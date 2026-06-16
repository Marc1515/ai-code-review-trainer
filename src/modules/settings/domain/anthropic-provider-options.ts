// Client-safe: no server-only imports, no "use server".
// Model IDs verified against Anthropic documentation (June 2026).
// TODO: update when Anthropic releases new models.
export const ANTHROPIC_MODELS = ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"] as const;
export type AnthropicModel = (typeof ANTHROPIC_MODELS)[number];
