import React, { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalProps {
  children: ReactNode;
  title?: string;
  className?: string;
  showPrompt?: boolean;
  autoType?: boolean;
  typingDelay?: number;
}

export function Terminal({
  children,
  title = "terminal@cybersec:~$",
  className,
  showPrompt = true,
  autoType = false,
  typingDelay = 50,
}: TerminalProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(autoType);
  const [cursorPosition, setCursorPosition] = useState(0);
  const content = children?.toString() || "";

  useEffect(() => {
    if (!autoType) {
      setDisplayedContent(content);
      return;
    }

    if (isTyping && cursorPosition < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.substring(0, cursorPosition + 1));
        setCursorPosition(prev => prev + 1);
      }, typingDelay);
      return () => clearTimeout(timer);
    } else if (cursorPosition >= content.length) {
      setIsTyping(false);
    }
  }, [isTyping, cursorPosition, content, autoType, typingDelay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-cyber-darker rounded-md p-4 shadow-neu font-mono text-sm text-green-400 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-1 mb-2 px-1 py-1 bg-cyber-darkest rounded-t-sm">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <div className="h-2 w-2 rounded-full bg-yellow-400" />
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <div className="text-xs ml-2 opacity-70">{title}</div>
      </div>
      
      <div className="p-2 h-full overflow-y-auto neumorphic-inset">
        {showPrompt && (
          <div className="flex">
            <span className="text-cyber-neon-green mr-2">{title}</span>
          </div>
        )}
        <div className="whitespace-pre-wrap">
          {displayedContent}
          {isTyping && (
            <span className="animate-terminal-blink text-white">▋</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface CommandLineProps {
  command: string;
  output: ReactNode;
  showPrompt?: boolean;
  className?: string;
}

export function CommandLine({
  command,
  output,
  showPrompt = true,
  className,
}: CommandLineProps) {
  return (
    <div className={cn("font-mono text-sm", className)}>
      {showPrompt && (
        <div className="flex">
          <span className="text-cyber-neon-green">terminal@cybersec:~$</span>
          <span className="ml-2 text-white">{command}</span>
        </div>
      )}
      <div className="mt-1 whitespace-pre-wrap text-cyber-neon-blue">
        {output}
      </div>
    </div>
  );
}

interface TypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypingEffect({ 
  text, 
  speed = 50, 
  className,
  onComplete 
}: TypingEffectProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete && currentIndex === text.length) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className={cn("font-mono inline-block", className)}>
      {displayText}
      <span className="animate-terminal-blink ml-0.5">▋</span>
    </div>
  );
}

interface MatrixRainProps {
  density?: number;
  className?: string;
}

export function MatrixRain({ density = 50, className }: MatrixRainProps) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const columns = Math.floor(density);
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden opacity-20 z-0 pointer-events-none", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <div 
          key={i}
          className="text-cyber-neon-green text-xs absolute animate-matrix-rain"
          style={{ 
            left: `${(i / columns) * 100}%`, 
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${10 + Math.random() * 10}s` 
          }}
        >
          {Array.from({ length: 30 }).map((_, j) => (
            <div 
              key={j}
              className="opacity-80"
              style={{ opacity: 1 - (j / 30) }}
            >
              {characters[Math.floor(Math.random() * characters.length)]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
