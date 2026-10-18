"use client";

import { useEffect, useRef } from "react";
import { drawPrint, stampDate, stampTime, type Print } from "./desk/print";
import { createSfx } from "./desk/sound";

/*
 * The footer: a desk at the end of the page, and one thing to do on it: leave a mark.
 *
 * A graphite rubber stamp follows your pointer with a little weight (it lags, tilts as it travels, and its shadow
 * lengthens as it lifts). Press and it comes down; let go and it lifts to show the print: "visited", today's date and
 * the real time, in red. Every print is different. The stamp runs out of ink, so prints thin and break up until you
 * dab it on the pad. Your marks are kept on this device for next time.
 *
 * Nothing moves until it is touched. Touch: tap the sheet and the stamp travels there and presses. Keyboard: tab to the
 * stamp, arrow keys move it, Enter stamps. Reduced motion: no spring, no set-down; the stamp goes where you point.
 */

const SHEET_ROT = -1.2; // degrees; the sheet is not quite square to the desk, and the maths below knows it
const STORE = "desk.prints.v1";
const SOUND = "desk.sound";
const MAX_SAVED = 12;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Rect = { x: number; y: number; w: number; h: number };

export default function StampDesk() {
  const frame = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const sheetCanvas = useRef<HTMLCanvasElement>(null);
  const pad = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLParagraphElement>(null);
  const soundBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const host = frame.current!;
    const sheetEl = sheet.current!;
    const canvas = sheetCanvas.current!;
    const padEl = pad.current!;
    const stampEl = stamp.current!;
    const lineEl = line.current!;
    const soundEl = soundBtn.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sfx = createSfx();

    // ---- layout, in frame coordinates
    let W = 0,
      H = 0,
      R = 59; // stamp plate radius
    let sheetR: Rect = { x: 0, y: 0, w: 1, h: 1 };
    let padR: Rect = { x: 0, y: 0, w: 1, h: 1 };
    let rest = { x: 0, y: 0 };
    let dpr = 1;

    // ---- state
    const S = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
      lift: 0,
      liftV: 0,
      press: 0,
      pressV: 0,
      tilt: 0,
    };
    let carrying = false; // a mouse is over the desk, so the stamp is in hand
    let pressing = false;
    let pressStart = 0;
    let ink = 1;
    let warnedLow = false;
    let prints: Print[] = [];
    let soundOn = false;
    let raf = 0;
    let last = 0;
    let idleTimer = 0;
    let lineTimer = 0;
    let revealed = false;
    let touchJob = 0;
    // after a press the stamp lifts away to show what it left, then comes back to the hand
    let peelUntil = 0;
    let peelAt = { x: 0, y: 0 };
    let peelTimer = 0;
    let pointer = { x: 0, y: 0 };

    const setLine = (text: string) => {
      if (lineEl.textContent === text) return;
      window.clearTimeout(lineTimer);
      lineEl.dataset.on = "";
      delete lineEl.dataset.on;
      lineTimer = window.setTimeout(() => {
        lineEl.textContent = text;
        lineEl.dataset.on = "";
      }, 160);
    };

    // ---- the sheet: prints are data; this redraws them all
    const toSheet = (px: number, py: number) => {
      // frame point -> point on the (slightly rotated) sheet, as fractions of the sheet
      const cx = sheetR.x + sheetR.w / 2,
        cy = sheetR.y + sheetR.h / 2;
      const a = (-SHEET_ROT * Math.PI) / 180;
      const dx = px - cx,
        dy = py - cy;
      const lx = dx * Math.cos(a) - dy * Math.sin(a),
        ly = dx * Math.sin(a) + dy * Math.cos(a);
      return { u: lx / sheetR.w + 0.5, v: ly / sheetR.h + 0.5 };
    };

    const redraw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, sheetR.w, sheetR.h);
      for (const p of prints) drawPrint(ctx, p, sheetR.w, sheetR.h, dpr);
    };

    const measure = () => {
      const f = host.getBoundingClientRect();
      W = host.clientWidth;
      H = host.clientHeight;
      const rel = (el: HTMLElement): Rect => {
        // layout size (unaffected by the sheet's tiny rotation)
        return {
          x: el.offsetLeft,
          y: el.offsetTop,
          w: el.offsetWidth,
          h: el.offsetHeight,
        };
      };
      sheetR = rel(sheetEl);
      padR = rel(padEl);
      R = stampEl.offsetWidth / 2;
      rest = { x: padR.x + padR.w / 2, y: padR.y - R * 0.8 };
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(sheetR.w * dpr);
      canvas.height = Math.round(sheetR.h * dpr);
      redraw();
      if (!carrying && !pressing) {
        S.tx = rest.x;
        S.ty = rest.y;
        if (!raf && S.x === 0 && S.y === 0) {
          S.x = rest.x;
          S.y = rest.y;
        }
      }
      void f;
      paint();
      wake();
    };

    // ---- the stamp's body: weight, lift, tilt and a shadow that tells you how high it is
    const paint = () => {
      const s = 1 + 0.05 * S.lift - 0.045 * S.press;
      const sx = 2 + 13 * S.lift - 1.5 * S.press;
      const sy = 3 + 22 * S.lift - 1.5 * S.press;
      const blur = 3 + 15 * S.lift;
      const a = 0.42 - 0.16 * S.lift + 0.06 * S.press;
      stampEl.style.transform = `translate3d(${S.x - R}px, ${S.y - R}px, 0) rotate(${S.tilt}deg) scale(${s})`;
      stampEl.style.filter = `drop-shadow(${sx}px ${sy}px ${blur}px rgba(38, 24, 6, ${a}))`;
    };

    const spring = (
      pos: number,
      vel: number,
      target: number,
      k: number,
      c: number,
      dt: number,
    ): [number, number] => {
      const acc = k * (target - pos) - c * vel;
      const v = vel + acc * dt;
      return [pos + v * dt, v];
    };

    const frameStep = (t: number) => {
      raf = 0;
      const dt = last ? Math.min((t - last) / 1000, 0.033) : 1 / 60;
      last = t;
      if (reduced.matches) {
        S.x = S.tx;
        S.y = S.ty;
        S.vx = S.vy = 0;
        S.lift = carrying && !pressing ? 1 : 0;
        S.press = pressing ? 1 : 0;
        S.tilt = 0;
      } else {
        const k = 360,
          c = 2 * Math.sqrt(k) * 0.8;
        [S.x, S.vx] = spring(S.x, S.vx, S.tx, k, c, dt);
        [S.y, S.vy] = spring(S.y, S.vy, S.ty, k, c, dt);
        [S.lift, S.liftV] = spring(
          S.lift,
          S.liftV,
          carrying && !pressing ? 1 : 0,
          520,
          2 * Math.sqrt(520) * 0.9,
          dt,
        );
        [S.press, S.pressV] = spring(
          S.press,
          S.pressV,
          pressing ? 1 : 0,
          1100,
          2 * Math.sqrt(1100) * 0.85,
          dt,
        );
        S.tilt +=
          (clamp(S.vx / 1500, -1, 1) * 7 - S.tilt) * (1 - Math.exp(-11 * dt));
      }
      paint();
      const moving =
        Math.abs(S.tx - S.x) > 0.25 ||
        Math.abs(S.ty - S.y) > 0.25 ||
        Math.abs(S.vx) + Math.abs(S.vy) > 2 ||
        Math.abs(S.tilt) > 0.05;
      const targetLift = carrying && !pressing ? 1 : 0;
      const settling =
        Math.abs(S.lift - targetLift) > 0.004 ||
        Math.abs(S.press - (pressing ? 1 : 0)) > 0.004 ||
        Math.abs(S.liftV) > 0.01;
      if (moving || settling) raf = requestAnimationFrame(frameStep);
      else last = 0; // asleep: nothing is drawn until something is touched
    };
    function wake() {
      if (!raf && revealed) raf = requestAnimationFrame(frameStep);
    }

    // ---- what a press does depends on where the stamp is
    const inRect = (r: Rect, x: number, y: number, pad = 0) =>
      x > r.x - pad &&
      x < r.x + r.w + pad &&
      y > r.y - pad &&
      y < r.y + r.h + pad;
    const pan = () => clamp((S.x / Math.max(W, 1)) * 2 - 1, -1, 1) * 0.6;

    const save = () => {
      try {
        localStorage.setItem(STORE, JSON.stringify(prints.slice(-MAX_SAVED)));
      } catch {}
    };

    const strike = (pressure: number) => {
      if (inRect(padR, S.x, S.y, 8)) {
        // dabbing the pad: the stamp takes up ink
        const was = ink;
        ink = 1;
        warnedLow = false;
        padEl.dataset.dab = "";
        window.setTimeout(() => delete padEl.dataset.dab, 220);
        if (soundOn) sfx.pad(pan());
        if (was < 0.55) setLine("there we go.");
        return;
      }
      if (inRect(sheetR, S.x, S.y, -R * 0.35)) {
        const now = new Date();
        const { u, v } = toSheet(S.x, S.y);
        const p: Print = {
          x: u,
          y: v,
          d: (R * 2) / sheetR.w,
          rot: (SHEET_ROT * -1 * Math.PI) / 180 + (Math.random() - 0.5) * 0.32,
          ink,
          press: pressure,
          seed: (Math.random() * 1e9) | 0,
          date: stampDate(now),
          time: stampTime(now),
        };
        prints.push(p);
        drawPrint(ctx, p, sheetR.w, sheetR.h, dpr);
        save();
        ink = Math.max(0, ink - 0.17);
        if (soundOn) sfx.stamp(pressure, pan());
        if ("vibrate" in navigator) navigator.vibrate?.(8);
        if (prints.length === 1) setLine("you were here.");
        else if (ink < 0.3 && !warnedLow) {
          warnedLow = true;
          setLine("ink's running low.");
        } else if (prints.length === 9) setLine("that's a full page.");
        return;
      }
      if (soundOn) sfx.knock(pan());
    };

    // ---- input
    const local = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onSound = (e: Event) =>
      !!(e.target as HTMLElement).closest(".desk__sound");

    const aim = () => {
      let x = pointer.x,
        y = pointer.y;
      if (
        performance.now() < peelUntil &&
        Math.hypot(pointer.x - peelAt.x, pointer.y - peelAt.y) < 34
      ) {
        x = peelAt.x + R * 0.5;
        y = peelAt.y - R * 1.7;
      }
      S.tx = clamp(x, R * 0.5, W - R * 0.5);
      S.ty = clamp(y, R * 0.5, H - R * 0.5);
      wake();
    };
    const peel = () => {
      peelAt = { x: S.x, y: S.y };
      peelUntil = performance.now() + 1250;
      window.clearTimeout(peelTimer);
      aim();
      peelTimer = window.setTimeout(aim, 1260);
    };

    const goRest = () => {
      carrying = false;
      pressing = false;
      peelUntil = 0;
      delete host.dataset.carry;
      S.tx = rest.x;
      S.ty = rest.y;
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // a drag on touch is a scroll
      pointer = local(e);
      carrying = true;
      if (!onSound(e)) host.dataset.carry = "";
      else delete host.dataset.carry;
      if (!pressing) setLineHover();
      aim();
    };
    let hovered = false;
    const setLineHover = () => {
      if (hovered || prints.length) return;
      hovered = true;
      setLine("press to stamp.");
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      goRest();
    };

    const press = () => {
      pressing = true;
      pressStart = performance.now();
      wake();
    };
    const release = (pressure: number) => {
      strike(pressure);
      pressing = false;
      peel();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button > 0 || onSound(e) || !revealed) return;
      pointer = local(e);
      peelUntil = 0; // a new press cancels any peel in progress
      S.tx = clamp(pointer.x, R * 0.5, W - R * 0.5);
      S.ty = clamp(pointer.y, R * 0.5, H - R * 0.5);
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        // a tap: the stamp travels there, comes down, prints, and goes home after a while
        window.clearTimeout(idleTimer);
        window.clearTimeout(touchJob);
        carrying = true;
        wake();
        const t0 = performance.now();
        const arrive = () => {
          const near =
            Math.hypot(S.tx - S.x, S.ty - S.y) < 5 &&
            Math.abs(S.vx) + Math.abs(S.vy) < 40;
          if (near || performance.now() - t0 > 380 || reduced.matches) {
            // if it has not quite arrived (a slow device), it settles at the tap before it comes down
            S.x = S.tx;
            S.y = S.ty;
            S.vx = S.vy = 0;
            press();
            touchJob = window.setTimeout(() => {
              release(0.78);
              idleTimer = window.setTimeout(goRest, 2600);
            }, 130);
          } else touchJob = window.setTimeout(arrive, 16);
        };
        arrive();
        return;
      }
      carrying = true;
      // a press means the hand has stopped: the stamp settles under the pointer, so a print never lands away from the click
      S.x = S.tx;
      S.y = S.ty;
      S.vx = S.vy = 0;
      host.setPointerCapture?.(e.pointerId);
      press();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.pointerType === "pen") return;
      if (!pressing) return;
      const held = performance.now() - pressStart;
      release(0.55 + 0.45 * clamp(held / 320, 0, 1));
    };
    const onCancel = () => {
      pressing = false;
      wake();
    };

    // keyboard: the stamp is a button you can walk around the desk
    const onKey = (e: KeyboardEvent) => {
      const step = 32;
      const move = (dx: number, dy: number) => {
        e.preventDefault();
        carrying = true;
        S.tx = clamp(
          (carrying && S.tx ? S.tx : S.x) + dx,
          R * 0.5,
          W - R * 0.5,
        );
        S.ty = clamp(
          (carrying && S.ty ? S.ty : S.y) + dy,
          R * 0.5,
          H - R * 0.5,
        );
        wake();
      };
      if (e.key === "ArrowLeft") move(-step, 0);
      else if (e.key === "ArrowRight") move(step, 0);
      else if (e.key === "ArrowUp") move(0, -step);
      else if (e.key === "ArrowDown") move(0, step);
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (pressing) return;
        carrying = true;
        press();
        window.setTimeout(() => release(0.8), 130);
      } else if (e.key === "Escape") goRest();
    };
    const onBlur = () => {
      if (!host.matches(":hover")) goRest();
    };

    // ---- sound toggle (off by default)
    try {
      soundOn = localStorage.getItem(SOUND) === "1";
    } catch {}
    const syncSound = () => {
      soundEl.setAttribute("aria-pressed", String(soundOn));
      soundEl.textContent = soundOn ? "sound on" : "sound off";
    };
    syncSound();
    const toggleSound = () => {
      soundOn = !soundOn;
      try {
        localStorage.setItem(SOUND, soundOn ? "1" : "0");
      } catch {}
      syncSound();
      if (soundOn) sfx.knock(0);
    };
    soundEl.addEventListener("click", toggleSound);

    // ---- earlier marks
    try {
      const raw = localStorage.getItem(STORE);
      if (raw)
        prints = (JSON.parse(raw) as Print[])
          .filter((p) => typeof p.x === "number")
          .slice(-MAX_SAVED);
    } catch {}
    if (prints.length) setLine("good to see you again.");
    else setLine("leave a mark.");

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onCancel);
    stampEl.addEventListener("keydown", onKey);
    stampEl.addEventListener("blur", onBlur);

    // ---- arrival: it sits below the fold; objects are set down once it is a little way into view
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    measure();
    S.x = S.tx = rest.x;
    S.y = S.ty = rest.y;
    paint();
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !revealed && e.intersectionRatio >= 0.14) {
          revealed = true;
          host.dataset.in = "";
          measure();
          wake();
        }
      },
      { threshold: [0, 0.14, 0.4] },
    );
    io.observe(host);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      window.clearTimeout(lineTimer);
      window.clearTimeout(touchJob);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onCancel);
      stampEl.removeEventListener("keydown", onKey);
      stampEl.removeEventListener("blur", onBlur);
      soundEl.removeEventListener("click", toggleSound);
    };
  }, []);

  return (
    <footer className="desk">
      <div className="desk__frame" ref={frame}>
        <div className="desk__surface" aria-hidden="true" />
        <div
          className="desk__sheet"
          ref={sheet}
          style={{ ["--rot" as string]: `${SHEET_ROT}deg` }}
        >
          <span className="desk__head" aria-hidden="true">
            visitor log
          </span>
          <canvas
            className="desk__prints"
            ref={sheetCanvas}
            aria-hidden="true"
          />
        </div>
        <div className="desk__pad" ref={pad} aria-hidden="true">
          <div className="desk__felt" />
        </div>
        <div className="desk__stamp-wrap">
          <div
            className="desk__stamp"
            ref={stamp}
            role="button"
            tabIndex={0}
            aria-label="Visitor stamp. Press Enter to stamp the sheet, arrow keys to move it, Escape to put it back."
          >
            <span className="desk__plate" />
            <span className="desk__knob" />
          </div>
        </div>
        <span className="desk__light" aria-hidden="true" />
        <p className="desk__line" ref={line} aria-live="polite" />
        <button
          className="desk__sound"
          ref={soundBtn}
          type="button"
          aria-pressed="false"
        >
          sound off
        </button>
        <span className="desk__rim" aria-hidden="true" />
      </div>
    </footer>
  );
}
