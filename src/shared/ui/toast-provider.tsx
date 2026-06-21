"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { ToastContext, type ToastItem, type ToastVariant } from "@/shared/hooks/use-toast";

let _nextId = 0;
const DURATION_MS = 3000;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("toast");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const current = timers.current;
    return () => {
      current.forEach(clearTimeout);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = String(++_nextId);
      setToasts((prev) => [...prev, { id, message, variant }].slice(-MAX_VISIBLE));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DURATION_MS),
      );
    },
    [dismiss],
  );

  // On mount, check for a pending toast written before locale navigation (e.g., language change).
  // The key is removed immediately to prevent duplicate toasts on refresh.
  // setTimeout defers the setState call out of the effect body to avoid cascading renders.
  useEffect(() => {
    let message: string | null = null;
    try {
      const raw = sessionStorage.getItem("ai-code-review-trainer-pending-toast");
      if (raw) {
        sessionStorage.removeItem("ai-code-review-trainer-pending-toast");
        const pending = JSON.parse(raw) as { key: string };
        if (pending.key === "languageChanged") {
          message = t("languageChanged");
        }
      }
    } catch {
      // sessionStorage unavailable or malformed — ignore
    }
    if (!message) return;
    const captured = message;
    const id = setTimeout(() => showToast(captured, "success"), 0);
    return () => clearTimeout(id);
  }, [showToast, t]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            data-toast-variant={toast.variant}
            className="animate-toast-in pointer-events-auto flex max-w-xs min-w-[200px] items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 shadow-lg dark:border-zinc-600 dark:bg-zinc-800"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              data-toast-dot={toast.variant}
              aria-hidden="true"
            />
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label={t("dismiss")}
              className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-100"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 2l8 8M10 2l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
