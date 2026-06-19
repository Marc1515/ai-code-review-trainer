import { describe, expect, it } from "vitest";

import { resolveLocale } from "@/shared/language/language-utils";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type LanguagePreference,
} from "@/shared/language/language-types";

// ---------------------------------------------------------------------------
// resolveLocale — pure locale resolution from user preference
// ---------------------------------------------------------------------------

describe("resolveLocale", () => {
  it('returns "es" when preference is explicitly "es"', () => {
    expect(resolveLocale("es")).toBe("es");
  });

  it('returns "en" when preference is explicitly "en"', () => {
    expect(resolveLocale("en")).toBe("en");
  });

  it('returns the default locale when preference is "system" and navigator is unavailable', () => {
    // In the Node.js / Vitest environment navigator is undefined.
    // resolveLocale falls back to DEFAULT_LOCALE ("es") in that case.
    expect(resolveLocale("system")).toBe(DEFAULT_LOCALE);
  });

  it("all explicit locale preferences resolve to a supported locale", () => {
    const explicit: LanguagePreference[] = ["es", "en"];
    for (const pref of explicit) {
      expect(SUPPORTED_LOCALES as readonly string[]).toContain(resolveLocale(pref));
    }
  });
});

// ---------------------------------------------------------------------------
// SUPPORTED_LOCALES / DEFAULT_LOCALE — constant contracts
// ---------------------------------------------------------------------------

describe("SUPPORTED_LOCALES", () => {
  it('contains "es"', () => {
    expect(SUPPORTED_LOCALES).toContain("es");
  });

  it('contains "en"', () => {
    expect(SUPPORTED_LOCALES).toContain("en");
  });

  it("has exactly two entries", () => {
    expect(SUPPORTED_LOCALES).toHaveLength(2);
  });
});

describe("DEFAULT_LOCALE", () => {
  it('is "es" (Spanish-first)', () => {
    expect(DEFAULT_LOCALE).toBe("es");
  });

  it("is a member of SUPPORTED_LOCALES", () => {
    expect(SUPPORTED_LOCALES as readonly string[]).toContain(DEFAULT_LOCALE);
  });
});
