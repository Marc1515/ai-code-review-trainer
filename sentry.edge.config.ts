import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  // Conservative: 5% of transactions in production, none in development.
  // Errors are always captured regardless of this setting.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
  debug: false,
  beforeSend(event) {
    // Strip request bodies — may contain FormData with user-submitted code.
    if (event.request) {
      delete event.request.data;
    }
    // Remove any extra context fields that could carry submitted code.
    if (event.extra) {
      const extra = event.extra as Record<string, unknown>;
      delete extra.code;
      delete extra.input;
    }
    // Drop breadcrumbs that reference submitted code.
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(
        (b: { data?: Record<string, unknown> }) => !b.data?.code && !b.data?.input,
      );
    }
    return event;
  },
});
