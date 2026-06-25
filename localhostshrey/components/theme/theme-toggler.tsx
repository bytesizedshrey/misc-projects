"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggler() {
  const { theme, setTheme } = useTheme();

  const switchTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark");
        break;
      case "dark":
        setTheme("light");
        break;
      default:
        break;
    }
  };

  const toggleTheme = () => {
    //@ts-expect-error: Shut Up!
    if (!document.startViewTransition) switchTheme();

    //@ts-expect-error: Shut Up!
    document.startViewTransition(switchTheme);
  };

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      className="rounded-full !border-none bg-transparent "
    >
      <p className=" w-[1.2rem] scale-100 transition-all duration-100 dark:scale-0 text-white dark:text-zinc-500 font-bold hover:[box-shadow:1px_1px_50px_-1px_#fff] bg-none rounded-full">
        <SunIcon className="w-full h-full" />
      </p>

      <p className="absolute w-[1.2rem] scale-0 transition-all duration-100 dark:scale-100 text-zinc-500 dark:text-black font-bold hover:[box-shadow:1px_1px_50px_20px_#c6c6c650] bg-none rounded-full ">
        <MoonIcon className="w-full h-full" />
      </p>
    </Button>
  );
}
