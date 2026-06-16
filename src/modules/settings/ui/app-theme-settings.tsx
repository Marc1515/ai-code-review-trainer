"use client";

import { useTranslations } from "next-intl";

import { useAppTheme } from "@/shared/hooks/use-app-theme";
import { THEME_PREFERENCES, type ThemePreference } from "@/shared/theme/theme-types";

export function AppThemeSettings() {
  const t = useTranslations("settings.appTheme");
  const { preference, savePreference } = useAppTheme();

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</h2>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t("description")}</p>
      <div>
        <label
          htmlFor="appTheme"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {t("label")}
        </label>
        <select
          id="appTheme"
          value={preference}
          onChange={(e) => savePreference(e.target.value as ThemePreference)}
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        >
          {THEME_PREFERENCES.map((value) => (
            <option key={value} value={value}>
              {t(`options.${value}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
