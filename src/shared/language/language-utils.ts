import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type LanguagePreference,
  type SupportedLocale,
} from "./language-types";

export function resolveLocale(preference: LanguagePreference): SupportedLocale {
  if (preference === "es") return "es";
  if (preference === "en") return "en";

  // preference === "system": resolve from browser language
  const langs: readonly string[] =
    typeof navigator !== "undefined"
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      : [];

  for (const lang of langs) {
    for (const locale of SUPPORTED_LOCALES) {
      if (lang.toLowerCase().startsWith(locale)) return locale;
    }
  }

  return DEFAULT_LOCALE;
}
