import { vi } from "vitest";

// Neutralise Next.js server-only guard so modules that start with
// `import "server-only"` can be imported in the Node/Vitest context.
vi.mock("server-only", () => ({}));

// Minimum env vars required by getServerEnv() for tests that touch
// server modules. Real values are irrelevant here — only shape matters.
// NODE_ENV is already "test" when Vitest runs; AUTH_SECRET is the only
// non-defaulted required var in the server env schema.
process.env.AUTH_SECRET = "test-secret-for-vitest";
