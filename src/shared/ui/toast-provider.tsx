"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import {
  ToastContext,
  type ToastItem,
  type ToastOptions,
  type ToastVariant,
} from "@/shared/hooks/use-toast";

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
    setToasts((prev) => {
      const toast = prev.find((item) => item.id === id);
      toast?.onDismiss?.();
      return prev.filter((item) => item.id !== id);
    });
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success", options: ToastOptions = {}) => {
      const id = options.id ?? String(++_nextId);
      const existingTimer = timers.current.get(id);
      if (existingTimer !== undefined) {
        clearTimeout(existingTimer);
        timers.current.delete(id);
      }

      setToasts((prev) => {
        const nextToast = {
          id,
          message,
          variant,
          onClick: options.onClick,
          onDismiss: options.onDismiss,
        };
        const exists = prev.some((item) => item.id === id);
        if (exists) {
          return prev.map((item) => (item.id === id ? nextToast : item));
        }
        return [...prev, nextToast].slice(-MAX_VISIBLE);
      });

      if (options.durationMs !== null) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), options.durationMs ?? DURATION_MS),
        );
      }

      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast: dismiss }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2"
      >
        {toasts.map((toast) => {
          const isClickable = typeof toast.onClick === "function";

          return (
            <div
              key={toast.id}
              role={isClickable ? "button" : "status"}
              tabIndex={isClickable ? 0 : undefined}
              data-toast-variant={toast.variant}
              onClick={toast.onClick}
              onKeyDown={(event) => {
                if (!toast.onClick) return;
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                toast.onClick();
              }}
              className={`animate-toast-in pointer-events-auto flex max-w-xs min-w-[200px] items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 shadow-lg transition-colors hover:bg-zinc-800 focus:ring-2 focus:ring-teal-400 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 ${isClickable ? "cursor-pointer" : ""}`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                data-toast-dot={toast.variant}
                aria-hidden="true"
              />
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  dismiss(toast.id);
                }}
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
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
