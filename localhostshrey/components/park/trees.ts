// Tree crowns, painted once per tree as a cluster of lit leaf dabs. The same
// sprite is drawn big in front of the lens, and (flattened to a silhouette)
// as the shadow the sun throws across the lawn.

import { lightDir } from "./camera";
import type { TreeDef } from "./layout";
import { makeCanvas, seeded } from "./util";

type RGB = [number, number, number];
interface Palette {
  dark: RGB;
  mid: RGB;
  lit: RGB;
  high: RGB;
  back: RGB;
}

const PALETTES: Palette[] = [
  // sage and olive
  { dark: [24, 52, 36], mid: [66, 112, 62], lit: [128, 166, 84], high: [190, 208, 120], back: [232, 236, 160] },
  // sun-struck golden green
  { dark: [34, 56, 28], mid: [92, 126, 52], lit: [158, 176, 72], high: [214, 214, 112], back: [250, 238, 160] },
  // cool blue-green
  { dark: [16, 46, 46], mid: [48, 100, 84], lit: [100, 150, 120], high: [160, 200, 160], back: [210, 238, 196] },
  // spring blossom
  { dark: [64, 44, 52], mid: [176, 102, 128], lit: [230, 150, 170], high: [248, 200, 212], back: [255, 232, 236] },
];

function ramp(p: Palette, t: number): RGB {
  const x = 3 * Math.max(0, Math.min(1, t));
  const i = Math.min(2, Math.floor(x));
  const f = x - i;
  const stops = [p.dark, p.mid, p.lit, p.high];
  const a = stops[i];
  const b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

const css = (c: RGB, a = 1, d = 0) =>
  `rgba(${Math.round(c[0] + d)},${Math.round(c[1] + d)},${Math.round(c[2] + 0.6 * d)},${a})`;

export interface Sprite {
  cv: HTMLCanvasElement;
  /** Size in CSS px. */
  size: number;
}

const sprites = new Map<TreeDef, Sprite>();
const shadows = new Map<TreeDef, Sprite>();

export function clearTreeCache() {
  sprites.clear();
  shadows.clear();
}

/** Height of a crown above the ground, in px. */
export const crownHeight = (t: TreeDef) => 1.9 * t.r;

export function treeSprite(t: TreeDef, m: number, dpr: number): Sprite {
  const hit = sprites.get(t);
  if (hit) return hit;
  const size = Math.ceil(2.4 * t.r);
  const cv = makeCanvas(size * dpr, size * dpr);
  const g = cv.getContext("2d")!;
  g.scale(dpr, dpr);
  paintCrown(g, size / 2, t.r, m, t.seed, PALETTES[t.tone % PALETTES.length]);
  const out = { cv, size };
  sprites.set(t, out);
  return out;
}

export function treeShadow(t: TreeDef, m: number, dpr: number): Sprite {
  const hit = shadows.get(t);
  if (hit) return hit;
  const src = treeSprite(t, m, dpr);
  const small = Math.ceil(src.cv.width / 4);
  const cv = makeCanvas(small, small);
  const g = cv.getContext("2d")!;
  g.drawImage(src.cv, 0, 0, small, small);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = "#000";
  g.fillRect(0, 0, small, small);
  const out = { cv, size: src.size };
  shadows.set(t, out);
  return out;
}

function paintCrown(g: CanvasRenderingContext2D, c: number, R: number, l: number, seed: number, pal: Palette) {
  const r = seeded(seed);
  // unit vector toward the light, in the sprite's (screen) plane
  const ld = lightDir();
  const lx = ld.x;
  const ly = ld.y;
  const L3 = { x: 0.62 * lx, y: 0.62 * ly, z: 0.78 };

  g.strokeStyle = "rgb(46,36,28)";
  g.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const a = r() * Math.PI * 2;
    const d = R * (0.5 + 0.3 * r());
    g.lineWidth = 0.1 * l;
    g.beginPath();
    g.moveTo(c, c);
    g.quadraticCurveTo(c + Math.cos(a + 0.3) * d * 0.5, c + Math.sin(a + 0.3) * d * 0.5, c + Math.cos(a) * d, c + Math.sin(a) * d);
    g.stroke();
  }

  interface Crown { x: number; y: number; r: number; top: number }
  const crowns: Crown[] = [{ x: c, y: c, r: 0.6 * R, top: 0.95 * R }];
  const n = 4 + ((3 * r()) | 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.8 * r();
    const dist = R * (0.36 + 0.16 * r());
    const rad = R * (0.36 + 0.16 * r());
    crowns.push({ x: c + Math.cos(a) * dist, y: c + Math.sin(a) * dist, r: rad, top: rad + (R - dist) * 0.35 });
  }
  crowns.sort((a, b) => a.top - b.top);

  for (const cr of crowns) {
    // body of the crown: a dark bed of overlapping discs
    g.globalCompositeOperation = "source-over";
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + r();
      const d = 0.45 * cr.r;
      g.fillStyle = css(ramp(pal, 0.18));
      g.beginPath();
      g.arc(cr.x + Math.cos(a) * d, cr.y + Math.sin(a) * d, cr.r * (0.5 + 0.15 * r()), 0, Math.PI * 2);
      g.fill();
    }
    // darkness on the side away from the light, soaked into what's painted
    g.globalCompositeOperation = "source-atop";
    const gr = g.createRadialGradient(cr.x - lx * cr.r * 0.45, cr.y - ly * cr.r * 0.45, 0.5 * cr.r, cr.x - lx * cr.r * 0.45, cr.y - ly * cr.r * 0.45, 1.2 * cr.r);
    gr.addColorStop(0, "rgba(4,22,12,0.45)");
    gr.addColorStop(1, "rgba(4,22,12,0)");
    g.fillStyle = gr;
    g.beginPath();
    g.arc(cr.x - lx * cr.r * 0.45, cr.y - ly * cr.r * 0.45, 1.2 * cr.r, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = "source-over";

    // back-lit leaves ringing the sun side of the edge
    const rim = Math.round((cr.r / l) * 9);
    for (let i = 0; i < rim; i++) {
      const a = r() * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const facing = ca * lx + sa * ly;
      const d = cr.r * (0.9 + 0.16 * r());
      const sz = l * (0.09 + 0.06 * r());
      g.fillStyle = facing > 0.35 ? css(pal.back, 0.9, (r() - 0.5) * 16) : css(ramp(pal, 0.2 + 0.6 * Math.max(0, facing)), 0.95);
      g.beginPath();
      g.ellipse(cr.x + ca * d, cr.y + sa * d, sz, 0.55 * sz, r() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }

    // clumps on a hemisphere, brightness from the angle to the light
    const clumps = Math.round(Math.pow(cr.r / (0.42 * l), 2) * 2.2) + 8;
    const hs: number[][] = [];
    for (let i = 0; i < clumps; i++) {
      const a = r() * Math.PI * 2;
      const d = 0.98 * Math.sqrt(r());
      hs.push([Math.cos(a) * d, Math.sin(a) * d, Math.sqrt(Math.max(0, 1 - d * d))]);
    }
    hs.sort((a, b) => a[2] - b[2]);
    for (const [hx, hy, hz] of hs) {
      const lum = Math.max(0, hx * L3.x + hy * L3.y + hz * L3.z) * (0.82 + 0.3 * r()) * (0.55 + 0.45 * hz);
      const col = ramp(pal, lum);
      const px = cr.x + hx * cr.r;
      const py = cr.y + hy * cr.r;
      const cs = l * (0.3 + 0.22 * r());
      g.fillStyle = css(ramp(pal, 0.55 * lum), 0.95);
      g.beginPath();
      g.arc(px, py, 0.85 * cs, 0, Math.PI * 2);
      g.fill();
      for (let k = 0; k < 9; k++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * cs * 0.85;
        const sz = l * (0.1 + 0.09 * r());
        if (Math.cos(a) * lx + Math.sin(a) * ly < -0.4 && d > 0.4 * cs) continue;
        g.fillStyle = css(col, 0.92, (r() - 0.5) * 18);
        g.beginPath();
        g.ellipse(px + Math.cos(a) * d, py + Math.sin(a) * d, sz, 0.55 * sz, r() * Math.PI, 0, Math.PI * 2);
        g.fill();
      }
    }

    // sun glow on one side, a shaded rim on the other
    g.globalCompositeOperation = "source-atop";
    const rimg = g.createRadialGradient(cr.x + lx * cr.r * 0.45, cr.y + ly * cr.r * 0.45, 0.1 * cr.r, cr.x, cr.y, 1.08 * cr.r);
    rimg.addColorStop(0, "rgba(255,250,200,0.16)");
    rimg.addColorStop(0.5, "rgba(255,250,200,0)");
    rimg.addColorStop(0.82, "rgba(6,26,18,0.32)");
    rimg.addColorStop(1, "rgba(6,26,18,0)");
    g.fillStyle = rimg;
    g.beginPath();
    g.arc(cr.x, cr.y, 1.1 * cr.r, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = "source-over";
  }

  // gaps between leaf masses
  g.globalCompositeOperation = "source-atop";
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2;
    const d = R * (0.3 + 0.45 * r());
    const rad = l * (0.08 + 0.1 * r());
    const x = c + Math.cos(a) * d;
    const y = c + Math.sin(a) * d;
    const hole = g.createRadialGradient(x, y, 0, x, y, 1.6 * rad);
    hole.addColorStop(0, "rgba(10,30,18,0.6)");
    hole.addColorStop(1, "rgba(10,30,18,0)");
    g.fillStyle = hole;
    g.beginPath();
    g.arc(x, y, 1.6 * rad, 0, Math.PI * 2);
    g.fill();
  }
  g.globalCompositeOperation = "source-over";
}

/** Slow swaying of a crown in the wind, in [-1, 1]. */
export const sway = (t: TreeDef, time: number) =>
  0.7 * Math.sin(0.5 * time + t.seed) + 0.3 * Math.sin(1.3 * time + 2 * t.seed);
