# Session Notes

Current status:
- Phase 0 scaffold + docs completed by Claude Code.
- Next.js + TypeScript + Tailwind + Shadcn initialized.
- pnpm is the package manager.
- ESLint, Prettier, Husky and lint-staged configured.
- Documentation files created:
  - README.md
  - ARCHITECTURE.md
  - DECISIONS.md
  - PROMPTS.md
  - SECURITY.md
  - DEPLOYMENT.md
  - CLAUDE.md
- Environment example files created:
  - .env.example
  - .env.development.example
  - .env.production.example
- Verification passed:
  - pnpm install
  - pnpm lint
  - pnpm typecheck
  - pnpm format
  - pnpm build

Important pending corrections:
- Claude created `src/features/review` and `src/core`.
- Preferred architecture should be `src/modules/reviews` and `src/modules/auth`.
- AI provider infrastructure should probably live under `src/modules/reviews/infrastructure/ai`.
- next-intl was planned but not fully implemented yet.
- Do not start Phase 1 until structure is corrected and Phase 0 is committed.

Next recommended step:
- Ask Claude to correct `features` to `modules`, update imports/docs, run checks, then continue with next-intl setup before review feature implementation.
