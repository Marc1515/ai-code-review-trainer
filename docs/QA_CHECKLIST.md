# QA Checklist

Manual verification checklist for every release candidate. Run against the dev
environment before promoting to production.

Default locale for manual testing: **Spanish (`/es`)** — always test in both
`/es` and `/en`.

---

## Anonymous user

- [ ] Can reach the app at `/es` and `/en` without signing in.
- [ ] Can submit a code review (paste code, choose type, click submit).
- [ ] Review response comes from Ollama (or mock if `AI_PROVIDER=mock`).
- [ ] Review is **not** saved — dashboard does not appear; no DB record created.
- [ ] Rate limit applies: 6th request within 60 s returns a clear error message.
- [ ] Review form shows the trust notice ("code analyzed as data, never executed").

---

## Authenticated user — sign-in

- [ ] Can sign in with **GitHub**.
- [ ] Can sign in with **Google**.
- [ ] After sign-in, username/avatar appears in the header.
- [ ] Sign-out works and session is cleared.

## Authenticated user — review flow

- [ ] Can submit a code review while signed in.
- [ ] Review is saved and appears in the dashboard.
- [ ] Dashboard shows the correct review count (`current / max`).
- [ ] Saved review limit (10) is enforced: the 11th review is not saved and the
  UI shows the limit modal or a clear message.
- [ ] Clicking a saved review opens the review detail page.
- [ ] Review detail page shows the submitted code and all findings.

## Authenticated user — delete

- [ ] Can delete a single review from the dashboard.
- [ ] Deleted review no longer appears in the list.
- [ ] Can select multiple reviews and bulk-delete them.
- [ ] After deletion, the review count decreases correctly.

---

## Ollama states

- [ ] **Available** — Ollama is running; reviews complete within the timeout.
- [ ] **Busy** — Ollama is already processing a review; submitting a second
  request immediately returns a "system busy" error message in the UI.
- [ ] **Unavailable** — Ollama is stopped or unreachable; the UI returns a
  clear "service unavailable" message rather than crashing or exposing a stack
  trace.
- [ ] **Timeout** — a review that exceeds `OLLAMA_TIMEOUT_MS` returns a timeout
  error message in the UI.
- [ ] **Invalid response** — Ollama returns malformed JSON; the UI returns a
  generic error without leaking the raw model output.
- [ ] No fallback to paid providers occurs in any error state.
- [ ] Ollama is **not** publicly reachable from the internet (port 11434 is
  blocked externally by the VPS firewall).

---

## Settings page (`/es/settings`, `/en/settings`)

- [ ] Page loads for both anonymous and authenticated users.
- [ ] **Language selector** — switching language updates the URL and UI language
  without a full page reload.
- [ ] **App theme selector** — switching between Light / Dark / System updates
  the theme immediately.
- [ ] **Editor theme selector** — switching between GitHub Light / GitHub Dark /
  Dracula updates the code editor preview.
- [ ] **AI provider card** — visible, shows "Coming soon" / "Próximamente" badge.
- [ ] **No API key form** — no `<input>` or `<textarea>` for entering an API key
  is rendered.
- [ ] **No paid provider branding** — no mention of "Anthropic", "Claude",
  "OpenAI", or `sk-ant-` anywhere on the settings page.

---

## Security

- [ ] User-submitted code is **never executed** (no `eval`, no `Function`,
  no `child_process`).
- [ ] User-submitted code is rendered as inert text, not as executable HTML.
- [ ] Full user code is **not logged** to the server console or sent to Sentry.
- [ ] API keys and secrets are not visible in the browser (no `NEXT_PUBLIC_`
  secret vars).
- [ ] Server errors return user-friendly messages — no stack traces, raw error
  objects, or SQL details reach the client.
- [ ] Sentry (when `SENTRY_DSN` is set) captures errors without attaching
  `request.data`, `extra.code`, or `extra.input`.

---

## Deployment

- [ ] Dev environment (`dev-trainer.marcespana.com`) is reachable over HTTPS.
- [ ] Production environment (`trainer.marcespana.com`) is reachable over HTTPS
  after a main-branch promotion.
- [ ] App container reaches Ollama via `OLLAMA_BASE_URL=http://ollama:11434`
  (Docker-internal networking — not the host IP).
- [ ] Database volumes are **not** reset on redeploy — existing reviews survive.
- [ ] Container entrypoint runs `prisma migrate deploy` (not `db push`) on
  startup; no existing rows are lost.
- [ ] GitHub Actions deploy workflow completes without errors.
