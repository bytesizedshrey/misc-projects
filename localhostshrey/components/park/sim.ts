// The park's life. Everything here is an agent with a small state machine:
// walkers, joggers and dog-walkers follow the paths and sometimes claim a
// bench; ducks chase crumbs; a rowboat drifts and rows; pigeons peck and
// scatter; a man on the pond bench smokes and mutters. Nothing is scripted
// on a timeline; it all keeps going, and pointer taps nudge it.

import { type Pt, mkPt, project } from "./camera";
import { figureAnchors, makeLook, type Look, type Pose } from "./figure";
import { pathAt, pathDistance, pondField, pondPoint, type Layout } from "./layout";
import { type DuckKind, type FlockBird, type Sailboat, oarCycle } from "./props";
import { TAU, angleDiff, clamp01, easeInOut, rand, seeded, vnoise } from "./util";

/** Sound hooks; `pan` is 0..1 across the scene. All optional. */
export interface Sfx {
  plop(pan: number, gain?: number): void;
  rustle(pan: number, gain?: number): void;
  flick(pan: number): void;
  cough(pan: number, gain?: number): void;
  nibble(pan: number): void;
  pellets(pan: number): void;
  oar(pan: number): void;
  wind(level: number): void;
}

export const quietSfx: Sfx = {
  plop() {}, rustle() {}, flick() {}, cough() {}, nibble() {}, pellets() {}, oar() {}, wind() {},
};

// ---------------------------------------------------------------- types ----

export interface Dog { x: number; y: number; heading: number; ph: number; color: string; sniff: number }

export enum Kind { Walker, Jogger, DogWalker, Stroller, Parent, Kid }
export enum Act { Walk, ToBench, Sit, Leave }

export interface Person {
  kind: Kind;
  look: Look;
  pose: Pose;
  path: number;
  s: number;
  dir: number;
  lane: number;
  speed: number;
  act: Act;
  t: number;
  bench: number;
  sat: boolean;
  reads: number;
  dog: Dog | null;
  leader: Person | null;
  lookT: number;
  lookTo: number;
  alive: boolean;
}

export interface Duck {
  x: number; y: number; heading: number; speed: number; tx: number; ty: number;
  state: number; t: number; kind: DuckKind; bob: number; dip: number; wakeT: number;
  target: Crumb | null;
}

export interface Crumb { x: number; y: number; z: number; vx: number; vy: number; vz: number; water: boolean; alive: boolean; age: number }
export interface Ripple { x: number; y: number; r: number; a: number; life: number; age: number; alive: boolean }
export interface Spark { x: number; y: number; vx: number; vy: number; age: number; life: number; s: number; rgb: string; alive: boolean }
export interface Smoke { x: number; y: number; vx: number; vy: number; age: number; life: number; r0: number; r1: number; a: number; blue: boolean; seed: number; alive: boolean }
export interface Bubble { x: number; y: number; vx: number; vy: number; z: number; vz: number; r: number; age: number; life: number; ph: number; alive: boolean }
export interface Leaf { x: number; y: number; z: number; rot: number; spin: number; ph: number; col: number; t: number; state: number }

export interface Pigeon {
  x: number; y: number; z: number; heading: number; mode: number; t: number; tx: number; ty: number;
  gait: number; pecks: number; peckT: number; tone: number;
  sx: number; sy: number; cx: number; cy: number; ex: number; ey: number; f: number; dur: number; peak: number; delay: number;
}

export interface Flock {
  birds: (FlockBird & { u: number; v: number; wu: number; wv: number; wph: number; wrate: number; alt: number; yaw: number })[];
  t: number; x: number; y: number; dir: number; turn: number; speed: number; time: number;
}

export interface Sitter { pose: Pose; look: Look; home: [number, number]; lookT: number; to: number }

export interface Smoker {
  x: number; y: number; face: number; s: number; t: number; dur: number; raise: number; length: number;
  drags: number; glow: number; lit: boolean; look: number; lookTo: number; lookT: number; cough: number;
  talkT: number; line: number; emitT: number; flame: number;
  hand: Pt; ember: Pt; mouth: Pt; pose: Pose;
}

export interface Boat {
  x: number; y: number; heading: number; speed: number; tx: number; ty: number; stroke: number;
  rowing: boolean; t: number;
  rower: Pose; rowerLook: Look; guest: Pose; guestLook: Look;
}

export interface Say { text: string; x: number; y: number; t: number; life: number }

export interface World {
  L: Layout;
  dpr: number;
  sfx: Sfx;
  time: number;
  wind: number;
  windX: number;
  windY: number;
  camX: number;
  camY: number;
  people: Person[];
  spawnT: number;
  ducks: Duck[];
  smoker: Smoker;
  crumbs: Crumb[];
  ripples: Ripple[];
  rippleNext: number;
  sparks: Spark[];
  sparkNext: number;
  smoke: Smoke[];
  smokeNext: number;
  bubbles: Bubble[];
  leaves: Leaf[];
  leafT: number;
  lawn: {
    sitters: Sitter[];
    players: [Player, Player];
    kid: Kid;
    disc: Disc;
  };
  boat: Boat;
  pigeons: Pigeon[];
  flock: Flock;
  cart: { x: number; y: number; vendor: Pose; look: Look };
  fetch: Fetch;
  sails: Sailboat[];
  say: Say;
}

interface Player extends Sitter {}
interface Kid extends Sitter { blowT: number; blowing: number; chase: number; tx: number; ty: number }
interface Disc { from: number; t: number; dur: number; x0: number; y0: number; x1: number; y1: number; bend: number; flying: boolean; wait: number; x: number; y: number; z: number }
interface Fetch {
  owner: Pose; look: Look; dx: number; dy: number; dh: number; ph: number; state: number; t: number;
  bx: number; by: number; bz: number; vx: number; vy: number; vz: number;
}

const TIME_SCALE = 0.55;
const POOL = { ripples: 80, sparks: 140, smoke: 320, bubbles: 40, leaves: 36 };

const SAYINGS = [
  "five more minutes of this",
  "the pond looks lazy today",
  "that duck has somewhere to be",
  "should have brought a jacket",
  "nice out, isn't it",
  "is that a turtle or a rock?",
  "i should call my mother",
  "this is my last one. probably",
  "go ahead, take the seat",
  "i'll walk the long way home",
  "haven't eaten since morning",
  "listen to the leaves",
];
const REPLIES = [
  "you need something?",
  "oh, hello",
  "give me a minute",
  "there's room, sit down",
  "back already?",
  "nice day for it",
];

// ------------------------------------------------------------- helpers ----

export const smokerLook: Look = {
  coat: "#e9e2d2", legs: "#2e3a52", shoes: "#3a2c24", hair: "#3a2e26", skin: "#d8ac88",
  hairStyle: 0, hat: 0, hatColor: "#000000", scarf: null, longCoat: false, bag: null, scale: 1,
};

function newPose(x = 0, y = 0, heading = 0, sitting = false): Pose {
  return { x, y, heading, ph: Math.random() * 6, stride: 0, sitting, look: 0, handR: null, handL: null };
}

/** True if (x, y) is dry land comfortably inside the scene. */
function dry(L: Layout, x: number, y: number) {
  return x > L.m && y > L.m && x < L.w - L.m && y < L.h - L.m && pondField(L.pond, x, y) < -0.06;
}

function dryNear(L: Layout, x: number, y: number, r: number) {
  for (let i = 0; i < 16; i++) {
    const a = rand(0, TAU);
    const d = Math.sqrt(Math.random()) * r;
    const px = x + Math.cos(a) * d;
    const py = y + Math.sin(a) * d;
    if (dry(L, px, py)) return { x: px, y: py };
  }
  return { x: L.plaza.x + rand(-1, 1) * L.m, y: L.plaza.y + rand(-1, 1) * L.m };
}

function waterSpot(L: Layout, rnd: () => number = Math.random) {
  for (let i = 0; i < 40; i++) {
    const x = L.pond.cx + (2 * rnd() - 1) * L.pond.rx * 0.75;
    const y = L.pond.cy + (2 * rnd() - 1) * L.pond.ry * 0.75;
    if (pondField(L.pond, x, y) > 0.4 && y > 0.12 * L.h && x < 0.9 * L.w) return { x, y };
  }
  return { x: L.pond.cx - 0.2 * L.pond.rx, y: L.pond.cy + 0.2 * L.pond.ry };
}

/** Land on a small margin from the water, for the fetching dog. */
function solidGround(L: Layout, x: number, y: number) {
  const r = 0.6 * L.m;
  if (pondField(L.pond, x, y) >= 0) return false;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    if (pondField(L.pond, x + Math.cos(a) * r, y + Math.sin(a) * r) >= 0) return false;
  }
  return true;
}

// ------------------------------------------------------------- pools -------

export function addRipple(w: World, x: number, y: number, r: number, a = 0.5, life = 2.2) {
  let slot = w.rippleNext;
  for (let i = 0; i < POOL.ripples; i++) {
    const k = (w.rippleNext + i) % POOL.ripples;
    if (!w.ripples[k].alive) {
      slot = k;
      break;
    }
  }
  Object.assign(w.ripples[slot], { x, y, r, a, life, age: 0, alive: true });
  w.rippleNext = (slot + 1) % POOL.ripples;
}

export function addSpark(w: World, x: number, y: number, size: number, n = 1, speed = 0, rgb = "255,252,236", scale = 1) {
  for (let i = 0; i < n; i++) {
    const s = w.sparks[w.sparkNext];
    w.sparkNext = (w.sparkNext + 1) % POOL.sparks;
    const a = rand(0, TAU);
    const v = speed * rand(0.4, 1);
    Object.assign(s, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: rand(0.5, 1.1), s: size * rand(0.03, 0.07) * scale, rgb, alive: true });
  }
}

function addSmoke(w: World, x: number, y: number, vx: number, vy: number, m: number, exhale: boolean) {
  const p = w.smoke[w.smokeNext];
  w.smokeNext = (w.smokeNext + 1) % POOL.smoke;
  p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.age = 0; p.alive = true;
  p.blue = !exhale;
  p.seed = Math.random() * 100;
  if (exhale) {
    p.life = 3.5 + 2.5 * Math.random(); p.r0 = 0.1 * m; p.r1 = m * (0.9 + 0.7 * Math.random()); p.a = 0.36;
  } else {
    p.life = 3.4 + 1.8 * Math.random(); p.r0 = 0.04 * m; p.r1 = m * (0.32 + 0.3 * Math.random()); p.a = 0.32;
  }
}

function say(w: World, text: string, x: number, y: number, life = 4.2) {
  w.say.text = text; w.say.x = x; w.say.y = y; w.say.t = 0; w.say.life = life;
}

// --------------------------------------------------------------- people ----

function lanePoint(p: Person, L: Layout) {
  const q = { x: 0, y: 0, tx: 0, ty: 0 };
  pathAt(L.paths[p.path], p.s, q);
  const off = p.lane * L.m;
  return { x: q.x - q.ty * p.dir * off, y: q.y + q.tx * p.dir * off, hx: q.tx * p.dir, hy: q.ty * p.dir };
}

function makePerson(L: Layout, kind: Kind, path: number, s: number, dir: number, lane: number): Person {
  const r = Math.random;
  const p: Person = {
    kind,
    look: makeLook(r, kind === Kind.Kid ? 0.62 : rand(0.92, 1.06)),
    pose: newPose(),
    path, s, dir, lane,
    speed: kind === Kind.Jogger ? rand(2.6, 3.2) : kind === Kind.Stroller ? rand(0.9, 1.1) : rand(1.05, 1.4),
    act: Act.Walk, t: 0, bench: -1,
    sat: kind !== Kind.Walker || r() > 0.45,
    reads: (4 * r()) | 0,
    dog: null, leader: null, lookT: rand(1, 5), lookTo: 0, alive: true,
  };
  if (kind === Kind.Jogger) {
    p.look.hat = r() > 0.5 ? 2 : 0;
    p.look.bag = null; p.look.scarf = null; p.look.longCoat = false; p.look.shoes = "#f2f0ea";
  }
  if (kind === Kind.Kid) { p.look.longCoat = false; p.look.bag = null; }
  const at = lanePoint(p, L);
  p.pose.x = at.x; p.pose.y = at.y;
  p.pose.heading = Math.atan2(at.hy, at.hx);
  if (kind === Kind.DogWalker) {
    p.dog = {
      x: at.x + at.hx * L.m, y: at.y + at.hy * L.m, heading: p.pose.heading, ph: 0,
      color: ["#c8a070", "#2e2a26", "#e8dcc8", "#8a5a34", "#a8a49c"][(r() * 5) | 0], sniff: 0,
    };
  }
  return p;
}

function spawnPerson(w: World, anywhere: boolean) {
  const L = w.L;
  const roll = Math.random();
  const path = Math.random() < 0.5 ? 0 : 1;
  const dir = Math.random() < 0.5 ? 1 : -1;
  const pth = L.paths[path];
  const s = anywhere ? rand(0.1, 0.9) * pth.total : dir > 0 ? 1 : pth.total - 1;
  const kind = roll < 0.42 ? Kind.Walker : roll < 0.57 ? Kind.Jogger : roll < 0.74 ? Kind.DogWalker : roll < 0.86 ? Kind.Stroller : Kind.Parent;
  const lane = rand(0.35, 0.95);
  const p = makePerson(L, kind, path, s, dir, lane);
  w.people.push(p);
  if (kind === Kind.Parent) {
    const kid = makePerson(L, Kind.Kid, path, s, dir, lane + 0.55);
    kid.leader = p;
    kid.speed = p.speed;
    w.people.push(kid);
  }
}

function updatePeople(w: World, dt: number) {
  const L = w.L;
  const m = L.m;
  for (const p of w.people) {
    if (!p.alive) continue;
    const pose = p.pose;
    p.lookT -= dt;
    if (p.lookT <= 0) {
      p.lookT = rand(1.5, 6);
      p.lookTo = Math.random() < 0.5 ? 0 : rand(-0.9, 0.9);
    }
    pose.look += (p.lookTo - pose.look) * Math.min(1, 3 * dt);

    let tx = pose.x;
    let ty = pose.y;
    let speed = p.speed;

    if (p.leader) {
      const lead = p.leader;
      if (!lead.alive) { p.alive = false; continue; }
      p.s = lead.s; p.path = lead.path; p.dir = lead.dir;
      const at = lanePoint(p, L);
      tx = at.x; ty = at.y; speed = lead.speed;
    } else if (p.act === Act.Walk) {
      const prev = p.s;
      p.s += p.speed * m * p.dir * dt;
      const pth = L.paths[p.path];
      // Crossing the junction: sometimes turn onto the other path.
      if ((prev - pth.junction) * (p.s - pth.junction) <= 0 && Math.random() < 0.5) {
        p.path = 1 - p.path;
        p.s = L.paths[p.path].junction + 0.5 * p.dir;
        p.dir = Math.random() < 0.5 ? 1 : -1;
      }
      const cur = L.paths[p.path];
      if (p.s < -m || p.s > cur.total + m) { p.alive = false; continue; }
      const at = lanePoint(p, L);
      tx = at.x; ty = at.y;
      if (!p.sat) {
        for (let i = 0; i < L.benches.length; i++) {
          const b = L.benches[i];
          if (b.occupied || Math.hypot(b.x - pose.x, b.y - pose.y) > 2.6 * m) continue;
          b.occupied = true; p.bench = i; p.act = Act.ToBench; p.sat = true;
          break;
        }
      }
    } else if (p.act === Act.ToBench) {
      const b = L.benches[p.bench];
      tx = b.x - Math.cos(b.face) * m * 0.08;
      ty = b.y - Math.sin(b.face) * m * 0.08;
      speed *= 0.8;
      if (Math.hypot(tx - pose.x, ty - pose.y) < 0.12 * m) {
        p.act = Act.Sit; p.t = rand(14, 45); pose.sitting = true;
      }
    } else if (p.act === Act.Sit) {
      const b = L.benches[p.bench];
      pose.heading += angleDiff(pose.heading, b.face) * Math.min(1, 4 * dt);
      pose.stride += (0 - pose.stride) * Math.min(1, 6 * dt);
      p.t -= dt;
      if (p.t <= 0) { p.act = Act.Leave; pose.sitting = false; b.occupied = false; }
      continue;
    } else {
      const at = lanePoint(p, L);
      tx = at.x; ty = at.y;
      if (Math.hypot(tx - pose.x, ty - pose.y) < 0.3 * m) p.act = Act.Walk;
    }

    const dx = tx - pose.x;
    const dy = ty - pose.y;
    const d = Math.hypot(dx, dy);
    const step = Math.min(d, speed * m * dt * (p.leader ? 1.4 : 1.1));
    if (d > 0.01) {
      pose.x += (dx / d) * step;
      pose.y += (dy / d) * step;
      pose.heading += angleDiff(pose.heading, Math.atan2(dy, dx)) * Math.min(1, 6 * dt);
    }
    const v = step / Math.max(dt, 0.001) / m;
    const freq = p.kind === Kind.Jogger ? 2.6 : p.kind === Kind.Kid ? 2.1 : 1.7;
    pose.ph += dt * TAU * freq * Math.min(1, v / Math.max(speed, 0.3));
    pose.stride += ((v > 0.2 ? 1 : 0) - pose.stride) * Math.min(1, 5 * dt);

    if (p.dog) {
      const dog = p.dog;
      dog.sniff -= dt;
      if (dog.sniff < -rand(3, 9)) dog.sniff = rand(1, 2.5);
      const c = Math.cos(pose.heading);
      const s = Math.sin(pose.heading);
      const weave = Math.sin(0.13 * pose.ph) * m * 0.7;
      const ahead = dog.sniff > 0 ? -0.2 : 1.3;
      const gx = pose.x + c * m * ahead - s * weave;
      const gy = pose.y + s * m * ahead + c * weave;
      const ex = gx - dog.x;
      const ey = gy - dog.y;
      const ed = Math.hypot(ex, ey);
      if (dog.sniff > 0 && ed > 2.4 * m) dog.sniff = -0.01;
      if (dog.sniff <= 0 && ed > 1) {
        const k = Math.min(1, 3 * dt);
        dog.x += ex * k; dog.y += ey * k;
        dog.heading += angleDiff(dog.heading, Math.atan2(ey, ex)) * Math.min(1, 5 * dt);
      }
      dog.ph += dt * (dog.sniff > 0 ? 3 : 9);
    }
  }
  for (let i = w.people.length - 1; i >= 0; i--) if (!w.people[i].alive) w.people.splice(i, 1);
}

// --------------------------------------------------------------- smoker ----

function setPhase(s: Smoker, state: number, dur: number) { s.s = state; s.t = 0; s.dur = dur; }

const HAND_REST = [0.26, 0.18, 0.56];
const HAND_UP = [0.06, 0.06, 1.1];

function updateSmoker(w: World, dt: number) {
  const s = w.smoker;
  const L = w.L;
  const m = L.m;
  s.t += dt;
  const f = Math.min(1, s.t / s.dur);
  switch (s.s) {
    case 0: s.raise += (0 - s.raise) * Math.min(1, 4 * dt); if (f >= 1) setPhase(s, 1, rand(0.8, 1.1)); break;
    case 1: s.raise = easeInOut(f); if (f >= 1) setPhase(s, 2, rand(1.2, 2.1)); break;
    case 2: s.length -= 0.045 * dt; if (f >= 1) { s.drags++; setPhase(s, 3, rand(0.7, 1)); } break;
    case 3: s.raise = 1 - easeInOut(f); if (f >= 1) setPhase(s, 4, rand(1.6, 2.4)); break;
    case 4:
      if (f >= 1) {
        if (Math.random() < 0.12) { s.cough = 0.6; w.sfx.cough(s.x / L.w, 0.45); }
        if (s.length < 0.28) setPhase(s, 5, 1.6); else setPhase(s, 0, rand(3.5, 8));
      }
      break;
    case 5:
      if (f > 0.5 && s.lit) { s.lit = false; w.sfx.flick(L.bin.x / L.w); }
      if (f >= 1) setPhase(s, 6, rand(6, 13));
      break;
    case 6: if (f >= 1) setPhase(s, 7, 2.2); break;
    case 7:
      s.raise = Math.min(1, s.t / 0.6);
      if (s.t > 0.9 && s.t - dt <= 0.9) w.sfx.flick(s.x / L.w);
      if (s.t > 1.25 && s.t - dt <= 1.25) { w.sfx.flick(s.x / L.w); s.flame = 0.8; }
      if (s.t > 1.4 && !s.lit) { s.lit = true; s.length = 0.95; s.drags = 0; }
      if (f >= 1) setPhase(s, 2, 1.6);
      break;
  }
  s.flame = Math.max(0, s.flame - dt);
  s.cough = Math.max(0, s.cough - dt);
  const glowTo = s.lit ? (s.s === 2 ? 1 : 0.28 + 0.04 * Math.sin(2.3 * s.t)) : 0;
  s.glow += (glowTo - s.glow) * Math.min(1, dt * (glowTo > s.glow ? 3 : 1.5));

  // Looks at whoever walks close; otherwise glances around.
  let near: number | null = null;
  for (const p of w.people) {
    if (Math.hypot(p.pose.x - s.x, p.pose.y - s.y) < 4.5 * m) { near = Math.atan2(p.pose.y - s.y, p.pose.x - s.x); break; }
  }
  s.lookT -= dt;
  if (near !== null && s.s !== 2) s.lookTo = Math.max(-1.1, Math.min(1.1, angleDiff(s.face, near)));
  else if (s.lookT <= 0) { s.lookT = rand(2, 6); s.lookTo = Math.random() < 0.5 ? 0 : rand(-0.9, 0.9); }
  if (s.s === 2 || s.s === 7) s.lookTo = 0;
  s.look += (s.lookTo - s.look) * Math.min(1, 2.5 * dt);

  // pose
  const p = s.pose;
  p.x = s.x + (s.cough > 0 ? Math.sin(60 * w.time) * m * 0.025 * s.cough : 0);
  p.y = s.y + Math.sin(1.1 * w.time) * m * 0.006;
  p.heading = s.face;
  p.look = s.look;
  p.sitting = true;
  p.seat = 0.46;
  const hr = (p.handR ||= [0, 0, 0]);
  if (s.s === 5) {
    const k = Math.sin(Math.min(1, s.t / s.dur) * Math.PI);
    hr[0] = 0.26 - 0.3 * k; hr[1] = 0.18 + 0.75 * k; hr[2] = 0.56 - 0.2 * k;
  } else {
    hr[0] = HAND_REST[0] + (HAND_UP[0] - HAND_REST[0]) * s.raise;
    hr[1] = HAND_REST[1] + (HAND_UP[1] - HAND_REST[1]) * s.raise;
    hr[2] = HAND_REST[2] + (HAND_UP[2] - HAND_REST[2]) * s.raise;
  }
  p.handL = s.s === 7 ? [0.08, -0.05, 1.08] : null;

  const hand = mkPt();
  const head = mkPt();
  figureAnchors(p, smokerLook, m, hand, head);
  s.hand.x = hand.x; s.hand.y = hand.y; s.hand.k = hand.k;
  const fa = p.heading + p.look;
  const hd = 0.1 * m * head.k;
  s.mouth.x = head.x + Math.cos(fa) * hd; s.mouth.y = head.y + Math.sin(fa) * hd; s.mouth.k = head.k;
  const ea = s.face + 0.6 * (1 - s.raise);
  const el = (0.05 + 0.07 * Math.max(0, s.length)) * m * hand.k;
  s.ember.x = hand.x + Math.cos(ea) * el; s.ember.y = hand.y + Math.sin(ea) * el;

  if (s.lit) {
    if (Math.random() < dt * (s.s === 2 ? 1.2 : s.s === 0 ? 0.15 : 0)) {
      addSpark(w, s.ember.x, s.ember.y, m, s.s === 0 ? 3 : 1, 0.4 * m, "255,176,96", 0.7);
    }
    s.emitT -= dt;
    while (s.emitT <= 0) {
      s.emitT += 0.035;
      addSmoke(w, s.ember.x, s.ember.y, w.windX * m * 0.2, w.windY * m * 0.2, m, false);
    }
  }
  if (s.s === 4 && f < 0.75) {
    const a = s.face + s.look + 0.25;
    const v = m * (1.4 - 1.4 * f);
    if (Math.random() < 0.85) addSmoke(w, s.mouth.x, s.mouth.y, Math.cos(a) * v + (Math.random() - 0.5) * m * 0.3, Math.sin(a) * v + (Math.random() - 0.5) * m * 0.3, m, true);
  }
  s.talkT -= dt;
  if (s.talkT <= 0 && s.s === 0) {
    s.line = (s.line + 1 + ((3 * Math.random()) | 0)) % SAYINGS.length;
    if (!(w.say.t < w.say.life && w.say.life > 0)) {
      say(w, SAYINGS[s.line], s.mouth.x, s.mouth.y - 12);
      s.talkT = rand(14, 22);
    }
  }
}

// ---------------------------------------------------------------- ducks ----

function updateDucks(w: World, dt: number) {
  const L = w.L;
  const m = L.m;
  const boat = w.boat;
  for (const d of w.ducks) {
    d.t -= dt;
    d.bob += dt;
    if (!d.target || !d.target.alive) {
      d.target = null;
      let best = 1.2 * L.pond.rx;
      for (const c of w.crumbs) {
        if (!c.alive || !c.water || c.z > 0) continue;
        const claimed = w.ducks.some((o) => o !== d && o.target === c);
        const dist = Math.hypot(c.x - d.x, c.y - d.y) * (claimed ? 2.5 : 1);
        if (dist < best) { best = dist; d.target = c; }
      }
      if (d.target && d.state === 2) d.state = 0;
    }
    let want = 0;
    if (d.target) {
      d.tx = d.target.x; d.ty = d.target.y;
      const hx = d.x + Math.cos(d.heading) * m * 0.55;
      const hy = d.y + Math.sin(d.heading) * m * 0.55;
      const bill = Math.hypot(d.tx - hx, d.ty - hy);
      const body = Math.hypot(d.tx - d.x, d.ty - d.y);
      want = Math.min(0.75, 0.12 + (body / m) * 0.35);
      if (bill < 0.3 * m || body < 0.45 * m) {
        d.target.alive = false; d.target = null;
        addRipple(w, hx, hy, 0.5 * m, 0.4, 1.2);
        w.sfx.nibble(d.x / L.w);
        d.state = 1; d.t = rand(0.6, 1.5);
      }
    } else if (d.state === 0) {
      want = 0.32;
      if (Math.hypot(d.tx - d.x, d.ty - d.y) < 0.6 * m || d.t <= 0) { d.state = 1; d.t = rand(2, 7); }
    } else if (d.state === 1) {
      if (d.t <= 0) {
        if (Math.random() < 0.25) { d.state = 2; d.t = rand(2, 4); addRipple(w, d.x, d.y, 0.8 * m, 0.45, 1.6); }
        else { d.state = 0; d.t = rand(6, 14); const s = waterSpot(L); d.tx = s.x; d.ty = s.y; }
      }
    } else if (d.t <= 0) { d.state = 1; d.t = rand(1, 3); addRipple(w, d.x, d.y, 0.6 * m, 0.35, 1.4); }

    d.dip += ((d.state === 2 ? 1 : 0) - d.dip) * (1 - Math.exp(-dt / 0.32));
    let goal = Math.atan2(d.ty - d.y, d.tx - d.x);
    for (const o of w.ducks) {
      if (o === d) continue;
      const ox = d.x - o.x;
      const oy = d.y - o.y;
      const od = Math.hypot(ox, oy);
      const keep = 1.1 * m;
      if (od < keep && od > 0) { const push = (1 - od / keep) * m * 0.5 * dt; d.x += (ox / od) * push; d.y += (oy / od) * push; }
    }
    const bx = d.x - boat.x;
    const by = d.y - boat.y;
    const bd = Math.hypot(bx, by);
    if (bd < 3.2 * m) {
      goal = Math.atan2(by, bx); want = Math.max(want, 0.5);
      d.x += (bx / bd) * m * 0.6 * dt; d.y += (by / bd) * m * 0.6 * dt;
    }
    if (pondField(L.pond, d.x + Math.cos(d.heading) * m, d.y + Math.sin(d.heading) * m) < 0.1) {
      goal = Math.atan2(L.pond.cy - d.y, L.pond.cx - d.x);
    }
    if (want > 0) {
      const turn = Math.max(-1.4, Math.min(1.4, 2 * angleDiff(d.heading, goal))) * dt;
      d.heading += turn * Math.min(1, 0.4 + d.speed);
    }
    d.speed += (want - d.speed) * Math.min(1, dt * (want > d.speed ? 1.2 : 0.8));
    d.x += Math.cos(d.heading) * d.speed * m * dt;
    d.y += Math.sin(d.heading) * d.speed * m * dt;
    d.wakeT -= dt;
    if (d.speed > 0.12 && d.wakeT <= 0) {
      d.wakeT = 0.45;
      const wx = d.x - Math.cos(d.heading) * m * 0.25;
      const wy = d.y - Math.sin(d.heading) * m * 0.25;
      addRipple(w, wx, wy, 0.55 * m, 0.2, 1.6);
      if (Math.random() < 0.5) addSpark(w, wx + rand(-0.3, 0.3) * m, wy + rand(-0.3, 0.3) * m, m, 1);
    }
  }
}

// ----------------------------------------------------- crumbs & bubbles ----

function updateCrumbs(w: World, dt: number) {
  const L = w.L;
  let wetPan = -1;
  let dryPan = -1;
  for (const c of w.crumbs) {
    if (!c.alive) continue;
    c.age += dt;
    if (c.z > 0) {
      c.vz -= 9.8 * dt;
      c.z += c.vz * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      if (c.z <= 0) {
        c.z = 0;
        c.water = pondField(L.pond, c.x, c.y) > 0;
        if (c.water) {
          addRipple(w, c.x, c.y, 0.4 * L.m, 0.4, 1.2);
          addSpark(w, c.x, c.y, L.m, 2, 0.5 * L.m);
          wetPan = c.x;
        } else dryPan = c.x;
      }
    } else if (c.water) c.x += Math.sin(c.age) * L.m * 0.02 * dt;
    if (c.age > 40) c.alive = false;
  }
  if (wetPan >= 0) w.sfx.pellets(wetPan / L.w);
  else if (dryPan >= 0) w.sfx.flick(dryPan / L.w);
  if (w.crumbs.length > 60 || (w.crumbs.length && !w.crumbs[0].alive)) {
    for (let i = w.crumbs.length - 1; i >= 0; i--) if (!w.crumbs[i].alive) w.crumbs.splice(i, 1);
  }
}

function popBubble(w: World, b: Bubble) {
  b.alive = false;
  addSpark(w, b.x, b.y, w.L.m, 9, 1.2 * w.L.m);
}

function updateBubbles(w: World, dt: number) {
  const m = w.L.m;
  for (const b of w.bubbles) {
    if (!b.alive) continue;
    b.age += dt;
    b.vx += (w.windX * m * 0.7 - b.vx) * dt * 0.5 + Math.sin(1.3 * w.time + b.ph) * m * 0.2 * dt;
    b.vy += (w.windY * m * 0.7 - b.vy) * dt * 0.5 + Math.cos(1.1 * w.time + b.ph) * m * 0.2 * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.z = Math.max(0.05, b.z + b.vz * dt);
    b.vz -= 0.02 * dt;
    if (b.age > b.life || b.z <= 0.05) popBubble(w, b);
  }
}

function updateLeaves(w: World, dt: number) {
  const L = w.L;
  const m = L.m;
  w.leafT -= dt * (0.4 + (w.wind - 0.45));
  if (w.leafT <= 0) {
    w.leafT = rand(1.2, 3.5);
    const free = w.leaves.find((l) => l.state === 0);
    const tree = L.trees[(Math.random() * L.trees.length) | 0];
    if (free) {
      const a = rand(0, TAU);
      const d = Math.sqrt(Math.random()) * tree.r * 0.9;
      Object.assign(free, { x: tree.x + Math.cos(a) * d, y: tree.y + Math.sin(a) * d, z: rand(3.5, 5.5), rot: rand(0, TAU), spin: rand(-3, 3), ph: rand(0, 6), col: (Math.random() * 5) | 0, t: 0, state: 1 });
    }
  }
  for (const l of w.leaves) {
    if (l.state === 0) continue;
    l.t += dt;
    l.ph += dt;
    if (l.state === 1) {
      l.z -= dt * (0.55 + 0.3 * Math.sin(2.4 * l.ph));
      l.x += (0.9 * w.windX + 0.5 * Math.cos(2.4 * l.ph)) * m * dt;
      l.y += (0.9 * w.windY + 0.3 * Math.sin(1.7 * l.ph)) * m * dt;
      l.rot += l.spin * dt;
      if (l.z <= 0) {
        l.z = 0; l.t = 0;
        if (pondField(L.pond, l.x, l.y) > 0) { l.state = 3; addRipple(w, l.x, l.y, 0.5 * m, 0.35, 1.4); }
        else l.state = 2;
      }
    } else if (l.state === 3) { l.x += w.windX * m * 0.08 * dt; l.y += w.windY * m * 0.08 * dt; }
    if (l.state >= 2 && l.t > 30) l.state = 0;
    if (l.x < -8 * m || l.x > L.w + 8 * m || l.y < -8 * m || l.y > L.h + 8 * m) l.state = 0;
  }
}

// -------------------------------------------------------------- pigeons ----

export function scatterPigeons(w: World, x: number, y: number, radius: number) {
  const L = w.L;
  const m = L.m;
  const hit = w.pigeons.filter((p) => p.mode !== 3 && Math.hypot(p.x - x, p.y - y) < radius);
  if (!hit.length) return;
  let cx = 0;
  let cy = 0;
  for (const p of hit) { cx += p.x; cy += p.y; }
  cx /= hit.length; cy /= hit.length;
  const away = Math.atan2(cy - y, cx - x) + rand(-0.6, 0.6);
  const far = m * rand(5, 9);
  let land = { x: cx + Math.cos(away) * far, y: cy + Math.sin(away) * far };
  if (!dry(L, land.x, land.y)) land = dryNear(L, L.plaza.x, L.plaza.y, 2.5 * L.plaza.r);
  const bend = rand(-1, 1) * far * 0.4;
  for (const p of hit) {
    const to = dryNear(L, land.x, land.y, 1.2 * m);
    const mx = (p.x + to.x) / 2;
    const my = (p.y + to.y) / 2;
    const dist = Math.hypot(to.x - p.x, to.y - p.y) || 1;
    Object.assign(p, {
      mode: 3, sx: p.x, sy: p.y, ex: to.x, ey: to.y,
      cx: mx - ((to.y - p.y) / dist) * bend, cy: my + ((to.x - p.x) / dist) * bend,
      f: 0, dur: Math.max(1.8, dist / (4.5 * m)), peak: rand(1.6, 2.6),
      delay: Math.hypot(p.x - x, p.y - y) / (6 * m) + rand(0, 0.25),
    });
  }
  w.sfx.rustle(x / L.w, Math.min(1, 0.4 + 0.08 * hit.length));
}

/** Wing-beat amount: 0 on the ground, flapping while airborne. */
export function pigeonFlap(p: Pigeon) {
  if (p.mode !== 3 || p.delay > 0) return 0;
  return p.f < 0.3 || p.f > 0.82 ? 0.35 + 0.65 * Math.abs(Math.sin(26 * p.gait)) : 0.92 + 0.05 * Math.sin(3 * p.gait);
}

function updatePigeons(w: World, dt: number, walkers: Pose[]) {
  const L = w.L;
  const m = L.m;
  let ax = 0;
  let ay = 0;
  let n = 0;
  for (const p of w.pigeons) if (p.mode !== 3) { ax += p.x; ay += p.y; n++; }
  if (n) { ax /= n; ay /= n; }
  for (const p of w.pigeons) {
    if (p.mode === 3) {
      if (p.delay > 0) { p.delay -= dt; continue; }
      p.f = Math.min(1, p.f + dt / p.dur);
      const e = p.f < 0.5 ? 2 * p.f * p.f * (1.4 - 0.8 * p.f) : 1 - 2 * (1 - p.f) ** 2 * (1.4 - 0.8 * (1 - p.f));
      const u = 1 - e;
      const nx = u * u * p.sx + 2 * u * e * p.cx + e * e * p.ex;
      const ny = u * u * p.sy + 2 * u * e * p.cy + e * e * p.ey;
      if (Math.hypot(nx - p.x, ny - p.y) > 0.01) p.heading = Math.atan2(ny - p.y, nx - p.x);
      p.x = nx; p.y = ny;
      p.z = p.peak * Math.pow(Math.sin(Math.PI * Math.min(1, 1.15 * p.f)), 0.7);
      p.gait += dt;
      if (p.f >= 1) { p.mode = 0; p.z = 0; p.t = rand(0.6, 1.4); }
      continue;
    }
    // frightened by anyone walking too close
    let near: Pose | null = null;
    let nd = Infinity;
    for (const q of walkers) {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < nd) { nd = d; near = q; }
    }
    if (near && nd < 0.55 * m) { scatterPigeons(w, near.x, near.y, 2 * m); continue; }
    if (near && nd < 1.6 * m && p.mode !== 1) {
      const a = Math.atan2(p.y - near.y, p.x - near.x) + rand(-0.5, 0.5);
      const tx = p.x + Math.cos(a) * m * 1.2;
      const ty = p.y + Math.sin(a) * m * 1.2;
      if (dry(L, tx, ty)) { p.tx = tx; p.ty = ty; p.mode = 1; p.t = 3; }
    }
    // crumbs on dry ground
    let crumb: Crumb | null = null;
    let cd = 7 * m;
    for (const c of w.crumbs) {
      if (!c.alive || c.water || c.z > 0) continue;
      const d = Math.hypot(c.x - p.x, c.y - p.y);
      if (d < cd) { cd = d; crumb = c; }
    }
    p.t -= dt;
    if (crumb) {
      const hx = p.x + Math.cos(p.heading) * m * 0.2;
      const hy = p.y + Math.sin(p.heading) * m * 0.2;
      if (Math.hypot(crumb.x - hx, crumb.y - hy) < 0.12 * m) { crumb.alive = false; p.mode = 2; p.pecks = 2; p.peckT = 0; }
      else if (p.mode !== 2) { p.mode = 1; p.tx = crumb.x; p.ty = crumb.y; p.t = 2; }
    } else if (p.mode === 0 && p.t <= 0) {
      if (Math.random() < 0.55) { p.mode = 2; p.pecks = 2 + ((4 * Math.random()) | 0); p.peckT = 0; }
      else {
        const to = dryNear(L, p.x + (ax - p.x) * 0.25, p.y + (ay - p.y) * 0.25, 1.4 * m);
        p.tx = to.x; p.ty = to.y; p.mode = 1; p.t = 6;
      }
    }
    if (p.mode === 2) {
      p.peckT += dt;
      if (p.peckT > 0.32) { p.peckT = 0; if (--p.pecks <= 0) { p.mode = 0; p.t = rand(1.5, 4); } }
    } else if (p.mode === 1) {
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.08 * m || p.t <= 0) { p.mode = 0; p.t = rand(1.2, 3.5); continue; }
      p.heading += angleDiff(p.heading, Math.atan2(dy, dx)) * Math.min(1, 5 * dt);
      const hurry = crumb || (near && nd < 1.6 * m) ? 0.75 : 0.32;
      p.gait += 2.6 * dt * (hurry / 0.32) * TAU;
      const step = Math.min(d, hurry * (0.35 + 1.3 * Math.max(0, Math.sin(p.gait)) ** 2) * m * dt);
      let sx = 0;
      let sy = 0;
      for (const o of w.pigeons) {
        if (o === p || o.mode === 3) continue;
        const ox = p.x - o.x;
        const oy = p.y - o.y;
        const od = Math.hypot(ox, oy);
        if (od > 0 && od < 0.3 * m) { sx += ox / od; sy += oy / od; }
      }
      p.x += Math.cos(p.heading) * step + sx * m * 0.2 * dt;
      p.y += Math.sin(p.heading) * step + sy * m * 0.2 * dt;
    }
  }
}

function updateFlock(w: World, dt: number) {
  const L = w.L;
  const f = w.flock;
  f.t -= dt;
  if (f.t <= 0 && !f.birds.length) {
    f.dir = rand(-0.55, 0.35);
    f.turn = rand(-0.04, 0.04);
    f.speed = rand(6, 8.5) * L.m;
    f.x = -0.35 * L.w;
    f.y = L.h * rand(0.15, 0.95);
    f.time = 0;
    f.birds = formation(4 + ((6 * Math.random()) | 0));
  }
  if (f.birds.length) {
    f.time += dt;
    f.dir += f.turn * dt;
    f.x += Math.cos(f.dir) * f.speed * dt;
    f.y += Math.sin(f.dir) * f.speed * dt;
    for (const b of f.birds) {
      b.glide += dt;
      b.ph += dt * b.rate * (Math.sin(0.45 * b.glide) > 0.55 ? 0.15 : 1);
    }
    if (f.x > 1.7 * L.w || f.y < -L.h || f.y > 2 * L.h) { f.birds.length = 0; f.t = rand(35, 70); }
  }
}

function formation(n: number) {
  const mk = (u: number, v: number) => ({
    u, v, wu: rand(0.3, 1.2), wv: rand(0.3, 1), wph: rand(0, TAU), wrate: rand(0.15, 0.4),
    alt: rand(11, 16), ph: rand(0, TAU), rate: rand(5.2, 6.8), glide: rand(0, 6), yaw: rand(-0.08, 0.08),
  });
  const list: Flock["birds"] = [];
  const roll = Math.random();
  if (roll < 0.5) {
    const la = rand(0.45, 0.7);
    const ra = rand(0.45, 0.7);
    const left = Math.ceil((n - 1) * rand(0.35, 0.65));
    list.push(mk(0, 0));
    for (let i = 1; i < n; i++) {
      const side = i <= left ? -1 : 1;
      const idx = side < 0 ? i : i - left;
      const d = rand(1.6, 2.6) * idx;
      const a = side < 0 ? la : ra;
      list.push(mk(-d * Math.cos(a), side * d * Math.sin(a)));
    }
  } else if (roll < 0.8) {
    const a = rand(0.35, 0.8) * (Math.random() < 0.5 ? -1 : 1);
    let d = 0;
    for (let i = 0; i < n; i++) { list.push(mk(-d * Math.cos(a), d * Math.sin(a))); d += rand(1.2, 3); }
  } else for (let i = 0; i < n; i++) list.push(mk(rand(-5, 1), rand(-3, 3)));
  if (Math.random() < 0.7) { const l = list[list.length - 1]; l.u -= rand(2, 5); l.v += rand(-1.5, 1.5); }
  return list;
}

/** World position and heading of one flock bird. */
export function flockBirdPose(f: Flock, b: Flock["birds"][number], m: number) {
  const u = b.u + Math.sin(f.time * b.wrate + b.wph) * b.wu;
  const v = b.v + Math.cos(f.time * b.wrate * 1.3 + b.wph) * b.wv;
  const c = Math.cos(f.dir);
  const s = Math.sin(f.dir);
  return { x: f.x + (u * c - v * s) * m, y: f.y + (u * s + v * c) * m, a: f.dir + b.yaw + 0.05 * Math.sin(0.7 * f.time + b.wph) };
}

// --------------------------------------------------------------- boat ------

function updateBoat(w: World, dt: number) {
  const L = w.L;
  const m = L.m;
  const b = w.boat;
  b.t -= dt;
  if (b.t <= 0) {
    b.rowing = !b.rowing;
    b.t = b.rowing ? rand(14, 26) : rand(8, 16);
    if (b.rowing) { const s = waterSpot(L); b.tx = s.x; b.ty = s.y; }
  }
  if (b.rowing) {
    const prev = b.stroke % 1;
    b.stroke += dt / 2.6;
    const cur = b.stroke % 1;
    if (cur < 0.45) b.speed += 0.55 * dt;
    if (prev > cur) w.sfx.oar(b.x / L.w);
    if (prev > cur || (prev < 0.45 && cur >= 0.45)) {
      const c = Math.cos(b.heading);
      const s = Math.sin(b.heading);
      const reach = 2.3 * m;
      for (const side of [-1, 1]) {
        const a = b.heading + (Math.PI / 2) * side + (prev > cur ? -0.55 : 0.55) * side;
        const x = b.x + Math.cos(a) * reach - c * m * 0.1;
        const y = b.y + Math.sin(a) * reach - s * m * 0.1;
        addRipple(w, x, y, 0.8 * m, 0.5, 1.8);
        if (prev > cur) addSpark(w, x, y, m, 4, 0.8 * m);
      }
    }
    const goal = Math.atan2(b.ty - b.y, b.tx - b.x);
    b.heading += angleDiff(b.heading, goal) * Math.min(1, 0.25 * dt);
    if (Math.hypot(b.tx - b.x, b.ty - b.y) < 3 * m) { const s = waterSpot(L); b.tx = s.x; b.ty = s.y; }
  }
  b.speed *= 1 - 0.35 * dt;
  b.x += (Math.cos(b.heading) * b.speed + 0.04 * w.windX) * m * dt;
  b.y += (Math.sin(b.heading) * b.speed + 0.04 * w.windY) * m * dt;
  if (pondField(L.pond, b.x + Math.cos(b.heading) * m * 3, b.y + Math.sin(b.heading) * m * 3) < 0.15) {
    b.heading += angleDiff(b.heading, Math.atan2(L.pond.cy - b.y, L.pond.cx - b.x)) * Math.min(1, 1.2 * dt);
  }
  const c = Math.cos(b.heading);
  const s = Math.sin(b.heading);
  b.rower.x = b.x + c * m * 0.15; b.rower.y = b.y + s * m * 0.15; b.rower.heading = b.heading + Math.PI;
  const cyc = b.rowing ? oarCycle(b.stroke) : { sweep: 0, up: 0.3 };
  const reachBack = -(0.32 * cyc.sweep);
  b.rower.handR = [0.3 + reachBack, 0.28, 0.62 + 0.1 * cyc.up];
  b.rower.handL = [0.3 + reachBack, -0.28, 0.62 + 0.1 * cyc.up];
  b.guest.x = b.x - c * m * 1.1; b.guest.y = b.y - s * m * 1.1; b.guest.heading = b.heading;
}

// ------------------------------------------------------- lawn & extras ----

function stepToward(s: Sitter, tx: number, ty: number, speed: number, m: number, dt: number) {
  const p = s.pose;
  const dx = tx - p.x;
  const dy = ty - p.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.08 * m) { p.stride += (0 - p.stride) * Math.min(1, 6 * dt); return true; }
  const step = Math.min(d, speed * m * dt);
  p.x += (dx / d) * step; p.y += (dy / d) * step;
  p.heading += angleDiff(p.heading, Math.atan2(dy, dx)) * Math.min(1, 8 * dt);
  p.ph += dt * TAU * (speed > 2 ? 2.4 : 1.8);
  p.stride += (1 - p.stride) * Math.min(1, 6 * dt);
  return false;
}

function updateLawn(w: World, dt: number) {
  const m = w.L.m;
  const lawn = w.lawn;
  for (const s of lawn.sitters) {
    s.lookT -= dt;
    if (s.lookT <= 0) { s.lookT = rand(1.5, 6); s.to = rand(-0.8, 0.8); }
    s.pose.look += (s.to - s.pose.look) * Math.min(1, 2 * dt);
  }
  const disc = lawn.disc;
  const [a, b] = lawn.players;
  const thrower = disc.from ? b : a;
  const catcher = disc.from ? a : b;
  if (disc.flying) {
    disc.t += dt;
    if (disc.t > 0.3) thrower.pose.handR = null;
    const arrived = stepToward(catcher, disc.x1, disc.y1, 3, m, dt);
    const k = Math.min(1, disc.t / disc.dur);
    const nx = -(disc.y1 - disc.y0);
    const ny = disc.x1 - disc.x0;
    const nl = Math.hypot(nx, ny) || 1;
    const curve = Math.sin(k * Math.PI) * disc.bend;
    disc.x = disc.x0 + (disc.x1 - disc.x0) * k + (nx / nl) * curve;
    disc.y = disc.y0 + (disc.y1 - disc.y0) * k + (ny / nl) * curve;
    disc.z = 1.05 + 0.9 * Math.sin(k * Math.PI);
    if (arrived) catcher.pose.heading += angleDiff(catcher.pose.heading, Math.atan2(disc.y - catcher.pose.y, disc.x - catcher.pose.x)) * Math.min(1, 6 * dt);
    if (k >= 1) {
      disc.flying = false; disc.from = 1 - disc.from; disc.wait = rand(1, 2.4);
      catcher.pose.handR = [0.3, 0.2, 1.1];
    }
  } else {
    disc.wait -= dt;
    for (const [me, other] of [[thrower, catcher], [catcher, thrower]] as const) {
      if (stepToward(me, me.home[0], me.home[1], 1.2, m, dt)) {
        me.pose.heading += angleDiff(me.pose.heading, Math.atan2(other.pose.y - me.pose.y, other.pose.x - me.pose.x)) * Math.min(1, 5 * dt);
      }
    }
    thrower.pose.handR = disc.wait < 0.35 ? [-0.25, 0.35, 1] : null;
    if (disc.wait <= 0) {
      const p = thrower.pose;
      disc.flying = true; disc.t = 0; disc.x0 = p.x; disc.y0 = p.y;
      disc.x1 = catcher.home[0] + rand(-1.6, 1.6) * m;
      disc.y1 = catcher.home[1] + rand(-1.2, 1.2) * m;
      disc.dur = Math.hypot(disc.x1 - disc.x0, disc.y1 - disc.y0) / (m * rand(7, 9));
      disc.bend = rand(-1, 1) * m * 1.2;
      p.handR = [0.35, 0.25, 1.05];
    }
  }

  const kid = lawn.kid;
  if (kid.chase > 0) { kid.chase -= dt; stepToward(kid, kid.tx, kid.ty, 2.2, m, dt); }
  else if (stepToward(kid, kid.home[0], kid.home[1], 1.5, m, dt)) {
    kid.pose.heading += angleDiff(kid.pose.heading, Math.atan2(w.windY, w.windX)) * Math.min(1, 2 * dt);
    kid.blowT -= dt;
    if (kid.blowT <= 0 && kid.blowing <= 0) { kid.blowing = 1.6; kid.blowT = rand(4, 8); }
    if (kid.blowing > 0) {
      kid.blowing -= dt;
      kid.pose.handR = [0.22, 0.05, 0.9];
      if (Math.random() < 5 * dt) {
        const p = kid.pose;
        const c = Math.cos(p.heading);
        const s = Math.sin(p.heading);
        const at = project(p.x + c * m * 0.3, p.y + s * m * 0.3, 0.9 * m, mkPt());
        const slot = w.bubbles.find((q) => !q.alive);
        if (slot) Object.assign(slot, { x: at.x, y: at.y, vx: (1.2 * c + 0.5 * w.windX) * m, vy: (1.2 * s + 0.5 * w.windY) * m, z: 1.1, vz: rand(-0.05, 0.25), r: m * rand(0.14, 0.3), age: 0, life: rand(5, 13), ph: rand(0, 6), alive: true });
      }
      if (kid.blowing <= 0) {
        kid.pose.handR = null;
        if (Math.random() < 0.35) {
          kid.chase = rand(2, 3.5);
          kid.tx = kid.home[0] + w.windX * m * 5 + rand(-1, 1) * m * 2;
          kid.ty = kid.home[1] + w.windY * m * 5 + rand(-1, 1) * m * 2;
        }
      }
    }
  } else kid.pose.handR = null;
}

function updateExtras(w: World, dt: number) {
  const L = w.L;
  const m = L.m;
  const f = w.fetch;
  const owner = f.owner;
  f.t -= dt;
  if (f.state === 0) {
    owner.handR = f.t < 0.4 ? [-0.3, 0.3, 1.3] : null;
    if (f.t <= 0) {
      const ang = rand(-0.9, 0.5);
      const sp = m * rand(6, 9);
      f.bx = owner.x; f.by = owner.y; f.bz = 1.6;
      f.vx = Math.cos(ang) * sp; f.vy = Math.sin(ang) * sp; f.vz = 4.5;
      owner.handR = [0.4, 0.25, 1.5];
      owner.heading = ang;
      f.state = 1;
    }
  } else if (f.state === 1 && f.bz <= 0 && Math.hypot(f.vx, f.vy) < 0.2 * m) f.state = 2;
  if (f.state >= 1 && f.state < 3) {
    f.vz -= 9.8 * dt;
    f.bz = Math.max(0, f.bz + f.vz * dt);
    if (f.bz === 0) {
      f.vz = Math.abs(f.vz) > 1 ? -(0.4 * f.vz) : 0;
      f.vx *= 1 - 2.5 * dt; f.vy *= 1 - 2.5 * dt;
    }
    const nx = f.bx + f.vx * dt;
    const ny = f.by + f.vy * dt;
    if (solidGround(L, nx, ny)) { f.bx = nx; f.by = ny; } else { f.vx = 0; f.vy = 0; }
  }
  const gx = f.state === 3 ? owner.x + Math.cos(owner.heading) * m * 0.6 : f.state >= 1 ? f.bx : owner.x + 0.8 * m;
  const gy = f.state === 3 ? owner.y + Math.sin(owner.heading) * m * 0.6 : f.state >= 1 ? f.by : owner.y;
  const dx = gx - f.dx;
  const dy = gy - f.dy;
  const d = Math.hypot(dx, dy);
  const run = f.state >= 1 ? 6 * m : 1.2 * m;
  if (d > 0.15 * m) {
    const step = Math.min(d, run * dt);
    const nx = f.dx + (dx / d) * step;
    const ny = f.dy + (dy / d) * step;
    if (solidGround(L, nx, ny)) { f.dx = nx; f.dy = ny; }
    f.dh += angleDiff(f.dh, Math.atan2(dy, dx)) * Math.min(1, 8 * dt);
    f.ph += dt * (f.state >= 1 ? 14 : 5);
  } else if (f.state === 2 && f.bz === 0) f.state = 3;
  else if (f.state === 3) { f.state = 0; f.t = rand(1.5, 3.5); }
  if (f.state === 3) {
    f.bx = f.dx + Math.cos(f.dh) * m * 0.4;
    f.by = f.dy + Math.sin(f.dh) * m * 0.4;
    f.bz = 0.45;
  }
  if (f.state === 0) owner.heading += angleDiff(owner.heading, Math.atan2(f.dy - owner.y, f.dx - owner.x)) * Math.min(1, 3 * dt);

  for (const s of w.sails) {
    s.ph += dt;
    const target = waterTarget(w, s);
    const goal = Math.atan2(target.y - s.y, target.x - s.x) + 0.4 * Math.sin(0.3 * s.ph);
    s.heading += angleDiff(s.heading, goal) * dt * 0.4;
    s.x += Math.cos(s.heading) * m * 0.35 * dt;
    s.y += Math.sin(s.heading) * m * 0.35 * dt;
    if (pondField(L.pond, s.x + Math.cos(s.heading) * m, s.y + Math.sin(s.heading) * m) < 0.12) s.heading += 2.6;
    const bx = s.x - w.boat.x;
    const by = s.y - w.boat.y;
    const bd = Math.hypot(bx, by);
    if (bd < 3 * m) {
      s.x += (bx / bd) * m * 0.8 * dt; s.y += (by / bd) * m * 0.8 * dt;
      s.heading += angleDiff(s.heading, Math.atan2(by, bx)) * dt;
    }
    if (Math.random() < 0.6 * dt) addRipple(w, s.x - Math.cos(s.heading) * m * 0.3, s.y - Math.sin(s.heading) * m * 0.3, 0.35 * m, 0.25, 1.2);
  }
}

const sailGoals = new WeakMap<Sailboat, { x: number; y: number }>();
function waterTarget(w: World, s: Sailboat) {
  let g = sailGoals.get(s);
  if (!g || Math.hypot(g.x - s.x, g.y - s.y) < 1.5 * w.L.m) {
    g = waterSpot(w.L);
    sailGoals.set(s, g);
  }
  return g;
}

// ------------------------------------------------------------- world ------

function mkPool<T>(n: number, make: () => T): T[] {
  return Array.from({ length: n }, make);
}

function makeSitter(x: number, y: number, heading: number, look: Look, sitting: boolean): Sitter {
  return { pose: { x, y, heading, ph: Math.random() * 6, stride: 0, sitting, seat: sitting ? 0.1 : undefined, look: 0, handR: null, handL: null }, look, home: [x, y], lookT: rand(1, 4), to: 0 };
}

export function createWorld(L: Layout, dpr: number, sfx: Sfx = quietSfx): World {
  const m = L.m;
  const rng = seeded(808);

  const sitters: Sitter[] = [];
  L.blankets.forEach((b, i) => {
    const count = i === 1 ? 3 : i === 0 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const a = b.ang + (k / count) * TAU + 0.6;
      const x = b.x + Math.cos(a) * 0.5 * m;
      const y = b.y + Math.sin(a) * 0.5 * m;
      sitters.push(makeSitter(x, y, a + Math.PI + rand(-0.5, 0.5), makeLook(rng), true));
    }
  });
  const [fx0, fy0, fx1, fy1] = L.frisbee;
  const players: [Player, Player] = [
    makeSitter(fx0, fy0, Math.atan2(fy1 - fy0, fx1 - fx0), makeLook(rng), false),
    makeSitter(fx1, fy1, Math.atan2(fy0 - fy1, fx0 - fx1), makeLook(rng), false),
  ];
  const b0 = L.blankets[0];
  const kidSitter = makeSitter(b0.x - 1.6 * m, b0.y - 0.4 * m, -0.3, makeLook(rng, 0.6), false);
  kidSitter.look.longCoat = false;
  kidSitter.look.bag = null;
  const kid: Kid = { ...kidSitter, blowT: 2, blowing: 0, chase: 0, tx: 0, ty: 0 };

  const sb = L.benches[L.smokerBench];
  const smoker: Smoker = {
    x: sb.x - Math.cos(sb.face) * m * 0.08, y: sb.y - Math.sin(sb.face) * m * 0.08, face: sb.face,
    s: 0, t: 0, dur: 3, raise: 0, length: 0.8, drags: 0, glow: 0.3, lit: true,
    look: 0, lookTo: 0, lookT: 2, cough: 0, talkT: rand(4, 9), line: (Math.random() * SAYINGS.length) | 0,
    emitT: 0, flame: 0, hand: mkPt(), ember: mkPt(), mouth: mkPt(),
    pose: newPose(sb.x, sb.y, sb.face, true),
  };

  // The ice-cream cart sits on the lawn beside the plaza.
  let cx = L.plaza.x;
  let cy = L.plaza.y + L.plaza.r + 2 * m;
  const sr = seeded(77);
  for (let t = 0.6; t < 6.9; t += 0.15) {
    const x = L.plaza.x + Math.cos(t) * (L.plaza.r + 3.6 * m);
    const y = L.plaza.y + Math.sin(t) * (L.plaza.r + 3.6 * m);
    if (pathDistance(L, x, y) > L.pathHW + 1.1 * m && pondField(L.pond, x, y) < -0.1) { cx = x; cy = y; break; }
  }
  const toward = Math.atan2(L.plaza.y - cy, L.plaza.x - cx);
  const vendor = newPose(cx + Math.cos(toward) * m * 0.9, cy + Math.sin(toward) * m * 0.9, toward);

  const ox = 0.14 * L.w;
  const oy = 0.8 * L.h;
  const w: World = {
    L, dpr, sfx, time: 0, wind: 0.5, windX: 0.5, windY: 0, camX: 0, camY: 0,
    people: [], spawnT: 2,
    ducks: Array.from({ length: 6 }, (_, i) => {
      const d: Duck = {
        x: 0, y: 0, heading: rand(0, 6.3), speed: 0, tx: 0, ty: 0, state: 1, t: rand(0, 4),
        kind: (i === 2 ? 1 : i === 4 ? 2 : 0) as DuckKind, bob: rand(0, 6), dip: 0, wakeT: 0, target: null,
      };
      const a = waterSpot(L);
      d.x = a.x; d.y = a.y;
      const b = waterSpot(L);
      d.tx = b.x; d.ty = b.y;
      return d;
    }),
    smoker,
    crumbs: [],
    ripples: mkPool(POOL.ripples, () => ({ x: 0, y: 0, r: 1, a: 0, life: 1, age: 0, alive: false })),
    rippleNext: 0,
    sparks: mkPool(POOL.sparks, () => ({ x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, s: 1, rgb: "", alive: false })),
    sparkNext: 0,
    smoke: mkPool(POOL.smoke, () => ({ x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, r0: 1, r1: 1, a: 0, blue: false, seed: 0, alive: false })),
    smokeNext: 0,
    bubbles: mkPool(POOL.bubbles, () => ({ x: 0, y: 0, vx: 0, vy: 0, z: 0, vz: 0, r: 0, age: 0, life: 1, ph: 0, alive: false })),
    leaves: mkPool(POOL.leaves, () => ({ x: 0, y: 0, z: 0, rot: 0, spin: 0, ph: 0, col: 0, t: 0, state: 0 })),
    leafT: 1,
    lawn: { sitters, players, kid, disc: { from: 0, t: 0, dur: 1, x0: 0, y0: 0, x1: 0, y1: 0, bend: 0, flying: false, wait: 1.5, x: fx0, y: fy0, z: 1 } },
    boat: (() => {
      const lr = seeded(31);
      const rl = makeLook(lr);
      const gl = makeLook(lr);
      rl.longCoat = false;
      gl.longCoat = false;
      const spot = waterSpot(L);
      return {
        x: L.pond.cx - 0.2 * L.pond.rx, y: L.pond.cy + 0.25 * L.pond.ry, heading: 2.4, speed: 0, tx: spot.x, ty: spot.y,
        stroke: 0, rowing: true, t: 12,
        rower: { ...newPose(), sitting: true, seat: 0.3, handR: [0, 0, 0], handL: [0, 0, 0] }, rowerLook: rl,
        guest: { ...newPose(), sitting: true, seat: 0.3 }, guestLook: gl,
      } as Boat;
    })(),
    pigeons: Array.from({ length: 9 }, (_, i) => {
      const at = dryNear(L, L.plaza.x, L.plaza.y, 1.4 * L.plaza.r);
      return {
        x: at.x, y: at.y, z: 0, heading: rand(0, 6.28), mode: 0, t: rand(0, 2), tx: at.x, ty: at.y,
        gait: rand(0, 6), pecks: 0, peckT: 0, tone: i % 5, sx: 0, sy: 0, cx: 0, cy: 0, ex: 0, ey: 0, f: 0, dur: 1, peak: 2, delay: 0,
      };
    }),
    flock: { birds: [], t: rand(8, 20), x: 0, y: 0, dir: 0, turn: 0, speed: 0, time: 0 },
    cart: { x: cx, y: cy, vendor, look: makeLook(sr) },
    fetch: {
      owner: { ...newPose(ox, oy, -0.2) }, look: makeLook(sr), dx: ox + m, dy: oy, dh: 0, ph: 0, state: 0, t: 2,
      bx: ox, by: oy, bz: 0, vx: 0, vy: 0, vz: 0,
    },
    sails: [0, 1].map((i) => {
      const a = waterSpot(L, sr);
      return { x: a.x, y: a.y, heading: rand(0, 6.28), ph: rand(0, 6), color: i ? "#e0604c" : "#f8f4ea", trim: i ? "#f4efe2" : "#2f5f8a" } as Sailboat;
    }),
    say: { text: "", x: 0, y: 0, t: 0, life: 0 },
  };
  for (let i = 0; i < 8; i++) spawnPerson(w, true);
  return w;
}

export function updateWorld(w: World, realDt: number) {
  const dt = TIME_SCALE * realDt;
  const L = w.L;
  const m = L.m;
  w.time += dt;
  const t = w.time;
  w.wind = 0.45 + 0.2 * Math.sin(0.13 * t) + 0.3 * Math.pow(Math.max(0, Math.sin(0.37 * t + 1)), 3);
  const ang = 0.1 + 0.35 * Math.sin(0.05 * t);
  w.windX = Math.cos(ang) * w.wind;
  w.windY = Math.sin(ang) * w.wind;
  w.camX = Math.sin(0.07 * t) * m * 0.25 + Math.sin(0.17 * t) * m * 0.08;
  w.camY = Math.cos(0.05 * t) * m * 0.2;

  w.spawnT -= dt;
  if (w.spawnT <= 0) {
    w.spawnT = rand(2, 5);
    if (w.people.length < 11) spawnPerson(w, false);
  }
  updatePeople(w, dt);
  updateDucks(w, dt);
  updateSmoker(w, dt);
  updateCrumbs(w, dt);
  const walkers: Pose[] = [];
  for (const p of w.people) if (!p.pose.sitting) walkers.push(p.pose);
  walkers.push(w.lawn.kid.pose);
  updatePigeons(w, dt, walkers);
  updateFlock(w, dt);
  updateExtras(w, dt);
  updateBoat(w, dt);
  updateLawn(w, dt);
  updateLeaves(w, dt);
  updateBubbles(w, dt);

  for (const s of w.sparks) {
    if (!s.alive) continue;
    s.age += dt;
    s.x += s.vx * dt; s.y += s.vy * dt;
    s.vx *= 1 - 3 * dt; s.vy *= 1 - 3 * dt;
    if (s.age > s.life) s.alive = false;
  }
  // Smoke drifts on a slowly changing noise field plus the wind.
  const inv = 1 / (0.9 * m);
  for (const p of w.smoke) {
    if (!p.alive) continue;
    p.age += dt;
    if (p.age >= p.life) { p.alive = false; continue; }
    const nx = p.x * inv;
    const ny = p.y * inv;
    const sh = 0.35 * t;
    const fx = vnoise(nx + sh, ny + 0.35 + 0.01 * p.seed) - vnoise(nx + sh, ny - 0.35 + 0.01 * p.seed);
    const fy = vnoise(nx + 0.35 + sh, ny + 0.01 * p.seed) - vnoise(nx - 0.35 + sh, ny + 0.01 * p.seed);
    const grow = Math.min(1, p.age / 1.2);
    const k = m * (0.9 + 1.2 * grow);
    p.vx += (fx * k * 6 + w.windX * m * grow * 0.9 - 0.9 * p.vx) * dt;
    p.vy += (-fy * k * 6 + w.windY * m * grow * 0.9 - 0.9 * p.vy) * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (const r of w.ripples) if (r.alive && (r.age += dt) >= r.life) r.alive = false;
  if (w.say.life > 0) w.say.t += dt;
  w.sfx.wind(clamp01(w.wind));
}

/** A tap/click at world coordinates (x, y). */
export function tapWorld(w: World, x: number, y: number) {
  const L = w.L;
  const m = L.m;
  const pan = x / L.w;
  for (const b of w.bubbles) {
    if (b.alive && Math.hypot(b.x - x, b.y - y) < b.r + 0.35 * m) { popBubble(w, b); w.sfx.flick(pan); return; }
  }
  const s = w.smoker;
  if (Math.hypot(x - s.mouth.x, y - s.mouth.y) < 1.2 * m) {
    say(w, REPLIES[(Math.random() * REPLIES.length) | 0], s.mouth.x, s.mouth.y - 12, 2.6);
    s.lookTo = 0;
    s.talkT = rand(8, 14);
    w.sfx.cough(s.x / L.w, 0.25);
    return;
  }
  if (pondField(L.pond, x, y) > 0) {
    addRipple(w, x, y, 1.4 * m, 0.7, 2.4);
    addRipple(w, x, y, 0.7 * m, 0.5, 1.6);
    w.sfx.plop(pan, 0.5);
  } else scatterPigeons(w, x, y, 2 * m);
  for (let i = 0; i < 7; i++) {
    const a = rand(0, TAU);
    const v = m * rand(0.4, 1.4);
    w.crumbs.push({ x, y, z: 1.2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: rand(0.5, 2), water: false, alive: true, age: 0 });
  }
}
