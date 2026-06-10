import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = withNextIntl({
  output: "standalone",
});

export default withSentryConfig(nextConfig, {
  // Suppress Sentry build-time output.
  silent: true,
  // Source map upload is intentionally deferred — no SENTRY_AUTH_TOKEN required.
  // Enable in a future phase by setting SENTRY_AUTH_TOKEN, SENTRY_ORG, and
  // SENTRY_PROJECT and removing this option.
  sourcemaps: { disable: true },
});
