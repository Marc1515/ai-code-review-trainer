import { afterEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "@/shared/security/rate-limiter";

// Each test uses a unique userId or IP address so that the module-level Map
// (which persists for the lifetime of the test file) never leaks state between
// independent test cases.

function ipHeaders(ip: string): Headers {
  return new Headers({ "x-forwarded-for": ip });
}

// ---------------------------------------------------------------------------
// Anonymous users — keyed by X-Forwarded-For IP
// ---------------------------------------------------------------------------

describe("checkRateLimit — anonymous", () => {
  it("allows the first request", () => {
    expect(checkRateLimit(undefined, ipHeaders("10.0.0.1")).allowed).toBe(true);
  });

  it("blocks the request that exceeds the anonymous limit (default: 5)", () => {
    const h = ipHeaders("10.0.1.1");
    for (let i = 0; i < 5; i++) checkRateLimit(undefined, h);
    expect(checkRateLimit(undefined, h).allowed).toBe(false);
  });

  it("still allows the 5th request (limit is inclusive)", () => {
    const h = ipHeaders("10.0.2.1");
    for (let i = 0; i < 4; i++) checkRateLimit(undefined, h);
    expect(checkRateLimit(undefined, h).allowed).toBe(true);
  });

  it("two different IPs have independent windows", () => {
    const h1 = ipHeaders("10.1.0.1");
    const h2 = ipHeaders("10.1.0.2");
    for (let i = 0; i < 5; i++) checkRateLimit(undefined, h1);
    // h1 is exhausted; h2 is a fresh window.
    expect(checkRateLimit(undefined, h2).allowed).toBe(true);
  });

  it("uses x-real-ip when x-forwarded-for is absent", () => {
    const h = new Headers({ "x-real-ip": "10.3.0.1" });
    expect(checkRateLimit(undefined, h).allowed).toBe(true);
  });

  it("falls back gracefully when no IP header is present", () => {
    // Falls back to the "unknown" key — should still allow the first request.
    expect(checkRateLimit(undefined, new Headers()).allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Authenticated users — keyed by userId, not by IP
// ---------------------------------------------------------------------------

describe("checkRateLimit — authenticated", () => {
  it("allows the first request for an authenticated user", () => {
    expect(checkRateLimit("user-a1", new Headers()).allowed).toBe(true);
  });

  it("blocks the request that exceeds the authenticated limit (default: 15)", () => {
    const userId = "user-b1";
    for (let i = 0; i < 15; i++) checkRateLimit(userId, new Headers());
    expect(checkRateLimit(userId, new Headers()).allowed).toBe(false);
  });

  it("still allows the 15th request (limit is inclusive)", () => {
    const userId = "user-c1";
    for (let i = 0; i < 14; i++) checkRateLimit(userId, new Headers());
    expect(checkRateLimit(userId, new Headers()).allowed).toBe(true);
  });

  it("two different user IDs have independent windows", () => {
    const u1 = "user-d1";
    const u2 = "user-d2";
    for (let i = 0; i < 15; i++) checkRateLimit(u1, new Headers());
    expect(checkRateLimit(u1, new Headers()).allowed).toBe(false);
    // u2 has its own fresh window regardless of u1's state.
    expect(checkRateLimit(u2, new Headers()).allowed).toBe(true);
  });

  it("authenticated users get a higher limit than anonymous users", () => {
    // Exhaust anonymous limit (5) using a unique IP — the next call should fail.
    const h = ipHeaders("10.4.0.1");
    for (let i = 0; i < 5; i++) checkRateLimit(undefined, h);
    expect(checkRateLimit(undefined, h).allowed).toBe(false);

    // The same logical request count (5) must still be within the auth limit (15).
    const userId = "user-e1";
    for (let i = 0; i < 5; i++) checkRateLimit(userId, new Headers());
    expect(checkRateLimit(userId, new Headers()).allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Window reset — counters clear after the window elapses
// ---------------------------------------------------------------------------

describe("checkRateLimit — window reset", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resets the counter after the 60-second window expires", () => {
    vi.useFakeTimers();
    const h = ipHeaders("10.5.0.1");

    for (let i = 0; i < 5; i++) checkRateLimit(undefined, h);
    expect(checkRateLimit(undefined, h).allowed).toBe(false);

    // Advance the fake clock past the 60-second window.
    vi.advanceTimersByTime(61_000);

    // The window has expired — the counter resets and the request is allowed.
    expect(checkRateLimit(undefined, h).allowed).toBe(true);
  });
});
