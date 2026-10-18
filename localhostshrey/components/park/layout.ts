// The park's fixed geometry: a pond in the upper right, two paths that cross
// at a small plaza, benches, trees, picnic blankets. Everything is derived
// from the stage size so the same composition holds at any aspect ratio.

import { TAU, clamp01, seeded } from "./util";

export interface Pond {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  ph: number[];
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
  tone: number;
  seed: number;
}

export interface Blanket {
  x: number;
  y: number;
  ang: number;
  check: string;
}

export interface Layout {
  w: number;
  h: number;
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
  bin: { x: number; y: number };
  lilies: { x: number; y: number; r: number; rot: number; ph: number }[];
  field: Float32Array;
  fieldW: number;
  fieldStep: number;
}

const WAVES = [
  [2, 0.09],
  [3, 0.06],
  [5, 0.035],
  [9, 0.018],
] as const;

function wobble(p: Pond, ang: number) {
  let s = 1;
  for (let i = 0; i < WAVES.length; i++) {
    s += WAVES[i][1] * Math.sin(WAVES[i][0] * ang + p.ph[i]);
  }
  return s;
}

/** > 0 inside the pond, 0 on the shore, < 0 on land. */
export function pondField(p: Pond, x: number, y: number) {
  const dx = (x - p.cx) / p.rx;
  const dy = (y - p.cy) / p.ry;
  return 1 - Math.hypot(dx, dy) / wobble(p, Math.atan2(dy, dx));
}

/** A point on the pond's outline, pulled in by `inset` (1 = on the shore). */
export function pondPoint(p: Pond, ang: number, inset: number) {
  const w = wobble(p, ang);
  return {
    x: p.cx + Math.cos(ang) * p.rx * w * inset,
    y: p.cy + Math.sin(ang) * p.ry * w * inset,
  };
}

function buildPath(
  pts: number[][],
  w: number,
  h: number,
  plaza: { x: number; y: number },
): Path {
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
        0.5 *
        (2 * b +
          (-a + c) * t +
          (2 * a - 5 * b + 4 * c - d) * t2 +
          (-a + 3 * b - 3 * c + d) * t3);
      xs.push(cr(p0[0], p1[0], p2[0], p3[0]) * w);
      ys.push(cr(p0[1], p1[1], p2[1], p3[1]) * h);
    }
  }
  const last = pts[pts.length - 1];
  xs.push(last[0] * w);
  ys.push(last[1] * h);
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
  return {
    xs: Float32Array.from(xs),
    ys: Float32Array.from(ys),
    s,
    n,
    total: s[n - 1],
    junction: s[nearest],
  };
}

const tmp = { x: 0, y: 0, tx: 0, ty: 0 };

/** Position and unit tangent at arc length `t` along a path. */
export function pathAt(
  path: Path,
  t: number,
  out: { x: number; y: number; tx: number; ty: number },
) {
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
export function pathDistance(
  L: Pick<Layout, "field" | "fieldW" | "fieldStep">,
  x: number,
  y: number,
) {
  const rows = L.field.length / L.fieldW;
  const fx = Math.max(0, Math.min(L.fieldW - 1.001, x / L.fieldStep));
  const fy = Math.max(0, Math.min(rows - 1.001, y / L.fieldStep));
  const ix = fx | 0;
  const iy = fy | 0;
  const tx = fx - ix;
  const ty = fy - iy;
  const i = iy * L.fieldW + ix;
  const f = L.field;
  return (
    (f[i] * (1 - tx) + f[i + 1] * tx) * (1 - ty) +
    (f[i + L.fieldW] * (1 - tx) + f[i + L.fieldW + 1] * tx) * ty
  );
}

export function buildLayout(w: number, h: number): Layout {
  const rng = seeded(1904);
  const m = Math.min(w, h) / 22;

  const pond: Pond = {
    cx: 0.74 * w,
    cy: 0.25 * h,
    rx: 0.27 * w,
    ry: 0.31 * h,
    ph: [rng() * TAU, rng() * TAU, rng() * TAU, rng() * TAU],
  };
  const plaza = { x: 0.4 * w, y: 0.56 * h, r: 2.6 * m };

  const paths = [
    buildPath(
      [
        [0.3, -0.12],
        [0.33, 0.12],
        [0.37, 0.36],
        [0.4, 0.56],
        [0.36, 0.8],
        [0.26, 1.12],
      ],
      w,
      h,
      plaza,
    ),
    buildPath(
      [
        [-0.12, 0.62],
        [0.16, 0.58],
        [0.4, 0.56],
        [0.6, 0.66],
        [0.82, 0.72],
        [1.12, 0.66],
      ],
      w,
      h,
      plaza,
    ),
  ];
  const pathHW = 1.3 * m;

  // Distance-to-path field on a coarse grid, used for the ground texture and
  // for keeping props off the paths.
  const fieldStep = 3;
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

  // Benches: a few around the plaza, a few along the paths, and the one on
  // the pond bank where the smoker lives.
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
      benches.push({ x: bx, y: by, face: a + Math.PI, occupied: false });
    }
  }
  const sx = plaza.x + (pond.cx - plaza.x) * 0.3;
  const sy = plaza.y + (pond.cy - plaza.y) * 0.42;
  for (let i = benches.length - 1; i >= 0; i--) {
    if (Math.hypot(benches[i].x - sx, benches[i].y - sy) < 2.2 * m)
      benches.splice(i, 1);
  }
  benches.push({
    x: sx,
    y: sy,
    face: Math.atan2(pond.cy - sy, pond.cx - sx),
    occupied: true,
  });
  const smokerBench = benches.length - 1;

  const alongPath = (p: Path, frac: number, side: number, flip: boolean) => {
    pathAt(p, p.total * frac, tmp);
    const nx = tmp.ty * side;
    const ny = -tmp.tx * side;
    const off = pathHW + 0.75 * m;
    const bx = tmp.x + nx * off;
    const by = tmp.y + ny * off;
    if (bx < 0.05 * w || bx > 0.95 * w || by < 0.05 * h || by > 0.95 * h) return;
    if (pondField(pond, bx, by) > -0.05) return;
    benches.push({
      x: bx,
      y: by,
      face: Math.atan2(flip ? ny : -ny, flip ? nx : -nx),
      occupied: false,
    });
  };
  alongPath(paths[0], 0.22, -1, false);
  alongPath(paths[0], 0.33, -1, false);
  alongPath(paths[1], 0.66, 1, true);
  alongPath(paths[1], 0.8, 1, true);
  alongPath(paths[1], 0.2, -1, false);

  const trees: TreeDef[] = [
    { x: plaza.x - 4.6 * m, y: plaza.y + 4.4 * m, r: 3.2 * m, tone: 0 },
    { x: 0.1 * w, y: 0.84 * h, r: 3.8 * m, tone: 1 },
    { x: 0.1 * w, y: 0.14 * h, r: 3.4 * m, tone: 2 },
    { x: 0.93 * w, y: 0.9 * h, r: 3.6 * m, tone: 0 },
    { x: 0.64 * w, y: 0.97 * h, r: 2.8 * m, tone: 2 },
  ].map((t, i) => ({ ...t, seed: 7 + 31 * i }));
  // A big tree just off the bottom edge whose shadow reaches in.
  const shades: TreeDef[] = [
    { x: 0.8 * w, y: 1.25 * h, r: 4.5 * m, tone: 0, seed: 223 },
  ];

  const blankets: Blanket[] = [
    { x: 0.56 * w, y: 0.86 * h, ang: 0.2, check: "rgba(214,86,74,0.5)" },
    { x: 0.13 * w, y: 0.34 * h, ang: -0.35, check: "rgba(70,120,200,0.45)" },
    { x: 0.84 * w, y: 0.9 * h, ang: 0.5, check: "rgba(232,180,60,0.55)" },
  ];

  const sb = benches[smokerBench];
  const bin = {
    x: sb.x - Math.sin(sb.face) * m * 1.5 - Math.cos(sb.face) * m * 0.2,
    y: sb.y + Math.cos(sb.face) * m * 1.5 - Math.sin(sb.face) * m * 0.2,
  };

  const lilies: Layout["lilies"] = [];
  const lr = seeded(5);
  for (let i = 0; i < 5; i++) {
    const a = -0.7 + 1.2 * lr();
    const pt = pondPoint(pond, a, 0.76 + 0.14 * lr());
    lilies.push({
      x: pt.x,
      y: pt.y,
      r: m * (0.15 + 0.06 * lr()),
      rot: 6 * lr(),
      ph: 6 * lr(),
    });
  }

  return {
    w,
    h,
    m,
    pond,
    paths,
    pathHW,
    plaza,
    benches,
    smokerBench,
    trees,
    shades,
    blankets,
    frisbee: [0.07 * w, 0.12 * h, 0.24 * w, 0.2 * h],
    bin,
    lilies,
    field,
    fieldW,
    fieldStep,
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
      const path = Math.max(
        clamp01(0.5 + (L.pathHW - pathDistance(L, px, py)) / soft),
        clamp01(0.5 + (L.plaza.r - toPlaza) / soft),
      );
      data[o] = 255 * path;
      data[o + 1] = 255 * clamp01(0.5 + pondField(L.pond, px, py));
      data[o + 2] = 255 * clamp01((L.plaza.r - 0.3 * L.m - toPlaza) / L.m);
      data[o + 3] = 255;
    }
  }
  return { data, mw, mh };
}
