# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Golden rules

- **pnpm only.** Never use npm, yarn, or bun. Install with `pnpm add`, scripts via `pnpm <script>`.
- **Never execute user-submitted code**, and never add `eval`/`Function`/shell execution of user input. Code is **data**, not instructions. See [SECURITY.md](./SECURITY.md) and [PROMPTS.md](./PROMPTS.md).
- **No paid AI in the MVP.** Default provider is `MockAiReviewProvider`. Real AI is future **BYOK** only (see [DECISIONS.md](./DECISIONS.md)).
- **Never commit secrets** or real env files. Only `*.example` templates are committed.
- Keep secrets server-side; only `NEXT_PUBLIC_*` may reach the client.

## Commands

```bash
pnpm dev              # start dev server (localhost:3000)
pnpm build            # production build
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm format           # Prettier write
pnpm format:check     # Prettier check (CI)
```

Prisma:

```bash
pnpm prisma migrate dev --name <name>   # create + apply a migration
pnpm prisma generate                    # regenerate client after schema changes
pnpm prisma studio                      # GUI browser for the DB
```

Env setup: copy `.env.example` → `.env` and fill in `DATABASE_URL`, `AUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

The Husky `pre-commit` hook runs `lint-staged` automatically. Before committing manually, run `pnpm lint && pnpm typecheck && pnpm format:check`.

## Architecture (respect the boundaries)

Modular, Clean/Hexagonal-inspired. Dependencies point inward — framework details depend on the domain, not the other way around.

```
UI (React)  ──▶  Server Action  ──▶  Use-case  ──▶  Port (interface)
                                                       ▲
                                          Adapter implements port
                                  (MockAiReviewProvider, Prisma repo)
```

Layer rules:

- `modules/*/domain` — framework-free types **and ports** (interfaces) only.
- `modules/*/use-cases` — depend on domain + ports; never import React, Next.js, Prisma, or a concrete provider.
- `modules/*/infrastructure/*` — adapters implementing the module's ports (AI providers, repositories).
- `server/actions` — thin Server Actions; validate FormData with Zod, call use-cases, return typed state. No business logic.
- `modules/*/ui`, `components/ui` — presentation only; no persistence or AI calls.
- `shared/*`, `config/*` — cross-module utilities and config. Do **not** add a generic `core` directory.
- Import alias: `@/*` → `src/*`.

## Review flow (end-to-end)

1. UI form submits → `server/actions/review.action.ts` validates with `reviewInputSchema` (Zod).
2. Action calls `auth()` server-side to resolve `userId` (anonymous if absent).
3. Action calls `createCodeReview(input, userId?)` use-case.
4. Use-case calls `getAiReviewProvider()` and validates provider output with `reviewResultSchema`.
5. If `userId` is present, use-case calls `saveReview()` in the repository — **anonymous reviews are never persisted**.
6. Structured `ReviewResult` is returned to the UI.

To add a new AI provider: implement the `AiReviewProvider` port and wire it in `provider-factory.ts` — no other layer changes needed.

## Prisma / data access patterns

- `Review.userId` is nullable — only authenticated users' reviews are stored.
- All repository queries that fetch reviews **must filter by `userId`** to prevent cross-user data exposure. See `listReviewsByUser` and (future) `getReviewByIdAndUser` in `infrastructure/db/review-repository.ts` for the pattern.
- Shared singleton client: `src/shared/db/client.ts` — import `prisma` from there everywhere. Never instantiate `PrismaClient` elsewhere.
- After any schema change, run `pnpm prisma generate` before `pnpm typecheck`.

## Auth / session

- `auth()` from `src/auth.ts` is the server-side session accessor — call it in Server Actions and page components, never in UI components.
- With `PrismaAdapter`, `session.user.id` is populated at runtime but **not typed by default**. Access it as `session?.user?.id` and treat it as `string | undefined`. Add a `next-auth.d.ts` augmentation if stricter typing is needed.
- `AuthHeader` catches errors from `auth()` and renders an unauthenticated state — this handles unconfigured environments gracefully.

## Validation

- Validate Server Action input and provider output with **Zod**.
- `MAX_CODE_LENGTH = 10_000` characters enforced on review input.
- Submitted code is treated as untrusted data — render as inert text only, never as executable HTML.

## i18n

- Spanish (`es`) is the default UI language; English (`en`) is secondary.
- Code, comments, and docs are in **English**. User-facing strings go through next-intl message catalogs (`src/i18n/messages/{es,en}.json`).
- Routes are locale-prefixed via `src/i18n/routing.ts` and middleware.
- `ReviewResult` UI component is `"use client"` (uses `useTranslations`). Server page components use `getTranslations` from `next-intl/server`.

## Phasing

Completed: scaffold → next-intl i18n → mock review flow → auth → authenticated persistence → dashboard (list).  
**Current phase:** review detail page.  
Next: infra/deploy → post-MVP (Sentry, BYOK, simulated pull requests).

Don't pull later-phase work forward. Off-limits until explicitly planned: edit/delete reviews, pagination, real AI providers, BYOK, Sentry, Docker/CI changes.
