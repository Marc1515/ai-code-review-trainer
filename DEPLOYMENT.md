# Deployment

Deployment targets a single VPS using **Docker Compose** behind **Traefik**,
driven by **GitHub Actions** on a **self-hosted runner**. This document
describes the current, implemented architecture.

## Environments

| Environment | Branch | Domain                          | App container                      | DB container                              | Backend network                          |
| ----------- | ------ | ------------------------------- | ---------------------------------- | ----------------------------------------- | ---------------------------------------- |
| Production  | `main` | `trainer.marcespana.com`        | `ai-code-review-trainer-prod`      | `ai-code-review-trainer-postgres-prod`    | `ai-code-review-trainer-prod-backend`    |
| Development | `dev`  | `dev-trainer.marcespana.com`    | `ai-code-review-trainer-dev`       | `ai-code-review-trainer-postgres-dev`     | `ai-code-review-trainer-dev-backend`     |

- VPS path: `~/apps/ai-code-review-trainer`
- Reverse proxy: **Traefik**, external Docker network **`traefik-proxy`**
- Push to `main` deploys production; push to `dev` deploys development.

## Components

### Dockerfile
Multi-stage build using **pnpm**, producing a Next.js **standalone** output for
a small runtime image. Build installs only what's needed; runtime runs the
standalone server. The entrypoint runs `pnpm prisma migrate deploy` before
starting `node server.js`.

### Compose files
- `docker-compose.dev.yml` / `docker-compose.prod.yml` — the **app** service per
  environment, with Traefik labels (host rule, TLS) and attachment to the
  `traefik-proxy` external network and the per-env backend network. Env is
  supplied from the environment's (uncommitted) env file on the VPS.
- `docker-compose.db.dev.yml` / `docker-compose.db.prod.yml` — the **persistent
  external PostgreSQL** container per environment, with a named volume so data
  survives app redeploys (ADR-007). These are started once and managed
  independently of app deploys. Each DB compose file creates its backend network.

### Ollama service

The app uses a **local Ollama instance** as the default AI provider
(`AI_PROVIDER=ollama`). Ollama must be running on the VPS and reachable by the
app container. It must **never** be publicly exposed.

- The app container reaches Ollama via `OLLAMA_BASE_URL=http://ollama:11434`
  (Docker internal networking).
- From the VPS host, Ollama can be tested at `http://127.0.0.1:11434` (ensure
  the VPS firewall blocks external access to port 11434).
- Recommended model: `ollama pull qwen2.5-coder:3b`
- Lightweight alternative: `ollama pull qwen2.5-coder:1.5b`
- Additional env vars: `OLLAMA_MODEL` (default `qwen2.5-coder:3b`) and
  `OLLAMA_TIMEOUT_MS` (default `90000`).

### Networks
- `traefik-proxy` — external, managed by Traefik. Both app services attach to it.
- `ai-code-review-trainer-dev-backend` — created by `docker-compose.db.dev.yml`;
  referenced as external by `docker-compose.dev.yml`.
- `ai-code-review-trainer-prod-backend` — created by `docker-compose.db.prod.yml`;
  referenced as external by `docker-compose.prod.yml`.

### Traefik
Each app service declares Traefik labels routing its host
(`dev-trainer.marcespana.com` / `trainer.marcespana.com`) to the app on the
`traefik-proxy` network. Traefik handles TLS certificates and HTTPS.

### GitHub Actions
- `.github/workflows/deploy-dev.yml` — triggers on push to `dev`.
- `.github/workflows/deploy-prod.yml` — triggers on push to `main`.

Both run on the **self-hosted runner** on the VPS and roughly:

1. Check out the repo into `~/apps/ai-code-review-trainer`.
2. Build the image via the environment's compose file.
3. `docker compose ... up -d` the app service (DB container stays running).
4. Migrations run automatically at container startup via the entrypoint.

## Database lifecycle

The Postgres containers are **persistent and external** to the app deploy.
Redeploying the app never recreates or wipes the database. Migrations are
applied at container startup (idempotent `migrate deploy`); backups are managed
at the volume level on the VPS.

## Secrets on the VPS

Real environment values live in uncommitted env files on the VPS (templated by
`.env.development.example` / `.env.production.example`) and are injected into
containers by Compose. No secrets are committed to the repo. See
[SECURITY.md](./SECURITY.md).

## First-time setup (outline)

1. Ensure Docker, Compose, and the `traefik-proxy` network exist on the VPS.
2. Register the GitHub Actions self-hosted runner on the VPS.
3. Create the env files for each environment from the `*.example` templates.
4. Pre-create the named volumes:
   ```
   docker volume create ai-code-review-trainer-postgres-dev-data
   docker volume create ai-code-review-trainer-postgres-prod-data
   ```
5. Start the persistent DB containers (this also creates the backend networks):
   ```
   docker compose -f docker-compose.db.dev.yml up -d
   docker compose -f docker-compose.db.prod.yml up -d
   ```
6. Push to `dev` / `main` to trigger the corresponding deploy workflow.
