# Testing Strategy

Pragmatic and portfolio-defensible. Tests cover critical pure logic where
automation adds real signal. Layers that require a live database, the Next.js
runtime, or a real Ollama instance are verified by the QA checklist instead of
forced into bad mocks.

## Test runner

**Vitest 4.x** — TypeScript-native, fast, compatible with the project's ESM +
path-alias (`@/*`) setup.

```bash
pnpm test          # single run (CI mode)
pnpm test:watch    # interactive watch mode
```

## What is tested (unit)

All test files live in `src/tests/`.

| File | Covers |
|---|---|
| `review-schema.test.ts` | `reviewResultSchema` and `reviewInputSchema` Zod validation — valid payloads accepted, missing fields rejected, invalid severity/type rejected, boundary lengths |
| `language-utils.test.ts` | `resolveLocale` explicit preferences (`es`, `en`), system fallback in a non-browser environment, `SUPPORTED_LOCALES` / `DEFAULT_LOCALE` constant contracts |
| `provider-factory.test.ts` | `getAiReviewProvider()` — correct provider selected per `AI_PROVIDER` value (`mock` → `MockAiReviewProvider`, `ollama` → `OllamaAiReviewProvider`, default → Ollama); no paid provider returned for any supported configuration |
| `rate-limiter.test.ts` | `checkRateLimit` — anonymous IP keying, authenticated userId keying, inclusive limits (5 anon / 15 auth), independent windows per key, 60-second window reset |

## What is NOT unit-tested (by design)

| Area | Reason |
|---|---|
| Prisma queries / DB layer | Requires a live PostgreSQL container; mocking Prisma in detail produces false confidence |
| Next.js Server Actions | Tightly coupled to the Next.js request/response runtime |
| Ollama provider `.review()` | Makes real network calls; verified via QA checklist |
| React components | No component testing tools added in this phase |
| Auth flows | Require real OAuth providers; tested manually via QA checklist |

These are covered by `docs/QA_CHECKLIST.md`.

## Test setup

`src/tests/setup.ts` runs before every test file and:

1. **Mocks `server-only`** — Next.js's server-only guard throws outside the
   framework's module system. The mock neutralises it so server modules can be
   imported in plain Node.js (Vitest's runtime).
2. **Provides minimum env vars** — `AUTH_SECRET` and `NODE_ENV=test` so
   `getServerEnv()` does not throw a validation error during import.

## Test rules (non-negotiable)

- Tests never call real PostgreSQL, Ollama, or any external network.
- Tests never require Docker to be running.
- Tests never execute, compile, eval, or sandbox user-submitted code.
- Tests never log full user code or secrets.
- Tests never import or test paid cloud AI providers (OpenAI, Anthropic, Gemini).
