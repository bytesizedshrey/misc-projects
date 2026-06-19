import React from "react";
import { BentoCard, BentoGrid } from "../magicui/bento-grid";
import Profile from "../Profile";
import Techstack from "../TechStack";
import Links from "../Links";
import Projects from "../Projects";
import Spam from "../Spam";
import Link from "next/link";
import Footer from "../Footer";

const features = [
  // Profile — top-left, wide
  {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1 },
    className:
      "sm:col-start-1 sm:col-end-6 sm:row-start-1 sm:row-end-3 z-10 max-sm:h-max",
    background: <Profile />,
  },
  // TechStack — full right column, tall
  {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 1 },
    className:
      "sm:col-start-6 sm:col-end-9 sm:row-start-1 sm:row-end-6 z-[8] max-sm:h-max relative",
    background: <Techstack />,
  },
  // Links — middle left strip
  {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 1 },
    className:
      "sm:col-start-1 sm:col-end-3 sm:row-start-3 sm:row-end-4 z-[7] max-sm:h-max",
    background: <Links />,
  },
  // Projects — middle center (coming soon)
  {
    initial: { scale: 1, opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { opacity: { duration: 1 }, y: { duration: 1 } },
    whileHover: { scale: 0.97, transition: { duration: 0.15 } },
    className:
      "sm:col-start-3 sm:col-end-6 sm:row-start-3 sm:row-end-4 z-[8] max-sm:h-max mx-auto overflow-hidden",
    background: (
      <Link href="/projects">
        <Projects />
      </Link>
    ),
  },
  // Spam — full bottom, wide
  {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1 },
    className:
      "sm:col-start-1 sm:col-end-6 sm:row-start-4 sm:row-end-6 z-[9] max-sm:h-max",
    background: <Spam />,
  },
];

const Grid = () => {
  return (
    <div className="flex items-center justify-center max-sm:flex-col sm:flex-row bg-transparent">
      <BentoGrid className="grid-cols-1 sm:grid-cols-8 sm:grid-rows-5 p-5 max-sm:p-4 sm:h-[770px] relative w-full max-sm:gap-3 max-sm:min-h-screen">
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
      <div className="sm:hidden w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Grid;
