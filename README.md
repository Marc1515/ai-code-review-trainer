# AI Code Review Trainer

An educational web app where you paste code and receive a structured,
mentor-style code review from an AI. The reviewer explains _why_ each issue
matters and suggests concrete improvements across several review lenses.

> **Current status:** manual code paste only, powered by a **local Ollama**
> server-side AI (zero cost for owner and users). No API key needed. The
> `mock` provider is available as a local/demo/testing fallback. BYOK is
> postponed — see [DECISIONS.md](./DECISIONS.md).

## Review types

`general` · `clean-code` · `bugs` · `security` · `performance` ·
`architecture` · `testing`

## Tech stack

- **Next.js** (App Router) · **React** · **TypeScript**
- **Tailwind CSS** · **Shadcn UI**
- **Zod** (validation) · **Prisma** + **PostgreSQL**
- **Auth.js / NextAuth** (GitHub + Google)
- **ESLint** · **Prettier** · **Husky** · **lint-staged**
- **Docker** / **Docker Compose** · **Traefik** · **GitHub Actions** (self-hosted runner)
- **Sentry** (error monitoring, active)

> This project uses **pnpm only**. Do not use npm, yarn, or bun.

## Getting started

```bash
pnpm install
cp .env.example .env        # fill in values; AI_PROVIDER=ollama by default
pnpm dev                    # http://localhost:3000
```

## Scripts

| Script              | Purpose                              |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start the dev server                 |
| `pnpm build`        | Production build                     |
| `pnpm start`        | Run the production build             |
| `pnpm lint`         | ESLint                               |
| `pnpm lint:fix`     | ESLint with autofix                  |
| `pnpm format`       | Prettier (write)                     |
| `pnpm format:check` | Prettier (check only)                |
| `pnpm typecheck`    | TypeScript, no emit                  |

A Husky `pre-commit` hook runs `lint-staged` (ESLint + Prettier on staged files).

## Internationalization

UI is **Spanish-first** (`es`, default) with **English** (`en`) secondary.
Code, comments, and technical documentation are written in **English**.

## Documentation

| File                                 | Contents                                        |
| ------------------------------------ | ----------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers, dependency rule, ports & adapters       |
| [DECISIONS.md](./DECISIONS.md)       | Architecture decision records                   |
| [PROMPTS.md](./PROMPTS.md)           | Review prompt templates; untrusted-code handling|
| [SECURITY.md](./SECURITY.md)         | Threat model and security rules                 |
| [DEPLOYMENT.md](./DEPLOYMENT.md)     | VPS, Docker, Traefik, CI/CD                      |
| [CLAUDE.md](./CLAUDE.md)             | Conventions for AI coding agents                |

## Security in one line

The app **analyzes** code but **never executes** it. User-submitted code is
untrusted **data**, never instructions. See [SECURITY.md](./SECURITY.md).
