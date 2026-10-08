"use client";

import { useSpotify } from "./useSpotify";

/** Quick global play/pause for the real Spotify player (same store as the Dial, so they stay in sync). */
export default function MusicToggle() {
  const { status, paused, playPause } = useSpotify();
  if (status === "unconfigured") return null;
  const playing = status === "ready" && !paused;

  return (
    <button
      type="button"
      className="music"
      data-playing={playing}
      aria-label={status === "signed-out" ? "Connect Spotify" : playing ? "Pause" : "Play"}
      aria-pressed={playing}
      onClick={playPause}
    >
      <svg viewBox="0 0 12 12" aria-hidden="true">
        {playing ? <path d="M3 2h2v8H3zM7 2h2v8H7z" /> : <path d="M3.5 2l6 4-6 4z" />}
      </svg>
    </button>
  );
}
