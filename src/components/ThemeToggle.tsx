
import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";
  return (
    <button
      className="ml-2 p-2 rounded-full bg-clay-purple/10 hover:bg-clay-purple/30 transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-clay-purple" />
      ) : (
        <Moon className="w-5 h-5 text-clay-purple" />
      )}
    </button>
  );
};
