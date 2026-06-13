import { z } from "zod";

/**
 * Server-side environment validation.
 *
 * Phase 0 skeleton: only the variables that exist today. Auth, database and
 * provider keys are added in their respective phases. Never expose secrets to
 * the client — only `NEXT_PUBLIC_*` values may cross that boundary.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Active AI provider. "ollama" is the default (free, server-side). "mock" for local dev/testing. */
  AI_PROVIDER: z.enum(["mock", "ollama"]).default("ollama"),
  /** Ollama base URL — only used when AI_PROVIDER=ollama. */
  OLLAMA_BASE_URL: z.string().url().default("http://ollama:11434"),
  /** Ollama model name. */
  OLLAMA_MODEL: z.string().min(1).default("qwen2.5-coder:3b"),
  /** Ollama request timeout in milliseconds. */
  OLLAMA_TIMEOUT_MS: z.coerce.number().int().positive().default(90_000),
  /** Auth.js signing secret — required. Generate with: openssl rand -base64 32 */
  AUTH_SECRET: z.string().min(1),
  /** Rate limiting — anonymous users: max requests per window. */
  RATE_LIMIT_ANON_MAX: z.coerce.number().int().positive().default(5),
  /** Rate limiting — authenticated users: max requests per window. */
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(15),
  /** Rate limit window in milliseconds. */
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  /** Sentry DSN — optional. When absent, Sentry is disabled (no events sent). */
  SENTRY_DSN: z.string().url().optional(),
  /** Sentry environment tag. Defaults to NODE_ENV when unset. */
  SENTRY_ENVIRONMENT: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment variables:\n${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}
