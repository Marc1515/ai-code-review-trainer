export type LanguagePreference = "system" | "es" | "en";

export const LANGUAGE_PREFERENCES: readonly LanguagePreference[] = ["system", "es", "en"];
export const DEFAULT_LANGUAGE_PREFERENCE: LanguagePreference = "system";
export const LANGUAGE_STORAGE_KEY = "ai-code-review-trainer-language";

export const SUPPORTED_LOCALES = ["es", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "es";
