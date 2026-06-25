
import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeumorphicBoxProps {
  children: ReactNode;
  className?: string;
  inset?: boolean;
  hoverEffect?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function NeumorphicBox({
  children,
  className,
  inset = false,
  hoverEffect = false,
  onClick,
  style,
}: NeumorphicBoxProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={cn(
        "rounded-xl p-4",
        inset ? "neumorphic-inset" : "neumorphic",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface NeumorphicTextProps {
  children: ReactNode;
  className?: string;
  variant?: "h1" | "h2" | "h3" | "h4" | "p";
  glowing?: boolean;
  gradient?: boolean;
}

export function NeumorphicText({
  children,
  className,
  variant = "p",
  glowing = false,
  gradient = false,
}: NeumorphicTextProps) {
  const baseClasses = cn(
    "font-cyber tracking-wide",
    glowing && "animate-glow",
    gradient && "text-gradient-cyber",
    className
  );

  switch (variant) {
    case "h1":
      return <h1 className={cn("text-4xl md:text-5xl lg:text-6xl font-bold mb-6", baseClasses)}>{children}</h1>;
    case "h2":
      return <h2 className={cn("text-3xl md:text-4xl font-bold mb-4", baseClasses)}>{children}</h2>;
    case "h3":
      return <h3 className={cn("text-2xl md:text-3xl font-semibold mb-3", baseClasses)}>{children}</h3>;
    case "h4":
      return <h4 className={cn("text-xl md:text-2xl font-semibold mb-2", baseClasses)}>{children}</h4>;
    default:
      return <p className={cn("text-base", baseClasses)}>{children}</p>;
  }
}

interface IsometricBoxProps {
  children: ReactNode;
  className?: string;
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  topColor?: string;
  rightColor?: string;
  parallax?: boolean;
}

export function IsometricBox({
  children,
  className,
  width = 100,
  height = 100,
  depth = 20,
  color = "rgba(14, 165, 233, 0.7)",
  topColor = "rgba(14, 165, 233, 0.85)",
  rightColor = "rgba(14, 165, 233, 0.5)",
  parallax = false,
}: IsometricBoxProps) {
  return (
    <motion.div
      className={cn("relative transform-gpu", parallax && "hover:scale-105 transition-transform", className)}
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateX(60deg) rotateZ(-45deg)",
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Front face */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateZ(${depth / 2}px)`,
          background: color,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="p-4 text-white opacity-90 transform rotate-[45deg] -translate-y-1/4 scale-75">
          {children}
        </div>
      </div>

      {/* Top face */}
      <div
        className="absolute"
        style={{
          transform: `rotateX(-90deg) translateZ(${depth / 2}px)`,
          width: `${width}px`,
          height: `${depth}px`,
          background: topColor,
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      />

      {/* Right face */}
      <div
        className="absolute"
        style={{
          transform: `rotateY(90deg) translateZ(${width - depth / 2}px)`,
          width: `${depth}px`,
          height: `${height}px`,
          background: rightColor,
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      />
    </motion.div>
  );
}
