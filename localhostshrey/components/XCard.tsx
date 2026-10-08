"use client";

import { useEffect, useRef } from "react";
import { createMetal, type Metal } from "./metal";

/**
 * A black physical card (after the card on shwn.design) in the same material
 * language as the Off screen cards. It tilts toward the cursor on a spring,
 * lifts slightly and catches a soft moving light; all on the GPU via CSS 3D.
 */
export default function XCard() {
  const card = useRef<HTMLAnchorElement>(null);
  const s = useRef({ x: 0, y: 0, l: 0, vx: 0, vy: 0, vl: 0, tx: 0, ty: 0, tl: 0, raf: 0, t: 0 });
  const reduce = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const metal = useRef<Metal | null>(null);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = s.current;
    const cv = canvas.current;
    let ro: ResizeObserver | undefined;
    let mo: MutationObserver | undefined;
    if (cv) {
      const m = createMetal(cv);
      if (m) {
        metal.current = m;
        /* silver in light mode, gunmetal in dark: follow the theme as it changes */
        const sync = () => m.setLight(document.documentElement.dataset.theme !== "dark");
        sync();
        mo = new MutationObserver(sync);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        card.current?.setAttribute("data-gl", "1");
        /* the card is display:none until placed, so wait for it to get a size */
        ro = new ResizeObserver(() => m.resize());
        ro.observe(cv);
      }
    }
    return () => {
      cancelAnimationFrame(st.raf);
      ro?.disconnect();
      mo?.disconnect();
      metal.current?.destroy();
      metal.current = null;
    };
  }, []);

  const tick = (now: number) => {
    const st = s.current;
    const el = card.current;
    if (!el) return;
    const dt = Math.min((now - (st.t || now)) / 1000, 1 / 30) || 1 / 60;
    st.t = now;
    const K = 190; // stiffness
    const D = 17; // damping: a little under critical, so it settles with a slight overshoot
    st.vx += (K * (st.tx - st.x) - D * st.vx) * dt;
    st.vy += (K * (st.ty - st.y) - D * st.vy) * dt;
    st.vl += (K * (st.tl - st.l) - D * st.vl) * dt;
    st.x += st.vx * dt;
    st.y += st.vy * dt;
    st.l += st.vl * dt;
    el.style.setProperty("--nx", st.x.toFixed(4));
    el.style.setProperty("--ny", st.y.toFixed(4));
    el.style.setProperty("--lift", Math.max(0, st.l).toFixed(4));
    metal.current?.render(st.x, st.y, st.l);
    const still =
      Math.abs(st.tx - st.x) < 0.0005 && Math.abs(st.ty - st.y) < 0.0005 && Math.abs(st.tl - st.l) < 0.0005 &&
      Math.abs(st.vx) < 0.001 && Math.abs(st.vy) < 0.001 && Math.abs(st.vl) < 0.001;
    if (still) {
      st.raf = 0;
      st.t = 0;
    } else {
      st.raf = requestAnimationFrame(tick);
    }
  };

  const kick = () => {
    if (reduce.current) return;
    if (!s.current.raf) s.current.raf = requestAnimationFrame(tick);
  };

  const move = (e: React.PointerEvent) => {
    /* measure the (untilted) wrapper so the tilt doesn't feed back into the pointer position */
    const box = card.current?.parentElement?.getBoundingClientRect();
    if (!box) return;
    const st = s.current;
    st.tx = Math.max(-1, Math.min(1, ((e.clientX - box.left) / box.width) * 2 - 1));
    st.ty = Math.max(-1, Math.min(1, ((e.clientY - box.top) / box.height) * 2 - 1));
    st.tl = 1;
    kick();
  };

  const leave = () => {
    const st = s.current;
    st.tx = 0;
    st.ty = 0;
    st.tl = 0;
    kick();
  };

  return (
    <a
      ref={card}
      className="xcard"
      href="https://x.com/bytesizedshrey"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Shreyash Gajbhiye, @bytesizedshrey on X"
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <span className="xcard__face" aria-hidden="true">
        <canvas ref={canvas} className="xcard__gl" />
        <svg className="xcard__x" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="xcard__sheen" />
      </span>
      <span className="xcard__who">
        <span className="xcard__name">Shreyash Gajbhiye</span>
        <span className="xcard__handle">@bytesizedshrey</span>
      </span>
      <span className="xcard__role">Design Engineer</span>
    </a>
  );
}
