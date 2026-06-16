"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_THEME_PREFERENCE,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/shared/theme/theme-types";

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && (THEME_PREFERENCES as readonly string[]).includes(stored)) {
      return stored as ThemePreference;
    }
  } catch {
    // localStorage unavailable (private browsing, SSR).
  }
  return DEFAULT_THEME_PREFERENCE;
}

// Module-level subscriber set so same-tab saves propagate without storage events.
const subscribers = new Set<() => void>();

function subscribe(notify: () => void): () => void {
  subscribers.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subscribers.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAppTheme() {
  const preference = useSyncExternalStore(
    subscribe,
    readStoredPreference,
    () => DEFAULT_THEME_PREFERENCE,
  );

  function savePreference(next: ThemePreference) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore write failures.
    }
    subscribers.forEach((notify) => notify());
  }

  return { preference, savePreference };
}
