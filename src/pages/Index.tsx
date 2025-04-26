
import React, { useState, useEffect } from "react";
import { SparklesPreviewDark } from "@/components/ui/sparkles-preview";
import { SplineSceneBasic } from "@/components/ui/spline-demo";
import { FloatingEmojis } from "@/components/ui/floating-emojis";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { RobotDJ } from "@/components/robot-dj";
import { AudioControls } from "@/components/audio-controls";
import { RoboModeToggle } from "@/components/robo-mode-toggle";
import { cn } from "@/lib/utils";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [roboMode, setRoboMode] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const toggleRoboMode = () => {
    setRoboMode(!roboMode);
    // Trigger some audio effect when toggling robo mode
    const audio = new Audio(roboMode ? '/sounds/power-down.mp3' : '/sounds/power-up.mp3');
    audio.play().catch(err => console.log("Audio play failed:", err));
  };

  if (loading) {
    return <SparklesPreviewDark />;
  }

  return (
    <>
      <div className={cn("animated-bg", roboMode && "robo-mode-bg")} />
      <FloatingEmojis />
      
      <div className={cn("fixed top-4 right-4 z-50 flex items-center gap-4", 
        roboMode && "animate-pulse")}>
        <AudioControls isPlaying={audioPlaying} onToggle={() => setAudioPlaying(!audioPlaying)} />
        <RoboModeToggle enabled={roboMode} onToggle={toggleRoboMode} />
        <ThemeSwitcher />
      </div>
      
      <div className={cn("min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8 overflow-auto relative transition-all duration-500",
        roboMode && "robo-mode")}>
        <div className="max-w-7xl mx-auto">
          <div className={cn("text-center mb-12 clay-card p-8 hover-lift", 
            roboMode && "robo-mode-card")}>
            <h1 className={cn("text-4xl md:text-5xl font-bold mb-4 text-3d text-gradient",
              roboMode && "text-6xl tracking-wider")}>
              Cyberpunk Visual Mixtape
            </h1>
            <p className={cn("text-xl text-muted-foreground mb-8 transition-all duration-300 hover:tracking-wide",
              roboMode && "text-foreground")}>
              Interact with the Robot DJ below to trigger remix effects
            </p>
          </div>
          
          <div className={cn("mb-16 hover-lift", roboMode && "robo-dance")}>
            <RobotDJ roboMode={roboMode} audioPlaying={audioPlaying} />
          </div>
          
          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 mt-12",
            roboMode && "grid-cols-1 md:grid-cols-3 gap-4")}>
            <div className={cn("clay-card p-8 group hover-lift", roboMode && "robo-mode-card")}>
              <h2 className="text-2xl font-semibold mb-4 text-3d text-gradient">
                Cyberpunk Vibes
              </h2>
              <p className="text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:tracking-wide">
                Neon lights, digital dreams, and futuristic beats
              </p>
            </div>
            
            <div className={cn("clay-card p-8 group hover-lift", roboMode && "robo-mode-card")}>
              <h2 className="text-2xl font-semibold mb-4 text-3d text-gradient">
                Interactive DJ
              </h2>
              <p className="text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:tracking-wide">
                Click on the robot to trigger dance moves and remix effects
              </p>
            </div>

            {roboMode && (
              <div className="clay-card p-8 group hover-lift robo-mode-card">
                <h2 className="text-2xl font-semibold mb-4 text-3d text-gradient">
                  ROBO MODE ON
                </h2>
                <p className="text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:tracking-wide">
                  Extreme neon visuals and bass-boosted audio unlocked
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
