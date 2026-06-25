
'use client'

import { useState, useEffect } from "react";
import { SplineScene } from "@/components/ui/spline";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

// Modify this URL to point to your specific Spline scene
const ROBOT_SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

interface RobotDJProps {
  roboMode: boolean;
  audioPlaying: boolean;
}

export function RobotDJ({ roboMode, audioPlaying }: RobotDJProps) {
  const [danceMove, setDanceMove] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);

  // Robot dance effect when audio is playing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (audioPlaying) {
      interval = setInterval(() => {
        setDanceMove((prev) => (prev + 1) % 3);
      }, roboMode ? 500 : 2000); // Dance faster in ROBO MODE
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [audioPlaying, roboMode]);

  const handleInteraction = () => {
    setInteractionCount((prev) => prev + 1);
    setDanceMove((prev) => (prev + 1) % 3);
    
    // Trigger a sound effect
    const effects = ['/sounds/glitch.mp3', '/sounds/beat-drop.mp3', '/sounds/scratch.mp3'];
    const audio = new Audio(effects[Math.floor(Math.random() * effects.length)]);
    audio.volume = roboMode ? 0.8 : 0.5; // Louder in ROBO MODE
    audio.play().catch(err => console.log("Audio effect failed:", err));
  };

  return (
    <Card 
      className={cn(
        "w-full h-[500px] bg-background/[0.96] relative overflow-hidden clay-card group transform-gpu",
        "transition-all duration-500",
        roboMode && "h-[600px] robo-mode-container",
        danceMove === 1 && "skew-x-1",
        danceMove === 2 && "skew-y-1",
        audioPlaying && "pulse-subtle"
      )}
      onClick={handleInteraction}
    >
      <Spotlight
        className={cn(
          "-top-40 left-0 md:left-60 md:-top-20 transition-all duration-500",
          roboMode ? "opacity-90 group-hover:opacity-100" : "group-hover:opacity-70",
          roboMode && "animate-pulse"
        )}
        fill="hsl(var(--foreground))"
      />
      
      <div className="flex h-full">
        <div className={cn(
          "flex-1 p-8 relative z-10 flex flex-col justify-center transform-gpu transition-all duration-500 group-hover:translate-x-2",
          roboMode && "translate-x-4"
        )}>
          <h1 className={cn(
            "text-4xl md:text-5xl font-bold bg-clip-text text-transparent",
            "bg-gradient-to-b from-foreground to-foreground/40",
            "transition-all duration-500 group-hover:scale-105 group-hover:tracking-wider",
            roboMode && "text-6xl cyberpunk-text"
          )}>
            {roboMode ? "UNLEASHED DJ MODE" : "Interactive Robot DJ"}
          </h1>
          <p className={cn(
            "mt-4 text-muted-foreground max-w-lg transition-all duration-500 group-hover:text-foreground group-hover:translate-x-2",
            roboMode && "text-foreground cyberpunk-glow"
          )}>
            {roboMode 
              ? "SYSTEM OVERRIDE: Full cybernetic control enabled. Click to trigger dance+ mode."
              : `Click to interact (${interactionCount} interactions). Activate ROBO MODE for the full experience.`
            }
          </p>
          
          {roboMode && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "h-2 bg-accent/30 rounded-full overflow-hidden",
                    i === danceMove && "bg-primary"
                  )}
                >
                  <div 
                    className={cn(
                      "h-full bg-primary animate-pulse", 
                      i !== danceMove && "w-[30%]",
                      i === danceMove && "w-full"
                    )} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cn(
          "flex-1 relative transform-gpu transition-all duration-500",
          "group-hover:scale-105 group-hover:rotate-2",
          roboMode && "scale-110 group-hover:scale-115 group-hover:rotate-3",
          danceMove === 1 && "bounce-subtle",
          danceMove === 2 && "sway-subtle"
        )}>
          <SplineScene 
            scene={ROBOT_SCENE_URL}
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
}
