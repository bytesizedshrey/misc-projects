"use client";

import { useSpotify } from "./useSpotify";

/** A small physical Walkman backed by the real Spotify Web Playback SDK.
 *  The object is static; play state and track title reflect the actual player. */
export default function Walkman() {
  const { status, paused, title, playPause, next, prev } = useSpotify();
  const on = status === "ready" && !paused;

  const text =
    status === "ready" || status === "connecting"
      ? title
      : status === "signed-out"
        ? "connect"
        : status === "premium"
          ? "premium"
          : status === "error"
            ? "retry"
            : "";

  return (
    <div className="wm-stage">
      <div className="wm" data-on={on}>
        <div className="wm__plate">
          <span className="wm__grille" aria-hidden="true" />
          <span className="wm__lcd" aria-hidden="true">
            <i className="wm__art" />
            {text && <span className="wm__title">{text}</span>}
          </span>
          <span className="wm__pair">
            <button type="button" className="wm__btn wm__btn--prev" aria-label="Previous track" onClick={prev} />
            <button type="button" className="wm__btn wm__btn--next" aria-label="Next track" onClick={next} />
          </span>
          <button
            type="button"
            className="wm__play"
            aria-label={status === "signed-out" ? "Connect Spotify" : on ? "Pause" : "Play"}
            aria-pressed={on}
            onClick={playPause}
          >
            <span className="wm__glyph" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
