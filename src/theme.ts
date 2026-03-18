export type Theme = "light" | "dark";

const STORAGE_KEY = "jedligram_theme";

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "light" || raw === "dark" ? raw : null;
};

export const getActiveTheme = (): Theme => {
  if (typeof document === "undefined") return "dark";
  const raw = document.documentElement.dataset.theme;
  return raw === "light" || raw === "dark" ? raw : getSystemTheme();
};

export const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.dispatchEvent(new Event("theme-changed"));
};

export const setTheme = (theme: Theme) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }
  applyTheme(theme);
};

export const toggleTheme = (): Theme => {
  const next: Theme = getActiveTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};

export const initTheme = () => {
  if (typeof window === "undefined") return;
  const initial = getStoredTheme() ?? getSystemTheme();
  applyTheme(initial);
};
