"use client";

import { useTheme } from "@/components/ThemeModeProvider";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      {theme === "light" ? (
  <Button
    size="sm"
    variant="outline"
    onClick={() => setTheme("dark")}
  >
    🌙 Dark Mode
  </Button>
) : (
  <Button
    size="sm"
    variant="outline"
    onClick={() => setTheme("light")}
  >
    ☀ Light Mode
  </Button>
)}

    </div>
  );
}
