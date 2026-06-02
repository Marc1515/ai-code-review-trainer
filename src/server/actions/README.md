# server / actions

Next.js Server Actions — thin entrypoints for the main review flow. Phase 1
adds `review.action.ts`: parse the form with the Zod input schema, delegate to
the `create-review` use-case, and return a typed result to the UI.

Actions hold **no business logic** — they adapt the transport to use-cases.
