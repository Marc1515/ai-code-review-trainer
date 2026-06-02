# Deployment

Deployment targets a single VPS using **Docker Compose** behind **Traefik**,
driven by **GitHub Actions** on a **self-hosted runner**.

> Some artifacts below (Dockerfile, compose files, workflows) are authored in
> the infrastructure phase (Phase 4). This document is the agreed target design.

## Environments

| Environment | Branch | Domain                          | App container suffix | DB container                              |
| ----------- | ------ | ------------------------------- | -------------------- | ----------------------------------------- |
| Production  | `main` | `trainer.marcespana.com`        | `-prod`              | `ai-code-review-trainer-postgres-prod`    |
| Development | `dev`  | `dev-trainer.marcespana.com`    | `-dev`               | `ai-code-review-trainer-postgres-dev`     |

- VPS path: `~/apps/ai-code-review-trainer`
- Reverse proxy: **Traefik**, external Docker network **`traefik-proxy`**
- Push to `main` deploys production; push to `dev` deploys development.

## Components

### Dockerfile
Multi-stage build using **pnpm**, producing a Next.js **standalone** output for
a small runtime image. Build installs only what's needed; runtime runs the
standalone server.

### Compose files
- `docker-compose.dev.yml` / `docker-compose.prod.yml` — the **app** service per
  environment, with Traefik labels (host rule, TLS) and attachment to the
  `traefik-proxy` external network. Env is supplied from the environment's
  (uncommitted) env file on the VPS.
- `docker-compose.db.dev.yml` / `docker-compose.db.prod.yml` — the **persistent
  external PostgreSQL** container per environment, with a named volume so data
  survives app redeploys (ADR-007). These are started once and managed
  independently of app deploys.

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
4. Apply Prisma migrations (Phase 3 onward).

## Database lifecycle

The Postgres containers are **persistent and external** to the app deploy.
Redeploying the app never recreates or wipes the database. Migrations are
applied as a deploy step; backups are managed at the volume level on the VPS.

## Secrets on the VPS

Real environment values live in uncommitted env files on the VPS (templated by
`.env.development.example` / `.env.production.example`) and are injected into
containers by Compose. No secrets are committed to the repo. See
[SECURITY.md](./SECURITY.md).

## First-time setup (outline)

1. Ensure Docker, Compose, and the `traefik-proxy` network exist on the VPS.
2. Register the GitHub Actions self-hosted runner on the VPS.
3. Create the env files for each environment from the `*.example` templates.
4. Start the persistent DB containers (`docker-compose.db.*.yml`).
5. Push to `dev` / `main` to trigger the corresponding deploy workflow.
