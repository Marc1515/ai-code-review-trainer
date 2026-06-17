"use client";

import { useTranslations } from "next-intl";

export function AiProviderComingSoonSettings() {
  const t = useTranslations("settings.aiProvider");

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</h2>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
          {t("comingSoon")}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{t("note")}</p>
    </div>
  );
}
