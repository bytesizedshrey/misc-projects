/**
 * The mark the stamp leaves: a passport-style round stamp ("visited", the date and the real time), printed in red ink.
 * Every print is different: the ink thins as the stamp runs dry, pressure changes how fully it takes, and a seeded
 * speckle breaks up the edges the way rubber on paper does. Prints are described by plain data, so they can be saved
 * and redrawn exactly.
 */

export type Print = {
  /** centre, as a fraction of the sheet */
  x: number;
  y: number;
  /** diameter, as a fraction of the sheet's width */
  d: number;
  rot: number; // radians
  ink: number; // 0..1, how much ink the stamp carried
  press: number; // 0..1, how firmly it was pressed
  seed: number;
  date: string;
  time: string;
};

export const INK = [166, 30, 26]; // a Ferrari-ish red, the only colour on the desk

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Value noise on a lattice, seeded: breaks the ink into soft blotches and fine speckle. */
function noiseField(seed: number, size: number) {
  const r = rng(seed);
  const g = 24;
  const lat = new Float32Array((g + 1) * (g + 1));
  for (let i = 0; i < lat.length; i++) lat[i] = r();
  const fine = new Float32Array(size * size);
  for (let i = 0; i < fine.length; i++) fine[i] = r();
  return (x: number, y: number, ix: number) => {
    const fx = (x / size) * g,
      fy = (y / size) * g;
    const x0 = Math.floor(fx),
      y0 = Math.floor(fy);
    const tx = fx - x0,
      ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx),
      sy = ty * ty * (3 - 2 * ty);
    const a = lat[y0 * (g + 1) + x0],
      b = lat[y0 * (g + 1) + x0 + 1],
      c = lat[(y0 + 1) * (g + 1) + x0],
      d = lat[(y0 + 1) * (g + 1) + x0 + 1];
    const blot = a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
    return 0.55 * blot + 0.45 * fine[ix];
  };
}

const artCache = new Map<string, HTMLCanvasElement>();

/** The stamp's own artwork, drawn in solid black at `size` px. Cached per text and size. */
function art(size: number, date: string, time: string) {
  const key = `${size}|${date}|${time}`;
  const hit = artCache.get(key);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const R = size / 2;
  g.translate(R, R);
  g.fillStyle = g.strokeStyle = "#000";
  g.textAlign = "center";
  g.textBaseline = "middle";

  // rings
  g.lineWidth = size * 0.022;
  g.beginPath();
  g.arc(0, 0, R * 0.93, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = size * 0.01;
  g.beginPath();
  g.arc(0, 0, R * 0.58, 0, Math.PI * 2);
  g.stroke();
  g.beginPath();
  g.arc(0, 0, R * 0.9, 0, Math.PI * 2);
  g.stroke();

  // the ring of text, one letter at a time around the band
  const ring = "LOCALHOSTSHREY · DESIGN ENGINEER · MUMBAI · ";
  g.font = `600 ${size * 0.075}px ui-monospace, "SF Mono", Menlo, monospace`;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    g.save();
    g.rotate(a);
    g.translate(0, -R * 0.74);
    g.fillText(ring[i], 0, 0);
    g.restore();
  }

  // the middle: the verdict, the date, the time
  g.font = `800 ${size * 0.15}px ui-monospace, "SF Mono", Menlo, monospace`;
  g.fillText("VISITED", 0, -R * 0.2);
  g.fillRect(-R * 0.4, -R * 0.06, R * 0.8, size * 0.012);
  g.font = `600 ${size * 0.07}px ui-monospace, "SF Mono", Menlo, monospace`;
  g.fillText(date, 0, R * 0.13);
  g.font = `700 ${size * 0.09}px ui-monospace, "SF Mono", Menlo, monospace`;
  g.fillText(time, 0, R * 0.3);

  artCache.set(key, c);
  if (artCache.size > 40) artCache.delete(artCache.keys().next().value!);
  return c;
}

/** Turn the black artwork into a believable inked impression. */
function impression(p: Print, size: number) {
  const src = art(size, p.date, p.time);
  const out = document.createElement("canvas");
  out.width = out.height = size;
  const g = out.getContext("2d")!;
  g.drawImage(src, 0, 0);
  const img = g.getImageData(0, 0, size, size);
  const px = img.data;
  const noise = noiseField(p.seed, size);
  // how fully the rubber takes: ink on the face, and how hard it was pressed
  const coverage =
    Math.min(1, 0.18 + 0.82 * Math.pow(p.ink, 0.8)) * (0.62 + 0.38 * p.press);
  const [r, gg, b] = INK;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const a = px[i * 4 + 3] / 255;
      if (a === 0) continue;
      // a shallow press leaves the middle thin and the rim heavy, like a stamp that rocks
      const dx = (x - size / 2) / (size / 2),
        dy = (y - size / 2) / (size / 2);
      const rim = Math.min(1, Math.hypot(dx, dy));
      const bias = (rim - 0.5) * 0.3 * (1 - p.press);
      const n = noise(x, y, i);
      const take = smooth(0.38, 0.62, coverage + bias + (n - 0.5) * 0.95);
      px[i * 4] = r;
      px[i * 4 + 1] = gg;
      px[i * 4 + 2] = b;
      px[i * 4 + 3] = Math.round(
        255 * a * take * (0.8 + 0.2 * Math.min(1, coverage * 1.2)),
      );
    }
  }
  g.putImageData(img, 0, 0);
  return out;
}

/** Draw one print onto the sheet. */
export function drawPrint(
  ctx: CanvasRenderingContext2D,
  p: Print,
  sheetW: number,
  sheetH: number,
  dpr: number,
) {
  const D = p.d * sheetW;
  const size = Math.max(32, Math.round(D * dpr));
  const imp = impression(p, size);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.translate(p.x * sheetW, p.y * sheetH);
  ctx.rotate(p.rot);
  ctx.filter = "blur(0.35px)"; // ink bleeds a touch into the paper
  ctx.drawImage(imp, -D / 2, -D / 2, D, D);
  ctx.restore();
}

export const stampDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en", { month: "short" }).toUpperCase()} ${d.getFullYear()}`;
export const stampTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
