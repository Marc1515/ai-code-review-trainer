"use client";

import { useSyncExternalStore } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { readStoredPreference, saveStoredPreference } from "@/shared/language/language-storage";
import {
  DEFAULT_LANGUAGE_PREFERENCE,
  LANGUAGE_STORAGE_KEY,
  type LanguagePreference,
} from "@/shared/language/language-types";
import { resolveLocale } from "@/shared/language/language-utils";

// Module-level subscriber set so same-tab saves propagate without storage events.
const subscribers = new Set<() => void>();

function subscribe(notify: () => void): () => void {
  subscribers.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LANGUAGE_STORAGE_KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subscribers.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLanguagePreference() {
  const router = useRouter();
  const pathname = usePathname();

  const preference = useSyncExternalStore(
    subscribe,
    readStoredPreference,
    () => DEFAULT_LANGUAGE_PREFERENCE,
  );

  function applyPreference(next: LanguagePreference) {
    saveStoredPreference(next);
    subscribers.forEach((notify) => notify());
    const locale = resolveLocale(next);
    router.replace(pathname, { locale });
  }

  return { preference, applyPreference };
}
