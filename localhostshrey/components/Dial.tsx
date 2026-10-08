"use client";

import { useEffect, useRef, useState } from "react";
import { useSpotify } from "./useSpotify";

const SWEEP = 270; // degrees of knob travel for 0 → 100%

/** The Dial: a black pill with a recessed level track, two small buttons and a knurled knob.
 *  Backed by the real Spotify Web Playback SDK.
 *  – knob: drag round to set volume; click the centre cap (or Space/Enter) to play / pause
 *  – small buttons: previous / next track
 *  – track: playback progress, with the current album artwork at its leading end */
export default function Dial() {
  const { status, paused, title, art, clock, volume, setVolume, playPause, next, prev } = useSpotify();
  const playing = status === "ready" && !paused;

  // playback progress follows the real player position
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const calc = () => {
      if (!clock.dur) return 0;
      const pos = playing ? clock.pos + (Date.now() - clock.at) : clock.pos;
      return Math.max(0, Math.min(1, pos / clock.dur));
    };
    setProgress(calc());
    if (!playing) return;
    const id = setInterval(() => setProgress(calc()), 500);
    return () => clearInterval(id);
  }, [clock, playing]);

  // knob drag
  const knob = useRef<HTMLDivElement>(null);
  const drag = useRef<{ last: number; moved: number } | null>(null);
  const angleOf = (e: React.PointerEvent) => {
    const r = knob.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const down = (e: React.PointerEvent) => {
    knob.current?.setPointerCapture(e.pointerId);
    drag.current = { last: angleOf(e), moved: 0 };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const a = angleOf(e);
    let delta = a - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.last = a;
    d.moved += Math.abs(delta);
    if (d.moved > 4) setVolume(volume + (delta / SWEEP) * 100);
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (d && d.moved <= 4) playPause();
  };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") (e.preventDefault(), setVolume(volume + 5));
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") (e.preventDefault(), setVolume(volume - 5));
    else if (e.key === " " || e.key === "Enter") (e.preventDefault(), playPause());
  };

  const note =
    status === "signed-out" ? "connect spotify" : status === "premium" ? "premium only" : status === "error" ? "retry" : "";

  return (
    <div className="dl-stage">
      <span className="dl-hint" data-hide={playing} aria-hidden="true">
        wanna hear some songs? <i>→</i>
      </span>
      <div className="dl" data-playing={playing} title={title || undefined}>
        <span className="dl__track">
          <span
            className="dl__fill"
            style={{ ["--p" as string]: progress } as React.CSSProperties}
          >
            {art && <img className="dl__art" src={art} alt="" draggable={false} />}
          </span>
          {note && <span className="dl__note">{note}</span>}
        </span>

        <span className="dl__pair">
          <button type="button" className="dl__btn" aria-label="Previous track" onClick={prev}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zM20 6v12L9.5 12z" /></svg>
          </button>
          <button type="button" className="dl__btn" aria-label="Next track" onClick={next}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2zM4 6l10.5 6L4 18z" /></svg>
          </button>
        </span>

        <div
          className="dl__knob"
          ref={knob}
          role="slider"
          tabIndex={0}
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={volume}
          aria-valuetext={`${volume}%${playing ? ", playing" : ""}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={key}
        >
          <span className="dl__ring" style={{ transform: `rotate(${(volume / 100) * SWEEP - SWEEP / 2}deg)` }} />
          <span className="dl__well" />
          <span className="dl__cap">{volume}%</span>
        </div>
      </div>
    </div>
  );
}
