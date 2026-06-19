# Security

The app **analyzes** code but **never executes** it. This document states the
threat model and the non-negotiable rules.

## Golden rules

1. **Never execute user code.** No `eval`, no `Function(...)`, no running,
   compiling, sandboxing, or shelling out with user-submitted code in the MVP.
2. **Code is data, not instructions.** Treat all submitted code as untrusted
   input. Prompts delimit it as data and instruct the model to ignore any
   embedded instructions (prompt injection). See [PROMPTS.md](./PROMPTS.md).
3. **Secrets stay server-side.** Never expose API keys or secrets to the
   client. Only `NEXT_PUBLIC_*` values may reach the browser.
4. **Never commit real env files.** Only `*.example` templates are committed;
   `.env`, `.env.*` (real) are git-ignored.

## Untrusted input handling

- All review input is validated with **Zod** at the Server Action boundary:
  required fields, allowed `reviewType` enum, and **code length limits** to
  bound payload size and abuse.
- Provider output is validated with Zod before rendering, so a misbehaving
  provider cannot inject arbitrary structure into the UI.
- Submitted code is rendered as inert text, never as executable HTML/markup.

## AI provider and cost policy

- The app uses a **local Ollama instance** server-side as the default AI provider
  (`AI_PROVIDER=ollama`). The owner incurs **no AI cost**; users incur **no AI
  cost** (see [DECISIONS.md](./DECISIONS.md), ADR-001).
- **No API key is required** to use the app. Users must never be asked to provide
  one in the current product.
- `AI_PROVIDER=mock` is available as a fallback for local development, demos, and
  testing only. No paid cloud provider (OpenAI, Anthropic, Gemini, etc.) is wired
  as the default or fallback.
- **Ollama is server-side only.** The Ollama endpoint must never be publicly
  exposed. In Docker networking, the app reaches Ollama via
  `OLLAMA_BASE_URL=http://ollama:11434`. From the VPS host, it may be tested at
  `http://127.0.0.1:11434` (blocked externally by the firewall).
- If Ollama is busy, the app returns a clear busy state to the user.
- If Ollama is unavailable, the app returns a demo-safe unavailable result.
- **BYOK is postponed** (ADR-002). No BYOK UI, no API-key storage, and no paid
  provider are active. If BYOK resumes, the key-handling rules below apply.

## BYOK API key rules *(deferred — BYOK is postponed; see ADR-002)*

These rules are non-negotiable **if and when BYOK is re-activated**. They are
kept here for reference.

1. **Server-only.** The decrypted API key exists only in server memory, for the
   duration of one request. It is never serialised, never returned from a
   function as part of a public value, and never sent to the client.
2. **Never logged.** No `console.log`, `console.error`, or structured logger may
   receive a key or a value that contains one. Log the provider name and model
   only.
3. **Never sent to Sentry.** The Sentry `beforeSend` hook must strip any event
   field named `apiKey`, `encryptedApiKey`, `decryptedKey`, or similar. This
   extends the existing `code`/`input` stripping already in place.
4. **Encrypted at rest.** Only AES-256-GCM ciphertext is stored in the DB. The
   `ENCRYPTION_KEY` env var (VPS-only, never committed) is the sole secret.
   See ADR-011.
5. **Never returned to the browser.** The settings Server Action that saves a
   key must not echo it back; the UI may only confirm success or failure.
6. **Isolated per user.** All `UserProviderConfig` queries filter by `userId`.
   No code path allows one user to read or use another user's key. See ADR-012.

## Authentication & data

- Auth via Auth.js / NextAuth (GitHub, Google).
- Review history is persisted **only for authenticated users**; anonymous use
  is stateless and stores no PII.
- Dev and prod use **separate** PostgreSQL databases/containers (ADR-007).

## Secrets management

- Local: copy `.env.example` → `.env`; fill real values locally only.
- Server: env files live on the VPS outside version control and are injected
  into containers by Docker Compose. See [DEPLOYMENT.md](./DEPLOYMENT.md).
- `AUTH_SECRET` is generated with `openssl rand -base64 32` and is unique per
  environment.

## Observability

- **Sentry** is active (`@sentry/nextjs`). Three guarantees are enforced by `beforeSend` in all three Sentry config files (client, server, edge):
  1. `event.request.data` is always deleted — no FormData or request bodies leave the server.
  2. `event.extra.code` and `event.extra.input` are deleted — use-case inputs cannot leak via manually attached context.
  3. Breadcrumbs carrying a `code` or `input` data key are dropped.
- Sentry is **disabled when `SENTRY_DSN` is blank** — local dev without a DSN configured produces no traffic.
- Source map upload is intentionally deferred (see ADR-009). Stack traces show minified identifiers until enabled.
- The test error route (`GET /api/test-error`) returns 404 in production and throws intentionally in other environments.

## Rate Limiting

Requests to the review Server Action are rate-limited using an in-memory
fixed-window counter (`src/shared/security/rate-limiter.ts`).

**Limits (configurable via env vars; container restart/recreate is required after env changes):**

| User type     | Default limit | Env var               |
|---------------|---------------|-----------------------|
| Anonymous     | 5 req / 60 s  | `RATE_LIMIT_ANON_MAX` |
| Authenticated | 15 req / 60 s | `RATE_LIMIT_AUTH_MAX` |
| Window        | 60 000 ms     | `RATE_LIMIT_WINDOW_MS`|

**Key strategy:**
- Authenticated users are keyed by their stable `userId` — not spoofable.
- Anonymous users are keyed by `X-Forwarded-For` (first IP, set by Traefik) or
  `X-Real-IP`; falls back to `"unknown"` in local dev without a proxy.

**Known limitations of in-memory rate limiting (acceptable for MVP):**

1. **Per-process state.** Each Node.js worker tracks its own counters. On this
   single-container VPS deployment this is not a concern; a clustered or
   multi-replica setup would allow users to exceed limits across processes.
2. **Resets on restart.** Counters clear on every container restart or deploy.
3. **IP spoofing.** `X-Forwarded-For` can be manipulated if traffic bypasses
   Traefik and reaches the container directly. Ensure the VPS firewall blocks
   direct access to the container port.
4. **No persistence.** Limits are not stored to disk or a shared store.

**Upgrade path:** When scaling horizontally, replace the `Map`-based store in
`rate-limiter.ts` with a Redis or Upstash adapter. The `checkRateLimit`
interface and all callers remain unchanged.

## Transport

- Production and development are served over HTTPS via Traefik. TLS termination
  and routing are handled by the reverse proxy (external network `traefik-proxy`).
