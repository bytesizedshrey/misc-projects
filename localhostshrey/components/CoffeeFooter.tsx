"use client";

import { useEffect, useRef } from "react";
import type { LivingPhoto } from "./cafe/livingPhoto";

/*
 * The footer: a quiet coffee break, found at the bottom of the page.
 *
 * It is a single photograph that has been given a little life (see cafe/livingPhoto.ts): hazy window light that breathes,
 * plants that sway a pixel, a few dust motes in the sunbeams, film grain. He never moves. The page loads without it;
 * it is created only as the footer approaches, and only animates while it is on screen.
 * Without WebGL, or with reduced motion, it is simply the photograph.
 */
const SRC = "/assets/cafe.jpg";
const REVEAL_MS = 2600;

export default function CoffeeFooter() {
  const frame = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = frame.current;
    const img = photo.current;
    const cv = canvas.current;
    if (!host || !img || !cv) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lp: LivingPhoto | null = null;
    let disposed = false;
    let loading = false;
    let visible = false;
    let revealedAt = 0; // performance.now() when the reveal began; 0 until then
    let raf = 0;
    let clock = 0;
    let last = 0;
    let width = 0;
    let height = 0;
    const dpr = () => Math.min(window.devicePixelRatio || 1, 1.25); // the source is small; more pixels would add nothing

    const reveal = () =>
      revealedAt
        ? Math.min(1, (performance.now() - revealedAt) / REVEAL_MS)
        : 0;
    const motion = () => (reduced.matches ? 0 : 1);
    const running = () =>
      !!lp && visible && !document.hidden && !reduced.matches;

    const draw = () =>
      lp?.render(clock, reduced.matches && revealedAt ? 1 : reveal(), motion());

    const tick = (t: number) => {
      raf = 0;
      if (!lp || !running()) {
        last = 0;
        return;
      }
      clock += last ? Math.min((t - last) / 1000, 0.05) : 1 / 60;
      last = t;
      draw();
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && running()) raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      if (lp && width && height) {
        lp.resize(width, height, dpr());
        if (!raf) draw();
      }
    };

    const load = async () => {
      if (lp || loading || disposed) return;
      loading = true;
      try {
        await img.decode();
      } catch {
        /* decode can reject for a cached image; the pixels are still usable */
      }
      const { createLivingPhoto } = await import("./cafe/livingPhoto");
      if (disposed) return;
      measure();
      lp = createLivingPhoto(cv, img, { dust: width < 520 ? 26 : 44 });
      loading = false;
      if (!lp) return; // no WebGL: the plain photograph stays
      lp.resize(width, height, dpr());
      draw();
      host.dataset.gl = "";
      wake();
    };

    // warm up shortly before the footer arrives, so the first frame is ready when it does
    const near = new IntersectionObserver(
      ([e]) => e.isIntersecting && void load(),
      { rootMargin: "400px 0px" },
    );
    near.observe(host);

    // reveal once a little of it is on screen, and keep it (scrolling back up never flickers); run only while visible
    const seen = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (e.isIntersecting && !revealedAt && e.intersectionRatio >= 0.14) {
          revealedAt = performance.now();
          host.dataset.in = "";
          draw();
        }
        wake();
      },
      { threshold: [0, 0.14, 0.4] },
    );
    seen.observe(host);

    const ro = new ResizeObserver(measure);
    ro.observe(host);

    const lost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      lp = null;
      delete host.dataset.gl;
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
      cv.removeEventListener("webglcontextlost", lost);
      cv.removeEventListener("webglcontextrestored", restored);
      document.removeEventListener("visibilitychange", wake);
      reduced.removeEventListener("change", wake);
      lp?.dispose();
      lp = null;
    };
  }, []);

  return (
    <footer className="cafe">
      <div
        className="cafe__frame"
        ref={frame}
        role="img"
        aria-label="A young man with curly hair sips an iced coffee in a sunlit café, with plants hanging in the window light."
      >
        <img
          className="cafe__photo"
          ref={photo}
          src={SRC}
          alt=""
          width={736}
          height={414}
          decoding="async"
        />
        <canvas className="cafe__canvas" ref={canvas} aria-hidden="true" />
        <span className="cafe__rim" aria-hidden="true" />
      </div>
    </footer>
  );
}
