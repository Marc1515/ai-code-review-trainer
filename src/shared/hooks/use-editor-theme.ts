"use client";

import { useSyncExternalStore } from "react";

export type EditorTheme = "github-light" | "github-dark" | "dracula";

export const EDITOR_THEMES: readonly EditorTheme[] = ["github-light", "github-dark", "dracula"];
export const DEFAULT_THEME: EditorTheme = "github-light";

const STORAGE_KEY = "editorTheme";

function readStoredTheme(): EditorTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (EDITOR_THEMES as readonly string[]).includes(stored)) {
      return stored as EditorTheme;
    }
  } catch {
    // localStorage unavailable (private browsing).
  }
  return DEFAULT_THEME;
}

// Module-level subscriber set so same-tab saves propagate without storage events.
const subscribers = new Set<() => void>();

function subscribe(notify: () => void): () => void {
  subscribers.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subscribers.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function useEditorTheme() {
  const theme = useSyncExternalStore(subscribe, readStoredTheme, () => DEFAULT_THEME);

  function saveTheme(next: EditorTheme) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore write failures.
    }
    subscribers.forEach((notify) => notify());
  }

  return { theme, saveTheme };
}
