"use client";

import { useTranslations } from "next-intl";
import { EDITOR_THEMES, useEditorTheme, type EditorTheme } from "@/shared/hooks/use-editor-theme";

const THEME_LABEL_KEYS: Record<EditorTheme, string> = {
  "github-light": "githubLight",
  "github-dark": "githubDark",
  dracula: "dracula",
};

export function EditorThemeSettings() {
  const t = useTranslations("settings.editorTheme");
  const { theme, saveTheme } = useEditorTheme();

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">{t("title")}</h2>
      <div>
        <label htmlFor="editorTheme" className="mb-1.5 block text-sm font-medium text-zinc-700">
          {t("label")}
        </label>
        <select
          id="editorTheme"
          value={theme}
          onChange={(e) => saveTheme(e.target.value as EditorTheme)}
          className="w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none"
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
