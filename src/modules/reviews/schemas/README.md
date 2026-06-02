# reviews / schemas

Zod schemas that validate review input/output at the application boundary.
Phase 1 adds `review.schema.ts`: a `reviewInputSchema` (code length limits,
`reviewType` enum from the domain) and a `reviewResultSchema` used to validate
provider output before it reaches the UI.

User-submitted code is **untrusted data** — validated for shape/size only,
never executed. See SECURITY.md.
