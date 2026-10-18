// The park's fixed geometry. The ground is a flat plane (world) seen through
// the oblique camera; the composition is designed in *view* coordinates
// (u, v in 0..1 across the screen) and converted to ground positions, so it
// holds together at any aspect ratio: a kidney-shaped pond on the left, a
// winding path along its far bank and another sweeping in from the lower
// left, meeting at a small plaza, with open lawns, a blossom tree and a
// grove around them.

import { setSun, setView, toScreenVec, toWorldVec, unproject } from "./camera";
import { TAU, angleDiff, clamp01, seeded } from "./util";

export interface Pond {
  /** Centre, world. */
  cx: number;
  cy: number;
  /** Rough world radius, for the simulation's sampling. */
  rx: number;
  ry: number;
  /** Semi-axes in screen px — the pond's shape is designed as seen. */
  sx: number;
  sy: number;
  rot: number;
  /** Radial wobble: amplitude, frequency and phase of each harmonic. */
  amp: number[];
  freq: number[];
  ph: number[];
  /** A bay: the shore pulls in around this screen angle. */
  dip: { ang: number; depth: number; width: number };
}

export interface Path {
  xs: Float32Array;
  ys: Float32Array;
  s: Float32Array;
  n: number;
  total: number;
  junction: number;
}

export interface Bench {
  x: number;
  y: number;
  face: number;
  occupied: boolean;
}

export interface TreeDef {
  x: number;
  y: number;
  r: number;
  /** Palette: 0..2 leafy greens, 3 blossom. */
  tone: number;
  seed: number;
}

export interface Blanket {
  x: number;
  y: number;
  ang: number;
  check: string;
}

export interface Reed {
  x: number;
  y: number;
  h: number;
  lean: number;
  seed: number;
}

export interface Layout {
  /** World (ground) size. */
  w: number;
  h: number;
  /** View size in screen px. */
  vw: number;
  vh: number;
  /** One "metre": the unit every size and speed is expressed in. */
  m: number;
  pond: Pond;
  paths: Path[];
  pathHW: number;
  plaza: { x: number; y: number; r: number };
  benches: Bench[];
  smokerBench: number;
  trees: TreeDef[];
  shades: TreeDef[];
  blankets: Blanket[];
  frisbee: [number, number, number, number];
  fetch: { x: number; y: number };
  bin: { x: number; y: number };
  lilies: { x: number; y: number; r: number; rot: number; ph: number }[];
  reeds: Reed[];
  field: Float32Array;
  fieldW: number;
  fieldStep: number;
}

/** The camera: rotation of the ground, foreshortening, height scale. */
const THETA = 0.5;
const SQUASH = 0.62;
const HEIGHT = 0.8;

const tv = { x: 0, y: 0 };

function wobble(p: Pond, ang: number) {
  let s = 1;
  for (let i = 0; i < p.amp.length; i++) s += p.amp[i] * Math.sin(p.freq[i] * ang + p.ph[i]);
  const d = angleDiff(ang, p.dip.ang);
  s -= p.dip.depth * Math.exp(-(d * d) / p.dip.width);
  return s;
}

/** > 0 inside the pond, 0 on the shore, < 0 on land. */
export function pondField(p: Pond, x: number, y: number) {
  toScreenVec(x - p.cx, y - p.cy, tv);
  const c = Math.cos(p.rot);
  const s = Math.sin(p.rot);
  const ex = (tv.x * c + tv.y * s) / p.sx;
  const ey = (-tv.x * s + tv.y * c) / p.sy;
  return 1 - Math.hypot(ex, ey) / wobble(p, Math.atan2(ey, ex));
}

/** A world point on the pond's outline at screen-angle `ang`, pulled in by `inset`. */
export function pondPoint(p: Pond, ang: number, inset: number) {
  const w = wobble(p, ang) * inset;
  const ex = Math.cos(ang) * p.sx * w;
  const ey = Math.sin(ang) * p.sy * w;
  const c = Math.cos(p.rot);
  const s = Math.sin(p.rot);
  toWorldVec(ex * c - ey * s, ex * s + ey * c, tv);
  return { x: p.cx + tv.x, y: p.cy + tv.y };
}

function buildPath(pts: number[][], plaza: { x: number; y: number }): Path {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 40; k++) {
      const t = k / 40;
      const t2 = t * t;
      const t3 = t2 * t;
      const cr = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      xs.push(cr(p0[0], p1[0], p2[0], p3[0]));
      ys.push(cr(p0[1], p1[1], p2[1], p3[1]));
    }
  }
  const last = pts[pts.length - 1];
  xs.push(last[0]);
  ys.push(last[1]);
  const n = xs.length;
  const s = new Float32Array(n);
  let nearest = 0;
  let best = Infinity;
  for (let i = 0; i < n; i++) {
    if (i) s[i] = s[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
    const d = Math.hypot(xs[i] - plaza.x, ys[i] - plaza.y);
    if (d < best) {
      best = d;
      nearest = i;
    }
  }
  return { xs: Float32Array.from(xs), ys: Float32Array.from(ys), s, n, total: s[n - 1], junction: s[nearest] };
}

const tmp = { x: 0, y: 0, tx: 0, ty: 0 };

/** Position and unit tangent at arc length `t` along a path. */
export function pathAt(path: Path, t: number, out: { x: number; y: number; tx: number; ty: number }) {
  if (t <= 0) t = 0;
  else if (t >= path.total) t = path.total - 0.001;
  let lo = 0;
  let hi = path.n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (path.s[mid] <= t) lo = mid;
    else hi = mid;
  }
  const span = path.s[hi] - path.s[lo] || 1;
  const r = (t - path.s[lo]) / span;
  const dx = path.xs[hi] - path.xs[lo];
  const dy = path.ys[hi] - path.ys[lo];
  const len = Math.hypot(dx, dy) || 1;
  out.x = path.xs[lo] + dx * r;
  out.y = path.ys[lo] + dy * r;
  out.tx = dx / len;
  out.ty = dy / len;
  return out;
}

/** Distance (in px) from a point to the nearest path centreline. */
export function pathDistance(L: Pick<Layout, "field" | "fieldW" | "fieldStep">, x: number, y: number) {
  const rows = L.field.length / L.fieldW;
  const fx = Math.max(0, Math.min(L.fieldW - 1.001, x / L.fieldStep));
  const fy = Math.max(0, Math.min(rows - 1.001, y / L.fieldStep));
  const ix = fx | 0;
  const iy = fy | 0;
  const tx = fx - ix;
  const ty = fy - iy;
  const i = iy * L.fieldW + ix;
  const f = L.field;
  return (f[i] * (1 - tx) + f[i + 1] * tx) * (1 - ty) + (f[i + L.fieldW] * (1 - tx) + f[i + L.fieldW + 1] * tx) * ty;
}

export function buildLayout(vw: number, vh: number): Layout {
  const rng = seeded(2611);
  const m = Math.min(vw, vh) / 21;

  // The ground needs to cover everything the view can see. Measure the view's
  // corners on the ground, then centre the world on the view.
  setView(vw, vh, THETA, SQUASH, HEIGHT, 0, 0);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [sx, sy] of [[0, 0], [vw, 0], [0, vh], [vw, vh]]) {
    unproject(sx, sy, tv);
    minX = Math.min(minX, tv.x); maxX = Math.max(maxX, tv.x);
    minY = Math.min(minY, tv.y); maxY = Math.max(maxY, tv.y);
  }
  const pad = 6 * m;
  const w = Math.ceil(maxX - minX + 2 * pad);
  const h = Math.ceil(maxY - minY + 2 * pad);
  setView(vw, vh, THETA, SQUASH, HEIGHT, w / 2, h / 2);
  // Shadows fall toward the lower right of the screen: a soft late-morning sun
  // from the upper left.
  setSun(0.5, 0.36);

  /** View coordinates (0..1 across the screen) → a ground point. */
  const V = (u: number, v: number) => {
    unproject(u * vw, v * vh, tv);
    return { x: tv.x, y: tv.y };
  };
  const P = (u: number, v: number): [number, number] => {
    const p = V(u, v);
    return [p.x, p.y];
  };

  // A kidney-shaped pond, its bay opening toward the plaza.
  const pc = V(0.25, 0.6);
  const pond: Pond = {
    cx: pc.x,
    cy: pc.y,
    rx: 0.23 * vw * 1.05,
    ry: 0.23 * vw * 1.05,
    sx: 0.235 * vw,
    sy: 0.27 * vh,
    rot: -0.18,
    amp: [0.07, 0.1, 0.05, 0.03, 0.015],
    freq: [2, 3, 4, 6, 10],
    ph: [rng() * TAU, rng() * TAU, rng() * TAU, rng() * TAU, rng() * TAU],
    dip: { ang: 0.35, depth: 0.2, width: 0.32 },
  };

  const plazaAt = V(0.62, 0.52);
  const plaza = { x: plazaAt.x, y: plazaAt.y, r: 2.6 * m };

  const paths = [
    // down the far bank, through the plaza, out toward the lower right
    buildPath([P(0.5, -0.22), P(0.52, 0.04), P(0.5, 0.24), P(0.56, 0.4), P(0.62, 0.52), P(0.7, 0.68), P(0.82, 0.84), P(0.98, 0.95), P(1.18, 1.0)], plaza),
    // from the lower left, under the pond, up to the plaza and away to the upper right
    buildPath([P(-0.2, 1.1), P(0.1, 0.98), P(0.34, 0.9), P(0.52, 0.72), P(0.62, 0.52), P(0.76, 0.36), P(0.92, 0.2), P(1.2, 0.1)], plaza),
  ];
  const pathHW = 1.3 * m;

  const fieldStep = 4;
  const fieldW = Math.ceil(w / fieldStep) + 1;
  const fieldH = Math.ceil(h / fieldStep) + 1;
  const field = new Float32Array(fieldW * fieldH);
  for (let gy = 0; gy < fieldH; gy++) {
    for (let gx = 0; gx < fieldW; gx++) {
      const px = gx * fieldStep;
      const py = gy * fieldStep;
      let best = Infinity;
      for (const p of paths) {
        for (let i = 0; i < p.n; i += 2) {
          const dx = p.xs[i] - px;
          const dy = p.ys[i] - py;
          const d = dx * dx + dy * dy;
          if (d < best) best = d;
        }
      }
      field[gy * fieldW + gx] = Math.sqrt(best);
    }
  }
  const lay = { field, fieldW, fieldStep };

  // Benches: one on the pond bank facing the water (the smoker's), a couple
  // around the plaza, the rest along the paths.
  const benches: Bench[] = [];
  const arms: number[] = [];
  for (const p of paths) {
    for (const side of [-1, 1]) {
      pathAt(p, p.junction + side * plaza.r, tmp);
      arms.push((Math.atan2(tmp.y - plaza.y, tmp.x - plaza.x) + TAU) % TAU);
    }
  }
  arms.sort((a, b) => a - b);
  for (let i = 0; i < arms.length; i++) {
    const a0 = arms[i];
    const gap = (i === arms.length - 1 ? arms[0] + TAU : arms[i + 1]) - a0;
    const count = gap > 2.4 ? 2 : gap > 1.1 ? 1 : 0;
    for (let k = 1; k <= count; k++) {
      const a = a0 + (gap * k) / (count + 1);
      const rr = plaza.r + 0.35 * m;
      const bx = plaza.x + Math.cos(a) * rr;
      const by = plaza.y + Math.sin(a) * rr;
      if (pathDistance(lay, bx, by) < pathHW + 0.9 * m) continue;
      if (pondField(pond, bx, by) > -0.1) continue;
      benches.push({ x: bx, y: by, face: a + Math.PI, occupied: false });
    }
  }
  // On the shore nearest the plaza, a little way back from the water.
  toScreenVec(plaza.x - pond.cx, plaza.y - pond.cy, tv);
  const toward = Math.atan2(tv.y, tv.x) - pond.rot;
  const shore = pondPoint(pond, toward, 1);
  const away = Math.atan2(plaza.y - shore.y, plaza.x - shore.x);
  const sx = shore.x + Math.cos(away) * 1.9 * m;
  const sy = shore.y + Math.sin(away) * 1.9 * m;
  for (let i = benches.length - 1; i >= 0; i--) {
    if (Math.hypot(benches[i].x - sx, benches[i].y - sy) < 2.4 * m) benches.splice(i, 1);
  }
  benches.push({ x: sx, y: sy, face: Math.atan2(shore.y - sy, shore.x - sx), occupied: true });
  const smokerBench = benches.length - 1;

  const alongPath = (p: Path, frac: number, side: number, flip: boolean) => {
    pathAt(p, p.total * frac, tmp);
    const nx = tmp.ty * side;
    const ny = -tmp.tx * side;
    const off = pathHW + 0.75 * m;
    const bx = tmp.x + nx * off;
    const by = tmp.y + ny * off;
    if (pondField(pond, bx, by) > -0.08) return;
    if (Math.hypot(bx - sx, by - sy) < 3 * m) return;
    benches.push({ x: bx, y: by, face: Math.atan2(flip ? ny : -ny, flip ? nx : -nx), occupied: false });
  };
  alongPath(paths[0], 0.2, 1, true);
  alongPath(paths[0], 0.3, -1, false);
  alongPath(paths[0], 0.76, 1, true);
  alongPath(paths[1], 0.3, 1, true);
  alongPath(paths[1], 0.72, -1, false);
  alongPath(paths[1], 0.85, 1, true);

  // Trees grow bigger toward the front of the scene, which also gives the
  // flat ground a sense of depth. Crowns stand well above their roots, so
  // anything near the top edge has to be small to stay in frame.
  const tp = (u: number, v: number, tone: number, i: number, scale = 1): TreeDef => {
    const p = V(u, v);
    return { x: p.x, y: p.y, r: (1.9 + 2.1 * v) * scale * m, tone, seed: 7 + 31 * i };
  };
  const trees: TreeDef[] = [
    tp(0.07, 0.3, 1, 0, 0.95),
    tp(0.3, 0.22, 2, 1, 0.9),
    tp(0.64, 0.3, 0, 2, 0.9),
    tp(0.92, 0.52, 3, 3), // the blossom tree
    tp(0.9, 0.9, 1, 4),
    tp(0.05, 0.96, 2, 5, 0.9),
  ];
  // Beyond the frame to the upper right, shading the lawn in.
  const shades: TreeDef[] = [{ ...tp(0.9, -0.12, 0, 7, 1.5), seed: 223 }];

  const bl = (u: number, v: number, ang: number, check: string): Blanket => {
    const p = V(u, v);
    return { x: p.x, y: p.y, ang, check };
  };
  const blankets: Blanket[] = [
    bl(0.82, 0.66, 0.3, "rgba(214,86,74,0.5)"),
    bl(0.17, 0.12, -0.4, "rgba(70,130,190,0.45)"),
    bl(0.58, 0.84, 0.5, "rgba(232,180,60,0.55)"),
  ];
  const f0 = V(0.64, 0.1);
  const f1 = V(0.82, 0.16);

  const sb = benches[smokerBench];
  const bin = {
    x: sb.x - Math.sin(sb.face) * m * 1.5 - Math.cos(sb.face) * m * 0.2,
    y: sb.y + Math.cos(sb.face) * m * 1.5 - Math.sin(sb.face) * m * 0.2,
  };

  const lilies: Layout["lilies"] = [];
  const lr = seeded(5);
  for (let i = 0; i < 5; i++) {
    const a = 2.4 + 1.5 * lr();
    const pt = pondPoint(pond, a, 0.74 + 0.14 * lr());
    lilies.push({ x: pt.x, y: pt.y, r: m * (0.16 + 0.06 * lr()), rot: 6 * lr(), ph: 6 * lr() });
  }

  // Reeds crowd the near shore.
  const reeds: Reed[] = [];
  const rr = seeded(91);
  for (let i = 0; i < 26; i++) {
    const a = 0.4 + 2.9 * rr();
    const pt = pondPoint(pond, a, 0.98 + 0.05 * rr());
    reeds.push({ x: pt.x, y: pt.y, h: m * (0.9 + 0.9 * rr()), lean: (rr() - 0.5) * 0.5, seed: rr() });
  }

  const fp = V(0.9, 0.76);
  return {
    w, h, vw, vh, m, pond, paths, pathHW, plaza, benches, smokerBench, trees, shades, blankets,
    frisbee: [f0.x, f0.y, f1.x, f1.y],
    fetch: { x: fp.x, y: fp.y },
    bin, lilies, reeds, field, fieldW, fieldStep,
  };
}

/** RGBA ground map: R = path, G = pond, B = plaza pavers. */
export function buildGroundMap(L: Layout) {
  const mw = Math.ceil(L.w / 2);
  const mh = Math.ceil(L.h / 2);
  const data = new Uint8Array(mw * mh * 4);
  const soft = 1.8 * L.m;
  for (let y = 0; y < mh; y++) {
    for (let x = 0; x < mw; x++) {
      const px = 2 * x + 1;
      const py = 2 * y + 1;
      const o = (y * mw + x) * 4;
      const toPlaza = Math.hypot(px - L.plaza.x, py - L.plaza.y);
      const path = Math.max(clamp01(0.5 + (L.pathHW - pathDistance(L, px, py)) / soft), clamp01(0.5 + (L.plaza.r - toPlaza) / soft));
      data[o] = 255 * path;
      data[o + 1] = 255 * clamp01(0.5 + pondField(L.pond, px, py));
      data[o + 2] = 255 * clamp01((L.plaza.r - 0.3 * L.m - toPlaza) / L.m);
      data[o + 3] = 255;
    }
  }
  return { data, mw, mh };
}
