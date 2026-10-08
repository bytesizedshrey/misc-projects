"use client";

import { useSyncExternalStore } from "react";

/**
 * Spotify Web Playback SDK, owned by this module, not by React.
 *
 * One Spotify.Player is created once per page load and kept for its lifetime, so component re-renders,
 * StrictMode double-mounts and effect re-runs can never create, connect or disconnect a player.
 * Everything React sees (play state, track, artwork, position, volume) is read from the SDK's own events.
 * Add ?spotifydebug to the URL to log the lifecycle to the console.
 */

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
const REFRESH_MARGIN = 60_000;

export type SpotifyStatus = "unconfigured" | "signed-out" | "connecting" | "ready" | "premium" | "error";
type Tokens = { access: string; refresh: string; expires: number };
type Snap = {
  status: SpotifyStatus;
  paused: boolean;
  title: string;
  art: string;
  clock: { pos: number; dur: number; at: number };
  volume: number;
};

/* ---------------- store ---------------- */
let snap: Snap = {
  status: CLIENT_ID ? "signed-out" : "unconfigured",
  paused: true,
  title: "",
  art: "",
  clock: { pos: 0, dur: 0, at: 0 },
  volume: 60,
};
const serverSnap = snap;
const subs = new Set<() => void>();
const set = (p: Partial<Snap>) => {
  snap = { ...snap, ...p };
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => {
  subs.add(f);
  init();
  return () => void subs.delete(f);
};

const debug = () =>
  typeof window !== "undefined" &&
  (window.location.search.includes("spotifydebug") || !!localStorage.getItem("walkman.debug"));
const log = (...a: unknown[]) => debug() && console.log(`[walkman ${new Date().toISOString().slice(11, 23)}]`, ...a);

/* ---------------- auth (Authorization Code + PKCE, no client secret) ---------------- */
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

type TokenResult = { ok: true; tokens: Tokens } | { ok: false; definitive: boolean };

async function tokenRequest(body: Record<string, string>): Promise<TokenResult> {
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: CLIENT_ID, ...body }),
    });
    if (!res.ok) return { ok: false, definitive: res.status === 400 || res.status === 401 };
    const j = await res.json();
    const prev = readTokens();
    return {
      ok: true,
      tokens: {
        access: j.access_token,
        refresh: j.refresh_token ?? prev?.refresh ?? "",
        expires: Date.now() + j.expires_in * 1000,
      },
    };
  } catch {
    return { ok: false, definitive: false }; // network blip: keep the session, try again next time
  }
}

/** Single-flight: concurrent callers share one refresh, so a rotating refresh token is never spent twice. */
let refreshing: Promise<string | null> | null = null;
export function getToken(force = false): Promise<string | null> {
  const t = readTokens();
  if (!t) return Promise.resolve(null);
  if (!force && Date.now() < t.expires - REFRESH_MARGIN) return Promise.resolve(t.access);
  if (!t.refresh) return Promise.resolve(null);
  refreshing ??= (async () => {
    log("refreshing access token");
    const r = await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refresh });
    if (r.ok) {
      writeTokens(r.tokens);
      return r.tokens.access;
    }
    if (r.definitive) writeTokens(null);
    // transient failure: hand back the old token if it has not actually expired yet
    return !r.definitive && Date.now() < t.expires ? t.access : null;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
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

/* ---------------- the player: created once ---------------- */
let initStarted = false;
let player: any = null;
let device = "";
let instances = 0;

function init() {
  if (initStarted || typeof window === "undefined" || !CLIENT_ID) return;
  initStarted = true;
  (async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if (code) {
      const r = await tokenRequest({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri(),
        code_verifier: sessionStorage.getItem("walkman.pkce") || "",
      });
      url.searchParams.delete("code");
      url.searchParams.delete("state");
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      if (r.ok) writeTokens(r.tokens);
    }
    if (await getToken()) boot();
  })();
  window.addEventListener("pagehide", () => player?.disconnect());
  if (debug()) (window as any).__walkman = { getToken, instances: () => instances, device: () => device };
}

function boot() {
  if (player || snap.status === "connecting") return;
  set({ status: "connecting" });
  const create = () => {
    if (player) return; // never a second instance
    const w = window as any;
    const p = new w.Spotify.Player({
      name: "localhostshrey dial",
      getOAuthToken: (cb: (t: string) => void) => {
        getToken().then((t) => t && cb(t));
      },
      volume: 0.6,
    });
    instances++;
    player = p;
    log("player created (instance", instances + ")");
    p.addListener("ready", ({ device_id }: { device_id: string }) => {
      log("ready, device", device_id, device && device !== device_id ? "(device id CHANGED)" : "");
      device = device_id;
      set({ status: "ready" });
      p.getVolume?.().then((v: number) => typeof v === "number" && set({ volume: Math.round(v * 100) }));
    });
    p.addListener("not_ready", ({ device_id }: { device_id: string }) => {
      log("not_ready", device_id);
      set({ status: "connecting" });
    });
    p.addListener("player_state_changed", (s: any) => {
      if (!s) {
        log("state: null (this device is no longer the active player)");
        set({ paused: true });
        return;
      }
      const tr = s.track_window?.current_track;
      log("state", { paused: s.paused, pos: s.position, track: tr?.name, loading: s.loading });
      const imgs: { url: string }[] = tr?.album?.images ?? [];
      set({
        paused: s.paused,
        title: tr?.name ?? snap.title,
        art: tr ? (imgs[1]?.url ?? imgs[0]?.url ?? "") : snap.art,
        clock: { pos: s.position ?? 0, dur: s.duration ?? 0, at: Date.now() },
      });
    });
    p.addListener("autoplay_failed", () => {
      log("autoplay_failed");
      set({ paused: true });
    });
    p.addListener("account_error", () => set({ status: "premium" }));
    p.addListener("authentication_error", (e: any) => {
      log("authentication_error", e?.message);
      set({ status: "error" });
    });
    p.addListener("initialization_error", (e: any) => {
      log("initialization_error", e?.message);
      set({ status: "error" });
    });
    p.connect().then((ok: boolean) => {
      log("connect()", ok);
      if (!ok) set({ status: "error" });
    });
  };
  const w = window as any;
  if (w.Spotify) return create();
  w.onSpotifyWebPlaybackSDKReady = create;
  if (!document.getElementById("spotify-sdk")) {
    const s = document.createElement("script");
    s.id = "spotify-sdk";
    s.src = "https://sdk.scdn.co/spotify-player.js";
    s.async = true;
    document.body.appendChild(s);
  }
}

/* ---------------- controls ---------------- */
async function startPlaylist(retry = true): Promise<void> {
  const token = await getToken();
  if (!token || !device) return;
  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ context_uri: PLAYLIST_URI }),
  });
  log("start playlist →", res.status);
  if (res.status === 401 && retry) {
    await getToken(true);
    return startPlaylist(false);
  }
}

let busy = false;
async function playPause() {
  const st = snap.status;
  if (st === "unconfigured") return;
  if (st === "signed-out" || st === "error") return startLogin();
  if (st !== "ready" || !player || busy) return;
  player.activateElement?.(); // must happen inside the click, before any await
  busy = true;
  try {
    const state = await player.getCurrentState();
    if (!state) await startPlaylist(); // this device isn't the active one (first press, or another client took over)
    else await player.togglePlay();
  } catch (e) {
    log("playPause failed", e);
  } finally {
    busy = false;
  }
}
const next = () => player?.nextTrack?.();
const prev = () => player?.previousTrack?.();
const setVolume = (v: number) => {
  const n = Math.max(0, Math.min(100, Math.round(v)));
  set({ volume: n });
  player?.setVolume?.(n / 100);
};

export function useSpotify() {
  const s = useSyncExternalStore(subscribe, () => snap, () => serverSnap);
  return { ...s, playPause, next, prev, setVolume };
}
