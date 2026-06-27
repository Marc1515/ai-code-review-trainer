# Architecture

A **modular** architecture (feature modules under `src/modules`) inspired by
Clean Architecture and Hexagonal Architecture (ports & adapters) — applied
pragmatically, not dogmatically. The goal is clear boundaries that let us swap
the AI provider, persistence, and transport without rewriting business logic.

## Layers and the dependency rule

```
UI (React)  ──▶  Server Action  ──▶  Use-case  ──▶  Port (interface)
                                                       ▲
                                          Adapter implements port
                                  (Mock/BYOK AI provider, Prisma repo)
```

**Dependencies point inward.** Concrete details (React, Next.js, Prisma, AI
SDKs) depend on the domain; the domain depends on nothing framework-specific.

- **Domain** (`modules/*/domain`) — framework-free types and rules
  (`ReviewType`, `Finding`, `ReviewResult`, `ReviewInput`) plus the **ports**
  (`modules/*/domain/ports`) the application depends on (e.g. `AiReviewProvider`).
- **Use-cases** (`modules/*/use-cases`) — application logic; orchestrate ports.
  Depend only on domain + ports.
- **Adapters** (`modules/*/infrastructure/*`) — concrete implementations of the
  module's ports (mock AI provider, future BYOK provider, review repository).
- **Transport** (`server/actions`) — thin Server Actions adapting HTTP/form
  input to use-cases. No business logic.
- **UI** (`modules/*/ui`, `app`, `components/ui`) — React + Shadcn. No AI or
  persistence logic.
- **Shared / config** (`shared/*`, `config/*`) — cross-module reusable utilities
  (`shared/lib`, shared Prisma client in `shared/db`) and configuration
  (`config/env.ts`).

## Folder structure

```
src/
  app/[locale]/                  # App Router routes (locale-prefixed; added with next-intl)
  modules/
    reviews/
      domain/
        types.ts                 # framework-free types
        ports/                   # AiReviewProvider interface (domain contract)
      schemas/                   # Zod input/output schemas
      use-cases/                 # createReview orchestration
      ui/                        # React components (form, result view)
      infrastructure/
        ai/                      # MockAiReviewProvider (default) + provider-factory (BYOK future)
        db/                      # review repository (Phase 3)
  server/actions/                # Server Actions (thin entrypoints)
  shared/
    lib/                         # cross-module utilities (cn, ...)
    db/                          # shared Prisma client singleton
    security/                    # server-only security utilities (rate limiter)
  config/
    env.ts                       # environment validation (Zod)
  i18n/                          # next-intl config + messages/{es,en}.json (next step)
  components/ui/                 # Shadcn primitives
prisma/                          # schema.prisma + migrations (Phase 3)
```

## The main review flow

1. The UI form (paste textarea + review-type selector) submits to a Server
   Action in `server/actions`.
2. The action validates input with a **Zod** schema, then calls the
   `create-review` use-case.
3. The use-case resolves the active provider via `getAiReviewProvider()` (in
   `modules/reviews/infrastructure/ai`) and calls the `AiReviewProvider` port.
   Provider **output is validated with Zod** before it leaves the boundary.
4. The action records short-lived review-generation state by `clientRequestId`
   so the UI can recover a completed result if the browser tab is closed while
   Ollama is still processing.
5. For authenticated users, the final result is also persisted through the
   review repository (`modules/reviews/infrastructure/db`) as review history.
   Anonymous users do not get review history, only temporary recovery state.
6. The structured `ReviewResult` is returned to the UI and rendered.

## Ports & adapters: AI provider

`AiReviewProvider` is the single seam for AI behaviour:

- **Current default:** `OllamaAiReviewProvider` — server-side local Ollama,
  zero API cost, never exposed to the browser.
- **Testing/demo fallback:** `MockAiReviewProvider` — deterministic and
  cost-free when `AI_PROVIDER=mock`.
- **Deferred:** `BYOKAiReviewProvider` — postponed; if reactivated later it can
  be selected inside `provider-factory.ts` without changing use-cases or UI.

### Provider selection

Current active selection is environment-based:

```
getAiReviewProvider()
  ├── AI_PROVIDER=ollama  →  OllamaAiReviewProvider   (default)
  └── AI_PROVIDER=mock    →  MockAiReviewProvider     (local/demo/testing)
```

All active providers are server-side. The browser never receives model
credentials or direct access to Ollama. See ADR-001 and ADR-012.

### UserProviderConfig (Phase 11 DB table)

A dedicated `UserProviderConfig` table (not columns on `User`) holds each
enrolled user's provider name, model, and AES-256-GCM encrypted API key. BYOK is
postponed and this table is dormant in the active flow. If BYOK is reactivated,
all queries must filter by `userId`; `ENCRYPTION_KEY` will be the sole
server-only decryption secret. See ADR-011 and ADR-012.

## Conventions

- Import alias `@/*` → `src/*`.
- A module owns its `domain` (types + ports), `schemas`, `use-cases`, `ui`, and
  `infrastructure` (adapters). Cross-module reuse lives in `shared/` or
  `config/`, never in a generic `core`.
- Server-only modules never leak secrets to the client; only `NEXT_PUBLIC_*`
  values cross that boundary.
