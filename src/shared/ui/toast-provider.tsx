"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";

import {
  ToastContext,
  type ToastItem,
  type ToastOptions,
  type ToastVariant,
} from "@/shared/hooks/use-toast";

let _nextId = 0;
const CONSUMED_TOASTS_KEY = "ai-code-review-trainer-consumed-toasts";
const DEFAULT_DURATION_MS = 10_000;
const MAX_VISIBLE = 3;
const MAX_CONSUMED_TOAST_IDS = 80;

const memoryConsumedToastIds = new Set<string>();

function trimMemoryConsumedToastIds() {
  while (memoryConsumedToastIds.size > MAX_CONSUMED_TOAST_IDS) {
    const oldest = memoryConsumedToastIds.values().next().value;
    if (!oldest) break;
    memoryConsumedToastIds.delete(oldest);
  }
}

function readConsumedToastIds(): string[] {
  try {
    const raw = window.sessionStorage.getItem(CONSUMED_TOASTS_KEY);
    if (!raw) return Array.from(memoryConsumedToastIds);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return Array.from(memoryConsumedToastIds);
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return Array.from(memoryConsumedToastIds);
  }
}

function hasConsumedToastId(eventId: string): boolean {
  return memoryConsumedToastIds.has(eventId) || readConsumedToastIds().includes(eventId);
}

function markToastConsumed(eventId?: string) {
  if (!eventId) return;

  memoryConsumedToastIds.add(eventId);
  trimMemoryConsumedToastIds();

  try {
    const ids = readConsumedToastIds().filter((id) => id !== eventId);
    ids.push(eventId);
    const trimmed = ids.slice(-MAX_CONSUMED_TOAST_IDS);
    window.sessionStorage.setItem(CONSUMED_TOASTS_KEY, JSON.stringify(trimmed));
  } catch {
    // sessionStorage unavailable — module memory still prevents same-runtime duplicates.
  }
}

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

  const clearTimer = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      setToasts((prev) => {
        const toast = prev.find((item) => item.id === id);
        markToastConsumed(toast?.eventId);
        toast?.onDismiss?.();
        return prev.filter((item) => item.id !== id);
      });
      clearTimer(id);
    },
    [clearTimer],
  );

  const showToast = useCallback(
    (title: string, variant: ToastVariant = "success", options: ToastOptions = {}) => {
      const id = options.id ?? String(++_nextId);
      const eventId = options.eventId;
      if (eventId && hasConsumedToastId(eventId)) return id;

      markToastConsumed(eventId);
      clearTimer(id);

      setToasts((prev) => {
        const nextToast: ToastItem = {
          id,
          eventId,
          title,
          description: options.description,
          variant,
          durationMs: options.durationMs ?? DEFAULT_DURATION_MS,
          onClick: options.onClick,
          onDismiss: options.onDismiss,
        };
        const exists = prev.some((item) => item.id === id);
        if (exists) {
          return prev.map((item) => (item.id === id ? nextToast : item));
        }
        const next = [...prev, nextToast];
        const visible = next.slice(-MAX_VISIBLE);
        const visibleIds = new Set(visible.map((item) => item.id));

        next.forEach((item) => {
          if (visibleIds.has(item.id)) return;
          markToastConsumed(item.eventId);
          item.onDismiss?.();
          clearTimer(item.id);
        });

        return visible;
      });

      timers.current.set(
        id,
        setTimeout(() => dismiss(id), options.durationMs ?? DEFAULT_DURATION_MS),
      );

      return id;
    },
    [clearTimer, dismiss],
  );

  const activateToast = useCallback(
    (toast: ToastItem) => {
      dismiss(toast.id);
      toast.onClick?.();
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
          const role = toast.variant === "error" ? "alert" : "status";
          const progressStyle = {
            "--toast-duration": `${toast.durationMs}ms`,
          } as CSSProperties;
          const content = (
            <>
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                data-toast-dot={toast.variant}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 leading-snug">
                <span className="block">{toast.title}</span>
                {toast.description && (
                  <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                    {toast.description}
                  </span>
                )}
              </span>
            </>
          );

          return (
            <div
              key={toast.id}
              role={role}
              data-toast-variant={toast.variant}
              style={progressStyle}
              className="animate-toast-in pointer-events-auto relative isolate flex max-w-xs min-w-[220px] overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 shadow-lg shadow-zinc-950/10 transition-colors dark:border-zinc-700/80 dark:bg-zinc-900/95 dark:text-zinc-100 dark:shadow-zinc-950/40"
            >
              <span data-toast-progress={toast.variant} aria-hidden="true" />
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => activateToast(toast)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 focus:ring-2 focus:ring-teal-400 focus:outline-none dark:hover:bg-zinc-800/80"
                >
                  {content}
                </button>
              ) : (
                <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">{content}</div>
              )}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  dismiss(toast.id);
                }}
                aria-label={t("dismiss")}
                className="mr-3 self-center rounded p-0.5 text-zinc-500 transition-colors hover:text-zinc-900 focus:ring-2 focus:ring-teal-400 focus:outline-none dark:text-zinc-400 dark:hover:text-zinc-100"
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
