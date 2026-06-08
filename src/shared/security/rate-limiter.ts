import "server-only";

import { getServerEnv } from "@/config/env";

type WindowEntry = { count: number; windowStart: number };

const store = new Map<string, WindowEntry>();
let lastCleanup = 0;

function extractIp(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() ?? "unknown";
}

export function checkRateLimit(
  userId: string | undefined,
  requestHeaders: Headers,
): { allowed: boolean } {
  const { RATE_LIMIT_ANON_MAX, RATE_LIMIT_AUTH_MAX, RATE_LIMIT_WINDOW_MS } = getServerEnv();
  const max = userId ? RATE_LIMIT_AUTH_MAX : RATE_LIMIT_ANON_MAX;
  const windowMs = RATE_LIMIT_WINDOW_MS;
  const key = userId ? `auth:${userId}` : `anon:${extractIp(requestHeaders)}`;
  const now = Date.now();

  // Periodic cleanup to prevent unbounded memory growth
  if (now - lastCleanup >= windowMs) {
    for (const [k, e] of store) {
      if (now - e.windowStart >= windowMs) store.delete(k);
    }
    lastCleanup = now;
  }

  const entry = store.get(key);
  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (entry.count >= max) return { allowed: false };
  entry.count++;
  return { allowed: true };
}
