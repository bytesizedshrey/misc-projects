"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

/* three.js only loads when the page does; until then (and if WebGL is unavailable) a flat copy of the same sheet shows */
const PaperCrumple = dynamic(() => import("./PaperCrumple"), {
  ssr: false,
  loading: () => <img className="status__flat" src="/assets/open-note.svg" alt="" width={26} height={32} />,
});

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** "open to work" with a small scrap of paper beside it: press and hold to crumple it, let go and it smooths back out. */
export default function StatusLight() {
  const slot = useRef<HTMLSpanElement>(null);

  /* The solver only draws on demand, and its first frame can be skipped while the module is still loading.
     A sub-pixel resize wakes its ResizeObserver, so the resting sheet is guaranteed to be painted. */
  useEffect(() => {
    const nudge = () => {
      const stage = slot.current?.querySelector<HTMLElement>(".status__stage");
      if (!stage) return;
      stage.style.width = "81px";
      window.setTimeout(() => (stage.style.width = ""), 120);
    };
    const ids = [500, 1500, 3000].map((ms) => window.setTimeout(nudge, ms));
    return () => ids.forEach(clearTimeout);
  }, []);

  return (
    <span className="status">
      <span className="status__paper" ref={slot}>
        <PaperCrumple
          className="status__stage"
          src="/assets/open-note.svg"
          alt="Open to work note, hold to crumple"
          width={26}
          height={32}
          sceneHeight={84}
          imageFit="contain"
          releaseBehavior="restore"
          crumpleAmount={0.85}
          crumpleDuration={REDUCED ? 0 : 0.55}
          releaseDuration={REDUCED ? 0 : 0.4}
          foldCount={6}
          foldSharpness={0.6}
          wrinkleDepth={0.65}
          creaseStrength={0.18}
          paperColor="#f4f0e8"
          paperTexture={0.08}
          shadow
          shadowOpacity={0.16}
          draggable
          dragRotation={10}
          dragRadius={10}
          returnToOrigin
        />
      </span>
      <span className="status__text">open to work</span>
    </span>
  );
}
