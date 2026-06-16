export type ThemePreference = "system" | "light" | "dark";

export const THEME_PREFERENCES: readonly ThemePreference[] = ["system", "light", "dark"];
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "light";
export const THEME_STORAGE_KEY = "ai-code-review-trainer-theme";
