"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeModeContext = createContext();

export function ThemeModeProvider({ children }) {
  const [theme, setTheme] = useState("system");

  // Apply theme
  const applyTheme = (mode) => {
    const root = document.documentElement;

    root.classList.remove("dark", "light");

    if (mode === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(mode);
    }
  };

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  // Persist theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeModeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeModeContext);
