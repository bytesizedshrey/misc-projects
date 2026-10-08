"use client";

import { useEffect, useState } from "react";
import { useSpotify } from "./useSpotify";

/**
 * A small television (after the TV on shwn.design) that is the Spotify player.
 * The three keys are previous / play-pause / next on the real SDK player; the screen shows the current
 * track's artwork with a restrained CRT treatment. The CRT effect is ambient only. It is not driven by the audio.
 */
export default function Tv() {
  const { status, paused, title, artist, art, playPause, next, prev } = useSpotify();
  const playing = status === "ready" && !paused;
  const hasTrack = status === "ready" && !!art;

  const state =
    status === "signed-out" || status === "connecting"
      ? "connect"
      : status === "error" || status === "premium"
        ? "retry"
        : playing
          ? "playing"
          : hasTrack
            ? "paused"
            : "idle";

  const label = state === "connect" ? "CONNECT" : status === "premium" ? "PREMIUM" : state === "retry" ? "RETRY" : "";

  // the on-screen caption shows briefly when the track or play state changes, like a TV's OSD
  const [osd, setOsd] = useState(false);
  useEffect(() => {
    if (!hasTrack) return;
    setOsd(true);
    const t = setTimeout(() => setOsd(false), 4200);
    return () => clearTimeout(t);
  }, [title, artist, playing, hasTrack]);

  // a tiny blip on the screen whenever a key is pressed
  const [blip, setBlip] = useState(0);
  const press = (fn: () => void) => () => {
    setBlip((b) => b + 1);
    fn();
  };

  const tip = [title, artist].filter(Boolean).join(" · ") || (state === "connect" ? "Connect Spotify" : "");

  return (
    <>
      <span className="tv-hint" data-hide={playing} aria-hidden="true">
        wanna hear some songs? <i>→</i>
      </span>
      <div className="tv" data-state={state} title={tip || undefined}>
        <span className="tv__bevel tv__bevel--light" aria-hidden="true" />
        <span className="tv__bevel tv__bevel--dark" aria-hidden="true" />
        <span className="tv__noise" aria-hidden="true" />

        <div className="tv__screen" aria-hidden="true">
          {art && hasTrack && <img key={art} className="tv__art" src={art} alt="" draggable={false} />}
          <span className="tv__static" />
          <span className="tv__lines" />
          <span className="tv__scan" />
          <span className="tv__glow" />
          <span key={blip} className="tv__blip" data-on={blip > 0} />
          {label ? (
            <span className="tv__label">{label}</span>
          ) : (
            <span className="tv__osd" data-show={osd}>
              <b>{title}</b>
              <i>{artist}</i>
            </span>
          )}
          <span className="tv__frame" />
        </div>

        <div className="tv__deck">
          <span className="tv__cell tv__cell--l">
            <button type="button" className="tv__key" aria-label="Previous track" onClick={press(prev)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 8.689c0-.864-.933-1.406-1.683-.977l-7.108 4.061a1.125 1.125 0 0 0 0 1.954l7.108 4.061A1.125 1.125 0 0 0 21 16.811V8.69ZM11.25 8.689c0-.864-.933-1.406-1.683-.977l-7.108 4.061a1.125 1.125 0 0 0 0 1.954l7.108 4.061a1.125 1.125 0 0 0 1.683-.977V8.69Z" />
              </svg>
            </button>
          </span>
          <span className="tv__cell">
            <button
              type="button"
              className="tv__key"
              data-latched={playing}
              aria-label={state === "connect" ? "Connect Spotify" : playing ? "Pause" : "Play"}
              aria-pressed={playing}
              onClick={press(playPause)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {playing ? (
                  <path d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                ) : (
                  <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                )}
              </svg>
            </button>
          </span>
          <span className="tv__cell tv__cell--r">
            <button type="button" className="tv__key" aria-label="Next track" onClick={press(next)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </>
  );
}
