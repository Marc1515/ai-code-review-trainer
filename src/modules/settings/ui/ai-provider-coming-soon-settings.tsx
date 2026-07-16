"use client";

import { useTranslations } from "next-intl";

import { SettingsCard } from "./settings-card";

export function AiProviderComingSoonSettings() {
  const t = useTranslations("settings.aiProvider");

  return (
    <SettingsCard helper={<p>{t("helper")}</p>}>
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</h2>
        <span className="rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
          {t("comingSoon")}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("description")}</p>
    </SettingsCard>
  );
}
