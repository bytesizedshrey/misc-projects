import React from "react";
import { BentoCard, BentoGrid } from "../magicui/bento-grid";
import Profile from "../Profile";
import Techstack from "../TechStack";
import Links from "../Links";
import Projects from "../Projects";
import Spam from "../Spam";
import Link from "next/link";
import Footer from "../Footer";

/**
 * Grid layout (8 cols × 5 rows):
 *
 * Col:  1   2   3   4   5   6   7   8
 * R1:  [Profile  Profile  Profile][Lnk][Tech Tech Tech]
 * R2:  [Profile  Profile  Profile][Prj][Tech Tech Tech]
 * R3:  [Spam  Spam  Spam  Spam  Spam  ][Tech Tech Tech]
 * R4:  [Spam  Spam  Spam  Spam  Spam  ][Tech Tech Tech]
 * R5:  [Spam  Spam  Spam  Spam  Spam  ][Tech Tech Tech]
 *
 * Profile  → col 1-6, row 1-3  (5 wide, 2 tall)
 * Links    → col 6-7, row 1-2  (1 wide, 1 tall, transparent)
 * Projects → col 6-7, row 2-3  (1 wide, 1 tall, glass)
 * TechStack→ col 7-9, row 1-6  (2 wide, 5 tall)
 * Spam     → col 1-7, row 3-6  (6 wide, 3 tall, transparent)
 */

const features = [
  // ── Profile ─────────────────────────────────────────────────────────────
  {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1 },
    className:
      "sm:col-start-1 sm:col-end-6 sm:row-start-1 sm:row-end-3 z-10 max-sm:h-max",
    background: <Profile />,
  },
  // ── TechStack (right tall column) ───────────────────────────────────────
  {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 1 },
    className:
      "sm:col-start-7 sm:col-end-9 sm:row-start-1 sm:row-end-6 z-[8] max-sm:h-max relative",
    background: <Techstack />,
  },
  // ── Links (small strip between Profile and TechStack) ───────────────────
  {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 1 },
    className:
      "sm:col-start-6 sm:col-end-7 sm:row-start-1 sm:row-end-3 z-[7] max-sm:h-max",
    background: <Links />,
    noGlass: false,
  },
  // ── Projects (small, below Links) ───────────────────────────────────────
  {
    initial: { scale: 1, opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    transition: { opacity: { duration: 1 }, x: { duration: 1 } },
    whileHover: { scale: 0.97, transition: { duration: 0.15 } },
    className:
      "sm:col-start-6 sm:col-end-7 sm:row-start-3 sm:row-end-4 z-[8] max-sm:h-max overflow-hidden",
    background: (
      <Link href="/projects">
        <Projects />
      </Link>
    ),
  },
  // ── Spam (full bottom, transparent — has its own internal sub-cards) ─────
  {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1 },
    className:
      "sm:col-start-1 sm:col-end-7 sm:row-start-3 sm:row-end-6 z-[9] max-sm:h-max",
    background: <Spam />,
    noGlass: true,
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
