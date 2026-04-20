import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type FontSize = "sm" | "md" | "lg" | "xl";

const THEME_KEY = "venmurasu:theme";
const FONT_KEY = "venmurasu:font-size";

export const FONT_CLASS: Record<FontSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export const FONT_LABEL: Record<FontSize, string> = {
  sm: "சிறியது",
  md: "நடுத்தரம்",
  lg: "பெரியது",
  xl: "மிகப் பெரியது",
};

export function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function getStoredTheme(): Theme {
  try { return (localStorage.getItem(THEME_KEY) as Theme) || "light"; } catch { return "light"; }
}

export function getStoredFont(): FontSize {
  try { return (localStorage.getItem(FONT_KEY) as FontSize) || "md"; } catch { return "md"; }
}

export function useSettings() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme());
  const [fontSize, setFontSizeState] = useState<FontSize>(getStoredFont());

  useEffect(() => { applyTheme(theme); try { localStorage.setItem(THEME_KEY, theme); } catch {} }, [theme]);
  useEffect(() => { try { localStorage.setItem(FONT_KEY, fontSize); } catch {} }, [fontSize]);

  return {
    theme, setTheme: setThemeState,
    fontSize, setFontSize: setFontSizeState,
    fontClass: FONT_CLASS[fontSize],
  };
}
