"use client";

import { useEffect, useRef, useState } from "react";
import { createAudio, type Audio } from "./park/audio";
import { SUN, matrices, project, unproject } from "./park/camera";
import { createRenderer } from "./park/gl";
import { buildGroundMap, buildLayout } from "./park/layout";
import { paintPaper, parseColor } from "./park/paper";
import { paintStaticProps } from "./park/props";
import { drawSay, makeLayers, renderLayers } from "./park/render";
import { createWorld, tapWorld, updateWorld, type World } from "./park/sim";
import { clearTreeCache } from "./park/trees";
import { clearPropCache } from "./park/props";

const FRAME_MS = 1000 / 30;

/**
 * The park at the bottom of the page: a late-afternoon aerial view where
 * people wander the paths, a man smokes on the pond bench, ducks chase
 * crumbs and a rowboat drifts. Taps feed the ducks, scatter the pigeons and
 * pop bubbles. It only runs while on screen.
 */
export default function Park() {
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const paperRef = useRef<HTMLCanvasElement>(null);
  const topRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<Audio | null>(null);
  const [live, setLive] = useState(false);
  const [sound, setSound] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const glCanvas = glRef.current;
    const paper = paperRef.current;
    const top = topRef.current;
    if (!stage || !glCanvas || !paper || !top) return;

    const renderer = createRenderer(glCanvas);
    if (!renderer) {
      setUnsupported(true);
      return;
    }
    const gl = renderer;
    const audio = createAudio();
    audioRef.current = audio;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Dev only: ?still previews the reduced-motion path without an OS setting.
    const forceStill = process.env.NODE_ENV !== "production" && window.location.search.includes("still");
    const reduced = { get matches() { return mq.matches || forceStill; } };

    let world: World | null = null;
    let layers: ReturnType<typeof makeLayers> | null = null;
    let props: ReturnType<typeof paintStaticProps> | null = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = false;
    let raf = 0;
    let last = 0;
    let lastDraw = 0;
    let resizeTimer = 0;
    let font = "system-ui, sans-serif";

    const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";
    const paintEdge = () => {
      if (!width) return;
      const css = getComputedStyle(document.documentElement).getPropertyValue("--paper");
      const dark = isDark();
      const bg = parseColor(css, dark ? { r: 13, g: 13, b: 13 } : { r: 246, g: 243, b: 238 });
      paintPaper(paper, width, height, bg, dark);
    };

    const build = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return false;
      width = w;
      height = h;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const glScale = Math.min(dpr, 1.5);
      clearTreeCache();
      clearPropCache();
      const L = buildLayout(w, h);
      world = createWorld(L, dpr, audio.sfx);
      layers = makeLayers(w, h, dpr);
      props = paintStaticProps(w, h, dpr, L.m, L.benches, L.blankets, L.bin, L.pond, L.reeds);
      const map = buildGroundMap(L);
      gl.setMap(map.data, map.mw, map.mh);
      gl.resize(Math.round(w * glScale), Math.round(h * glScale));
      glCanvas.style.width = `${w}px`;
      glCanvas.style.height = `${h}px`;
      top.width = w * dpr;
      top.height = h * dpr;
      top.style.width = `${w}px`;
      top.style.height = `${h}px`;
      font = getComputedStyle(stage).fontFamily || font;
      paintEdge();
      return true;
    };

    const ripples = new Float32Array(48);
    const frame = () => {
      if (!world || !layers || !props) return;
      const w = world;
      renderLayers(w, layers, props, dpr);
      ripples.fill(0);
      let n = 0;
      for (let i = 0; i < 80 && n < 12; i++) {
        const r = w.ripples[(w.rippleNext - 1 - i + 160) % 80];
        if (!r.alive || r.a < 0.3 || r.age > 4) continue;
        ripples[4 * n] = r.x;
        ripples[4 * n + 1] = r.y;
        ripples[4 * n + 2] = r.age;
        ripples[4 * n + 3] = Math.min(1.2, 1.6 * r.a);
        n++;
      }
      const mx = matrices();
      gl.draw(
        {
          w: w.L.w, h: w.L.h, vw: w.L.vw, vh: w.L.vh, m: w.L.m, time: w.time, wind: w.wind,
          wcx: mx.wx, wcy: mx.wy, inv: [mx.ia, mx.ib, mx.ic, mx.id],
          sunX: SUN.x, sunY: SUN.y, ripples, focus: w.smoker.mouth.y / w.L.vh, dim: isDark() ? 0.8 : 1,
        },
        [layers.sprites, layers.shade, layers.air, layers.fore, layers.canopy],
      );
      const g = top.getContext("2d")!;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, top.width, top.height);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawSay(g, w, w.L.vw, font);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < FRAME_MS) return;
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      lastDraw = now - ((now - lastDraw) % FRAME_MS);
      if (!visible || !world) return;
      if (process.env.NODE_ENV === "production") {
        updateWorld(world, dt);
        frame();
        return;
      }
      // Dev only: expose the simulation so behaviour can be inspected and
      // fast-forwarded from the console (window.__park).
      const t0 = performance.now();
      updateWorld(world, dt);
      const t1 = performance.now();
      frame();
      const t2 = performance.now();
      const dbg = ((window as unknown as { __park?: Record<string, unknown> }).__park ||= { frames: 0, sim: 0, draw: 0 });
      dbg.world = world;
      dbg.project = (x: number, y: number, z: number) => project(x, y, z, { x: 0, y: 0, k: 1 });
      dbg.step = (sec: number) => {
        for (let i = 0; i < sec * 30; i++) updateWorld(world!, 1 / 30);
      };
      dbg.frames = (dbg.frames as number) + 1;
      dbg.sim = (dbg.sim as number) * 0.9 + (t1 - t0) * 0.1;
      dbg.draw = (dbg.draw as number) * 0.9 + (t2 - t1) * 0.1;
    };

    const stillFrame = () => {
      if (!world) return;
      // Let the park settle for a few seconds, then hold a single frame.
      for (let i = 0; i < 90; i++) updateWorld(world, 1 / 30);
      frame();
    };

    const start = () => {
      if (!build()) return;
      if (reduced.matches) stillFrame();
      else if (!raf) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        audio.setVisible(visible);
        if (visible) {
          setLive(true);
          last = 0;
          // A held frame may have been dropped while off screen; repaint it.
          if (reduced.matches && world) frame();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(stage);

    const onPointer = (e: PointerEvent) => {
      if (!world || reduced.matches) return;
      const rect = stage.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const at = unproject(sx, sy, { x: 0, y: 0 });
      tapWorld(world, at.x, at.y, sx, sy);
    };
    stage.addEventListener("pointerdown", onPointer);

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (reduced.matches) {
          if (build()) stillFrame();
        } else build();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    const mo = new MutationObserver(() => {
      paintEdge();
      if (reduced.matches) frame();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });

    start();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      stage.removeEventListener("pointerdown", onPointer);
      io.disconnect();
      mo.disconnect();
      audio.dispose();
      audioRef.current = null;
      gl.dispose();
    };
  }, []);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    audioRef.current?.setEnabled(next);
  };

  return (
    <footer className="park" data-live={live} data-unsupported={unsupported || undefined}>
      <div className="park__wrap">
        <div
          ref={stageRef}
          className="park__stage"
          role="img"
          aria-label="A park seen from above on a late afternoon: a man smokes on a bench by the pond while people walk the paths, a rowboat crosses the water and families picnic on the lawn."
        >
          <canvas ref={glRef} className="park__layer" />
          <canvas ref={paperRef} className="park__layer park__layer--paper" />
          <canvas ref={topRef} className="park__layer park__layer--top" />
        </div>
        <button
          type="button"
          className="park__sound"
          aria-label={sound ? "Turn park sound off" : "Turn park sound on"}
          aria-pressed={sound}
          onClick={toggleSound}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5 6 9H3v6h3l5 4V5z" />
            {sound ? (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </>
            ) : (
              <path d="m16 9 5 6m0-6-5 6" />
            )}
          </svg>
        </button>
      </div>
    </footer>
  );
}
