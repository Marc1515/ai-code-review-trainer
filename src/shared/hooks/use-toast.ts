import { createContext, useContext } from "react";

export type ToastVariant = "success" | "info" | "error" | "warning";

export interface ToastItem {
  id: string;
  eventId?: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  durationMs: number;
  onClick?: () => void;
  onDismiss?: () => void;
}

export interface ToastOptions {
  id?: string;
  eventId?: string;
  description?: string;
  durationMs?: number;
  onClick?: () => void;
  onDismiss?: () => void;
}

interface ToastContextValue {
  showToast: (title: string, variant?: ToastVariant, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
