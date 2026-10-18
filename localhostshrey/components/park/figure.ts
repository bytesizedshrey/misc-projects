// People and dogs, drawn as articulated stick-skeletons with volume: legs,
// coat, shoulders, head, hair or hat. Joints are placed in the figure's own
// frame (forward, side, up) and projected like everything else, so a walker
// leans away from the view centre and casts a long shadow.

import { SUN, cast, mkPt, project, type Pt } from "./camera";
import { pick, shade } from "./util";

export interface Look {
  coat: string;
  legs: string;
  shoes: string;
  hair: string;
  skin: string;
  hairStyle: number;
  /** 0 none, 1 beanie, 2 cap */
  hat: number;
  hatColor: string;
  scarf: string | null;
  longCoat: boolean;
  bag: string | null;
  scale: number;
}

export interface Pose {
  x: number;
  y: number;
  heading: number;
  /** Gait phase, radians. */
  ph: number;
  /** 0 = standing still, 1 = full stride. */
  stride: number;
  sitting: boolean;
  /** Seat height when sitting (bench ≈ 0.46, ground ≈ 0.1). */
  seat?: number;
  /** Head turn relative to heading. */
  look: number;
  handR?: number[] | null;
  handL?: number[] | null;
}

const COATS = [
  "#f4f1ea", "#e9e1d0", "#c9a27a", "#dcc9a6", "#98b4cc", "#f0d6c8",
  "#d4785a", "#f7f4ee", "#a6ba8e", "#4e6a8e", "#e2bc5c", "#b8c8d8", "#e8a4a0",
];
const HAIR = ["#2a211c", "#4a3424", "#8a6a44", "#d8bc88", "#a8a8a2", "#7a3e22", "#161210"];
const SKIN = ["#efc9a4", "#cf9a76", "#8c5a3c", "#f4d6ba", "#b4784e", "#60402c"];
const ACCENT = ["#c4503c", "#e4bc4c", "#4e86a0", "#f2ece0", "#7e9a5a", "#e08a74"];
const LEGS = ["#2e3644", "#4a4640", "#3c5274", "#7a6a56", "#d8d0c0", "#262628"];

export function makeLook(r: () => number, scale = 1): Look {
  const hatRoll = r();
  return {
    coat: pick(COATS, r),
    legs: pick(LEGS, r),
    shoes: r() < 0.3 ? "#f2f0ea" : "#2a2624",
    hair: pick(HAIR, r),
    skin: pick(SKIN, r),
    hairStyle: (r() * 4) | 0,
    hat: hatRoll < 0.18 ? 1 : hatRoll < 0.28 ? 2 : 0,
    hatColor: pick(ACCENT, r),
    scarf: r() < 0.3 ? pick(ACCENT, r) : null,
    longCoat: r() < 0.35,
    bag: r() < 0.25 ? pick(["#7a5a3a", "#2e2e30", "#c8b490"], r) : null,
    scale,
  };
}

// joint indices
const FOOT_L = 0, FOOT_R = 1, KNEE_L = 2, KNEE_R = 3, HIP_L = 4, HIP_R = 5;
const SH_L = 6, SH_R = 7, EL_L = 8, EL_R = 9, HAND_L = 10, HAND_R = 11;
const NECK = 12, HEAD = 13, PELVIS = 14, CHEST = 15;

const J = new Float32Array(48);
const set = (i: number, f: number, s: number, z: number) => {
  J[3 * i] = f;
  J[3 * i + 1] = s;
  J[3 * i + 2] = z;
};
const pts: Pt[] = Array.from({ length: 16 }, mkPt);

function skeleton(p: Pose, look: Look) {
  const sw = Math.sin(p.ph) * p.stride;
  const lift = 0.07 * p.stride;
  if (p.sitting) {
    const seat = p.seat ?? 0.46;
    const onGround = seat < 0.25;
    set(HIP_L, -0.06, -0.1, seat);
    set(HIP_R, -0.06, 0.1, seat);
    if (onGround) {
      set(KNEE_L, 0.3, -0.16, 0.28);
      set(KNEE_R, 0.3, 0.16, 0.28);
      set(FOOT_L, 0.52, -0.1, 0.04);
      set(FOOT_R, 0.52, 0.1, 0.04);
    } else {
      set(KNEE_L, 0.36, -0.11, seat + 0.04);
      set(KNEE_R, 0.36, 0.11, seat + 0.04);
      set(FOOT_L, 0.48, -0.12, 0.02);
      set(FOOT_R, 0.46, 0.13, 0.02);
    }
    set(SH_L, -0.12, -0.2, seat + 0.52);
    set(SH_R, -0.12, 0.2, seat + 0.52);
    set(EL_L, 0.02, -0.24, seat + 0.2);
    set(EL_R, 0.02, 0.24, seat + 0.2);
    set(HAND_L, 0.24, -0.16, onGround ? 0.3 : seat + 0.08);
    set(HAND_R, 0.24, 0.16, onGround ? 0.3 : seat + 0.08);
    set(NECK, -0.08, 0, seat + 0.6);
    set(HEAD, -0.06, 0, seat + 0.73);
    set(PELVIS, 0.12, 0, seat + 0.04);
    set(CHEST, -0.1, 0, seat + 0.34);
  } else {
    set(FOOT_L, 0.3 * sw, -0.1, Math.max(0, Math.cos(p.ph)) * lift);
    set(FOOT_R, -0.3 * sw, 0.1, Math.max(0, -Math.cos(p.ph)) * lift);
    set(KNEE_L, 0.15 * sw + 0.05, -0.1, 0.5);
    set(KNEE_R, -0.15 * sw + 0.05, 0.1, 0.5);
    set(HIP_L, 0, -0.1, 0.92);
    set(HIP_R, 0, 0.1, 0.92);
    set(SH_L, 0, -0.2, 1.42);
    set(SH_R, 0, 0.2, 1.42);
    set(EL_L, -0.1 * sw - 0.02, -0.24, 1.12);
    set(EL_R, 0.1 * sw - 0.02, 0.24, 1.12);
    set(HAND_L, -0.24 * sw, -0.25, 0.84);
    set(HAND_R, 0.24 * sw, 0.25, 0.84);
    set(NECK, 0.02, 0, 1.5);
    set(HEAD, 0.03, 0, 1.63);
    set(PELVIS, 0, 0, look.longCoat ? 0.55 : 0.82);
    set(CHEST, 0.01, 0, 1.18);
  }
  if (p.handR) {
    set(HAND_R, p.handR[0], p.handR[1], p.handR[2]);
    set(EL_R, 0.3 * p.handR[0], 0.27, (p.handR[2] + J[3 * SH_R + 2]) * 0.45);
  }
  if (p.handL) {
    set(HAND_L, p.handL[0], p.handL[1], p.handL[2]);
    set(EL_L, 0.3 * p.handL[0], -0.27, (p.handL[2] + J[3 * SH_L + 2]) * 0.45);
  }
}

function place(p: Pose, look: Look, m: number, shadow: boolean) {
  skeleton(p, look);
  const c = Math.cos(p.heading);
  const s = Math.sin(p.heading);
  const u = m * look.scale;
  for (let i = 0; i < 16; i++) {
    const f = J[3 * i] * u;
    const sd = J[3 * i + 1] * u;
    const z = J[3 * i + 2] * u;
    const x = p.x + f * c - sd * s;
    const y = p.y + f * s + sd * c;
    if (shadow) cast(x, y, z, pts[i]);
    else project(x, y, z, pts[i]);
  }
  return u;
}

function seg(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, w: number) {
  ctx.lineWidth = w * (a.k + b.k) * 0.5;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

const LIGHT_ANGLE = Math.atan2(-SUN.y, -SUN.x);

export function drawFigureShadow(
  ctx: CanvasRenderingContext2D,
  p: Pose,
  look: Look,
  m: number,
) {
  const u = place(p, look, m, true);
  ctx.strokeStyle = "rgba(0,0,0,0.8)";
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.lineCap = "round";
  seg(ctx, pts[FOOT_L], pts[HIP_L], 0.15 * u);
  seg(ctx, pts[FOOT_R], pts[HIP_R], 0.15 * u);
  seg(ctx, pts[PELVIS], pts[CHEST], 0.4 * u);
  seg(ctx, pts[CHEST], pts[NECK], 0.42 * u);
  seg(ctx, pts[SH_L], pts[HAND_L], 0.1 * u);
  seg(ctx, pts[SH_R], pts[HAND_R], 0.1 * u);
  ctx.beginPath();
  ctx.arc(pts[HEAD].x, pts[HEAD].y, 0.13 * u, 0, Math.PI * 2);
  ctx.fill();
}

export function drawFigure(
  ctx: CanvasRenderingContext2D,
  p: Pose,
  look: Look,
  m: number,
) {
  const u = place(p, look, m, false);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const cos = Math.cos(p.heading);
  const sin = Math.sin(p.heading);

  // legs and shoes
  ctx.strokeStyle = look.legs;
  seg(ctx, pts[HIP_L], pts[KNEE_L], 0.14 * u);
  seg(ctx, pts[KNEE_L], pts[FOOT_L], 0.12 * u);
  seg(ctx, pts[HIP_R], pts[KNEE_R], 0.14 * u);
  seg(ctx, pts[KNEE_R], pts[FOOT_R], 0.12 * u);
  ctx.fillStyle = look.shoes;
  for (const f of [pts[FOOT_L], pts[FOOT_R]]) {
    ctx.beginPath();
    ctx.ellipse(f.x + cos * u * 0.06, f.y + sin * u * 0.06, 0.11 * u, 0.046 * u, p.heading, 0, Math.PI * 2);
    ctx.fill();
  }

  // torso
  ctx.strokeStyle = shade(look.coat, 0.82);
  seg(ctx, pts[PELVIS], pts[CHEST], (look.longCoat ? 0.36 : 0.3) * u);
  ctx.strokeStyle = shade(look.coat, 0.9);
  seg(ctx, pts[CHEST], pts[NECK], 0.32 * u);
  if (look.bag) {
    ctx.fillStyle = look.bag;
    const c = pts[CHEST];
    ctx.beginPath();
    ctx.ellipse(c.x - cos * u * 0.17, c.y - sin * u * 0.17, 0.14 * u, 0.09 * u, p.heading + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // arms
  ctx.strokeStyle = shade(look.coat, 0.86);
  seg(ctx, pts[SH_L], pts[EL_L], 0.11 * u);
  seg(ctx, pts[EL_L], pts[HAND_L], 0.1 * u);
  seg(ctx, pts[SH_R], pts[EL_R], 0.11 * u);
  seg(ctx, pts[EL_R], pts[HAND_R], 0.1 * u);
  ctx.fillStyle = look.skin;
  for (const h of [pts[HAND_L], pts[HAND_R]]) {
    ctx.beginPath();
    ctx.arc(h.x, h.y, 0.042 * u * h.k, 0, Math.PI * 2);
    ctx.fill();
  }

  // shoulders: the broad coat-coloured ellipse you see from above
  const a = pts[SH_L];
  const b = pts[SH_R];
  const k = (a.k + b.k) / 2;
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const rx = Math.hypot(b.x - a.x, b.y - a.y) / 2 + 0.06 * u * k;
  const ry = 0.115 * u * k;
  ctx.fillStyle = look.coat;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, ang, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(20,24,30,0.16)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // warm rim on the sun side, and a soft sheen
  ctx.strokeStyle = "rgba(255,244,214,0.75)";
  ctx.lineWidth = Math.max(0.7, 0.03 * u);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, ang, LIGHT_ANGLE - ang - 1.1, LIGHT_ANGLE - ang + 1.1);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,250,236,0.22)";
  ctx.beginPath();
  ctx.ellipse(cx - 0.25 * ry, cy + 0.1 * ry, 0.8 * rx, 0.5 * ry, ang, 0, Math.PI * 2);
  ctx.fill();
  if (look.scarf) {
    ctx.fillStyle = look.scarf;
    ctx.beginPath();
    ctx.arc(pts[NECK].x, pts[NECK].y, 0.1 * u * k, 0, Math.PI * 2);
    ctx.fill();
  }

  // head
  const h = pts[HEAD];
  const hr = (look.scale < 0.8 ? 0.14 : 0.112) * u * h.k;
  const face = p.heading + p.look;
  const fc = Math.cos(face);
  const fs = Math.sin(face);
  if (look.hairStyle === 1 && !p.sitting && look.hat === 0) {
    ctx.strokeStyle = look.hair;
    seg(ctx, h, pts[CHEST], 0.17 * u);
  }
  ctx.fillStyle = look.skin;
  ctx.beginPath();
  ctx.arc(h.x + fc * hr * 0.12, h.y + fs * hr * 0.12, 0.95 * hr, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(h.x + fc * hr * 0.9, h.y + fs * hr * 0.9, 0.2 * hr, 0, Math.PI * 2);
  ctx.fill();
  const capR = look.hat !== 0 ? 1 : look.hairStyle === 3 ? 0.86 : 0.97;
  const capBack = look.hat !== 0 ? 0.12 : look.hairStyle === 3 ? 0.2 : 0.24;
  ctx.fillStyle = look.hat === 0 ? look.hair : look.hatColor;
  ctx.beginPath();
  ctx.arc(h.x - fc * hr * capBack, h.y - fs * hr * capBack, hr * capR, 0, Math.PI * 2);
  ctx.fill();
  if (look.hat === 2) {
    ctx.beginPath();
    ctx.ellipse(h.x + fc * hr * 0.8, h.y + fs * hr * 0.8, 0.45 * hr, 0.72 * hr, face, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
  }
  if (look.hat === 0 && look.hairStyle === 2) {
    ctx.beginPath();
    ctx.arc(h.x - fc * hr * 0.85, h.y - fs * hr * 0.85, 0.42 * hr, 0, Math.PI * 2);
    ctx.fill();
  }
  if (look.hat === 1) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(h.x - fc * hr * 0.15, h.y - fs * hr * 0.15, 0.26 * hr, 0, Math.PI * 2);
    ctx.fill();
  }
  if (look.hat === 0 && look.hairStyle !== 3) {
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = Math.max(0.6, 0.12 * hr);
    ctx.beginPath();
    ctx.moveTo(h.x + fc * hr * 0.55 - fs * hr * 0.25, h.y + fs * hr * 0.55 + fc * hr * 0.25);
    ctx.lineTo(h.x - fc * hr * 0.25 - fs * hr * 0.15, h.y - fs * hr * 0.25 + fc * hr * 0.15);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,246,225,0.14)";
  ctx.beginPath();
  ctx.arc(h.x - 0.3 * hr, h.y + 0.2 * hr, 0.45 * hr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,244,214,0.8)";
  ctx.lineWidth = Math.max(0.7, 0.22 * hr);
  ctx.beginPath();
  ctx.arc(h.x, h.y, 0.95 * hr, LIGHT_ANGLE - 1, LIGHT_ANGLE + 1);
  ctx.stroke();
}

/** Projected hand and head positions for a pose (used by the smoker). */
export function figureAnchors(p: Pose, look: Look, m: number, hand: Pt, head: Pt) {
  place(p, look, m, false);
  hand.x = pts[HAND_R].x;
  hand.y = pts[HAND_R].y;
  hand.k = pts[HAND_R].k;
  head.x = pts[HEAD].x;
  head.y = pts[HEAD].y;
  head.k = pts[HEAD].k;
}

// ---------------------------------------------------------------- dogs ----

const dp: Pt[] = Array.from({ length: 8 }, mkPt);

function dogJoints(x: number, y: number, heading: number, ph: number, u: number, shadow: boolean, sniff: boolean) {
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  const trot = 0.18 * Math.sin(3.3 * ph);
  const stepL = 0.08 * Math.sin(ph);
  const defs: number[][] = [
    [0.22 + stepL, -0.09, 0],
    [0.22 - stepL, 0.09, 0],
    [-0.2 - stepL, -0.09, 0],
    [-0.2 + stepL, 0.09, 0],
    [0.2, 0, 0.42],
    [-0.2, 0, 0.42],
    [sniff ? 0.42 : 0.36, 0, sniff ? 0.15 : 0.5],
    [-0.42, trot, 0.5],
  ];
  for (let i = 0; i < 8; i++) {
    const [f, sd, z] = defs[i];
    const wx = x + (f * c - sd * s) * u;
    const wy = y + (f * s + sd * c) * u;
    if (shadow) cast(wx, wy, z * u, dp[i]);
    else project(wx, wy, z * u, dp[i]);
  }
}

function dseg(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, w: number) {
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

export function drawDogShadow(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, ph: number, u: number, sniff: boolean) {
  dogJoints(x, y, heading, ph, u, true, sniff);
  ctx.strokeStyle = "rgba(0,0,0,0.8)";
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) dseg(ctx, dp[i], dp[i < 2 ? 4 : 5], 0.06 * u);
  dseg(ctx, dp[4], dp[5], 0.24 * u);
  dseg(ctx, dp[4], dp[6], 0.16 * u);
  dseg(ctx, dp[5], dp[7], 0.05 * u);
}

export function drawDog(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, ph: number, color: string, u: number, sniff: boolean) {
  dogJoints(x, y, heading, ph, u, false, sniff);
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  for (let i = 0; i < 4; i++) dseg(ctx, dp[i], dp[i < 2 ? 4 : 5], 0.06 * u);
  dseg(ctx, dp[5], dp[7], 0.05 * u);
  dseg(ctx, dp[4], dp[5], 0.24 * u * dp[4].k);
  dseg(ctx, dp[4], dp[6], 0.1 * u);
  const head = dp[6];
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(head.x, head.y, 0.1 * u * head.k, 0, Math.PI * 2);
  ctx.fill();
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(head.x - c * u * 0.03 - s * side * u * 0.08, head.y - s * u * 0.03 + c * side * u * 0.08, 0.06 * u, 0.035 * u, heading + 0.5 * side, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#1e1a18";
  ctx.beginPath();
  ctx.arc(head.x + c * u * 0.1, head.y + s * u * 0.1, 0.025 * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,244,222,0.2)";
  ctx.beginPath();
  ctx.arc((dp[4].x + dp[5].x) / 2, (dp[4].y + dp[5].y) / 2, 0.08 * u, 0, Math.PI * 2);
  ctx.fill();
}

