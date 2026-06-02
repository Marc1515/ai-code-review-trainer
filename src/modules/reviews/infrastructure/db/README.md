# reviews / infrastructure / db

Review-specific persistence adapter. Phase 3 adds a review repository that maps
the `Review` domain result to/from Prisma models, using the shared Prisma client
from `@/shared/db`.

Reviews are persisted **only for authenticated users**; anonymous reviews stay
stateless.
