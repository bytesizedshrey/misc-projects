"use client";

import { useEffect, useRef } from "react";
import type { Pond } from "./pond/renderer";

/**
 * The footer: a koi pond that is only discovered by scrolling to the bottom of the page.
 * Nothing is created until the footer is about to enter the viewport; the simulation only runs while it is on screen.
 */
export default function PondFooter() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = frame.current;
    const cv = canvas.current;
    const section = root.current;
    if (!host || !cv || !section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let pond: Pond | null = null;
    let disposed = false;
    let loading = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    let clock = 40;
    let calm = 0; // with reduced motion, animate only until this time (ms) after a touch
    let dprCap = Math.min(window.devicePixelRatio || 1, 1.5);
    const samples: number[] = [];
    let width = 0;
    let height = 0;

    const running = () => !!pond && visible && !document.hidden && (!reduced.matches || performance.now() < calm);

    const tick = (t: number) => {
      raf = 0;
      if (!pond || !running()) {
        last = 0;
        return;
      }
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 1 / 60;
      // if the machine is struggling, drop the render resolution once
      if (last && dprCap > 1) {
        samples.push(t - last);
        if (samples.length >= 90) {
          samples.sort((a, b) => a - b);
          const median = samples[samples.length >> 1];
          samples.length = 0;
          if (median > 24) {
            dprCap = 1;
            pond.resize(width, height, 1);
          }
        }
      }
      last = t;
      clock += dt;
      pond.step(dt, clock);
      pond.render(clock);
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && running()) raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      if (pond && width && height) {
        pond.resize(width, height, Math.min(window.devicePixelRatio || 1, dprCap));
        if (!raf) {
          pond.step(0, clock);
          pond.render(clock);
        }
      }
    };

    const load = async () => {
      if (pond || loading || disposed) return;
      loading = true;
      const { createPond } = await import("./pond/renderer");
      if (disposed) return;
      measure();
      pond = createPond(cv, { fishCount: width < 520 ? 3 : 4 });
      if (!pond) {
        host.dataset.fallback = "";
        return;
      }
      pond.resize(width, height, Math.min(window.devicePixelRatio || 1, dprCap));
      pond.step(0, clock);
      pond.render(clock);
      wake();
    };

    // 1. warm up shortly before the footer arrives, so the first frame is ready when it does
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void load();
      },
      { rootMargin: "400px 0px" },
    );
    near.observe(section);

    // 2. the reveal itself, and pausing the simulation when the pond is out of view
    let revealed = false;
    const seen = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (e.isIntersecting && !revealed && e.intersectionRatio >= 0.14) {
          revealed = true;
          host.dataset.in = "";
          window.setTimeout(() => {
            pond?.intro();
            if (reduced.matches) calm = performance.now() + 4000;
            wake();
          }, 380);
        }
        wake();
      },
      { threshold: [0, 0.14, 0.4] },
    );
    seen.observe(host);

    const ro = new ResizeObserver(measure);
    ro.observe(host);

    // 3. touch
    let pressed = false;
    let lastX = 0;
    let lastY = 0;
    const point = (e: PointerEvent): [number, number] => {
      const r = cv.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * width, ((e.clientY - r.top) / r.height) * height];
    };
    const poke = () => {
      host.dataset.touched = "";
      calm = performance.now() + 4000;
      wake();
    };
    const down = (e: PointerEvent) => {
      if (!pond || e.button > 0) return;
      const [x, y] = point(e);
      pond.tap(x, y);
      pressed = true;
      lastX = x;
      lastY = y;
      poke();
    };
    const move = (e: PointerEvent) => {
      if (!pond || !pressed) return;
      const [x, y] = point(e);
      if (Math.hypot(x - lastX, y - lastY) < 8) return;
      pond.drag(x, y);
      lastX = x;
      lastY = y;
      poke();
    };
    const up = () => {
      pressed = false;
    };
    cv.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    const lost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      pond = null;
    };
    const restored = () => {
      loading = false;
      void load();
    };
    cv.addEventListener("webglcontextlost", lost);
    cv.addEventListener("webglcontextrestored", restored);
    document.addEventListener("visibilitychange", wake);
    reduced.addEventListener("change", wake);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      near.disconnect();
      seen.disconnect();
      ro.disconnect();
      cv.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      cv.removeEventListener("webglcontextlost", lost);
      cv.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", wake);
      reduced.removeEventListener("change", wake);
      pond?.dispose();
      pond = null;
    };
  }, []);

  return (
    <footer className="pond" ref={root}>
      <div className="pond__frame" ref={frame}>
        <canvas
          ref={canvas}
          className="pond__canvas"
          role="img"
          aria-label="Koi swimming in a pond. Tap the water to make ripples, or tap a fish to scare it."
        />
        <span className="pond__rim" aria-hidden="true" />
        <span className="pond__hint" aria-hidden="true">
          tap the water
        </span>
      </div>
    </footer>
  );
}
