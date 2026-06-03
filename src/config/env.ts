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
  /** Active AI provider. MVP is locked to the cost-free mock. */
  AI_PROVIDER: z.enum(["mock"]).default("mock"),
  /** Auth.js signing secret — required. Generate with: openssl rand -base64 32 */
  AUTH_SECRET: z.string().min(1),
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
