# Architecture Decision Records

Lightweight ADRs. Each records a decision, its context, and consequences.
Status: `accepted` unless noted.

---

## ADR-001 — Local Ollama as default AI provider; owner and users pay zero

**Context.** This is a public educational app. Real model usage costs money and
is trivially abusable by anonymous traffic.

**Decision.** The app uses a **local Ollama instance** (server-side, never
publicly exposed) as the default AI provider. Default model: `qwen2.5-coder:3b`;
lightweight alternative: `qwen2.5-coder:1.5b`. The `MockAiReviewProvider` is
retained as a fallback for local development, demos, and testing
(`AI_PROVIDER=mock`). No paid cloud provider (OpenAI, Anthropic, Gemini, etc.)
is used as the default or fallback.

**Consequences.** Zero AI cost for the owner and for users. No API key is
required to use the app. Ollama must be running server-side and must not be
exposed publicly. If Ollama is busy, the app returns a clear busy state; if
unavailable, it returns a demo-safe unavailable result.

---

## ADR-002 — BYOK (bring your own key) is postponed / out of scope

**Context.** Users may want real reviews via a paid cloud provider of their
choice, but the current product decision is to keep costs at zero for both
owner and users by using local Ollama (ADR-001).

**Decision.** BYOK is **postponed and out of scope** for the current product.
It may return in a future phase, but no BYOK UI, no API-key storage, and no
paid provider are active or wired in the app today.

**Consequences.** Users never need to provide an API key. The `AiReviewProvider`
port is already designed for swappable providers, so BYOK can be added later
without architecture changes. The `UserProviderConfig` Prisma table exists from
prior design work but is dormant; no migrations are needed to defer BYOK.

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

**Consequences.** Standard, scalable i18n. next-intl adds a `[locale]` routing
segment and middleware; both are fully implemented.

---

## ADR-006 — Anonymous reviews allowed; persist only when authenticated

**Context.** We want low friction for trying the tool, but also review history
for signed-in users.

**Decision.** Anyone can run a review (stateless). History is persisted **only**
for users authenticated via GitHub/Google.

**Consequences.** Simple anonymous path. Persistence and auth are implemented
and active. No PII stored for anonymous users.

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

## ADR-011 — BYOK key storage: encrypted at rest, server-only *(postponed — see ADR-002)*

**Context.** This ADR was designed alongside BYOK (ADR-002), which is now
postponed.

**Decision.** No action. The design (AES-256-GCM, `ENCRYPTION_KEY` env var,
server-only plaintext lifetime) is documented here for reference when BYOK
resumes. `ENCRYPTION_KEY` is **not validated** in `config/env.ts` and is
**not required** in the current product.

**Consequences.** No change to current deployment. When BYOK resumes, this
ADR provides the implementation contract.

---

## ADR-012 — BYOK provider selection is per-user, not a global env flag *(postponed — see ADR-002)*

**Context.** This ADR was designed alongside BYOK (ADR-002), which is now
postponed.

**Decision.** No action. The design (per-user factory lookup, `UserProviderConfig`
table, `userId`-scoped queries) is documented here for reference when BYOK
resumes. The `UserProviderConfig` Prisma table exists from prior design work
but is dormant — it is not queried by the active review flow.

The current active provider selection is simpler:

```
getAiReviewProvider()
  ├── AI_PROVIDER=ollama  →  OllamaAiReviewProvider   (default)
  └── AI_PROVIDER=mock    →  MockAiReviewProvider     (local/demo/testing)
```

**Consequences.** All users (anonymous and authenticated) use the same
server-side Ollama provider. No user sees another's data. When BYOK resumes,
the per-user factory design can be layered on top without changing callers.
