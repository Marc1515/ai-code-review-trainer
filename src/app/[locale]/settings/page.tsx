import { getTranslations } from "next-intl/server";

import { AiProviderComingSoonSettings } from "@/modules/settings/ui/ai-provider-coming-soon-settings";
import { AppThemeSettings } from "@/modules/settings/ui/app-theme-settings";
import { EditorThemeSettings } from "@/modules/settings/ui/editor-theme-settings";
import { LanguageSettings } from "@/modules/settings/ui/language-settings";
import { PageShell } from "@/shared/ui/page-shell";

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <PageShell>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <LanguageSettings />
        <AppThemeSettings />
        <EditorThemeSettings />
        <AiProviderComingSoonSettings />
      </div>
    </PageShell>
  );
}
