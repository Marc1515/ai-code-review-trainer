"use client";

import { useEffect } from "react";

import { useAppTheme } from "@/shared/hooks/use-app-theme";

// Mounted once in the root layout; keeps document.documentElement.classList in sync
// with the stored theme preference and reacts to OS color-scheme changes when
// the preference is "system".
export function ThemeSync() {
  const { preference } = useAppTheme();

  useEffect(() => {
    function applyTheme() {
      const isDark =
        preference === "dark" ||
        (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    }

    applyTheme();

    if (preference !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", applyTheme);
    return () => mq.removeEventListener("change", applyTheme);
  }, [preference]);

  return null;
}
