"use client";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { dracula } from "@uiw/codemirror-theme-dracula";
import type { EditorTheme } from "@/shared/hooks/use-editor-theme";

export const THEME_MAP = {
  "github-light": githubLight,
  "github-dark": githubDark,
  dracula: dracula,
} as const;

// Stable extension array — recreating it on every render causes editor churn.
const JS_EXTENSIONS = [javascript({ jsx: true, typescript: true })];

interface Props {
  value: string;
  onChange?: (value: string) => void;
  theme: EditorTheme;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
  readOnly?: boolean;
  ariaLabel?: string;
}

export function CodeEditor({
  value,
  onChange,
  theme,
  placeholder,
  maxLength,
  minHeight = "280px",
  readOnly = false,
  ariaLabel,
}: Props) {
  function handleChange(v: string) {
    if (!onChange) return;
    if (maxLength !== undefined && v.length > maxLength) return;
    onChange(v);
  }

  return (
    <CodeMirror
      value={value}
      onChange={readOnly ? undefined : handleChange}
      extensions={JS_EXTENSIONS}
      theme={THEME_MAP[theme]}
      placeholder={placeholder}
      minHeight={minHeight}
      readOnly={readOnly}
      editable={!readOnly}
      aria-label={ariaLabel}
      className={
        readOnly
          ? "overflow-hidden rounded-lg border border-zinc-200 text-sm dark:border-zinc-700"
          : "overflow-hidden rounded-lg border border-zinc-300 text-sm focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500/20"
      }
    />
  );
}
