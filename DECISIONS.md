# Architecture Decision Records

Lightweight ADRs. Each records a decision, its context, and consequences.
Status: `accepted` unless noted.

---

## ADR-001 — Mock AI provider by default; owner never pays for public users

**Context.** This is a public educational app. Real model usage costs money and
is trivially abusable by anonymous traffic.

**Decision.** The MVP ships with a deterministic `MockAiReviewProvider` selected
by default. No paid AI usage exists in the MVP.

**Consequences.** Zero AI cost exposure for the owner. Reviews are canned but
demonstrate the full flow and UI. Real intelligence is deferred (see ADR-002).

---

## ADR-002 — Future real AI is BYOK (bring your own key)

**Context.** Users may want real reviews, but the owner must not absorb the cost.

**Decision.** Real AI usage will be opt-in for **authenticated** users who
supply their own API key; they are responsible for any cost. Selection happens
in `provider-factory.ts` behind the `AiReviewProvider` port.

**Consequences.** No caller changes when adding BYOK. Key storage/secret
handling must be designed carefully (server-only) when implemented.

---

## ADR-003 — Modular architecture (pragmatic Clean/Hexagonal)

**Context.** We want swappable AI/persistence and clear boundaries, without the
ceremony of a rigid layered framework.

**Decision.** Feature modules under `src/modules/<module>` own their `domain`
(types + ports), `schemas`, `use-cases`, `ui`, and `infrastructure` (adapters).
Cross-module reusable utilities live in `src/shared` and configuration in
`src/config` — there is **no generic `core` directory**. Dependencies point
inward. Not over-engineered.

**Consequences.** Easy to test and swap adapters; some boilerplate at seams.
AI-provider responsibilities live in `modules/reviews/infrastructure/ai`.

---

## ADR-004 — Server Actions for the main review flow

**Context.** The review flow is a simple form submit → process → render.

**Decision.** Use Next.js **Server Actions** as thin transport entrypoints that
delegate to use-cases. No separate REST/RPC layer for the MVP.

**Consequences.** Less boilerplate, colocated with the App Router. Actions stay
logic-free; business rules live in use-cases.

---

## ADR-005 — i18n via next-intl, Spanish-first

**Context.** Primary audience is Spanish-speaking; English is secondary.

**Decision.** Use **next-intl** with locale-prefixed routes and message
catalogs. Default locale `es`, secondary `en`. Code/docs remain English.

**Consequences.** Standard, scalable i18n. next-intl setup is the **next step,
before the review feature is implemented** — it adds a `[locale]` routing
segment and middleware.

---

## ADR-006 — Anonymous reviews allowed; persist only when authenticated

**Context.** We want low friction for trying the tool, but also review history
for signed-in users.

**Decision.** Anyone can run a review (stateless). History is persisted **only**
for users authenticated via GitHub/Google.

**Consequences.** Simple anonymous path; persistence and auth are additive
(Phase 3). No PII stored for anonymous users.

---

## ADR-007 — Separate persistent PostgreSQL containers per environment

**Context.** Dev and prod data must not mix, and DB data must survive deploys.

**Decision.** Two external, persistent containers:
`ai-code-review-trainer-postgres-dev` and `-postgres-prod`, managed by dedicated
`docker-compose.db.*.yml` files separate from the app compose files.

**Consequences.** Deploys recreate the app container without touching the DB.
DB lifecycle is managed independently.

---

## ADR-008 — Deploy via GitHub Actions self-hosted runner + Docker Compose + Traefik

**Context.** Deployment targets a single VPS with multiple environments behind
one reverse proxy.

**Decision.** `main` → production (`trainer.marcespana.com`), `dev` →
development (`dev-trainer.marcespana.com`). A self-hosted runner builds and runs
Docker Compose under `~/apps/ai-code-review-trainer`; **Traefik** (external
network `traefik-proxy`) handles routing and TLS.

**Consequences.** Branch-based environments, no third-party CI runners needed.
Runner host must be maintained.

---

## ADR-009 — Sentry: minimal error capture; source map upload deferred *(implemented — Phase 9)*

**Context.** Observability matters but should not block the core MVP. Phase 9
wires up the SDK with the minimum viable footprint.

**Decision.** Install `@sentry/nextjs`. Initialize via `sentry.{client,server,edge}.config.ts`
and `src/instrumentation.ts`. Capture unhandled exceptions and explicit
`captureException` calls. Apply `beforeSend` to strip request bodies and any
`code`/`input` fields so user-submitted code never reaches Sentry.

Source map upload (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) is
intentionally deferred: stack traces will show minified identifiers until that
phase. Enable by adding those three vars to the build environment and removing
`disableSourceMapUpload: true` from `next.config.ts`.

**Consequences.** Errors are captured in production with correct environment
tags. No user-submitted code or request bodies leave the server. Traces are
sampled at 5% in production and 0% in development to minimise noise and cost.

---

## ADR-010 — pnpm only

**Decision.** pnpm is the only supported package manager. Do not use npm, yarn,
or bun. `pnpm-workspace.yaml` pins which dependency build scripts are allowed.

---

## ADR-011 — BYOK key storage: encrypted at rest, server-only *(design — Phase 10)*

**Context.** BYOK (ADR-002) requires persisting each user's API key between
sessions. The key must never appear in plaintext in the database, in logs, in
Sentry events, or in any value returned to the client.

**Decision.** Store the key as AES-256-GCM ciphertext in a dedicated
`UserProviderConfig` table (see ADR-012). A single `ENCRYPTION_KEY` env var
(32-byte, base64; generated with `openssl rand -base64 32`) is the only secret
needed to decrypt it. The plaintext key exists only in server memory during the
single request that uses it; it is never returned from any function, never
logged, and never attached to Sentry context.

A future `shared/security/crypto.ts` module (starting with `import "server-only"`)
provides `encrypt(plaintext, key)` and `decrypt(ciphertext, key)` backed by
Node.js `crypto` (AES-256-GCM). No third-party crypto dependency is needed.

`ENCRYPTION_KEY` is a **Phase 11 requirement**. It is not active in the MVP and
is not validated in `config/env.ts` today; it will be added when the BYOK
implementation phase begins.

**Consequences.** A DB breach exposes only ciphertext. The `ENCRYPTION_KEY` on
the VPS is the sole sensitive secret; rotate it by re-encrypting stored keys.
Plain-text key storage is permanently off the table.

---

## ADR-012 — BYOK provider selection is per-user, not a global env flag *(design — Phase 10)*

**Context.** A global `AI_PROVIDER` env var that switches all users to a real
model would expose the owner to cost and abuse. BYOK must be opt-in per
authenticated user.

**Decision.** Provider selection is user-scoped:

```
getAiReviewProvider(userId?)
  ├── !userId  →  MockAiReviewProvider          (anonymous; no DB call)
  ├── userId, no config  →  MockAiReviewProvider (authenticated, not enrolled)
  └── userId, config present  →  BYOKAiReviewProvider(decryptedKey, model)
```

The factory becomes `async getAiReviewProvider(userId?: string)`. The use-case
passes `userId` in; no other layer changes. `AI_PROVIDER` in `env.ts` remains
locked to `"mock"` — it is not the BYOK switch.

Phase 11 starts with **one** real provider (Anthropic Claude) to reduce scope.
A second provider (OpenAI) may be added later without architecture changes.

The `UserProviderConfig` table (separate from the `User` model) stores:

| Column            | Type      | Notes                                  |
|-------------------|-----------|----------------------------------------|
| `id`              | `String`  | cuid primary key                       |
| `userId`          | `String`  | FK → `User.id`, unique                 |
| `providerName`    | `String`  | `"anthropic"` (Phase 11); extensible   |
| `providerModel`   | `String`  | e.g. `"claude-sonnet-4-6"`             |
| `encryptedApiKey` | `String`  | AES-256-GCM ciphertext, base64         |
| `createdAt`       | `DateTime`|                                        |
| `updatedAt`       | `DateTime`|                                        |

All repository queries on this table **must filter by `userId`** (same rule as
`listReviewsByUser`). The Prisma migration and the settings UI are Phase 11 work.

**Consequences.** Zero risk of one user seeing another's key. The owner never
pays for any review. Anonymous users and authenticated users without a key
always use the mock provider.
