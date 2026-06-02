# Security

The app **analyzes** code but **never executes** it. This document states the
threat model and the non-negotiable rules.

## Golden rules

1. **Never execute user code.** No `eval`, no `Function(...)`, no running,
   compiling, sandboxing, or shelling out with user-submitted code in the MVP.
2. **Code is data, not instructions.** Treat all submitted code as untrusted
   input. Prompts delimit it as data and instruct the model to ignore any
   embedded instructions (prompt injection). See [PROMPTS.md](./PROMPTS.md).
3. **Secrets stay server-side.** Never expose API keys or secrets to the
   client. Only `NEXT_PUBLIC_*` values may reach the browser.
4. **Never commit real env files.** Only `*.example` templates are committed;
   `.env`, `.env.*` (real) are git-ignored.

## Untrusted input handling

- All review input is validated with **Zod** at the Server Action boundary:
  required fields, allowed `reviewType` enum, and **code length limits** to
  bound payload size and abuse.
- Provider output is validated with Zod before rendering, so a misbehaving
  provider cannot inject arbitrary structure into the UI.
- Submitted code is rendered as inert text, never as executable HTML/markup.

## Cost / abuse policy

- The MVP uses the **mock provider only** — the owner incurs **no AI cost** for
  public users (see [DECISIONS.md](./DECISIONS.md), ADR-001).
- Future real AI is **BYOK**: authenticated users supply their own key and bear
  their own cost (ADR-002). BYOK keys, when implemented, are handled server-side
  only and never logged or returned to the client.

## Authentication & data

- Auth via Auth.js / NextAuth (GitHub, Google).
- Review history is persisted **only for authenticated users**; anonymous use
  is stateless and stores no PII.
- Dev and prod use **separate** PostgreSQL databases/containers (ADR-007).

## Secrets management

- Local: copy `.env.example` → `.env`; fill real values locally only.
- Server: env files live on the VPS outside version control and are injected
  into containers by Docker Compose. See [DEPLOYMENT.md](./DEPLOYMENT.md).
- `AUTH_SECRET` is generated with `openssl rand -base64 32` and is unique per
  environment.

## Observability

- **Sentry** is documented now and implemented after the MVP flow (ADR-009).
  When enabled, ensure no secrets or full user code payloads are sent in error
  reports.

## Transport

- Production and development are served over HTTPS via Traefik. TLS termination
  and routing are handled by the reverse proxy (external network `traefik-proxy`).
