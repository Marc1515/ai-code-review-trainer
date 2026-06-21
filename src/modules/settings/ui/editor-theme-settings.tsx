"use client";

import { useTranslations } from "next-intl";
import { EDITOR_THEMES, useEditorTheme, type EditorTheme } from "@/shared/hooks/use-editor-theme";
import { useToast } from "@/shared/hooks/use-toast";

const THEME_LABEL_KEYS: Record<EditorTheme, string> = {
  "github-light": "githubLight",
  "github-dark": "githubDark",
  dracula: "dracula",
};

export function EditorThemeSettings() {
  const t = useTranslations("settings.editorTheme");
  const tToast = useTranslations("toast");
  const { theme, saveTheme } = useEditorTheme();
  const { showToast } = useToast();

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</h2>
      <div>
        <label
          htmlFor="editorTheme"
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {t("label")}
        </label>
        <select
          id="editorTheme"
          value={theme}
          onChange={(e) => {
            const value = e.target.value as EditorTheme;
            saveTheme(value);
            showToast(tToast(`editorThemeChanged.${THEME_LABEL_KEYS[value]}`));
          }}
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
        >
          {EDITOR_THEMES.map((value) => (
            <option key={value} value={value}>
              {t(`themes.${THEME_LABEL_KEYS[value]}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
