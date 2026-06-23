import { createContext, useContext } from "react";

export type ToastVariant = "success" | "info" | "error";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  onClick?: () => void;
  onDismiss?: () => void;
}

export interface ToastOptions {
  id?: string;
  durationMs?: number | null;
  onClick?: () => void;
  onDismiss?: () => void;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
