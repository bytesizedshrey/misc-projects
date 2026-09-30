"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="theme"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <svg viewBox="0 0 14 14" aria-hidden="true">
        <circle cx="7" cy="7" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 1.25a5.75 5.75 0 0 1 0 11.5z" fill="currentColor" />
      </svg>
    </button>
  );
}
