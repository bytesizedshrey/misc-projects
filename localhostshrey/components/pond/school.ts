/**
 * The koi: their bodies, their swimming and their moods. Everything is in CSS pixels, origin top-left.
 *
 * A fish is a head that steers and a trail of where the head has been. The body is laid along that trail at equal
 * spacing, so it bends the way a real fish does when it turns, then a travelling sine wave is added for the swim.
 */

export const SPINE = 22; // points along the body used to bend it
export const ROWS = 48; // cross-sections in the rendered mesh
export const FLOATS = 8; // x, y, a, b, id, length, fear, part
export const VERTS_PER_FISH = ROWS * 2 + 8; // body strip + two pectoral fins
const TRAIL = 150;
const T0 = -0.04; // the mesh starts a little ahead of the nose
const T1 = 1.5; // ...and ends at the tip of the tail (body ends at 1.0, tail fin after)
const TAU = Math.PI * 2;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/** Half the width of the fish at position t along it, as a fraction of its length. */
export function halfWidth(t: number): number {
  if (t <= 0) return 0;
  if (t <= 1) {
    const nose = Math.sqrt(Math.max(0, 1 - (Math.max(0.3 - t, 0) / 0.3) ** 2));
    return (0.11 + (0.028 - 0.11) * smooth(0.32, 1, t)) * nose;
  }
  // tail fin: flares out from the peduncle, then narrows again toward the fork
  return 0.028 + 0.13 * smooth(1, 1.28, t) * (1 - 0.45 * smooth(1.28, T1, t));
}

const SPECS = [
  { kind: 0, x: 0.2, y: 0.38, heading: 0.4, size: 1.0, seed: 0.13 }, // kohaku: white with red-orange
  { kind: 1, x: 0.7, y: 0.64, heading: 2.9, size: 0.92, seed: 0.91 }, // showa: black, white and orange
  { kind: 2, x: 0.5, y: 0.3, heading: -0.6, size: 0.84, seed: 0.34 }, // ogon: solid gold
  { kind: 3, x: 0.88, y: 0.3, heading: 2.2, size: 0.78, seed: 0.72 }, // tancho: white with a red crown
];

type Fish = {
  kind: number;
  seed: number;
  size: number;
  L: number;
  x: number;
  y: number;
  heading: number;
  turn: number;
  speed: number;
  cruise: number;
  goalX: number;
  goalY: number;
  goalUntil: number;
  fear: number;
  fleeAngle: number;
  beat: number;
  flickSide: number;
  flicked: boolean;
  finPhase: number;
  fold: number;
  swim: number;
  prevHeadX: number;
  prevHeadY: number;
  spine: Float32Array;
  trail: Float32Array;
  trailCount: number;
  rows: Float32Array; // per mesh row: x, y, normalX, normalY, dirX, dirY
};

export type RippleSink = {
  drop(x: number, y: number, r: number, amp: number): void;
};

export function createSchool(width: number, height: number, count: number) {
  let W = width;
  let H = height;
  const unit = () => Math.min(0.38 * H, 0.26 * W);
  const rowT = (k: number) => T0 + ((T1 - T0) * k) / (ROWS - 1);
  const rowAt = (t: number) => clamp(Math.round(((t - T0) / (T1 - T0)) * (ROWS - 1)), 0, ROWS - 1);

  const fish: Fish[] = SPECS.slice(0, count).map((s) => {
    const L = unit() * s.size;
    const f: Fish = {
      kind: s.kind,
      seed: s.seed,
      size: s.size,
      L,
      x: s.x * W,
      y: s.y * H,
      heading: s.heading,
      turn: 0,
      speed: 0,
      cruise: L * (0.2 + 0.1 * s.seed),
      goalX: s.x * W,
      goalY: s.y * H,
      goalUntil: 0,
      fear: 0,
      fleeAngle: 0,
      beat: s.seed * TAU,
      flickSide: 1,
      flicked: false,
      finPhase: 20 * s.seed,
      fold: 0,
      swim: 0.4,
      prevHeadX: s.x * W,
      prevHeadY: s.y * H,
      spine: new Float32Array(SPINE * 2),
      trail: new Float32Array(TRAIL * 2),
      trailCount: TRAIL,
      rows: new Float32Array(ROWS * 6),
    };
    f.speed = f.cruise;
    for (let i = 0; i < TRAIL; i++) {
      f.trail[2 * i] = f.x - Math.cos(f.heading) * L * 0.02 * i;
      f.trail[2 * i + 1] = f.y - Math.sin(f.heading) * L * 0.02 * i;
    }
    layBody(f);
    layRows(f);
    return f;
  });

  /** Lay the body along the trail at equal spacing. */
  function layBody(f: Fish) {
    const { spine, trail } = f;
    const gap = (T1 * f.L) / (SPINE - 1);
    spine[0] = f.x;
    spine[1] = f.y;
    let cx = f.x,
      cy = f.y,
      need = gap,
      n = 1;
    for (let i = 0; n < SPINE && i < f.trailCount; ) {
      const d = Math.hypot(trail[2 * i] - cx, trail[2 * i + 1] - cy);
      if (d >= need) {
        cx += ((trail[2 * i] - cx) * need) / d;
        cy += ((trail[2 * i + 1] - cy) * need) / d;
        spine[2 * n] = cx;
        spine[2 * n + 1] = cy;
        n++;
        need = gap;
      } else {
        need -= d;
        cx = trail[2 * i];
        cy = trail[2 * i + 1];
        i++;
      }
    }
    // if the trail ran out (just spawned), continue straight behind
    let dx = n >= 2 ? spine[2 * (n - 1)] - spine[2 * (n - 2)] : -Math.cos(f.heading);
    let dy = n >= 2 ? spine[2 * (n - 1) + 1] - spine[2 * (n - 2) + 1] : -Math.sin(f.heading);
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    for (; n < SPINE; n++) {
      spine[2 * n] = spine[2 * (n - 1)] + dx * gap;
      spine[2 * n + 1] = spine[2 * (n - 1) + 1] + dy * gap;
    }
  }

  /** Sample the body into mesh rows, adding the swimming wave. */
  function layRows(f: Fish) {
    const { spine, rows, L } = f;
    const hx = Math.cos(f.heading),
      hy = Math.sin(f.heading);
    const tmp = new Float32Array(ROWS * 4); // x, y, dirX, dirY
    for (let k = 0; k < ROWS; k++) {
      const t = rowT(k);
      let x: number, y: number, dx: number, dy: number;
      if (t <= 0) {
        x = f.x - hx * t * L;
        y = f.y - hy * t * L;
        dx = -hx; // direction of increasing t: from head toward tail
        dy = -hy;
      } else {
        const s = (t / T1) * (SPINE - 1);
        const i = Math.min(Math.floor(s), SPINE - 2);
        const r = s - i;
        x = spine[2 * i] + (spine[2 * (i + 1)] - spine[2 * i]) * r;
        y = spine[2 * i + 1] + (spine[2 * (i + 1) + 1] - spine[2 * i + 1]) * r;
        dx = spine[2 * (i + 1)] - spine[2 * i];
        dy = spine[2 * (i + 1) + 1] - spine[2 * i + 1];
        const m = Math.hypot(dx, dy) || 1;
        dx /= m;
        dy /= m;
      }
      // the wave grows toward the tail
      const amp = L * (0.008 + 0.07 * smooth(0.15, T1, t) ** 1.5) * f.swim * Math.sin(f.beat - 5.2 * t);
      tmp[4 * k] = x - dy * amp;
      tmp[4 * k + 1] = y + dx * amp;
      tmp[4 * k + 2] = dx;
      tmp[4 * k + 3] = dy;
    }
    for (let k = 0; k < ROWS; k++) {
      const a = Math.max(k - 1, 0),
        b = Math.min(k + 1, ROWS - 1);
      let tx = tmp[4 * b] - tmp[4 * a],
        ty = tmp[4 * b + 1] - tmp[4 * a + 1];
      const m = Math.hypot(tx, ty) || 1;
      tx /= m;
      ty /= m;
      rows[6 * k] = tmp[4 * k];
      rows[6 * k + 1] = tmp[4 * k + 1];
      rows[6 * k + 2] = -ty; // normal
      rows[6 * k + 3] = tx;
      rows[6 * k + 4] = tx; // direction toward the tail
      rows[6 * k + 5] = ty;
    }
  }

  function chooseGoal(f: Fish, now: number) {
    let best = -Infinity;
    for (let n = 0; n < 6; n++) {
      const gx = W * (0.12 + 0.76 * Math.random());
      const gy = H * (0.14 + 0.72 * Math.random());
      const d = Math.hypot(gx - f.x, gy - f.y);
      if (d < 1.2 * f.L) continue;
      let nearest = Infinity;
      for (const o of fish) {
        if (o === f) continue;
        nearest = Math.min(nearest, Math.hypot(gx - o.x, gy - o.y), Math.hypot(gx - o.goalX, gy - o.goalY));
      }
      const score = Math.min(nearest, 2.5 * f.L) - 0.15 * d;
      if (score > best) {
        best = score;
        f.goalX = gx;
        f.goalY = gy;
      }
    }
    f.goalUntil = now + 6 + 8 * Math.random();
  }

  function frighten(f: Fish, fromX: number, fromY: number, amount: number) {
    const k = rowAt(0.45);
    let dx = f.rows[6 * k] - fromX,
      dy = f.rows[6 * k + 1] - fromY;
    if (Math.hypot(dx, dy) < 4) {
      const side = Math.random() < 0.5 ? 1 : -1;
      dx = -Math.sin(f.heading) * side;
      dy = Math.cos(f.heading) * side;
    }
    f.fleeAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
    f.fear = Math.max(f.fear, amount);
  }

  return {
    count: fish.length,

    update(dt: number, now: number) {
      for (const f of fish) {
        const L = f.L;
        const hk = rowAt(0.12);
        f.prevHeadX = f.rows[6 * hk];
        f.prevHeadY = f.rows[6 * hk + 1];

        if (now > f.goalUntil || Math.hypot(f.goalX - f.x, f.goalY - f.y) < 0.8 * L) chooseGoal(f, now);

        const hx = Math.cos(f.heading),
          hy = Math.sin(f.heading);
        const gd = Math.hypot(f.goalX - f.x, f.goalY - f.y) || 1;
        const gx = (f.goalX - f.x) / gd,
          gy = (f.goalY - f.y) / gd;
        // a lazy meander on top of the straight line to the goal
        const wob = 0.18 * Math.sin(0.4 * now + 17 * f.seed) + 0.05 * Math.sin(1.1 * now + 5 * f.seed);
        let bx = gx - gy * wob,
          by = gy + gx * wob;

        // keep inside the water: look a little ahead of the nose
        const ax = f.x + hx * L * 0.8,
          ay = f.y + hy * L * 0.8;
        const m = 0.3 * L;
        const over = (v: number) => Math.max(v, 0) / L;
        const wx = over(m - ax) - over(ax - (W - m));
        const wy = over(m - ay) - over(ay - (H - m));
        bx += wx * (4 + 8 * Math.abs(wx));
        by += wy * (4 + 8 * Math.abs(wy));

        // keep clear of the others
        let crowd = 0;
        for (const o of fish) {
          if (o === f) continue;
          const reach = (L + o.L) * 0.55;
          for (const along of [0, 0.6, 1.3]) {
            const px = f.x + hx * L * along,
              py = f.y + hy * L * along;
            let best = Infinity,
              nx = 0,
              ny = 0;
            for (let k = rowAt(0); k < rowAt(1.1); k += 3) {
              const k2 = Math.min(k + 3, ROWS - 1);
              const sx = o.rows[6 * k2] - o.rows[6 * k],
                sy = o.rows[6 * k2 + 1] - o.rows[6 * k + 1];
              const u = clamp(((px - o.rows[6 * k]) * sx + (py - o.rows[6 * k + 1]) * sy) / (sx * sx + sy * sy || 1), 0, 1);
              const vx = px - (o.rows[6 * k] + sx * u),
                vy = py - (o.rows[6 * k + 1] + sy * u);
              const d = Math.hypot(vx, vy);
              if (d < best) {
                best = d;
                nx = vx;
                ny = vy;
              }
            }
            if (best >= reach) continue;
            const p = 1 - best / reach;
            if (best < 1) {
              nx = -hy;
              ny = hx;
              best = 1;
            }
            bx += (nx / best) * p * p * 9;
            by += (ny / best) * p * p * 9;
            crowd = Math.max(crowd, p * (along > 1 ? 0.6 : 1));
          }
        }
        if (crowd > 0.6) f.goalUntil = Math.min(f.goalUntil, now + 1.2);
        if (f.fear > 0.02) {
          bx += Math.cos(f.fleeAngle) * f.fear * 6;
          by += Math.sin(f.fleeAngle) * f.fear * 6;
        }

        // steer
        const err = wrap(Math.atan2(by, bx) - f.heading);
        const maxTurn = Math.min(0.6 + 2.4 * crowd + 8 * f.fear, 6, 0.3 + f.speed / (0.5 * L));
        const agility = 1.2 + 2 * crowd + 8 * f.fear;
        const want = clamp(err * agility, -maxTurn, maxTurn);
        f.turn += (want - f.turn) * (1 - Math.exp(-dt * agility * 4.5));
        f.heading = wrap(f.heading + f.turn * dt);

        // speed: slows for tight turns and crowds, bursts when frightened
        const pace = 0.7 + 0.45 * (0.5 + 0.5 * Math.sin(0.37 * now + 23 * f.seed));
        const target = f.cruise * pace * (1 - 0.35 * Math.min(Math.abs(err), 1)) * (1 - 0.4 * crowd) + f.fear * L * 3.4;
        f.speed += (target - f.speed) * (1 - Math.exp(-dt * (f.fear > 0.15 ? 7 : 1.1)));
        f.x += Math.cos(f.heading) * f.speed * dt;
        f.y += Math.sin(f.heading) * f.speed * dt;
        f.fear *= Math.exp(-1.5 * dt);

        const rel = f.speed / L;
        const prev = f.beat;
        f.beat += dt * TAU * (0.7 + 2.2 * rel);
        if (Math.floor(f.beat / Math.PI) !== Math.floor(prev / Math.PI)) f.flicked = true;
        f.finPhase += dt * TAU * (0.8 + 0.4 * f.seed);
        f.fold += ((f.fear > 0.25 ? 1 : 0) - f.fold) * (1 - Math.exp(-6 * dt));
        f.swim = 0.3 + 0.7 * clamp(rel / 1.2, 0, 1);

        const tr = f.trail;
        if (Math.hypot(f.x - tr[0], f.y - tr[1]) >= 0.02 * L) {
          tr.copyWithin(2, 0, tr.length - 2);
          tr[0] = f.x;
          tr[1] = f.y;
          f.trailCount = Math.min(f.trailCount + 1, TRAIL);
        }
        layBody(f);
        layRows(f);
      }
    },

    /** Fill the vertex buffer: per fish, a body strip then two pectoral fins. */
    writeVertices(out: Float32Array) {
      let o = 0;
      const put = (x: number, y: number, a: number, b: number, id: number, L: number, fear: number, part: number) => {
        out[o++] = x;
        out[o++] = y;
        out[o++] = a;
        out[o++] = b;
        out[o++] = id;
        out[o++] = L;
        out[o++] = fear;
        out[o++] = part;
      };
      for (const f of fish) {
        const id = f.kind + f.seed * 0.99;
        const L = f.L;
        const fear = Math.min(1, f.fold);
        for (let k = 0; k < ROWS; k++) {
          const t = rowT(k);
          const w = halfWidth(t) * L;
          const cx = f.rows[6 * k],
            cy = f.rows[6 * k + 1],
            nx = f.rows[6 * k + 2],
            ny = f.rows[6 * k + 3];
          put(cx - nx * w, cy - ny * w, t, -1, id, L, fear, 0);
          put(cx + nx * w, cy + ny * w, t, 1, id, L, fear, 0);
        }
        // pectoral fins, flapping gently and folding in when the fish is frightened
        const k0 = rowAt(0.27);
        for (const side of [-1, 1]) {
          const nx = f.rows[6 * k0 + 2] * side,
            ny = f.rows[6 * k0 + 3] * side;
          const dx = f.rows[6 * k0 + 4],
            dy = f.rows[6 * k0 + 5];
          const rootW = halfWidth(0.27) * L * 0.85;
          const ax = f.rows[6 * k0] + nx * rootW,
            ay = f.rows[6 * k0 + 1] + ny * rootW;
          const flap = 0.6 + 0.4 * Math.sin(f.finPhase + (side > 0 ? 0 : 1.7));
          const out = (0.1 + 0.05 * flap) * L * (1 - 0.75 * f.fold);
          const back = (0.17 - 0.06 * f.fold) * L;
          const tx = ax + nx * out + dx * back,
            ty = ay + ny * out + dy * back;
          put(ax - dx * 0.03 * L, ay - dy * 0.03 * L, 0, 0, id, L, fear, 1);
          put(ax + dx * 0.035 * L, ay + dy * 0.035 * L, 0, 1, id, L, fear, 1);
          put(tx - dx * 0.025 * L, ty - dy * 0.025 * L, 1, 0, id, L, fear, 1);
          put(tx + dx * 0.04 * L, ty + dy * 0.04 * L, 1, 1, id, L, fear, 1);
        }
      }
      return o / FLOATS;
    },

    /** Swimming disturbs the water: a dipole at the nose, and a small drop with every tail beat. */
    emitRipples(sink: RippleSink) {
      for (const f of fish) {
        const L = f.L;
        const k = rowAt(0.12);
        const hx = f.rows[6 * k],
          hy = f.rows[6 * k + 1];
        const dx = -f.rows[6 * k + 4],
          dy = -f.rows[6 * k + 5]; // toward the nose
        const push = Math.tanh(f.speed / (L * 1.4));
        if (push > 0.06) {
          sink.drop(hx + dx * L * 0.09, hy + dy * L * 0.09, 0.1 * L, 0.5 * push * push);
          sink.drop(hx - dx * L * 0.13, hy - dy * L * 0.13, 0.1 * L, -0.5 * push * push);
        }
        if (f.flicked) {
          f.flicked = false;
          f.flickSide = -f.flickSide;
          const t = rowAt(1.3);
          const off = f.flickSide * L * 0.05;
          sink.drop(f.rows[6 * t] - f.rows[6 * t + 3] * off, f.rows[6 * t + 1] + f.rows[6 * t + 2] * off, 0.07 * L, 0.18 * push);
        }
      }
    },

    /** The fish under a point, if any. */
    hitTest(x: number, y: number): Fish | null {
      for (let i = fish.length - 1; i >= 0; i--) {
        const f = fish[i];
        for (let k = rowAt(0); k < rowAt(1); k++) {
          const reach = halfWidth(rowT(k)) * f.L + 10;
          const ax = f.rows[6 * k],
            ay = f.rows[6 * k + 1];
          const sx = f.rows[6 * (k + 1)] - ax,
            sy = f.rows[6 * (k + 1) + 1] - ay;
          const u = clamp(((x - ax) * sx + (y - ay) * sy) / (sx * sx + sy * sy || 1), 0, 1);
          if (Math.hypot(x - (ax + sx * u), y - (ay + sy * u)) < reach) return f;
        }
      }
      return null;
    },

    /** Tapping a fish: it bolts, and its neighbours get nervous. Returns where to put the splash. */
    scare(f: Fish, x: number, y: number): [number, number] {
      frighten(f, x, y, 1);
      f.speed = Math.max(f.speed, 1.2 * f.L);
      for (const o of fish) {
        if (o === f) continue;
        const d = Math.hypot(o.x - x, o.y - y);
        if (d < 1.8 * f.L) frighten(o, x, y, 0.6 * (1 - d / (1.8 * f.L)));
      }
      const k = rowAt(1.3);
      return [f.rows[6 * k], f.rows[6 * k + 1]];
    },

    /** Disturb everything within `radius` of a point. */
    disturb(x: number, y: number, radius: number, amount: number) {
      for (const f of fish) {
        const d = Math.hypot(f.x - x, f.y - y);
        if (d < radius) frighten(f, x, y, amount * (1 - d / radius));
      }
    },

    startle(amount: number) {
      for (const f of fish) {
        f.fleeAngle = f.heading + (Math.random() - 0.5) * 1.2;
        f.fear = Math.max(f.fear, amount);
      }
    },

    resize(w: number, h: number) {
      const sx = w / (W || w),
        sy = h / (H || h);
      W = w;
      H = h;
      for (const f of fish) {
        f.x *= sx;
        f.y *= sy;
        f.goalX *= sx;
        f.goalY *= sy;
        for (let i = 0; i < SPINE; i++) {
          f.spine[2 * i] *= sx;
          f.spine[2 * i + 1] *= sy;
        }
        for (let i = 0; i < TRAIL; i++) {
          f.trail[2 * i] *= sx;
          f.trail[2 * i + 1] *= sy;
        }
        const scale = (unit() * f.size) / f.L;
        f.L *= scale;
        f.cruise *= scale;
        f.speed *= scale;
        layBody(f);
        layRows(f);
      }
    },

    /** Positions only, for drawing a still frame. */
    get fish() {
      return fish;
    },
  };
}

export type School = ReturnType<typeof createSchool>;
