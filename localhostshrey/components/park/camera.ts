// A very light "tilted top-down" camera. The scene is flat, but anything with
// height is pushed away from the view centre (parallax), and shadows are laid
// along the low western sun. This is what gives the miniature depth.

export interface Pt {
  x: number;
  y: number;
  /** Apparent scale at that height (1 = ground level). */
  k: number;
}

/** Direction shadows fall, per unit of height. */
export const SUN = { x: 0.78, y: -0.22 };

const cam = { cx: 0, cy: 0, hpx: 1 };

export function setCamera(cx: number, cy: number, m: number) {
  cam.cx = cx;
  cam.cy = cy;
  cam.hpx = 40 * m;
}

/** Project a world point at height z (in px) toward the viewer. */
export function project(x: number, y: number, z: number, out: Pt): Pt {
  const k = cam.hpx / (cam.hpx - z);
  out.x = cam.cx + (x - cam.cx) * k;
  out.y = cam.cy + (y - cam.cy) * k;
  out.k = k;
  return out;
}

/** Where the shadow of a point at height z lands on the ground. */
export function cast(x: number, y: number, z: number, out: Pt): Pt {
  out.x = x + SUN.x * z;
  out.y = y + SUN.y * z;
  out.k = 1;
  return out;
}

export const mkPt = (): Pt => ({ x: 0, y: 0, k: 1 });
