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

## ADR-009 — Sentry documented now, implemented after the MVP flow

**Context.** Observability matters but should not block the core MVP.

**Decision.** Document Sentry env vars and intent now; wire it up after the
review flow is working.

**Consequences.** Env templates reserve `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`;
no Sentry SDK in the MVP.

---

## ADR-010 — pnpm only

**Decision.** pnpm is the only supported package manager. Do not use npm, yarn,
or bun. `pnpm-workspace.yaml` pins which dependency build scripts are allowed.
