// An oblique ("dimetric") camera. The ground plane is rotated and squashed
// into a diamond-ish lawn seen from about forty degrees up; anything with
// height stands up the screen from where it touches the ground, so trees,
// people and benches read as solid things rather than as flat plan views.
//
// Two coordinate systems meet here:
//   world  – the flat ground the simulation runs on (px, y down)
//   screen – the view in CSS px
// `project` takes a world point at some height to the screen; `cast` stays on
// the ground plane (shadows) and is drawn under the ground transform.

export interface Pt {
  x: number;
  y: number;
  /** Kept for the draw code's sake; the camera has no perspective scaling. */
  k: number;
}

/** Direction shadows fall across the ground (world), per unit of height. */
export const SUN = { x: 0.78, y: -0.22 };

const cam = {
  a: 1, b: 0, c: 0, d: 1,
  ia: 1, ib: 0, ic: 0, id: 1,
  cx: 0, cy: 0,
  wx: 0, wy: 0,
  dx: 0, dy: 0,
  hz: 1,
};

/**
 * Configure the camera. `theta` turns the ground, `squash` is how much the
 * depth axis is foreshortened (sin of the elevation), `hz` converts height
 * into screen rise (cos of the elevation). (wx, wy) is the world point that
 * sits at the centre of a vw×vh view.
 */
export function setView(vw: number, vh: number, theta: number, squash: number, hz: number, wx: number, wy: number) {
  const co = Math.cos(theta);
  const si = Math.sin(theta);
  // screen = diag(1, squash) · R(theta) · world
  cam.a = co;
  cam.b = -si;
  cam.c = squash * si;
  cam.d = squash * co;
  const det = cam.a * cam.d - cam.b * cam.c;
  cam.ia = cam.d / det;
  cam.ib = -cam.b / det;
  cam.ic = -cam.c / det;
  cam.id = cam.a / det;
  cam.cx = vw / 2;
  cam.cy = vh / 2;
  cam.wx = wx;
  cam.wy = wy;
  cam.hz = hz;
  cam.dx = 0;
  cam.dy = 0;
}

/** Slow camera drift, in world px. */
export function setDrift(dx: number, dy: number) {
  cam.dx = dx;
  cam.dy = dy;
}

/** Aim the sun: shadows should fall toward (sx, sy) on screen. */
export function setSun(sx: number, sy: number) {
  SUN.x = cam.ia * sx + cam.ib * sy;
  SUN.y = cam.ic * sx + cam.id * sy;
}

/** A world-space offset as it appears on screen (no height). */
export function toScreenVec(dx: number, dy: number, out: { x: number; y: number }) {
  out.x = cam.a * dx + cam.b * dy;
  out.y = cam.c * dx + cam.d * dy;
  return out;
}

/** A screen-space offset as a world-space offset on the ground. */
export function toWorldVec(sx: number, sy: number, out: { x: number; y: number }) {
  out.x = cam.ia * sx + cam.ib * sy;
  out.y = cam.ic * sx + cam.id * sy;
  return out;
}

/** World point at height z (px) → screen. */
export function project(x: number, y: number, z: number, out: Pt): Pt {
  const dx = x - cam.wx - cam.dx;
  const dy = y - cam.wy - cam.dy;
  out.x = cam.cx + cam.a * dx + cam.b * dy;
  out.y = cam.cy + cam.c * dx + cam.d * dy - z * cam.hz;
  out.k = 1;
  return out;
}

/** Screen point → the ground point beneath it. */
export function unproject(sx: number, sy: number, out: { x: number; y: number }) {
  const ux = sx - cam.cx;
  const uy = sy - cam.cy;
  out.x = cam.wx + cam.dx + cam.ia * ux + cam.ib * uy;
  out.y = cam.wy + cam.dy + cam.ic * ux + cam.id * uy;
  return out;
}

/** Where the shadow of a point at height z lands, on the ground plane. */
export function cast(x: number, y: number, z: number, out: Pt): Pt {
  out.x = x + SUN.x * z;
  out.y = y + SUN.y * z;
  out.k = 1;
  return out;
}

/** The ground→screen transform, in canvas `setTransform` order, scaled by dpr. */
export function groundTransform(ctx: CanvasRenderingContext2D, dpr = 1, scale = 1) {
  const e = cam.cx - cam.a * (cam.wx + cam.dx) - cam.b * (cam.wy + cam.dy);
  const f = cam.cy - cam.c * (cam.wx + cam.dx) - cam.d * (cam.wy + cam.dy);
  const s = dpr * scale;
  ctx.setTransform(cam.a * s, cam.c * s, cam.b * s, cam.d * s, e * s, f * s);
}

/** Plain screen-space drawing at the given pixel ratio. */
export function screenTransform(ctx: CanvasRenderingContext2D, dpr = 1, scale = 1) {
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
}

/** Begin drawing something lying flat at a screen point (call ctx.restore() after). */
export function flat(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.transform(cam.a, cam.c, cam.b, cam.d, 0, 0);
}

const tp = { x: 0, y: 0, k: 1 };

/** Begin drawing something lying flat on the world point (x, y) at height z. */
export function onGround(ctx: CanvasRenderingContext2D, x: number, y: number, z = 0) {
  project(x, y, z, tp);
  flat(ctx, tp.x, tp.y);
}

const v = { x: 0, y: 0 };

/** Screen direction (unit) of a world heading. */
export function screenDir(heading: number, out: { x: number; y: number } = { x: 0, y: 0 }) {
  toScreenVec(Math.cos(heading), Math.sin(heading), v);
  const len = Math.hypot(v.x, v.y) || 1;
  out.x = v.x / len;
  out.y = v.y / len;
  return out;
}

export function screenAngle(heading: number) {
  toScreenVec(Math.cos(heading), Math.sin(heading), v);
  return Math.atan2(v.y, v.x);
}

/** Unit vector on screen pointing toward the sun. */
export function lightDir() {
  toScreenVec(SUN.x, SUN.y, v);
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: -v.x / len, y: -v.y / len };
}

/** The world→screen matrix and its inverse, for shaders. */
export function matrices() {
  return { a: cam.a, b: cam.b, c: cam.c, d: cam.d, ia: cam.ia, ib: cam.ib, ic: cam.ic, id: cam.id, wx: cam.wx + cam.dx, wy: cam.wy + cam.dy };
}

export const mkPt = (): Pt => ({ x: 0, y: 0, k: 1 });
