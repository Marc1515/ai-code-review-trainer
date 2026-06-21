"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

import { useToast } from "@/shared/hooks/use-toast";

export const PENDING_TOAST_KEY = "ai-code-review-trainer-pending-toast";

type PendingToast = {
  type: string;
  targetLocale: string;
  id: string;
};

/**
 * Reads a pending toast from sessionStorage after locale route navigation.
 *
 * Why a separate component instead of ToastProvider:
 * Next.js App Router reuses the layout component instance on soft navigation
 * (including locale changes), so useEffect([]) never re-fires. This component
 * uses useLocale() as a dep, which changes when the locale changes, guaranteeing
 * the effect runs exactly when needed.
 *
 * Must be rendered inside both NextIntlClientProvider and ToastProvider.
 */
export function PendingToastBridge() {
  const locale = useLocale();
  const t = useTranslations("toast");
  const { showToast } = useToast();

  useEffect(() => {
    let pending: PendingToast | null = null;
    try {
      const raw = sessionStorage.getItem(PENDING_TOAST_KEY);
      if (!raw) return;
      pending = JSON.parse(raw) as PendingToast;
    } catch {
      return;
    }

    if (!pending || pending.type !== "languageChanged") return;
    if (pending.targetLocale !== locale) return;

    // Remove before showing — prevents duplicate toasts on re-renders or Strict Mode double-runs.
    // The second Strict Mode run finds the key already gone and bails out early.
    try {
      sessionStorage.removeItem(PENDING_TOAST_KEY);
    } catch {
      // ignore
    }

    // requestAnimationFrame defers the setState call out of the synchronous effect body,
    // satisfying the react-hooks/set-state-in-effect lint rule.
    // No cancelAnimationFrame cleanup — we intentionally let the scheduled frame fire even
    // after Strict Mode cleanup so the toast is not silently dropped.
    requestAnimationFrame(() => {
      showToast(t("languageChanged"), "success");
    });
  }, [locale, showToast, t]);

  return null;
}
