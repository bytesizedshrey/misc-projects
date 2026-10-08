"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "";
export const PLAYLIST_URI = "spotify:playlist:6wbKFb02rfmgurSMqrvwku";
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");
const LS = "walkman.spotify";

type Tokens = { access: string; refresh: string; expires: number };
export type SpotifyStatus = "unconfigured" | "signed-out" | "connecting" | "ready" | "premium" | "error";

/* ---------- PKCE helpers (official Authorization Code with PKCE flow, no client secret) ---------- */
const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const rand = (n: number) => b64url(crypto.getRandomValues(new Uint8Array(n)).buffer);
const redirectUri = () => `${window.location.origin}/`;

const readTokens = (): Tokens | null => {
  try {
    return JSON.parse(localStorage.getItem(LS) || "null");
  } catch {
    return null;
  }
};
const writeTokens = (t: Tokens | null) => {
  try {
    if (t) localStorage.setItem(LS, JSON.stringify(t));
    else localStorage.removeItem(LS);
  } catch {}
};

async function tokenRequest(body: Record<string, string>): Promise<Tokens | null> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...body }),
  });
  if (!res.ok) return null;
  const j = await res.json();
  const prev = readTokens();
  return {
    access: j.access_token,
    refresh: j.refresh_token ?? prev?.refresh ?? "",
    expires: Date.now() + (j.expires_in - 30) * 1000,
  };
}

async function validToken(): Promise<string | null> {
  const t = readTokens();
  if (!t) return null;
  if (Date.now() < t.expires) return t.access;
  if (!t.refresh) return null;
  const n = await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refresh });
  if (!n) {
    writeTokens(null);
    return null;
  }
  writeTokens(n);
  return n.access;
}

export async function startLogin() {
  const verifier = rand(64);
  const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  try {
    sessionStorage.setItem("walkman.pkce", verifier);
  } catch {}
  const q = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${q}`;
}

/* ---------- the hook: reflects the real Spotify Web Playback SDK state ---------- */
export function useSpotify() {
  const [status, setStatus] = useState<SpotifyStatus>(CLIENT_ID ? "signed-out" : "unconfigured");
  const [paused, setPaused] = useState(true);
  const [title, setTitle] = useState("");
  const player = useRef<any>(null);
  const device = useRef<string>("");
  const started = useRef(false);

  const boot = useCallback(async () => {
    if (player.current) return;
    setStatus("connecting");
    const init = () => {
      const w = window as any;
      const p = new w.Spotify.Player({
        name: "localhostshrey walkman",
        getOAuthToken: (cb: (t: string) => void) => validToken().then((t) => t && cb(t)),
        volume: 0.6,
      });
      p.addListener("ready", ({ device_id }: { device_id: string }) => {
        device.current = device_id;
        setStatus("ready");
      });
      p.addListener("player_state_changed", (s: any) => {
        if (!s) return;
        setPaused(s.paused);
        const tr = s.track_window?.current_track;
        if (tr) setTitle(tr.name);
      });
      p.addListener("account_error", () => setStatus("premium"));
      p.addListener("authentication_error", () => {
        writeTokens(null);
        player.current = null;
        setStatus("signed-out");
      });
      p.addListener("initialization_error", () => setStatus("error"));
      p.connect();
      player.current = p;
    };
    const w = window as any;
    if (w.Spotify) return init();
    w.onSpotifyWebPlaybackSDKReady = init;
    if (!document.getElementById("spotify-sdk")) {
      const s = document.createElement("script");
      s.id = "spotify-sdk";
      s.src = "https://sdk.scdn.co/spotify-player.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  // on load: finish a login redirect, or resume a stored session
  useEffect(() => {
    if (!CLIENT_ID) return;
    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const verifier = sessionStorage.getItem("walkman.pkce") || "";
        const t = await tokenRequest({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri(),
          code_verifier: verifier,
        });
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        if (t) writeTokens(t);
      }
      if (await validToken()) boot();
    })();
    return () => player.current?.disconnect();
  }, [boot]);

  const playPause = useCallback(async () => {
    if (status === "unconfigured") return;
    if (status === "signed-out" || status === "error") return startLogin();
    const p = player.current;
    if (!p || status !== "ready") return;
    p.activateElement?.();
    if (!started.current) {
      // first press: start the playlist on this Walkman device
      const token = await validToken();
      if (!token || !device.current) return;
      const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device.current}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ context_uri: PLAYLIST_URI }),
      });
      if (res.ok || res.status === 204) started.current = true;
      return;
    }
    p.togglePlay();
  }, [status]);

  const next = useCallback(() => {
    if (status === "ready" && started.current) player.current?.nextTrack();
  }, [status]);
  const prev = useCallback(() => {
    if (status === "ready" && started.current) player.current?.previousTrack();
  }, [status]);

  return { status, paused, title, playPause, next, prev };
}
