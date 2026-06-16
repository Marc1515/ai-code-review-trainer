import {
  DEFAULT_LANGUAGE_PREFERENCE,
  LANGUAGE_PREFERENCES,
  LANGUAGE_STORAGE_KEY,
  type LanguagePreference,
} from "./language-types";

export function readStoredPreference(): LanguagePreference {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && (LANGUAGE_PREFERENCES as readonly string[]).includes(stored)) {
      return stored as LanguagePreference;
    }
  } catch {
    // localStorage unavailable (private browsing, SSR).
  }
  return DEFAULT_LANGUAGE_PREFERENCE;
}

export function saveStoredPreference(preference: LanguagePreference): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, preference);
  } catch {
    // Ignore write failures.
  }
}
