// The park isn't framed by a box: its edges are torn into the page. This
// paints the overlay that does it — a rounded, noise-roughened outline
// outside which the page colour takes over, a soft feather inside it, and a
// layer of paper grain, haze and light leaks over the whole picture.

import { vnoise } from "./util";

export interface RGB { r: number; g: number; b: number }

const OPT = {
  edgeMargin: 5,
  cornerRadius: 28,
  edgeNoise: 27,
  edgeFade: 10,
  grain: 71,
  grainPop: 9,
  warmth: 23,
  brightness: 21,
  fog: 63,
  leak: 12,
};

const fractal = (x: number, y: number) =>
  0.6 * vnoise(x * 0.004, y * 0.004) + 0.25 * vnoise(x * 0.01, y * 0.01) + 0.15 * vnoise(x * 0.025, y * 0.025);

function grainAmount(amp: number, pop: number, size: number) {
  const r = Math.random();
  if (r < 0.6 * pop) return size * (0.5 + 0.5 * Math.random()) * amp;
  if (r < pop) return -(size * (0.3 + 0.4 * Math.random()) * amp);
  return ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * amp * 2;
}

/** Signed distance to the roughened outline: > 0 outside, < 0 inside. */
function edgeMask(w: number, h: number) {
  const out = new Float32Array(w * h);
  const margin = (OPT.edgeMargin / 100) * Math.min(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const hw = cx - margin;
  const hh = cy - margin;
  const radius = (OPT.cornerRadius / 100) * Math.min(hw, hh);
  const rough = (OPT.edgeNoise / 100) * Math.min(w, h) * 0.06;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const qx = Math.abs(x - cx) - (hw - radius);
      const qy = Math.abs(y - cy) - (hh - radius);
      let d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
      if (rough > 0) d += (2 * fractal(x, y) - 1) * rough;
      out[y * w + x] = d;
    }
  }
  return out;
}

/** Paint the overlay onto `canvas` (CSS size w × h). `dark` softens the paper tint. */
export function paintPaper(canvas: HTMLCanvasElement, w: number, h: number, bg: RGB, dark: boolean) {
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d")!;
  const mask = edgeMask(w, h);

  const img = ctx.createImageData(w, h);
  const px = img.data;
  const fade = (OPT.edgeFade / 100) * Math.min(w, h) * 0.45;
  const amp = (OPT.grain / 100) * 80 * (dark ? 0.55 : 1);
  const pop = OPT.grainPop / 100;
  const popP = 0.15 * pop;
  const popS = 1.5 + 2.5 * pop;
  const warm = 0.3 * OPT.warmth;
  const base = (OPT.brightness / 100) * 255;
  const tint = dark ? [150, 150, 154] : [245, 240, 230];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const o = i * 4;
      const d = mask[i];
      if (d > 0) continue;
      const g = grainAmount(amp, popP, popS);
      const r = warm + base + g;
      const gg = base + g;
      const b = -warm + base + g;
      const avg = (r + gg + b) / 3;
      const a = Math.min(255, Math.max(0, 0.7 * Math.abs(avg)));
      if (avg >= 0) {
        px[o] = Math.min(255, tint[0] + Math.round(0.5 * warm * (dark ? 0 : 1)));
        px[o + 1] = tint[1];
        px[o + 2] = Math.max(0, tint[2] - Math.round(0.3 * warm * (dark ? 0 : 1)));
        px[o + 3] = Math.round(a * (dark ? 0.5 : 1));
      } else {
        px[o] = 30; px[o + 1] = 25; px[o + 2] = 20;
        px[o + 3] = Math.round(0.6 * a);
      }
      if (fade > 0 && -d < fade) {
        const t = -d / fade;
        const bgA = 1 - t * t * (3 - 2 * t);
        const a0 = px[o + 3] / 255;
        const outA = a0 + bgA * (1 - a0);
        if (outA > 0) {
          px[o] = Math.round((px[o] * a0 + bg.r * bgA * (1 - a0)) / outA);
          px[o + 1] = Math.round((px[o + 1] * a0 + bg.g * bgA * (1 - a0)) / outA);
          px[o + 2] = Math.round((px[o + 2] * a0 + bg.b * bgA * (1 - a0)) / outA);
        }
        px[o + 3] = Math.round(255 * outA);
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // haze and light leaks, only where something was painted
  const fog = (OPT.fog / 100) * 0.35 * (dark ? 0.25 : 1);
  const rad = Math.hypot(w / 2, h / 2);
  const haze = ctx.createRadialGradient(w / 2, h / 2, 0.05 * w, w / 2, h / 2, rad);
  const hz = dark ? "150,150,156" : "240,235,228";
  haze.addColorStop(0, `rgba(${hz},${fog})`);
  haze.addColorStop(0.5, `rgba(${hz},${0.6 * fog})`);
  haze.addColorStop(1, `rgba(${dark ? "120,120,126" : "220,215,210"},${0.8 * fog})`);
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h);
  const leak = (OPT.leak / 100) * 0.35 * (dark ? 0.3 : 1);
  for (const l of [
    { x: 0.15 * w, y: 0.2 * h, r: 0.5 * w },
    { x: 0.85 * w, y: 0.7 * h, r: 0.4 * w },
    { x: 0.5 * w, y: 0.1 * h, r: 0.35 * w },
  ]) {
    const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    g.addColorStop(0, `rgba(255,252,245,${leak})`);
    g.addColorStop(0.4, `rgba(255,250,240,${0.4 * leak})`);
    g.addColorStop(1, "rgba(255,250,240,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";

  // outside the outline the page itself
  const done = ctx.getImageData(0, 0, w, h);
  const dp = done.data;
  for (let i = 0; i < w * h; i++) {
    if (mask[i] > 0) {
      const o = i * 4;
      dp[o] = bg.r; dp[o + 1] = bg.g; dp[o + 2] = bg.b; dp[o + 3] = 255;
    }
  }
  ctx.putImageData(done, 0, 0);
}

/** Resolve a CSS colour string ("#rrggbb" or "rgb(...)") to RGB. */
export function parseColor(value: string, fallback: RGB): RGB {
  const v = value.trim();
  if (v.startsWith("#")) {
    let hex = v.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const n = parseInt(hex, 16);
    if (!Number.isNaN(n) && hex.length >= 6) return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const m = v.match(/rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return fallback;
}
