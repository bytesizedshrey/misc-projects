// Everything that isn't a person: benches, picnic blankets, the bin, ducks,
// pigeons, birds overhead, the rowboat, toy sailboats, the ice-cream cart and
// its umbrella. Static things are painted once; animals and boats are drawn
// each frame from cached sprites.

import { cast, flat, groundTransform, mkPt, onGround, project, screenTransform, setDrift, SUN, toScreenVec, type Pt } from "./camera";
import { pondPoint, type Bench, type Blanket, type Pond, type Reed } from "./layout";
import { seeded } from "./util";
import { makeCanvas } from "./util";

type Ctx = CanvasRenderingContext2D;

// ------------------------------------------------------------- benches ----

type Frame = (a: number, b: number, z: number, out: Pt) => Pt;

/** A frame whose axes are (across, forward, up) at a position and heading. */
function frame(x: number, y: number, face: number, u: number, shadow: boolean): Frame {
  const c = Math.cos(face);
  const s = Math.sin(face);
  return (a, b, z, out) => {
    const wx = x + (-s * a + c * b) * u;
    const wy = y + (c * a + s * b) * u;
    return shadow ? cast(wx, wy, z * u, out) : project(wx, wy, z * u, out);
  };
}

const q0 = mkPt(), q1 = mkPt(), q2 = mkPt(), q3 = mkPt();

function quad(g: Ctx, f: Frame, a0: number, a1: number, b0: number, z0: number, b1: number, z1: number) {
  f(a0, b0, z0, q0);
  f(a1, b0, z0, q1);
  f(a1, b1, z1, q2);
  f(a0, b1, z1, q3);
  g.beginPath();
  g.moveTo(q0.x, q0.y);
  g.lineTo(q1.x, q1.y);
  g.lineTo(q2.x, q2.y);
  g.lineTo(q3.x, q3.y);
  g.closePath();
  g.fill();
}

function line(g: Ctx, f: Frame, a: number, b0: number, z0: number, b1: number, z1: number) {
  f(a, b0, z0, q0);
  f(a, b1, z1, q1);
  g.beginPath();
  g.moveTo(q0.x, q0.y);
  g.lineTo(q1.x, q1.y);
  g.stroke();
}

const SEAT = [-0.2, -0.115, -0.03, 0.055, 0.14];
const BACK = [0.56, 0.68, 0.8];
const backB = (t: number) => -0.27 - (t - 0.5) * 0.28;

function benchFrame(g: Ctx, f: Frame) {
  for (const a of [-0.89, 0, 0.89]) {
    line(g, f, a, 0.19, 0, 0.2, 0.44);
    line(g, f, a, -0.2, 0, -0.22, 0.44);
    line(g, f, a, -0.22, 0.44, backB(0.9), 0.9);
    if (a) {
      line(g, f, a, -0.24, 0.66, 0.2, 0.64);
      line(g, f, a, 0.2, 0.64, 0.2, 0.44);
    }
  }
}

function drawBenchShadow(g: Ctx, b: Bench, u: number) {
  const f = frame(b.x, b.y, b.face, u, true);
  g.fillStyle = "rgba(0,0,0,0.75)";
  g.strokeStyle = "rgba(0,0,0,0.75)";
  g.lineWidth = 0.05 * u;
  g.lineCap = "round";
  for (const t of SEAT) quad(g, f, -0.95, 0.95, t, 0.45, t + 0.065, 0.45);
  for (const t of BACK) quad(g, f, -0.95, 0.95, backB(t), t, backB(t + 0.08), t + 0.08);
  benchFrame(g, f);
}

function drawBench(g: Ctx, b: Bench, u: number) {
  const f = frame(b.x, b.y, b.face, u, false);
  g.lineCap = "round";
  g.strokeStyle = "rgb(34,42,38)";
  g.lineWidth = 0.05 * u;
  benchFrame(g, f);
  SEAT.forEach((t, i) => {
    g.fillStyle = `rgb(${188 + (i % 2) * 8},${154 + (i % 2) * 6},112)`;
    quad(g, f, -0.95, 0.95, t, 0.45, t + 0.065, 0.45);
    g.fillStyle = "rgba(90,60,36,0.35)";
    quad(g, f, -0.95, 0.95, t + 0.05, 0.45, t + 0.065, 0.45);
  });
  BACK.forEach((t, i) => {
    g.fillStyle = `rgb(${166 + 6 * i},${132 + 5 * i},94)`;
    quad(g, f, -0.95, 0.95, backB(t), t, backB(t + 0.08), t + 0.08);
  });
  g.strokeStyle = "rgb(34,42,38)";
  for (const a of [-0.89, 0.89]) line(g, f, a, -0.24, 0.66, 0.2, 0.64);
}

// ------------------------------------------------------------ blankets ----

function drawBlanket(g: Ctx, bl: Blanket, u: number) {
  const w = 2 * u;
  const h = 1.6 * u;
  g.save();
  g.translate(bl.x, bl.y);
  g.rotate(bl.ang);
  g.fillStyle = "rgb(244,240,230)";
  g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = bl.check;
  const cell = 0.25 * u;
  for (let i = 0; i * cell < w; i += 2) g.fillRect(-w / 2 + i * cell, -h / 2, cell, h);
  for (let i = 0; i * cell < h; i += 2) g.fillRect(-w / 2, -h / 2 + i * cell, w, cell);
  const sheen = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  sheen.addColorStop(0, "rgba(255,252,240,0.18)");
  sheen.addColorStop(0.45, "rgba(60,40,30,0.08)");
  sheen.addColorStop(0.55, "rgba(255,252,240,0.14)");
  sheen.addColorStop(1, "rgba(60,40,30,0.1)");
  g.fillStyle = sheen;
  g.fillRect(-w / 2, -h / 2, w, h);
  // a turned-up corner, a basket, an apple and a plate
  g.fillStyle = "rgba(240,232,214,0.9)";
  g.beginPath();
  g.moveTo(w / 2, h / 2 - 0.35 * u);
  g.lineTo(w / 2, h / 2);
  g.lineTo(w / 2 - 0.35 * u, h / 2);
  g.closePath();
  g.fill();
  g.fillStyle = "rgb(168,124,80)";
  g.fillRect(0.22 * w, -0.38 * h, 0.46 * u, 0.32 * u);
  g.fillStyle = "rgb(230,90,70)";
  g.beginPath();
  g.arc(0.12 * w, 0.3 * h, 0.08 * u, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgb(250,250,246)";
  g.beginPath();
  g.arc(-0.1 * w, 0.28 * h, 0.07 * u, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

// ------------------------------------------------------------ lily pads ----

/** Green pads crowding the pond's far rim. */
function drawPads(g: Ctx, pond: Pond, u: number) {
  const r = seeded(51);
  for (let i = 0; i < 16; i++) {
    const at = pondPoint(pond, -0.9 + 1.5 * r(), 0.72 + 0.2 * r());
    const rad = u * (0.2 + 0.2 * r());
    const rot = r() * Math.PI * 2;
    g.fillStyle = `rgb(${70 + 30 * r()},${110 + 30 * r()},${70 + 20 * r()})`;
    g.beginPath();
    g.moveTo(at.x, at.y);
    g.arc(at.x, at.y, rad, rot + 0.3, rot + 2 * Math.PI);
    g.closePath();
    g.fill();
    g.strokeStyle = "rgba(30,60,40,0.35)";
    g.lineWidth = 0.6;
    g.beginPath();
    g.arc(at.x, at.y, 0.95 * rad, 0, Math.PI * 2);
    g.stroke();
  }
}

// ----------------------------------------------------------------- bin ----

function drawBinShadow(g: Ctx, x: number, y: number, u: number) {
  g.fillStyle = "rgba(0,0,0,0.6)";
  const p = mkPt();
  for (let i = 0; i <= 6; i++) {
    cast(x, y, (i / 6) * 0.85 * u, p);
    g.beginPath();
    g.arc(p.x, p.y, 0.28 * u, 0, Math.PI * 2);
    g.fill();
  }
}

function drawBin(g: Ctx, x: number, y: number, u: number) {
  const r = 0.28 * u;
  const base = project(x, y, 0, mkPt());
  const top = project(x, y, 0.85 * u, mkPt());
  const mid = project(x, y, 0.62 * u, mkPt());
  g.fillStyle = "rgb(48,52,50)";
  g.beginPath();
  g.ellipse(base.x, base.y, r, r * 0.7, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgb(214,214,206)";
  g.beginPath();
  g.ellipse(mid.x, mid.y, 0.86 * r, 0.86 * r * 0.7, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgb(150,112,70)";
  g.beginPath();
  g.ellipse(mid.x + 0.2 * r, mid.y - 0.15 * r, 0.25 * r, 0.16 * r, 0.6, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(40,54,48,0.85)";
  g.lineWidth = 0.7;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const cs = Math.cos(a);
    const sn = Math.sin(a);
    g.beginPath();
    g.moveTo(base.x + cs * r, base.y + sn * r);
    g.lineTo(top.x + cs * r * top.k, top.y + sn * r * top.k);
    g.stroke();
  }
  g.strokeStyle = "rgb(40,58,50)";
  g.lineWidth = 0.06 * u;
  g.beginPath();
  g.ellipse(top.x, top.y, r, r * 0.7, 0, 0, Math.PI * 2);
  g.stroke();
}

// --------------------------------------------------------------- reeds ----

/** Tufts of reed and bulrush standing along the shore. */
function drawReeds(g: Ctx, reeds: Reed[]) {
  const p0 = mkPt();
  const p1 = mkPt();
  g.lineCap = "round";
  for (const r of reeds) {
    const blades = 4 + ((r.seed * 4) | 0);
    for (let i = 0; i < blades; i++) {
      const k = (i + 1) / blades;
      const lean = r.lean + (k - 0.5) * 0.5;
      const hh = r.h * (0.7 + 0.5 * ((i * 37 + r.seed * 11) % 1));
      project(r.x + (k - 0.5) * 0.5 * r.h * 0.5, r.y, 0, p0);
      toScreenVec(lean * hh, 0, p1);
      const tx = p0.x + p1.x;
      const ty = p0.y - hh * 0.8 + p1.y;
      g.strokeStyle = i % 2 ? "rgb(98,124,62)" : "rgb(132,142,74)";
      g.lineWidth = Math.max(0.9, r.h * 0.07);
      g.beginPath();
      g.moveTo(p0.x, p0.y);
      g.quadraticCurveTo(p0.x + (tx - p0.x) * 0.3, p0.y - hh * 0.5, tx, ty);
      g.stroke();
      if (i === 1 && r.seed > 0.35) {
        g.strokeStyle = "rgb(112,74,44)";
        g.lineWidth = Math.max(1.4, r.h * 0.13);
        g.beginPath();
        g.moveTo(tx - (tx - p0.x) * 0.1, ty + hh * 0.16);
        g.lineTo(tx, ty);
        g.stroke();
      }
    }
  }
}

export interface StaticProps {
  body: HTMLCanvasElement;
  shadow: HTMLCanvasElement;
}

export function paintStaticProps(
  vw: number,
  vh: number,
  dpr: number,
  u: number,
  benches: Bench[],
  blankets: Blanket[],
  bin: { x: number; y: number },
  pond: Pond,
  reeds: Reed[],
): StaticProps {
  setDrift(0, 0);
  const body = makeCanvas(vw * dpr, vh * dpr);
  const shadow = makeCanvas(vw, vh);
  const g = body.getContext("2d")!;
  const sg = shadow.getContext("2d")!;
  // flat things lie on the ground plane: paint them under the ground transform
  groundTransform(g, dpr);
  drawPads(g, pond, u);
  for (const bl of blankets) drawBlanket(g, bl, u);
  screenTransform(g, dpr);
  drawReeds(g, reeds);
  groundTransform(sg, 1);
  for (const b of benches) drawBenchShadow(sg, b, u);
  drawBinShadow(sg, bin.x, bin.y, u);
  screenTransform(g, dpr);
  for (const b of benches) drawBench(g, b, u);
  drawBin(g, bin.x, bin.y, u);
  return { body, shadow };
}

// --------------------------------------------------------------- ducks ----

export type DuckKind = 0 | 1 | 2; // white, drake, hen

const DUCK = {
  0: { body: "#fbf8f1", back: "#ece5d6", wing: "#ddd4c2", head: "#fffdf8", bill: "#f2a43a", tail: "#e9e1d0" },
  1: { body: "#d9d4ca", back: "#9b9083", wing: "#8a7e70", head: "#1f6a45", bill: "#e3c64a", tail: "#2a2a2c" },
  2: { body: "#a9875f", back: "#8a6a47", wing: "#7a5c3c", head: "#9c7c58", bill: "#d08a40", tail: "#6e5236" },
} as const;

interface Cached { cv: HTMLCanvasElement; size: number }
const cache = new Map<string, Cached>();
export const clearPropCache = () => cache.clear();

function cached(key: string, size: number, dpr: number, paint: (g: Ctx, s: number) => void): Cached {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = makeCanvas(size * dpr, size * dpr);
  const g = cv.getContext("2d")!;
  g.scale(dpr, dpr);
  g.translate(size / 2, size / 2);
  paint(g, size);
  const out = { cv, size };
  cache.set(key, out);
  return out;
}

function paintDuck(g: Ctx, t: number, kind: DuckKind) {
  const c = DUCK[kind];
  g.fillStyle = c.body;
  g.beginPath();
  g.moveTo(-0.5 * t, 0);
  g.bezierCurveTo(-0.44 * t, -0.2 * t, 0.12 * t, -0.22 * t, 0.24 * t, -0.08 * t);
  g.lineTo(0.24 * t, 0.08 * t);
  g.bezierCurveTo(0.12 * t, 0.22 * t, -0.44 * t, 0.2 * t, -0.5 * t, 0);
  g.fill();
  g.fillStyle = c.wing;
  for (const s of [-1, 1]) {
    g.beginPath();
    g.moveTo(0.12 * t, 0.13 * s * t);
    g.quadraticCurveTo(-0.15 * t, 0.19 * s * t, -0.42 * t, 0.03 * s * t);
    g.quadraticCurveTo(-0.15 * t, 0.05 * s * t, 0.12 * t, 0.13 * s * t);
    g.fill();
  }
  g.fillStyle = c.back;
  g.beginPath();
  g.ellipse(-0.08 * t, 0, 0.26 * t, 0.06 * t, 0, 0, Math.PI * 2);
  g.fill();
  if (kind === 1) {
    g.fillStyle = "#3a5cb0";
    for (const s of [-1, 1]) g.fillRect(-0.18 * t, 0.155 * s * t - 0.015 * t, 0.12 * t, 0.03 * t);
    g.fillStyle = "#7a4630";
    g.beginPath();
    g.ellipse(0.17 * t, 0, 0.08 * t, 0.13 * t, 0, 0, Math.PI * 2);
    g.fill();
  }
  if (kind === 2) {
    g.fillStyle = "rgba(60,38,20,0.5)";
    for (let i = 0; i < 18; i++) {
      g.beginPath();
      g.ellipse((-0.4 + (i % 6) * 0.11) * t, (((7 * i) % 5) - 2) * 0.05 * t, 0.025 * t, 0.012 * t, 0.4, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.fillStyle = c.tail;
  g.beginPath();
  g.moveTo(-0.46 * t, -0.05 * t);
  g.lineTo(-0.58 * t, 0);
  g.lineTo(-0.46 * t, 0.05 * t);
  g.fill();
  if (kind === 1) {
    g.fillStyle = "#f4f1ea";
    g.beginPath();
    g.arc(0.27 * t, 0, 0.1 * t, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = c.head;
  g.beginPath();
  g.ellipse(0.33 * t, 0, 0.11 * t, 0.095 * t, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = c.bill;
  g.beginPath();
  g.roundRect(0.41 * t, -0.042 * t, 0.15 * t, 0.084 * t, 0.04 * t);
  g.fill();
  g.fillStyle = "rgba(0,0,0,0.25)";
  g.fillRect(0.47 * t, -0.012 * t, 0.02 * t, 0.024 * t);
  g.fillStyle = "#141414";
  for (const s of [-1, 1]) {
    g.beginPath();
    g.arc(0.36 * t, 0.075 * s * t, 0.016 * t, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = kind === 1 ? "rgba(150,230,170,0.45)" : "rgba(255,255,255,0.4)";
  g.beginPath();
  g.ellipse(0.31 * t, 0.02 * t, 0.05 * t, 0.035 * t, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.25)";
  g.beginPath();
  g.ellipse(-0.05 * t, 0.04 * t, 0.22 * t, 0.05 * t, 0, 0, Math.PI * 2);
  g.fill();
}

export function drawDuck(g: Ctx, x: number, y: number, heading: number, size: number, kind: DuckKind, dpr: number, squash = 1) {
  const sp = cached(`d${kind}:${Math.round(size)}:${dpr}`, Math.ceil(1.3 * size), dpr, (c, s) => paintDuck(c, s / 1.3, kind));
  g.save();
  g.translate(x, y);
  g.rotate(heading);
  if (squash !== 1) g.scale(squash, 1);
  g.drawImage(sp.cv, -sp.size / 2, -sp.size / 2, sp.size, sp.size);
  g.restore();
}

// ------------------------------------------------------------- pigeons ----

const PIGEON = ["#a3abbd", "#8e95a7", "#b9bfca", "#7f7672", "#dad8d3"];

function paintPigeon(g: Ctx, t: number, tone: number) {
  const body = PIGEON[tone % 5];
  g.fillStyle = "#4e5462";
  g.beginPath();
  g.moveTo(-0.28 * t, 0);
  g.lineTo(-0.52 * t, -0.11 * t);
  g.lineTo(-0.52 * t, 0.11 * t);
  g.closePath();
  g.fill();
  g.fillStyle = body;
  g.beginPath();
  g.moveTo(-0.42 * t, -0.08 * t);
  g.lineTo(-0.5 * t, -0.1 * t);
  g.lineTo(-0.5 * t, 0.1 * t);
  g.lineTo(-0.42 * t, 0.08 * t);
  g.fill();
  g.beginPath();
  g.moveTo(-0.38 * t, 0);
  g.bezierCurveTo(-0.3 * t, -0.22 * t, 0.12 * t, -0.22 * t, 0.2 * t, 0);
  g.bezierCurveTo(0.12 * t, 0.22 * t, -0.3 * t, 0.22 * t, -0.38 * t, 0);
  g.fill();
  g.strokeStyle = "rgba(40,44,56,0.75)";
  g.lineWidth = 0.03 * t;
  g.lineCap = "round";
  for (const s of [-1, 1]) {
    for (const l of [-0.08, -0.18]) {
      g.beginPath();
      g.moveTo(l * t, 0.07 * s * t);
      g.lineTo((l - 0.05) * t, 0.16 * s * t);
      g.stroke();
    }
  }
  g.fillStyle = "#5b7f6c";
  g.beginPath();
  g.ellipse(0.17 * t, 0, 0.08 * t, 0.1 * t, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "rgba(150,90,160,0.6)";
  g.beginPath();
  g.ellipse(0.15 * t, 0.04 * t, 0.05 * t, 0.04 * t, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#666d80";
  g.beginPath();
  g.arc(0.27 * t, 0, 0.075 * t, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#2a2a2a";
  g.fillRect(0.33 * t, -0.012 * t, 0.06 * t, 0.024 * t);
  g.fillStyle = "rgba(255,255,255,0.3)";
  g.beginPath();
  g.ellipse(-0.04 * t, 0.03 * t, 0.15 * t, 0.04 * t, 0, 0, Math.PI * 2);
  g.fill();
}

export function drawPigeonSprite(g: Ctx, x: number, y: number, heading: number, size: number, tone: number, dpr: number) {
  const sp = cached(`p${tone}:${Math.round(size)}:${dpr}`, Math.ceil(1.2 * size), dpr, (c, s) => paintPigeon(c, s / 1.2, tone));
  g.save();
  g.translate(x, y);
  g.rotate(heading);
  g.drawImage(sp.cv, -sp.size / 2, -sp.size / 2, sp.size, sp.size);
  g.restore();
}

export function drawPigeonWings(g: Ctx, x: number, y: number, heading: number, l: number, flap: number, tone: number, k: number) {
  const a = 0.62 * l * flap * k;
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  g.fillStyle = ["#9ea4b4", "#8a8f9e", "#b8bcc6", "#7c7470", "#d8d6d2"][tone % 5];
  for (const side of [-1, 1]) {
    g.beginPath();
    g.ellipse(x - s * side * a * 0.5 - c * l * 0.06 * k, y + c * side * a * 0.5 - s * l * 0.06 * k, 0.55 * a, 0.17 * l * k, heading + side * (Math.PI / 2 - 0.25), 0, Math.PI * 2);
    g.fill();
  }
}

// ---------------------------------------------------------- flock birds ----

export interface FlockBird {
  glide: number;
  ph: number;
  rate: number;
}

/** A small bird seen from above, in its own frame (pointing +x). */
export function drawBird(g: Ctx, t: number, bird: FlockBird, wide: boolean) {
  const gliding = Math.sin(0.45 * bird.glide) > 0.55;
  const span = gliding ? 0.97 : 0.55 + 0.45 * Math.abs(Math.cos(bird.ph));
  const sweep = gliding ? 0.02 : 0.12 * Math.sin(bird.ph);
  for (const s of [-1, 1]) {
    const f = (v: number) => v * s * t;
    g.beginPath();
    g.moveTo(0.1 * t, f(0.05));
    g.quadraticCurveTo(0.2 * t, f(0.3 * span), (0.1 + sweep) * t, f(0.52 * span));
    g.quadraticCurveTo((-0.05 + sweep) * t, f(0.8 * span), (-0.22 + sweep) * t, f(span));
    g.quadraticCurveTo((-0.16 + sweep) * t, f(0.6 * span), -0.21 * t, f(0.42 * span));
    g.quadraticCurveTo(-0.17 * t, f(0.2), -0.12 * t, f(0.05));
    g.closePath();
    g.fill();
  }
  g.beginPath();
  g.ellipse(0, 0, 0.3 * t, 0.075 * t, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(0.3 * t, 0, 0.065 * t, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.moveTo(-0.25 * t, -0.05 * t);
  g.lineTo(-0.42 * t, -0.1 * t);
  g.lineTo(-0.42 * t, 0.1 * t);
  g.lineTo(-0.25 * t, 0.05 * t);
  g.fill();
  if (wide) {
    g.fillStyle = "rgba(150,160,175,0.5)";
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse((-0.18 + sweep) * t, 0.92 * s * span * t, 0.07 * t, 0.03 * t, 0.4 * s, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#e88a4a";
    g.beginPath();
    g.arc(0.37 * t, 0, 0.025 * t, 0, Math.PI * 2);
    g.fill();
  }
}

// --------------------------------------------------------------- boats ----

export interface BoatFrame {
  x: number;
  y: number;
  c: number;
  s: number;
  m: number;
}

const hullWidth = (e: number) =>
  (e > 0 ? Math.pow(Math.cos((Math.min(1, e) * Math.PI) / 2), 0.8) : 0.66 + 0.34 * Math.pow(Math.cos((Math.min(1, -e) * Math.PI) / 2), 0.5)) * 0.65;

function bp(b: BoatFrame, fwd: number, side: number, z: number, out: Pt) {
  return project(b.x + (fwd * b.c - side * b.s) * b.m, b.y + (fwd * b.s + side * b.c) * b.m, z * b.m, out);
}

function hullPath(g: Ctx, b: BoatFrame, z: number, k: number) {
  const p = mkPt();
  g.beginPath();
  for (let i = 0; i <= 28; i++) {
    const o = 1 - (i / 28) * 2;
    bp(b, 3.6 * o * 0.5 * (0.96 + 0.04 * k), hullWidth(o) * k, z, p);
    if (i) g.lineTo(p.x, p.y);
    else g.moveTo(p.x, p.y);
  }
  for (let i = 28; i >= 0; i--) {
    const o = 1 - (i / 28) * 2;
    bp(b, 3.6 * o * 0.5 * (0.96 + 0.04 * k), -hullWidth(o) * k, z, p);
    g.lineTo(p.x, p.y);
  }
  g.closePath();
}

function bseg(g: Ctx, b: BoatFrame, a0: number, s0: number, z0: number, a1: number, s1: number, z1: number) {
  const p0 = bp(b, a0, s0, z0, mkPt());
  const p1 = bp(b, a1, s1, z1, mkPt());
  g.beginPath();
  g.moveTo(p0.x, p0.y);
  g.lineTo(p1.x, p1.y);
  g.stroke();
}

export function boatShadow(g: Ctx, b: BoatFrame) {
  g.save();
  g.translate(b.x + SUN.x * b.m * 0.4, b.y + SUN.y * b.m * 0.4);
  g.rotate(Math.atan2(b.s, b.c));
  g.fillStyle = "rgba(0,0,0,0.45)";
  g.beginPath();
  g.ellipse(0, 0, 3.6 * b.m * 0.5, 1.3 * b.m * 0.5, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function drawRowboat(g: Ctx, b: BoatFrame) {
  const m = b.m;
  hullPath(g, b, 0, 1.12);
  g.fillStyle = "rgba(10,40,50,0.28)";
  g.fill();
  hullPath(g, b, 0, 1);
  g.fillStyle = "#1f4d3a";
  g.fill();
  hullPath(g, b, 0.45, 1);
  g.fillStyle = "#3d7a58";
  g.fill();
  g.strokeStyle = "#efe6cf";
  g.lineWidth = 0.07 * m;
  g.lineJoin = "round";
  g.stroke();
  hullPath(g, b, 0.22, 0.84);
  g.fillStyle = "#c79a62";
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = "rgba(120,76,40,0.45)";
  g.lineWidth = 0.8;
  for (const s of [-0.24, -0.08, 0.08, 0.24]) bseg(g, b, -1.6, s, 0.12, 1.4, s, 0.12);
  g.restore();
  g.lineCap = "butt";
  for (const [a, wd] of [[0.15, 0.2], [-1.2, 0.26], [1.05, 0.16]]) {
    const half = 0.86 * hullWidth(a / 1.8);
    g.strokeStyle = "#b88a56";
    g.lineWidth = m * wd;
    bseg(g, b, a, -half, 0.38, a, half, 0.38);
    g.strokeStyle = "rgba(255,240,210,0.3)";
    g.lineWidth = m * wd * 0.3;
    bseg(g, b, a + 0.25 * wd, -half, 0.39, a + 0.25 * wd, half, 0.39);
  }
}

export function drawOars(g: Ctx, b: BoatFrame, sweep: number, up: number, heading: number) {
  const m = b.m;
  g.lineCap = "round";
  for (const side of [-1, 1]) {
    const w = hullWidth(0.1 / 1.8);
    const ang = (Math.PI / 2) * side - sweep * side;
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const lock = bp(b, 0.1, side * w, 0.5, mkPt());
    g.fillStyle = "#c8a24a";
    g.beginPath();
    g.arc(lock.x, lock.y, 0.05 * m, 0, Math.PI * 2);
    g.fill();
    const inA = 0.1 - 0.5 * c;
    const inS = side * w - 0.5 * s;
    const outA = 0.1 + 1.95 * c;
    const outS = side * w + 1.95 * s;
    const outZ = 0.05 + 0.5 * up;
    g.strokeStyle = "#e2cb9c";
    g.lineWidth = 0.055 * m;
    bseg(g, b, inA, inS, 0.62, outA, outS, outZ);
    const tip = bp(b, outA, outS, outZ, mkPt());
    const bladeAng = heading + Math.atan2(s, c);
    flat(g, tip.x, tip.y);
    g.rotate(bladeAng);
    g.fillStyle = "#f0dfb6";
    g.beginPath();
    g.ellipse(0, 0, 0.36 * m, 0.09 * m, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#2f6a4c";
    g.beginPath();
    g.ellipse(m * 0.22, 0, 0.1 * m, 0.085 * m, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
}

/** One oar stroke: sweep -0.55..0.55 forward-to-back, lifted on the return. */
export function oarCycle(t: number) {
  const f = t % 1;
  const drive = f < 0.45;
  return {
    sweep: drive ? -0.55 + (f / 0.45) * 1.1 : 0.55 - ((f - 0.45) / 0.55) * 1.1,
    up: drive ? 0 : Math.sin(((f - 0.45) / 0.55) * Math.PI),
  };
}

// ------------------------------------------------------------ sailboats ----

export interface Sailboat {
  x: number;
  y: number;
  heading: number;
  ph: number;
  color: string;
  trim: string;
}

function sailFrame(s: Sailboat, m: number, tall: boolean) {
  const c = Math.cos(s.heading);
  const sn = Math.sin(s.heading);
  const lean = 0.62 + 0.08 * Math.sin(0.9 * s.ph);
  const ls = Math.sin(lean);
  const lc = Math.cos(lean);
  return (a: number, side: number, z: number, out: Pt) => {
    side += z * ls;
    z *= lc;
    const wx = s.x + (a * c - side * sn) * m;
    const wy = s.y + (a * sn + side * c) * m;
    return tall ? cast(wx, wy, z * m, out) : project(wx, wy, z * m, out);
  };
}

function hullFin(g: Ctx, f: ReturnType<typeof sailFrame>, s: Sailboat, a: string, b: string) {
  const heel = 0.55 + 0.12 * Math.sin(0.6 * s.ph);
  const bow = 0.06 + 0.01 * Math.sin(1.7 * s.ph);
  const p0 = mkPt(), p1 = mkPt(), p2 = mkPt(), p3 = mkPt();
  f(0.05, 0, 0.12, p0);
  f(0.05, 0, 0.95, p1);
  f(0.05 - 0.42 * Math.cos(heel), 0.42 * Math.sin(heel), 0.14, p2);
  f(0.05 - 0.42 * Math.cos(heel) * 0.5 + bow, 0.42 * Math.sin(heel) * 0.5 + bow, 0.5, p3);
  g.fillStyle = a;
  g.beginPath();
  g.moveTo(p0.x, p0.y);
  g.lineTo(p1.x, p1.y);
  g.quadraticCurveTo(p3.x, p3.y, p2.x, p2.y);
  g.closePath();
  g.fill();
  f(0.38, 0, 0.1, p0);
  f(0.05, 0, 0.741, p1);
  f(0.12, 0.2 * Math.sin(heel), 0.1, p2);
  g.fillStyle = b;
  g.beginPath();
  g.moveTo(p0.x, p0.y);
  g.lineTo(p1.x, p1.y);
  g.lineTo(p2.x, p2.y);
  g.closePath();
  g.fill();
}

export function drawSailboatShadow(g: Ctx, s: Sailboat, m: number) {
  const f = sailFrame(s, m, true);
  g.fillStyle = "rgba(0,0,0,0.55)";
  hullFin(g, f, s, "rgba(0,0,0,0.5)", "rgba(0,0,0,0.5)");
  const a = f(0.05, 0, 0, mkPt());
  const b = f(0.05, 0, 0.95, mkPt());
  g.strokeStyle = "rgba(0,0,0,0.6)";
  g.lineWidth = 0.025 * m;
  g.beginPath();
  g.moveTo(a.x, a.y);
  g.lineTo(b.x, b.y);
  g.stroke();
}

export function drawSailboat(g: Ctx, s: Sailboat, m: number) {
  const f = sailFrame(s, m, false);
  const p = mkPt();
  for (const [off, wd, col] of [[0, 1, "#5a3a22"], [0.08, 1, s.trim], [0.09, 0.78, "#d9b07a"]] as const) {
    g.beginPath();
    for (let i = 0; i <= 32; i++) {
      const o = i <= 16 ? 1 - (i / 16) * 2 : -1 + ((i - 16) / 16) * 2;
      const r = (o > 0 ? Math.pow(Math.cos((o * Math.PI) / 2), 0.9) : 0.75 + 0.25 * Math.cos((o * Math.PI) / 2)) * 0.11 * wd;
      f(0.8 * o * 0.5 * (0.9 + 0.1 * wd), (i <= 16 ? 1 : -1) * r, off, p);
      if (i) g.lineTo(p.x, p.y);
      else g.moveTo(p.x, p.y);
    }
    g.closePath();
    g.fillStyle = col;
    g.fill();
  }
  const m0 = f(0.05, 0, 0.08, mkPt());
  const m1 = f(0.05, 0, 0.95, mkPt());
  g.strokeStyle = "#7a5634";
  g.lineWidth = 0.025 * m;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(m0.x, m0.y);
  g.lineTo(m1.x, m1.y);
  g.stroke();
  hullFin(g, f, s, s.color, "rgba(250,248,240,0.95)");
  const t0 = f(0.05, 0, 0.14, mkPt());
  const t1 = f(0.05, 0, 0.95, mkPt());
  g.strokeStyle = "rgba(255,252,236,0.7)";
  g.lineWidth = 0.015 * m;
  g.beginPath();
  g.moveTo(t0.x, t0.y);
  g.lineTo(t1.x, t1.y);
  g.stroke();
  const flag = f(-0.07, 0.03 * Math.sin(3 * s.ph), 0.94, mkPt());
  g.strokeStyle = "#d8473a";
  g.lineWidth = 0.016 * m;
  g.beginPath();
  g.moveTo(t1.x, t1.y);
  g.lineTo(flag.x, flag.y);
  g.stroke();
}

// ----------------------------------------------------------- ice cream ----

export function drawCartShadow(g: Ctx, x: number, y: number, m: number) {
  const top = cast(x, y, 2.2 * m, mkPt());
  g.fillStyle = "rgba(0,0,0,0.75)";
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const px = top.x + Math.cos(a) * m * 1.15;
    const py = top.y + Math.sin(a) * m * 1.15;
    if (i) g.lineTo(px, py);
    else g.moveTo(px, py);
  }
  g.closePath();
  g.fill();
  const box = cast(x, y, 0.9 * m, mkPt());
  g.beginPath();
  g.moveTo(x - 0.6 * m, y);
  g.lineTo(box.x - 0.6 * m, box.y);
  g.lineTo(box.x + 0.6 * m, box.y);
  g.lineTo(x + 0.6 * m, y);
  g.fill();
}

export function drawCart(g: Ctx, x: number, y: number, m: number) {
  const r = 0.65 * m;
  const n = 0.4 * m;
  // wheels
  g.fillStyle = "#2a2a2c";
  for (const t of [-1, 1]) {
    onGround(g, x + t * r, y, 0.18 * m);
    g.beginPath();
    g.ellipse(0, 0, 0.08 * m, 0.3 * m, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  // the box, built up from its footprint so it has some body
  for (let i = 0; i <= 5; i++) {
    const z = (0.35 + (0.55 * i) / 5) * m;
    onGround(g, x, y, z);
    g.fillStyle = i === 5 ? "#c9cdd0" : i % 2 ? "#9da2a6" : "#a8adb1";
    g.beginPath();
    g.roundRect(-r, -n, 2 * r, 2 * n, 0.08 * m);
    g.fill();
    if (i === 5) {
      g.fillStyle = "#e8ecee";
      g.fillRect(-0.85 * r, -0.7 * n, 0.8 * r, 1.4 * n);
      g.fillStyle = "#d84a3a";
      g.fillRect(0.15 * r, -0.7 * n, 0.65 * r, 0.5 * n);
      g.fillStyle = "#f2c640";
      g.fillRect(0.15 * r, 0.1 * n, 0.65 * r, 0.5 * n);
    }
    g.restore();
  }
}

export function drawUmbrella(g: Ctx, x: number, y: number, m: number, time: number) {
  const base = project(x, y, 0.9 * m, mkPt());
  const top = project(x, y, 2.35 * m, mkPt());
  g.strokeStyle = "#e8e2d4";
  g.lineWidth = Math.max(1, 0.05 * m);
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(base.x, base.y);
  g.lineTo(top.x, top.y);
  g.stroke();
  const rad = 1.15 * m;
  const turn = 0.02 * Math.sin(0.3 * time);
  onGround(g, x, y, 2.2 * m);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + turn;
    const b = ((i + 1) / 8) * Math.PI * 2 + turn;
    const mid = (a + b) / 2;
    g.fillStyle = i % 2 ? "#f6cc48" : "#3474bc";
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    g.quadraticCurveTo(Math.cos(mid) * rad * 0.9, Math.sin(mid) * rad * 0.9, Math.cos(b) * rad, Math.sin(b) * rad);
    g.closePath();
    g.fill();
  }
  const sheen = g.createRadialGradient(-0.35 * rad, 0.1 * rad, 0.1 * rad, 0, 0, rad);
  sheen.addColorStop(0, "rgba(255,250,230,0.32)");
  sheen.addColorStop(0.6, "rgba(255,250,230,0)");
  sheen.addColorStop(1, "rgba(20,30,60,0.18)");
  g.fillStyle = sheen;
  g.beginPath();
  g.arc(0, 0, rad, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.fillStyle = "#f8f4ea";
  g.beginPath();
  g.arc(top.x, top.y, 0.08 * m, 0, Math.PI * 2);
  g.fill();
}

// ------------------------------------------------------------ stroller ----

export function drawStroller(g: Ctx, x: number, y: number, heading: number, m: number) {
  onGround(g, x + Math.cos(heading) * m * 0.7, y + Math.sin(heading) * m * 0.7, 0.3 * m);
  g.rotate(heading);
  g.fillStyle = "rgb(60,62,66)";
  g.fillRect(-0.42 * m, -0.2 * m, 0.04 * m, 0.4 * m);
  g.fillStyle = "rgb(226,220,206)";
  g.beginPath();
  g.roundRect(-0.34 * m, -0.2 * m, 0.66 * m, 0.4 * m, 0.14 * m);
  g.fill();
  g.fillStyle = "rgb(150,176,196)";
  g.beginPath();
  g.roundRect(0.02 * m, -0.21 * m, 0.32 * m, 0.42 * m, 0.16 * m);
  g.fill();
  g.fillStyle = "rgb(242,208,196)";
  g.beginPath();
  g.arc(-0.12 * m, 0, 0.09 * m, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** Something to read on the bench: a paper, a book, or a phone. */
export function drawReading(g: Ctx, kind: number, x: number, y: number, heading: number, n: number, time: number, seed: number) {
  onGround(g, x + Math.cos(heading) * n * 0.22, y + Math.sin(heading) * n * 0.22, 0.66 * n);
  g.rotate(heading);
  if (kind === 1) {
    g.fillStyle = "#f6f0e2";
    g.fillRect(-0.08 * n, -0.13 * n, 0.16 * n, 0.26 * n);
    g.fillStyle = "#b45a44";
    g.fillRect(-0.08 * n, -0.01 * n, 0.16 * n, 0.02 * n);
  } else if (kind === 2) {
    const fold = Math.sin(0.4 * time + seed) > 0.985 ? 0.5 : 1;
    g.fillStyle = "#f0ebde";
    g.fillRect(-0.12 * n, -0.3 * n * fold, 0.24 * n, 0.6 * n * fold);
    g.fillStyle = "rgba(60,56,50,0.3)";
    for (let i = 0; i < 5; i++) g.fillRect(-0.09 * n, -0.24 * n * fold + i * n * 0.1 * fold, 0.18 * n, 0.022 * n);
  } else {
    g.fillStyle = "#26262a";
    g.fillRect(-0.05 * n, -0.08 * n, 0.1 * n, 0.16 * n);
    g.fillStyle = "rgba(190,214,230,0.8)";
    g.fillRect(-0.035 * n, -0.065 * n, 0.07 * n, 0.13 * n);
  }
  g.restore();
}

export function drawLily(g: Ctx, lily: { x: number; y: number; r: number; rot: number }) {
  for (let t = 0; t < 2; t++) {
    const a = lily.r * (t ? 0.6 : 1);
    g.fillStyle = t ? "rgb(252,236,236)" : "rgb(240,214,220)";
    for (let i = 0; i < 8; i++) {
      const ang = lily.rot + (i / 8) * Math.PI * 2 + 0.4 * t;
      g.beginPath();
      g.ellipse(lily.x + Math.cos(ang) * a * 0.5, lily.y + Math.sin(ang) * a * 0.5, 0.5 * a, 0.2 * a, ang, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.fillStyle = "rgb(236,200,90)";
  g.beginPath();
  g.arc(lily.x, lily.y, 0.16 * lily.r, 0, Math.PI * 2);
  g.fill();
}
