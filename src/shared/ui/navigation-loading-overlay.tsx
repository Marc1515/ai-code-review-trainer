"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const MIN_DURATION_MS = 100;

export function NavigationLoadingOverlay() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!href || href.startsWith("#")) return;

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr !== "_self") return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname + url.search === window.location.pathname + window.location.search) return;
      } catch {
        return;
      }

      startTimeRef.current = Date.now();
      pendingRef.current = true;
      setVisible(true);
    }

    function handlePopState() {
      startTimeRef.current = Date.now();
      pendingRef.current = true;
      setVisible(true);
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;

    const elapsed =
      startTimeRef.current !== null ? Date.now() - startTimeRef.current : MIN_DURATION_MS;
    const delay = Math.max(0, MIN_DURATION_MS - elapsed);

    const timer = setTimeout(() => setVisible(false), delay);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label={t("loading")}
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 backdrop-blur-[1px] dark:bg-zinc-950/60"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <span
          aria-hidden
          className="block h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-teal-600 dark:border-zinc-700 dark:border-t-teal-400"
        />
      </div>
    </div>
  );
}
