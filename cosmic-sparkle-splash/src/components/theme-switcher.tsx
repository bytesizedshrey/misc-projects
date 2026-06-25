
import * as React from "react"
import { Moon, Sun, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
  const [theme, setTheme] = React.useState("light")

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark", "pink", "purple")
    root.classList.add(theme)
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="clay-button">
          {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {(theme === "pink" || theme === "purple") && (
            <Palette className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("pink")}>Pink</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("purple")}>Purple</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
