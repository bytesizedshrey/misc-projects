"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const W = 96; // paper size in CSS px
const H = 36;
const LABEL = "open to work";

/** Draws the sheet, with the words printed on it, in the page's own font, so the paper texture carries the text. */
function drawSheet(): string {
  const k = 8; // texture scale
  const c = document.createElement("canvas");
  c.width = W * k;
  c.height = H * k;
  const x = c.getContext("2d");
  if (!x) return "";
  const cut = 9 * k; // clipped top-right corner, like a dog-eared scrap
  x.fillStyle = "#f4f0e8";
  x.beginPath();
  x.moveTo(0, 0);
  x.lineTo(c.width - cut, 0);
  x.lineTo(c.width, cut);
  x.lineTo(c.width, c.height);
  x.lineTo(0, c.height);
  x.closePath();
  x.fill();
  x.fillStyle = "#e2dccf";
  x.beginPath();
  x.moveTo(c.width - cut, 0);
  x.lineTo(c.width, cut);
  x.lineTo(c.width - cut, cut);
  x.closePath();
  x.fill();
  const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  x.font = `560 ${13 * k}px ${family}`;
  x.fillStyle = "#4b463e";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(LABEL, c.width / 2, c.height / 2 + k * 0.5);
  return c.toDataURL("image/png");
}

/* until three.js has loaded, show a flat copy of the same sheet */
function Flat({ src }: { src?: string }) {
  return src ? (
    <img className="status__flat" src={src} alt={LABEL} width={W} height={H} />
  ) : (
    <span className="status__flat status__flat--text">{LABEL}</span>
  );
}

const PaperCrumple = dynamic(() => import("./PaperCrumple"), { ssr: false, loading: () => <Flat /> });

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** "open to work" printed on a small sheet of paper (the React Bits Paper Crumple): hold it to crumple it, let go and it smooths back out. */
export default function StatusLight() {
  const slot = useRef<HTMLSpanElement>(null);
  const [src, setSrc] = useState("");

  useEffect(() => {
    let live = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => live && setSrc(drawSheet()));
    return () => {
      live = false;
    };
  }, []);

  /* The solver only draws on demand, and its first frame can be skipped while the module is still loading.
     A sub-pixel resize wakes its ResizeObserver, so the resting sheet is guaranteed to be painted. */
  useEffect(() => {
    if (!src) return;
    const nudge = () => {
      const stage = slot.current?.querySelector<HTMLElement>(".status__stage");
      if (!stage) return;
      stage.style.width = "151px";
      window.setTimeout(() => (stage.style.width = ""), 120);
    };
    const ids = [500, 1500, 3000].map((ms) => window.setTimeout(nudge, ms));
    return () => ids.forEach(clearTimeout);
  }, [src]);

  return (
    <span className="status">
      <span className="status__paper" ref={slot}>
        {src ? (
          <PaperCrumple
            className="status__stage"
            src={src}
            alt={LABEL}
            width={W}
            height={H}
            sceneHeight={90}
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
        ) : (
          <Flat />
        )}
      </span>
    </span>
  );
}
