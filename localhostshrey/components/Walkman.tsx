"use client";

import { useRef, useState } from "react";

/** A small physical Walkman: silver shell, graphite plate, speaker grille, LCD, metal buttons.
 *  Cursor-following tilt + moving surface light; buttons press in. No audio, no player UI. */
export default function Walkman() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    el.style.setProperty("--tx", nx.toFixed(3));
    el.style.setProperty("--ty", ny.toFixed(3));
    el.style.setProperty("--lx", ((nx + 1) / 2).toFixed(3));
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0");
    el.style.setProperty("--ty", "0");
    el.style.setProperty("--lx", "0.3");
  };

  return (
    <div className="wm-stage" onPointerMove={move} onPointerLeave={leave}>
      <div className="wm" ref={ref} data-on={on}>
        <div className="wm__plate">
          <span className="wm__grille" aria-hidden="true" />
          <span className="wm__lcd" aria-hidden="true">
            <i className="wm__art" />
          </span>
          <span className="wm__pair">
            <button type="button" className="wm__btn wm__btn--prev" aria-label="Previous" />
            <button type="button" className="wm__btn wm__btn--next" aria-label="Next" />
          </span>
          <button
            type="button"
            className="wm__play"
            aria-label={on ? "Pause" : "Play"}
            aria-pressed={on}
            onClick={() => setOn((v) => !v)}
          >
            <span className="wm__glyph" aria-hidden="true" />
          </button>
        </div>
        <span className="wm__sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
