"use client";

import { useTranslations } from "next-intl";

import { useLanguagePreference } from "@/shared/hooks/use-language-preference";
import { LANGUAGE_PREFERENCES, type LanguagePreference } from "@/shared/language/language-types";
import { useToast } from "@/shared/hooks/use-toast";

export function LanguageSettings() {
  const t = useTranslations("settings.language");
  const tToast = useTranslations("toast");
  const { preference, applyPreference } = useLanguagePreference();
  const { showToast } = useToast();

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t("description")}</p>
      <div>
        <label
          htmlFor="languagePreference"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {t("label")}
        </label>
        <select
          id="languagePreference"
          value={preference}
          onChange={(e) => {
            applyPreference(e.target.value as LanguagePreference);
            showToast(tToast("settingsSaved"));
          }}
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        >
          {LANGUAGE_PREFERENCES.map((value) => (
            <option key={value} value={value}>
              {t(`options.${value}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
