"use client";

import { Palette } from "lucide-react";
import { useTranslations } from "next-intl";

import { useEditorTheme, type EditorTheme } from "@/shared/hooks/use-editor-theme";

const THEME_LABEL_KEYS: Record<EditorTheme, string> = {
  "github-light": "githubLight",
  "github-dark": "githubDark",
  dracula: "dracula",
};

export function EditorThemeBadge() {
  const { theme } = useEditorTheme();
  const t = useTranslations("settings.editorTheme");

  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-teal-200 bg-teal-50 px-2 py-0.5 font-mono text-xs text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
      <Palette className="h-3 w-3" aria-hidden />
      {t(`themes.${THEME_LABEL_KEYS[theme]}`)}
    </span>
  );
}
