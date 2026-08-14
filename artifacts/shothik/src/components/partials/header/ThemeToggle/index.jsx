"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateTheme } from "@/redux/slices/settings-slice";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ThemeToggle({ className }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings?.theme);
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark") || theme === "dark";
      setCurrentTheme(isDark ? "dark" : "light");
    }
  }, [theme]);

  const isDark = currentTheme === "dark";

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    setCurrentTheme(nextTheme);

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(nextTheme);
      root.setAttribute("data-theme", nextTheme);
    }

    dispatch(updateTheme(nextTheme));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        "h-8 w-8 rounded-full border border-zinc-200 dark:border-white/[0.08] bg-zinc-100/80 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/[0.08] transition cursor-pointer",
        className
      )}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light (White) Mode" : "Switch to Dark Mode"}
      data-testid="theme-toggle"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-500" />
      )}
    </Button>
  );
}
