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

## Run locally with Docker Compose

This is the recommended path for evaluation or demo. It starts the full local
stack:

- the Next.js app;
- PostgreSQL;
- Ollama;
- a one-shot Ollama initializer that downloads the Qwen code model.

Requirements:

- Git
- Docker Desktop, or Docker Engine + Docker Compose v2

Use the delivery branch below for the stable local version prepared for this
project submission:

```bash
git clone https://github.com/Marc1515/ai-code-review-trainer.git
cd ai-code-review-trainer
git checkout codex/master-project-delivery
docker compose -f docker-compose.local.yml up --build
```

Open the app at:

```text
http://localhost:3000
```

The first run can take several minutes because Docker builds the app image and
Ollama downloads `qwen2.5-coder:3b`. The model and database are kept in Docker
volumes, so later starts are faster.

Useful local Docker commands:

| Command | Purpose |
| --- | --- |
| `docker compose -f docker-compose.local.yml up --build` | Build and start the full local stack |
| `docker compose -f docker-compose.local.yml up` | Start again after the first build |
| `docker compose -f docker-compose.local.yml down` | Stop containers but keep data/model volumes |
| `docker compose -f docker-compose.local.yml down -v` | Stop and delete local database/model volumes |
| `docker compose -f docker-compose.local.yml logs -f app` | Follow app logs |
| `docker compose -f docker-compose.local.yml exec ollama ollama list` | Show downloaded Ollama models |

If port `3000` is already in use, choose another host port:

```bash
APP_PORT=3001 docker compose -f docker-compose.local.yml up --build
```

Then open `http://localhost:3001`.

Authentication with GitHub/Google is optional for local evaluation. Anonymous
reviews work without OAuth credentials. If you want to test sign-in locally, set
`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_GOOGLE_ID`, and
`AUTH_GOOGLE_SECRET` in your shell before running Docker Compose, or add them to
a local `.env` file that is never committed.

If you do not want to configure local OAuth credentials but still want to review
the authenticated flow (sign-in and saved review history), use the production
deployment:

```text
https://trainer.marcespana.com/en
```

The production deployment may be slightly ahead of the local version downloaded
from this repository, because the application continues to evolve after the
submitted project snapshot.

## Run locally without Docker

```bash
pnpm install
cp .env.example .env.local  # fill in values; AI_PROVIDER=ollama by default
pnpm dev                    # http://localhost:3000
```

This mode expects you to provide PostgreSQL and Ollama yourself. For most
reviewers, the Docker Compose path above is simpler and more reproducible.

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
