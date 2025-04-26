
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bot, CircleSlash, CirclePlay, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoboModeToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function RoboModeToggle({ enabled, onToggle }: RoboModeToggleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (enabled) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [enabled]);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2 bg-background/40 backdrop-blur-sm rounded-full px-3 py-1",
        "border transition-all duration-300",
        enabled ? "border-primary shadow-[0_0_15px_rgba(0,255,198,0.2)]" : "border-border hover:border-primary/30",
        isAnimating && "animate-pulse"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full transition-all duration-300",
          enabled && "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,255,198,0.3)]"
        )}
        onClick={onToggle}
      >
        {enabled ? (
          <Zap className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </Button>
      
      <div className="flex flex-col">
        <span className={cn(
          "text-xs font-medium transition-all duration-300",
          "font-poppins tracking-wide",
          enabled ? "text-primary" : "text-foreground"
        )}>
          {enabled ? "ROBO MODE" : "ROBO MODE"}
        </span>
        
        <div className="flex items-center gap-1">
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className={cn(
              "data-[state=checked]:bg-primary",
              enabled && "animate-pulse shadow-[0_0_10px_rgba(0,255,198,0.3)]"
            )}
          />
          <span className="text-[10px] text-muted font-inter">
            {enabled ? "ON" : "OFF"}
          </span>
        </div>
      </div>
      
      {enabled && (
        <CirclePlay 
          className={cn(
            "h-4 w-4 text-primary transition-all duration-300",
            isAnimating && "animate-spin"
          )}
        />
      )}
      
      {!enabled && isHovered && (
        <CircleSlash className="h-4 w-4 text-muted" />
      )}
    </div>
  );
}
