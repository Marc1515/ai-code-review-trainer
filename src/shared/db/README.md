# shared / db

Shared persistence infrastructure. Phase 3 adds the **Prisma client singleton**
(`client.ts`) used across modules. Module-specific repositories live under their
own module (e.g. `@/modules/reviews/infrastructure/db`), not here.

Dev and prod use separate persistent external Postgres containers
(`ai-code-review-trainer-postgres-dev` / `-prod`). See DEPLOYMENT.md.
