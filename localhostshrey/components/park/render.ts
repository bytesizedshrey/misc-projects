// Paints the park's moving parts into a handful of 2D canvases. The WebGL
// pass then lights and composites them over the procedural ground:
//   sprites : figures, animals, boats, props (lit by sun and tree shade)
//   shade   : the shadows those things cast
//   air     : ripples, bubbles, smoke, glints (additive-ish, sun-sensitive)
//   fore    : tree crowns and birds, in front of the "lens"
//   canopy  : the tree shadows (half resolution)

import { SUN, cast, groundTransform, mkPt, onGround, project, screenTransform, setDrift, toScreenVec } from "./camera";
import { drawDog, drawDogShadow, drawFigure, drawFigureShadow } from "./figure";
import {
  boatShadow, drawBird, drawCart, drawCartShadow, drawDuck, drawLily, drawOars, drawPigeonSprite,
  drawPigeonWings, drawReading, drawRowboat, drawSailboat, drawSailboatShadow, drawStroller,
  drawUmbrella, oarCycle, type BoatFrame, type StaticProps,
} from "./props";
import { crownHeight, sway, treeShadow, treeSprite } from "./trees";
import { Act, Kind, flockBirdPose, pigeonFlap, smokerLook as SMOKER_LOOK, type World } from "./sim";
import { makeCanvas } from "./util";

type Ctx = CanvasRenderingContext2D;

export interface Layers {
  sprites: HTMLCanvasElement;
  shade: HTMLCanvasElement;
  air: HTMLCanvasElement;
  fore: HTMLCanvasElement;
  canopy: HTMLCanvasElement;
}

/** Layers are in screen space: w × h is the view, not the ground. */
export function makeLayers(w: number, h: number, dpr: number): Layers {
  return {
    sprites: makeCanvas(w * dpr, h * dpr),
    shade: makeCanvas(w, h),
    air: makeCanvas(w, h),
    fore: makeCanvas(w * dpr, h * dpr),
    canopy: makeCanvas(w / 2, h / 2),
  };
}

let blobBlue: HTMLCanvasElement | null = null;
let blobWhite: HTMLCanvasElement | null = null;

function glowSprite(r: number, g: number, b: number) {
  const c = makeCanvas(64, 64);
  const x = c.getContext("2d")!;
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gr.addColorStop(0.45, `rgba(${r},${g},${b},0.55)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  return c;
}

const LEAF = ["#d6c25a", "#9cc45a", "#e0a648", "#b8d070", "#c8803c"];
const p1 = mkPt();
const p2 = mkPt();

function blob(g: Ctx, x: number, y: number, rx: number, ry: number, ang: number, a: number) {
  g.fillStyle = `rgba(0,0,0,${a})`;
  g.beginPath();
  g.ellipse(x, y, rx, ry, ang, 0, Math.PI * 2);
  g.fill();
}

/** Soft elongated shadow of something on legs (strollers, bubbles). */
function longShadow(g: Ctx, x: number, y: number, rad: number, depth: number, alpha: number) {
  const len = Math.hypot(SUN.x, SUN.y) * depth;
  const ang = Math.atan2(SUN.y, SUN.x);
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  g.fillStyle = `rgba(0,0,0,${alpha / 3})`;
  for (let i = 0; i < 3; i++) {
    const k = 1 + 0.2 * i;
    g.beginPath();
    g.ellipse(0.5 * len, 0, 0.5 * len * k + 0.3 * rad, rad * k, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

export function renderLayers(w: World, ly: Layers, props: StaticProps, dpr: number) {
  const { L, camX, camY, time } = w;
  const m = L.m;
  const vw = L.vw;
  const vh = L.vh;
  blobBlue ??= glowSprite(214, 222, 236);
  blobWhite ??= glowSprite(236, 234, 230);
  setDrift(camX, camY);
  // The pre-painted statics were drawn with no drift; slide them by what the
  // drift moves the ground on screen.
  const drift = toScreenVec(-camX, -camY, { x: 0, y: 0 });

  const sp = ly.sprites.getContext("2d")!;
  const sh = ly.shade.getContext("2d")!;
  const air = ly.air.getContext("2d")!;
  const fore = ly.fore.getContext("2d")!;
  const can = ly.canopy.getContext("2d")!;
  const ALT = 0.4; // birds fly lower than they would for real, so they stay in frame

  // ------------------------------------------------------------- shadows
  sh.setTransform(1, 0, 0, 1, 0, 0);
  sh.clearRect(0, 0, vw, vh);
  sh.drawImage(props.shadow, drift.x, drift.y);
  groundTransform(sh, 1);
  for (const p of w.people) {
    drawFigureShadow(sh, p.pose, p.look, m);
    if (p.dog) drawDogShadow(sh, p.dog.x, p.dog.y, p.dog.heading, p.dog.ph, m, p.dog.sniff > 0);
    if (p.kind === Kind.Stroller) {
      const h = p.pose.heading;
      longShadow(sh, p.pose.x + Math.cos(h) * m * 0.7, p.pose.y + Math.sin(h) * m * 0.7, 0.3 * m, m, 0.6);
    }
  }
  drawFigureShadow(sh, w.smoker.pose, SMOKER_LOOK, m);
  const b = w.boat;
  const bf: BoatFrame = { x: b.x, y: b.y, c: Math.cos(b.heading), s: Math.sin(b.heading), m };
  boatShadow(sh, bf);
  drawFigureShadow(sh, b.rower, b.rowerLook, m);
  drawFigureShadow(sh, b.guest, b.guestLook, m);
  sh.fillStyle = "rgba(0,0,0,0.55)";
  for (const p of w.pigeons) {
    cast(p.x, p.y, (0.2 + p.z) * m, p1);
    const flap = pigeonFlap(p);
    sh.beginPath();
    sh.ellipse(p1.x, p1.y, 0.17 * m, m * (0.08 + 0.28 * flap), p.heading, 0, Math.PI * 2);
    sh.fill();
  }
  const fl = w.flock;
  for (const bird of fl.birds) {
    const pose = flockBirdPose(fl, bird, m);
    cast(pose.x, pose.y, bird.alt * m * ALT, p1);
    const o = bird.alt * m * 0.006;
    for (const [dx, dy, a] of [[0, 0, 0.22], [o, 0.4 * o, 0.12], [-o, -0.4 * o, 0.12]]) {
      sh.save();
      sh.translate(p1.x + dx, p1.y + dy);
      sh.rotate(pose.a);
      sh.fillStyle = `rgba(0,0,0,${a})`;
      drawBird(sh, 0.55 * m, bird, false);
      sh.restore();
    }
  }
  for (const s of [...w.lawn.sitters, ...w.lawn.players, w.lawn.kid]) drawFigureShadow(sh, s.pose, s.look, m);
  const disc = w.lawn.disc;
  if (disc.flying) {
    cast(disc.x, disc.y, disc.z * m, p1);
    blob(sh, p1.x, p1.y, 0.13 * m, 0.1 * m, 0, 0.6);
  }
  for (const bu of w.bubbles) if (bu.alive) longShadow(sh, bu.x + SUN.x * bu.z * m, bu.y + SUN.y * bu.z * m, 0.5 * bu.r, 0.01, 0.12);
  sh.fillStyle = "rgba(0,0,0,0.4)";
  for (const l of w.leaves) {
    if (l.state !== 1) continue;
    cast(l.x, l.y, l.z * m, p1);
    sh.beginPath();
    sh.ellipse(p1.x, p1.y, 0.1 * m, 0.05 * m, l.rot, 0, Math.PI * 2);
    sh.fill();
  }
  drawCartShadow(sh, w.cart.x, w.cart.y, m);
  drawFigureShadow(sh, w.cart.vendor, w.cart.look, m);
  const fe = w.fetch;
  drawFigureShadow(sh, fe.owner, fe.look, m);
  drawDogShadow(sh, fe.dx, fe.dy, fe.dh, fe.ph, m, false);
  cast(fe.bx, fe.by, fe.bz * m, p1);
  sh.fillStyle = "rgba(0,0,0,0.75)";
  sh.beginPath();
  sh.arc(p1.x, p1.y, 0.06 * m, 0, Math.PI * 2);
  sh.fill();
  for (const s of w.sails) drawSailboatShadow(sh, s, m);
  // the dark patch where each trunk meets the grass
  for (const t of L.trees) blob(sh, t.x, t.y, 0.3 * t.r, 0.3 * t.r, 0, 0.55);

  // -------------------------------------------------------------- sprites
  sp.setTransform(1, 0, 0, 1, 0, 0);
  sp.clearRect(0, 0, ly.sprites.width, ly.sprites.height);
  sp.drawImage(props.body, drift.x * dpr, drift.y * dpr, vw * dpr, vh * dpr);
  groundTransform(sp, dpr);
  for (const lily of L.lilies) drawLily(sp, lily);
  screenTransform(sp, dpr);

  const duckSize = 1.35 * m;
  for (const d of w.ducks) {
    const bob = 0.05 * Math.sin(1.3 * d.bob);
    const dip = d.dip * d.dip * (3 - 2 * d.dip);
    const squash = 1 - 0.55 * dip;
    const bx = d.x - Math.cos(d.heading) * duckSize * 0.22 * dip;
    const by = d.y - Math.sin(d.heading) * duckSize * 0.22 * dip;
    onGround(sp, bx, by, 0);
    sp.fillStyle = "rgba(10,40,50,0.22)";
    sp.beginPath();
    sp.ellipse(0, 0, 0.56 * duckSize * squash, 0.24 * duckSize, d.heading, 0, Math.PI * 2);
    sp.fill();
    drawDuck(sp, 0, 0, d.heading + bob, duckSize, d.kind, dpr, squash);
    sp.restore();
  }

  drawRowboat(sp, bf);
  drawFigure(sp, b.guest, b.guestLook, m);
  const cyc = b.rowing ? oarCycle(b.stroke) : { sweep: 0, up: 0.3 };
  drawOars(sp, bf, cyc.sweep, cyc.up, b.heading);
  drawFigure(sp, b.rower, b.rowerLook, m);

  sp.fillStyle = "#e6c890";
  for (const c of w.crumbs) {
    if (!c.alive) continue;
    project(c.x, c.y, c.z * m, p1);
    sp.beginPath();
    sp.arc(p1.x, p1.y, 0.045 * m, 0, Math.PI * 2);
    sp.fill();
  }

  for (const p of w.pigeons) {
    onGround(sp, p.x, p.y, (0.15 + p.z) * m);
    const flap = pigeonFlap(p);
    if (flap > 0) drawPigeonWings(sp, 0, 0, p.heading, 0.7 * m, flap, p.tone, 1);
    const peck = p.mode === 2 ? 0.09 * Math.sin(Math.min(1, p.peckT / 0.32) * Math.PI) : p.mode === 1 ? 0.045 * Math.cos(p.gait) : 0;
    drawPigeonSprite(sp, Math.cos(p.heading) * peck * 0.7 * m, Math.sin(p.heading) * peck * 0.7 * m, p.heading, 0.7 * m, p.tone, dpr);
    sp.restore();
  }

  for (const s of w.lawn.sitters) drawFigure(sp, s.pose, s.look, m);
  drawFigure(sp, w.lawn.players[0].pose, w.lawn.players[0].look, m);
  drawFigure(sp, w.lawn.players[1].pose, w.lawn.players[1].look, m);
  drawFigure(sp, w.lawn.kid.pose, w.lawn.kid.look, m);
  if (disc.flying) {
    onGround(sp, disc.x, disc.y, disc.z * m);
    const r = 0.14 * m;
    sp.fillStyle = "#ff8a5c";
    sp.beginPath();
    sp.arc(0, 0, r, 0, Math.PI * 2);
    sp.fill();
    sp.strokeStyle = "rgba(255,240,220,0.8)";
    sp.lineWidth = 0.8;
    const a = 20 * time;
    sp.beginPath();
    sp.arc(0, 0, 0.6 * r, a, a + 2);
    sp.stroke();
    sp.restore();
  }

  drawDog(sp, fe.dx, fe.dy, fe.dh, fe.ph, "#2e2a26", m, false);
  project(fe.bx, fe.by, fe.bz * m, p1);
  sp.fillStyle = "#d8e84a";
  sp.beginPath();
  sp.arc(p1.x, p1.y, 0.06 * m, 0, Math.PI * 2);
  sp.fill();
  drawFigure(sp, fe.owner, fe.look, m);
  for (const s of w.sails) drawSailboat(sp, s, m);

  drawCart(sp, w.cart.x, w.cart.y, m);
  drawFigure(sp, w.cart.vendor, w.cart.look, m);

  for (const p of w.people) {
    if (p.dog) {
      const { x, y, heading } = p.pose;
      const hand = project(x + Math.cos(heading + 1.3) * m * 0.25, y + Math.sin(heading + 1.3) * m * 0.25, 0.85 * m * p.look.scale, p1);
      const hx = hand.x;
      const hy = hand.y;
      const dg = p.dog;
      const collar = project(dg.x + Math.cos(dg.heading) * m * 0.3, dg.y + Math.sin(dg.heading) * m * 0.3, 0.48 * m, p2);
      const slack = 0.4 * Math.max(0, 1.8 * m - Math.hypot(collar.x - hx, collar.y - hy));
      sp.strokeStyle = "rgba(196,70,52,0.9)";
      sp.lineWidth = 1;
      sp.beginPath();
      sp.moveTo(hx, hy);
      sp.quadraticCurveTo((hx + collar.x) / 2 + 0.78 * slack, (hy + collar.y) / 2 + 0.6 * slack, collar.x, collar.y);
      sp.stroke();
      drawDog(sp, dg.x, dg.y, dg.heading, dg.ph, dg.color, m, dg.sniff > 0);
    }
    if (p.kind === Kind.Stroller) drawStroller(sp, p.pose.x, p.pose.y, p.pose.heading, m);
    drawFigure(sp, p.pose, p.look, m);
    if (p.act === Act.Sit && p.reads) drawReading(sp, p.reads, p.pose.x, p.pose.y, p.pose.heading, m * p.look.scale, time, p.s);
  }
  drawUmbrella(sp, w.cart.x, w.cart.y, m, time);

  // smoker, cup and cigarette
  {
    const s = w.smoker;
    const ci = Math.cos(s.face);
    const si = Math.sin(s.face);
    onGround(sp, s.x + (-0.04 * ci + 0.62 * si) * m, s.y + (-0.04 * si - 0.62 * ci) * m, 0.56 * m);
    sp.fillStyle = "#3c6a9a";
    sp.beginPath();
    sp.arc(0, 0, 0.065 * m, 0, Math.PI * 2);
    sp.fill();
    sp.fillStyle = "#f6f2ea";
    sp.beginPath();
    sp.arc(0, 0, 0.052 * m, 0, Math.PI * 2);
    sp.fill();
    sp.fillStyle = "#8a7a68";
    sp.beginPath();
    sp.ellipse(0.025 * m, 0, 0.012 * m, 0.006 * m, 0, 0, Math.PI * 2);
    sp.fill();
    sp.restore();
    drawFigure(sp, s.pose, SMOKER_LOOK, m);
    if (s.lit || s.s === 5 || (s.s === 7 && s.t > 0.4)) {
      const mx = s.hand.x + (s.ember.x - s.hand.x) * 0.3;
      const my = s.hand.y + (s.ember.y - s.hand.y) * 0.3;
      sp.lineCap = "butt";
      sp.lineWidth = 0.03 * m;
      sp.strokeStyle = "#d0a060";
      sp.beginPath();
      sp.moveTo(s.hand.x, s.hand.y);
      sp.lineTo(mx, my);
      sp.stroke();
      sp.strokeStyle = "#fbf8f2";
      sp.beginPath();
      sp.moveTo(mx, my);
      sp.lineTo(s.ember.x, s.ember.y);
      sp.stroke();
      if (s.lit) {
        sp.fillStyle = `rgb(255,${120 + 100 * s.glow},${50 + 60 * s.glow})`;
        sp.beginPath();
        sp.arc(s.ember.x, s.ember.y, 0.022 * m, 0, Math.PI * 2);
        sp.fill();
      }
    }
  }

  for (const l of w.leaves) {
    if (l.state === 0) continue;
    const fade = l.state >= 2 ? Math.min(1, (30 - l.t) / 5) : 1;
    const flutter = l.state === 1 ? 0.35 + 0.65 * Math.abs(Math.sin(2.4 * l.ph)) : 1;
    onGround(sp, l.x, l.y, l.z * m);
    sp.globalAlpha = fade;
    sp.fillStyle = LEAF[l.col];
    sp.beginPath();
    sp.ellipse(0, 0, 0.11 * m, 0.06 * m * flutter, l.rot, 0, Math.PI * 2);
    sp.fill();
    sp.restore();
  }
  sp.globalAlpha = 1;

  // ------------------------------------------------------------------ air
  air.setTransform(1, 0, 0, 1, 0, 0);
  air.clearRect(0, 0, vw, vh);
  groundTransform(air, 1);
  for (const r of w.ripples) {
    if (!r.alive) continue;
    const k = r.age / r.life;
    const rad = Math.max(0.5, r.r * (1 - (1 - k) * (1 - k)));
    air.lineWidth = 1.2 / 0.7;
    air.strokeStyle = `rgba(230,244,236,${r.a * (1 - k) * (1 - k) * 0.45})`;
    air.beginPath();
    air.ellipse(r.x, r.y, rad, 0.94 * rad, 0, 0, Math.PI * 2);
    air.stroke();
  }
  for (const lily of L.lilies) {
    const g = air.createRadialGradient(lily.x, lily.y, 0, lily.x, lily.y, 3.2 * lily.r);
    g.addColorStop(0, `rgba(255,236,240,${0.28 + 0.06 * Math.sin(0.7 * time + lily.ph)})`);
    g.addColorStop(1, "rgba(255,236,240,0)");
    air.fillStyle = g;
    air.beginPath();
    air.arc(lily.x, lily.y, 3.2 * lily.r, 0, Math.PI * 2);
    air.fill();
  }
  screenTransform(air, 1);
  for (const bu of w.bubbles) {
    if (!bu.alive) continue;
    project(bu.x, bu.y, bu.z * m, p1);
    const t = Math.min(1, 3 * bu.age) * Math.min(1, (bu.life - bu.age) * 2);
    const wob = 1 + 0.04 * Math.sin(6 * time + bu.ph);
    const g = air.createRadialGradient(p1.x, p1.y, 0.6 * bu.r, p1.x, p1.y, bu.r);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.85, `rgba(255,240,255,${0.22 * t})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    air.fillStyle = g;
    air.beginPath();
    air.ellipse(p1.x, p1.y, bu.r * wob, bu.r / wob, 0, 0, Math.PI * 2);
    air.fill();
    air.lineWidth = Math.max(0.8, 0.08 * bu.r);
    const hue = (40 * time + 60 * bu.ph) % 360;
    air.strokeStyle = `hsla(${hue},90%,78%,${0.55 * t})`;
    air.beginPath();
    air.arc(p1.x, p1.y, 0.95 * bu.r, 0.4, 2.6);
    air.stroke();
    air.strokeStyle = `hsla(${(hue + 150) % 360},90%,80%,${0.5 * t})`;
    air.beginPath();
    air.arc(p1.x, p1.y, 0.95 * bu.r, 3.4, 5.6);
    air.stroke();
    air.fillStyle = `rgba(255,255,255,${0.85 * t})`;
    air.beginPath();
    air.ellipse(p1.x - 0.38 * bu.r, p1.y - 0.38 * bu.r, 0.2 * bu.r, 0.11 * bu.r, -0.8, 0, Math.PI * 2);
    air.fill();
  }
  for (const s of w.sparks) {
    if (!s.alive) continue;
    let sx = s.x;
    let sy = s.y;
    if (!s.scr) {
      project(s.x, s.y, 0, p1);
      sx = p1.x;
      sy = p1.y;
    }
    const t = s.age / s.life;
    const tw = 0.6 + 0.4 * Math.sin(30 * s.age);
    const size = s.s * (1 - 0.5 * t);
    const a = (1 - t) * 0.9 * tw;
    const g = air.createRadialGradient(sx, sy, 0, sx, sy, 2.2 * size);
    g.addColorStop(0, `rgba(${s.rgb},${0.5 * a})`);
    g.addColorStop(1, `rgba(${s.rgb},0)`);
    air.fillStyle = g;
    air.beginPath();
    air.arc(sx, sy, 2.2 * size, 0, Math.PI * 2);
    air.fill();
    air.fillStyle = `rgba(255,254,246,${a})`;
    air.beginPath();
    air.moveTo(sx - size, sy);
    air.quadraticCurveTo(sx, sy, sx, sy - 1.3 * size);
    air.quadraticCurveTo(sx, sy, sx + size, sy);
    air.quadraticCurveTo(sx, sy, sx, sy + 1.3 * size);
    air.quadraticCurveTo(sx, sy, sx - size, sy);
    air.fill();
  }
  for (const p of w.smoke) {
    if (!p.alive) continue;
    const t = p.age / p.life;
    const rad = p.r0 + (p.r1 - p.r0) * Math.sqrt(t);
    const a = p.a * Math.min(1, 10 * t) * (1 - t) * (1 - t);
    if (a < 0.004) continue;
    air.globalAlpha = a;
    air.drawImage((p.blue ? blobBlue : blobWhite)!, p.x - rad, p.y - rad, 2 * rad, 2 * rad);
  }
  air.globalAlpha = 1;
  air.globalCompositeOperation = "lighter";
  {
    const s = w.smoker;
    if (s.lit) {
      const rad = m * (0.16 + 0.3 * s.glow);
      const g = air.createRadialGradient(s.ember.x, s.ember.y, 0, s.ember.x, s.ember.y, rad);
      g.addColorStop(0, `rgba(255,${170 + 60 * s.glow},90,${0.55 + 0.45 * s.glow})`);
      g.addColorStop(0.25, `rgba(255,120,50,${0.18 + 0.3 * s.glow})`);
      g.addColorStop(1, "rgba(255,90,30,0)");
      air.fillStyle = g;
      air.beginPath();
      air.arc(s.ember.x, s.ember.y, rad, 0, Math.PI * 2);
      air.fill();
    }
    if (s.flame > 0) {
      const k = s.flame / 0.8;
      const rad = 0.3 * m * (0.8 + 0.3 * Math.random());
      const g = air.createRadialGradient(s.mouth.x, s.mouth.y, 0, s.mouth.x, s.mouth.y, rad);
      g.addColorStop(0, `rgba(255,230,150,${0.9 * k})`);
      g.addColorStop(1, "rgba(255,160,60,0)");
      air.fillStyle = g;
      air.beginPath();
      air.arc(s.mouth.x, s.mouth.y, rad, 0, Math.PI * 2);
      air.fill();
    }
  }
  air.globalCompositeOperation = "source-over";

  // --------------------------------------------------------------- canopy
  can.setTransform(1, 0, 0, 1, 0, 0);
  can.clearRect(0, 0, ly.canopy.width, ly.canopy.height);
  groundTransform(can, 1, 0.5);
  can.imageSmoothingEnabled = true;
  for (const t of L.trees.concat(L.shades)) {
    const s = treeShadow(t, m, dpr);
    const sw = sway(t, time);
    const h = crownHeight(t);
    can.save();
    can.translate(t.x + SUN.x * h + sw * m * 0.12 * (0.4 + w.wind), t.y + SUN.y * h);
    can.globalAlpha = 0.96;
    can.drawImage(s.cv, -s.size / 2, -s.size / 2, s.size, s.size);
    can.restore();
  }

  // ----------------------------------------------------------------- fore
  fore.setTransform(1, 0, 0, 1, 0, 0);
  fore.clearRect(0, 0, ly.fore.width, ly.fore.height);
  screenTransform(fore, dpr);
  // nearer trees (lower on screen) stand in front of farther ones
  const order = L.trees.map((t) => ({ t, y: project(t.x, t.y, 0, mkPt()).y })).sort((a, c) => a.y - c.y);
  for (const { t } of order) {
    const s = treeSprite(t, m, dpr);
    const sw = sway(t, time);
    const sway3 = sw * m * 0.12 * (0.4 + w.wind);
    const base = project(t.x, t.y, 0, p1);
    const crown = project(t.x + sway3, t.y, crownHeight(t), p2);
    // the trunk, from the roots up into the crown
    const top = project(t.x + sway3 * 0.6, t.y, crownHeight(t) - 0.2 * t.r, mkPt());
    fore.lineCap = "round";
    fore.strokeStyle = "rgb(58,42,32)";
    fore.lineWidth = Math.max(2, 0.2 * t.r);
    fore.beginPath();
    fore.moveTo(base.x, base.y);
    fore.lineTo(top.x, top.y);
    fore.stroke();
    fore.strokeStyle = "rgba(196,160,118,0.55)";
    fore.lineWidth = Math.max(1, 0.07 * t.r);
    fore.beginPath();
    fore.moveTo(base.x - 0.05 * t.r, base.y);
    fore.lineTo(top.x - 0.05 * t.r, top.y);
    fore.stroke();
    fore.save();
    fore.translate(crown.x, crown.y);
    fore.rotate(0.012 * sw);
    fore.drawImage(s.cv, -s.size / 2, -s.size / 2, s.size, s.size);
    fore.restore();
  }
  for (const bird of fl.birds) {
    const pose = flockBirdPose(fl, bird, m);
    onGround(fore, pose.x, pose.y, bird.alt * m * ALT);
    fore.rotate(pose.a);
    fore.fillStyle = "rgba(255,255,252,0.96)";
    drawBird(fore, 0.55 * m, bird, true);
    fore.restore();
  }
}

/** Speech bubble above the smoker, drawn on the top canvas. */
export function drawSay(g: Ctx, w: World, stageW: number, font: string) {
  const s = w.say;
  if (s.life <= 0 || s.t >= s.life) return;
  const rise = Math.min(1, s.t / 0.25);
  const alpha = Math.min(rise, Math.min(1, (s.life - s.t) / 0.4));
  g.save();
  g.font = `10.5px ${font}`;
  const width = g.measureText(s.text).width + 16;
  let x = s.x - width / 2;
  x = Math.max(8, Math.min(stageW - width - 8, x));
  const y = s.y - 20 - 14 - (1 - (1 - (1 - rise) ** 3)) * 4;
  g.globalAlpha = alpha;
  g.fillStyle = "rgba(60,50,40,0.12)";
  g.beginPath();
  g.roundRect(x + 1, y + 2, width, 20, 8);
  g.fill();
  g.fillStyle = "rgba(255,253,248,0.95)";
  g.beginPath();
  g.roundRect(x, y, width, 20, 8);
  g.fill();
  const tail = Math.max(x + 10, Math.min(x + width - 10, s.x));
  g.beginPath();
  g.moveTo(tail - 4, y + 19.5);
  g.lineTo(tail, y + 25);
  g.lineTo(tail + 3, y + 19.5);
  g.fill();
  g.fillStyle = "rgba(42,37,32,0.78)";
  g.textBaseline = "middle";
  g.fillText(s.text, x + 8, y + 10.5);
  g.restore();
}

