# Release Checklist

Steps to validate a branch before merging to `main` and promoting to
production. Complete every item in order.

---

## 1. Automated checks

Run all of the following locally and confirm they exit cleanly:

```bash
pnpm lint          # 0 errors (warnings are acceptable if pre-existing)
pnpm typecheck     # 0 type errors
pnpm test          # all tests pass
pnpm build         # production build succeeds
```

---

## 2. Manual QA on dev environment

Deploy (or confirm the branch is deployed) to the dev environment
(`dev-trainer.marcespana.com`).

- [ ] Run through `docs/QA_CHECKLIST.md` — anonymous flow.
- [ ] Run through `docs/QA_CHECKLIST.md` — authenticated flow (GitHub + Google).
- [ ] Run through `docs/QA_CHECKLIST.md` — settings page (`/es` and `/en`).
- [ ] Spot-check Ollama busy/unavailable states if testable in dev.
- [ ] Confirm no API key form is rendered anywhere in the app.
- [ ] Confirm no paid-provider branding (Anthropic, OpenAI, Claude, `sk-ant-`)
  is visible in any page, including settings.

---

## 3. Security spot-check

- [ ] Open browser DevTools → Network: confirm no secrets appear in any
  response payload or query string.
- [ ] Check the server console (or Docker logs): confirm no full code snippets
  or API keys are logged.
- [ ] Verify that Sentry (if active) is not receiving request bodies or code
  content.

---

## 4. PR review

- [ ] For production PRs, base branch is `main` and head branch is `dev`
  (or a feature branch merged into `dev` first).
- [ ] PR description explains what changed and why.
- [ ] No Prisma schema changes without a corresponding migration.
- [ ] No new packages added without justification in the PR.
- [ ] No paid AI provider introduced or wired in the active review flow.
- [ ] No `BYOK` work merged unless it is a planned, approved phase.

---

## 5. Post-deploy verification (production)

After merging and deploying to production:

- [ ] `trainer.marcespana.com` loads over HTTPS.
- [ ] Anonymous review flow works end-to-end.
- [ ] Authenticated review flow works end-to-end (sign in, submit, save, view).
- [ ] Settings page renders correctly (`/es/settings`, `/en/settings`).
- [ ] No error spike in Sentry (if active).
- [ ] Database volumes intact — existing reviews visible in the dashboard.
