import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Shield, Lock, Terminal, Database, Server, FileCode, Key, Mail, BookOpen } from "lucide-react";

// Icon components that will be rendered in isometric style
const CYBER_ICONS = {
  shield: Shield,
  lock: Lock,
  terminal: Terminal,
  database: Database,
  server: Server,
  code: FileCode,
  key: Key,
  mail: Mail,
  book: BookOpen,
};

type CyberIconType = keyof typeof CYBER_ICONS;

interface CyberIconProps {
  icon: CyberIconType;
  className?: string;
  size?: number;
  glowing?: boolean;
  color?: string;
}

export function CyberIcon({
  icon,
  className,
  size = 0,
  glowing = false,
  color = "currentColor",
}: CyberIconProps) {
  const IconComponent = CYBER_ICONS[icon];
  
  return (
    <div className={cn(
      "relative inline-flex items-center justify-center",
      glowing && "animate-pulse-slow",
      className
    )}>
      <IconComponent 
        size={size} 
        className={cn(
          glowing && "drop-shadow-lg", 
          glowing && color === "hsl(var(--terminal-green))" && "shadow-terminal",
          glowing && color === "hsl(var(--neon-purple))" && "shadow-neon-purple",
          glowing && color === "hsl(var(--neon-blue))" && "shadow-neon-blue"
        )}
        color={color}
      />
    </div>
  );
}

interface IsometricIconProps {
  icon: CyberIconType;
  className?: string;
  size?: number;
  glowing?: boolean;
  color?: string;
  hoverEffect?: boolean;
}

export function IsometricIcon({
  icon,
  className,
  size = 50,
  glowing = true,
  color = "hsl(var(--neon-purple))",
  hoverEffect = true,
}: IsometricIconProps) {
  const IconComponent = CYBER_ICONS[icon];
  
  return (
    <motion.div
      className={cn(
        "relative transform-gpu",
        hoverEffect && "hover:scale-110 transition-transform duration-300",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateX(55deg) rotateZ(-45deg)",
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* <div
        className={cn(
          "absolute inset-0 rounded-md bg-opacity-80 backdrop-blur-sm flex items-center justify-center",
          glowing && "animate-pulse-slow"
        )}
        style={{
          background: `rgba(26, 31, 44, 0.8)`,
          border: `1px solid ${color}`,
          boxShadow: glowing ? `0 0 10px ${color}, 0 0 5px ${color}` : 'none',
        }}
      >
        <IconComponent
          size={size * 0.6}
          className="transform rotate-[45deg]"
          color={color}
        />
      </div> */}
    </motion.div>
  );
}

interface CyberGridProps {
  className?: string;
  density?: number;
  animate?: boolean;
}

export function CyberGrid({ 
  className,
  density = 40,
  animate = true,
}: CyberGridProps) {
  return (
    <div 
      className={cn(
        "absolute inset-0 opacity-20 pointer-events-none z-0",
        className
      )}
      style={{
        backgroundImage: 'linear-gradient(rgba(220, 220, 220, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)',
        backgroundSize: `${density}px ${density}px`,
        backgroundPosition: 'center center',
      }}
    >
      {animate && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cyber-darker" />
      )}
      {animate && (
        <div className="absolute inset-x-0 top-0 h-0 animate-scanner bg-gradient-to-b from-transparent to-cyber-neon-blue opacity-5" />
      )}
    </div>
  );
}

interface HexagonGridProps {
  className?: string;
  count?: number;
}

export function HexagonGrid({ className, count = 20 }: HexagonGridProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden opacity-10 pointer-events-none z-0", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute border-2 border-cyber-neon-blue"
          style={{
            clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            width: `${40 + Math.random() * 60}px`,
            height: `${40 + Math.random() * 60}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.6,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

interface ScannerEffectProps {
  className?: string;
  interval?: number;
}

export function ScannerEffect({ className, interval = 5000 }: ScannerEffectProps) {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanning(true);
      const resetTimer = setTimeout(() => setScanning(false), 2000);
      return () => clearTimeout(resetTimer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [interval]);

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
      {scanning && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{ duration: 2, ease: "linear" }}
          className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-cyber-neon-green to-transparent opacity-10"
        />
      )}
    </div>
  );
}

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchInterval?: number;
  duration?: number;
}

export function GlitchText({ 
  text, 
  className,
  glitchInterval = 5000,
  duration = 200
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    const glitchTimer = setInterval(() => {
      setIsGlitching(true);
      
      // Generate glitched text
      const glitchText = text.split('').map(char => {
        return Math.random() > 0.7 ? String.fromCharCode(Math.floor(Math.random() * 94) + 33) : char;
      }).join('');
      
      setDisplayText(glitchText);
      
      // Reset after short duration
      const resetTimer = setTimeout(() => {
        setDisplayText(text);
        setIsGlitching(false);
      }, duration);
      
      return () => clearTimeout(resetTimer);
    }, glitchInterval);
    
    return () => clearInterval(glitchTimer);
  }, [text, glitchInterval, duration]);
  
  return (
    <span className={cn(
      "inline-block transition-all duration-100", 
      isGlitching && "text-cyber-neon-blue opacity-90",
      className
    )}>
      {displayText}
    </span>
  );
}
