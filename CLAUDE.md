# CLAUDE.md — conventions for AI coding agents

Guidance for any AI agent (or human) working in this repo. Read this and the
docs it links before making changes.

## Golden rules

- **pnpm only.** Never use npm, yarn, or bun. Install with `pnpm add`,
  scripts via `pnpm <script>`.
- **Never execute user-submitted code**, and never add `eval`/`Function`/shell
  execution of user input. Code is **data**, not instructions. See
  [SECURITY.md](./SECURITY.md) and [PROMPTS.md](./PROMPTS.md).
- **No paid AI in the MVP.** Default provider is `MockAiReviewProvider`. Real
  AI is future **BYOK** only (see [DECISIONS.md](./DECISIONS.md)).
- **Never commit secrets** or real env files. Only `*.example` templates are
  committed.
- Keep secrets server-side; only `NEXT_PUBLIC_*` may reach the client.

## Architecture (respect the boundaries)

See [ARCHITECTURE.md](./ARCHITECTURE.md). The dependency rule points inward:

- `modules/*/domain` — framework-free types **and ports** (interfaces) only.
- `modules/*/use-cases` — depend on domain + ports; never import React,
  Next.js, Prisma, or a concrete provider.
- `modules/*/infrastructure/*` — adapters that implement the module's ports
  (AI providers, repositories).
- `server/actions` — thin Server Actions; no business logic.
- `modules/*/ui`, `components/ui` — presentation only.
- `shared/*`, `config/*` — cross-module reusable utilities and config. Do **not**
  add a generic `core` directory.
- Import alias: `@/*` → `src/*`.

When adding AI behaviour, implement the `AiReviewProvider` port and wire it in
`modules/reviews/infrastructure/ai/provider-factory.ts` — do not call providers
directly from use-cases or UI.

## Validation

- Validate Server Action input and provider output with **Zod**.
- Enforce code-length limits on review input.

## i18n

- Spanish (`es`) is the default UI language; English (`en`) is secondary.
- Code, comments, and docs are in **English**. User-facing strings go through
  next-intl message catalogs. **next-intl setup is the next step, before the
  review feature is implemented.**

## Quality gates

Before committing, code should pass:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
```

The Husky `pre-commit` hook runs `lint-staged` automatically.

## Phasing

The project is built in phases (see the README / plan): scaffold → **next-intl
i18n setup (next step)** → mock review flow → auth & persistence → infra/deploy
→ post-MVP (Sentry, BYOK, simulated pull requests). Don't pull later-phase work
forward without reason.
