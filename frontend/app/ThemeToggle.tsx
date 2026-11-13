"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("jba-theme") as Theme | null;
    const nextTheme = savedTheme ?? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = nextTheme;
    queueMicrotask(() => setTheme(nextTheme));
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("jba-theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`${theme === "dark" ? "Helles" : "Dunkles"} Design aktivieren`}
      title={`${theme === "dark" ? "Helles" : "Dunkles"} Design`}
    >
      <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
      {theme === "dark" ? "Hell" : "Dunkel"}
    </button>
  );
}
