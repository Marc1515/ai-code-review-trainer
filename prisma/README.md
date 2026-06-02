# prisma

Database schema and migrations (PostgreSQL). Phase 3 adds `schema.prisma`
(Auth.js models + a `Review` model) and the generated migrations.

Dev and prod use separate persistent external Postgres containers
(`ai-code-review-trainer-postgres-dev` / `-prod`). See DEPLOYMENT.md.
