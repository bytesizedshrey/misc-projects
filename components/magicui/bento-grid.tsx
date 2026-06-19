"use client";

import { ReactNode, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("grid w-full grid-cols-3 gap-3 max-sm:gap-2", className)}
    >
      {children}
    </div>
  );
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

const BentoCard = ({
  className,
  background,
  initial,
  animate,
  transition,
  whileHover,
  noGlass,
}: {
  className: string;
  initial: object;
  animate: object;
  transition: object;
  background: ReactNode;
  whileHover?: object;
  noGlass?: boolean;
}) => {
  const constraintsRef = useRef(null);
  const [, setIsDragging] = useState(false);
  const isMobile = useIsMobile();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 900 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const scale = useTransform(
    [springX, springY],
    ([latestX, latestY]) => 1 - Math.abs(latestX + latestY) / 10000
  );

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => {
    setIsDragging(false);
    springX.set(0);
    springY.set(0);
  };

  return (
    <motion.div
      ref={constraintsRef}
      drag={!isMobile}
      dragConstraints={isMobile ? false : constraintsRef}
      dragElastic={isMobile ? false : 0.6}
      dragMomentum={false}
      onDragStart={isMobile ? undefined : handleDragStart}
      onDragEnd={isMobile ? undefined : handleDragEnd}
      style={isMobile ? undefined : { x: springX, y: springY, scale }}
      whileHover={whileHover}
      role="button"
      tabIndex={0}
      aria-label="Draggable element"
      initial={initial}
      animate={animate}
      transition={transition}
      className={cn(
        "relative flex w-full rounded-xl cursor-grab",
        !noGlass && "glass",
        className
      )}
    >
      <div className="w-full h-full">{background}</div>

      <div
        className={cn(
          "pointer-events-none h-0 absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        )}
      ></div>
      <div className="pointer-events-none h-0 absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-neutral-800/10" />
    </motion.div>
  );
};

export { BentoCard, BentoGrid };
