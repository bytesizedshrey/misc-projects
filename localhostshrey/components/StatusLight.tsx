"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const W = 96; // paper size in CSS px
const H = 36;
const LABEL = "open to work";

/** Small seeded PRNG so the sheet is the same on every load. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let sheetSrc = "";

/**
 * Draws the sheet, with the words printed on it, in the page's own font. It is a small scrap of paper:
 * a slightly wobbly edge, fibres and mottling, a darker rim where the paper has aged, and a folded bottom corner.
 * The paper texture carries the text, so it crumples with the sheet.
 */
function drawSheet(): string {
  const k = 8; // texture scale
  const cw = W * k;
  const ch = H * k;
  const c = document.createElement("canvas");
  c.width = cw;
  c.height = ch;
  const x = c.getContext("2d");
  if (!x) return "";
  const rand = rng(11);
  const m = 2.4 * k; // margin so the wobbly edge never clips
  const x0 = m,
    y0 = m,
    x1 = cw - m,
    y1 = ch - m;
  const f = 10 * k; // folded corner size

  // outline: each edge is walked in small steps with a little wobble, like hand-torn or cut paper
  const edge = (ax: number, ay: number, bx: number, by: number, amp: number) => {
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(2, Math.round(len / (4 * k)));
    const nx = -(by - ay) / len,
      ny = (bx - ax) / len;
    const phase = rand() * 6.28;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const w = (rand() - 0.5) * amp + Math.sin(t * 5 + phase) * amp * 0.45;
      x.lineTo(ax + (bx - ax) * t + nx * w, ay + (by - ay) * t + ny * w);
    }
  };
  const outline = () => {
    x.beginPath();
    x.moveTo(x0 + rand() * k * 0.8, y0 + rand() * k * 0.8);
    edge(x0, y0, x1, y0 + rand() * k * 0.6, 0.9 * k);
    edge(x1, y0, x1 - rand() * k * 0.5, y1 - f, 0.8 * k);
    x.lineTo(x1 - f, y1); // the corner is folded over, so the outline cuts across it
    edge(x1 - f, y1, x0 + rand() * k, y1 - rand() * k * 0.5, 0.9 * k);
    edge(x0, y1, x0 + rand() * k * 0.4, y0, 0.8 * k);
    x.closePath();
  };

  outline();
  x.save();
  x.clip();

  // body: warm off-white with soft mottling
  x.fillStyle = "#f5f1e8";
  x.fillRect(0, 0, cw, ch);
  for (let i = 0; i < 7; i++) {
    const bx = rand() * cw,
      by = rand() * ch,
      r = (10 + rand() * 14) * k;
    const g = x.createRadialGradient(bx, by, 0, bx, by, r);
    const warm = rand() > 0.5;
    g.addColorStop(0, warm ? "rgba(205,180,140,0.14)" : "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, cw, ch);
  }
  // fine grain
  for (let i = 0; i < 5200; i++) {
    const sz = 1.5 + rand() * 4;
    x.fillStyle = rand() > 0.55 ? `rgba(120,98,64,${0.04 + rand() * 0.06})` : `rgba(255,255,255,${0.2 + rand() * 0.3})`;
    x.fillRect(rand() * cw, rand() * ch, sz, sz);
  }
  // a few loose fibres
  x.lineWidth = 1.2;
  for (let i = 0; i < 46; i++) {
    const fx = rand() * cw,
      fy = rand() * ch,
      l = (4 + rand() * 9) * k,
      a = rand() * 6.28;
    x.strokeStyle = `rgba(110,90,60,${0.05 + rand() * 0.06})`;
    x.beginPath();
    x.moveTo(fx, fy);
    x.quadraticCurveTo(fx + Math.cos(a) * l * 0.5 + (rand() - 0.5) * 8, fy + Math.sin(a) * l * 0.5 + (rand() - 0.5) * 8, fx + Math.cos(a) * l, fy + Math.sin(a) * l);
    x.stroke();
  }
  // the rim of the sheet is a touch darker, as if handled
  outline();
  x.lineJoin = "round";
  x.strokeStyle = "rgba(125,98,60,0.035)";
  x.lineWidth = 6 * k;
  x.stroke();
  x.strokeStyle = "rgba(125,98,60,0.06)";
  x.lineWidth = 2.2 * k;
  x.stroke();
  x.restore();

  // folded bottom-right corner: a lighter flap with a crease and a soft shadow on the sheet beneath
  const A = [x1 - f, y1],
    B = [x1, y1 - f],
    C = [x1 - f, y1 - f];
  x.save();
  x.shadowColor = "rgba(70,50,20,0.38)";
  x.shadowBlur = 3.2 * k;
  x.shadowOffsetX = -0.9 * k;
  x.shadowOffsetY = -0.9 * k;
  const flap = x.createLinearGradient(C[0], C[1], (A[0] + B[0]) / 2, (A[1] + B[1]) / 2);
  flap.addColorStop(0, "#fffdf8");
  flap.addColorStop(1, "#e6dece");
  x.fillStyle = flap;
  x.beginPath();
  x.moveTo(A[0], A[1]);
  x.lineTo(B[0], B[1]);
  x.lineTo(C[0], C[1]);
  x.closePath();
  x.fill();
  x.restore();
  x.strokeStyle = "rgba(110,88,55,0.32)";
  x.lineWidth = 1.1 * k;
  x.beginPath();
  x.moveTo(A[0], A[1]);
  x.lineTo(B[0], B[1]);
  x.stroke();
  x.strokeStyle = "rgba(110,88,55,0.14)";
  x.lineWidth = 0.7 * k;
  x.beginPath();
  x.moveTo(B[0], B[1]);
  x.lineTo(C[0], C[1]);
  x.lineTo(A[0], A[1]);
  x.stroke();

  // the words, printed in ink so the grain shows through
  const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  x.save();
  x.translate(cw / 2, ch / 2 + 0.2 * k);
  x.rotate(-0.012);
  x.globalCompositeOperation = "multiply";
  x.font = `560 ${13 * k}px ${family}`;
  x.fillStyle = "#4a443a";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(LABEL, 0, 0);
  x.restore();

  sheetSrc = c.toDataURL("image/png");
  return sheetSrc;
}

/* until three.js has loaded, show a flat copy of the same sheet */
function Flat({ src = sheetSrc }: { src?: string }) {
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
            rotation={-2}
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
            shadowOpacity={0.1}
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
