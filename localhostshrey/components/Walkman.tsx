"use client";

import { useRef, useState } from "react";

/** A small physical Walkman: cursor-following tilt, buttons that press in. No audio, no UI chrome. */
export default function Walkman() {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
    el.style.setProperty("--tx", String(nx));
    el.style.setProperty("--ty", String(ny));
  };
  const leave = () => {
    ref.current?.style.setProperty("--tx", "0");
    ref.current?.style.setProperty("--ty", "0");
  };

  return (
    <div className="wm-stage" onPointerMove={move} onPointerLeave={leave}>
      <div className="wm" ref={ref} data-playing={playing}>
        <span className="wm__grille" aria-hidden="true" />
        <span className="wm__screen" aria-hidden="true">
          <i className="wm__glyph" />
        </span>
        <span className="wm__pair">
          <button type="button" className="wm__btn" aria-label="Previous" />
          <button type="button" className="wm__btn" aria-label="Next" />
        </span>
        <button
          type="button"
          className="wm__play"
          aria-label={playing ? "Pause" : "Play"}
          aria-pressed={playing}
          onClick={() => setPlaying((p) => !p)}
        >
          <span className="wm__playmark" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
