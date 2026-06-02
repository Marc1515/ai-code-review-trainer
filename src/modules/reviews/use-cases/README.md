# reviews / use-cases

Application logic that orchestrates a review. Phase 1 adds `create-review.ts`:
validate `ReviewInput`, call the `AiReviewProvider` port via the provider
factory (`../infrastructure/ai/provider-factory.ts`), and (when authenticated)
persist the result through the review persistence adapter
(`../infrastructure/db`).

Use-cases depend on **domain types and ports only** — never on a concrete
provider, Prisma, Next.js, or React.
