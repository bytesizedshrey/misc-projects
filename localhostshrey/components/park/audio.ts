// A little synthesised soundscape: wind in the leaves, distant birdsong, and
// small sounds for what happens in the park. Off until the visitor turns it
// on (browsers require a gesture anyway) and silent while the park is out
// of view.

import { rand } from "./util";
import type { Sfx } from "./sim";

export interface Audio {
  readonly enabled: boolean;
  setEnabled(on: boolean): void;
  setVisible(v: boolean): void;
  sfx: Sfx;
  dispose(): void;
}

const pick = <T,>(l: T[]) => l[(Math.random() * l.length) | 0];

export function createAudio(): Audio {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let wind: { gain: GainNode; filter: BiquadFilterNode } | null = null;
  let noise: Record<"white" | "pink", AudioBuffer> | null = null;
  let on = false;
  let visible = false;
  let timer = 0;
  let nextBird = 0;
  let nextChat = 0;
  let lastWind = 0;
  const live: AudioScheduledSourceNode[] = [];

  function buffers(c: AudioContext) {
    if (noise) return noise;
    const len = Math.floor(6 * c.sampleRate);
    const mk = (pink: boolean) => {
      const b = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = b.getChannelData(ch);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          if (pink) {
            b0 = 0.99765 * b0 + w * 0.099046;
            b1 = 0.963 * b1 + w * 0.2965164;
            b2 = 0.57 * b2 + w * 1.0526913;
            d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
          } else d[i] = w * 0.5;
        }
        const fadeLen = Math.floor(0.2 * c.sampleRate);
        for (let i = 0; i < fadeLen; i++) {
          const t = i / fadeLen;
          d[i] = d[i] * t + d[len - fadeLen + i] * (1 - t);
        }
      }
      return b;
    };
    noise = { white: mk(false), pink: mk(true) };
    return noise;
  }

  function out(pan: number, wet = 0): AudioNode | null {
    if (!ctx || !master) return null;
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, (pan - 0.5) * 1.1));
    p.connect(master);
    void wet;
    return p;
  }

  function burst(at: number, dur: number, gain: number, freq: number, to: number, q: number, pan: number, color: "white" | "pink" = "pink") {
    if (!ctx) return;
    const dest = out(pan);
    if (!dest) return;
    const src = ctx.createBufferSource();
    src.buffer = buffers(ctx)[color];
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, at);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, to), at + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + Math.min(0.02, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(at, Math.random() * 4, dur + 0.05);
  }

  function tone(at: number, dur: number, gain: number, freqs: number[], pan: number, type: OscillatorType = "sine") {
    if (!ctx) return;
    const dest = out(pan);
    if (!dest) return;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freqs[0], at);
    for (let i = 1; i < freqs.length; i++) o.frequency.exponentialRampToValueAtTime(freqs[i], at + (dur * i) / (freqs.length - 1));
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + Math.min(0.02, dur * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g);
    g.connect(dest);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  function chirp(at: number) {
    const pan = rand(0.1, 0.9);
    const base = rand(0.9, 1.12);
    switch (pick(["robin", "chickadee", "warbler", "finch"])) {
      case "robin": {
        let t = at;
        const n = 4 + ((Math.random() * 3) | 0);
        for (let i = 0; i < n; i++) {
          const f = rand(2200, 3200) * base;
          tone(t, rand(0.12, 0.2), 0.011, [f, f * rand(1.1, 1.3), f * rand(0.85, 1)], pan);
          t += rand(0.2, 0.32);
        }
        break;
      }
      case "chickadee":
        tone(at, 0.38, 0.011, [3900 * base, 3850 * base], pan);
        tone(at + 0.48, 0.4, 0.01, [3400 * base, 3350 * base], pan);
        break;
      case "warbler":
        for (let i = 0; i < 9; i++) tone(at + 0.075 * i, 0.055, 0.009, [(3000 + 160 * i) * base, (3000 + 160 * i) * base * 1.25], pan);
        break;
      default:
        for (let i = 0; i < 6; i++) {
          const f = rand(3200, 4600) * base;
          tone(at + i * rand(0.07, 0.11), 0.06, 0.008, [f, f * 0.7], pan);
        }
    }
  }

  function start() {
    if (ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    const c = ctx;
    const src = c.createBufferSource();
    src.buffer = buffers(c).pink;
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 480;
    const gain = c.createGain();
    gain.gain.value = 0.03;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(0, Math.random() * 4);
    live.push(src);
    wind = { gain, filter };
    timer = window.setInterval(tick, 400);
  }

  function tick() {
    if (!ctx) return;
    const t = ctx.currentTime;
    if (nextBird === 0) { nextBird = t + rand(3, 7); nextChat = t + rand(20, 40); }
    if (!on || !visible) return;
    while (nextBird < t + 1.5) {
      chirp(Math.max(nextBird, t + 0.05));
      nextBird += rand(9, 24);
    }
    while (nextChat < t + 1.5) {
      for (let i = 0; i < 2 + ((Math.random() * 2) | 0); i++) burst(Math.max(nextChat, t + 0.05) + i * rand(0.09, 0.16), 0.1, 0.01, rand(300, 560), rand(380, 700), 2.2, rand(0.3, 0.8));
      nextChat += rand(30, 70);
    }
  }

  function apply() {
    if (!ctx || !master) return;
    const live = on && visible;
    master.gain.setTargetAtTime(live ? 1.4 : 0.0001, ctx.currentTime, live ? 1.2 : 0.3);
    if (live && ctx.state === "suspended") void ctx.resume();
  }

  const gate = (fn: () => void) => () => {
    if (on && visible && ctx) fn();
  };
  const t0 = () => (ctx ? ctx.currentTime + 0.01 : 0);

  const sfx: Sfx = {
    plop: (pan, g = 0.5) => gate(() => { tone(t0(), 0.18, 0.05 * g, [520, 180], pan); burst(t0(), 0.12, 0.03 * g, 900, 400, 1.2, pan); })(),
    rustle: (pan, g = 1) => gate(() => burst(t0(), 0.7, 0.05 * g, 2200, 1200, 0.7, pan, "white"))(),
    flick: (pan) => gate(() => burst(t0(), 0.05, 0.05, 2400, 1800, 1, pan, "white"))(),
    cough: (pan, g = 0.4) => gate(() => { burst(t0(), 0.14, 0.06 * g, 420, 300, 1.4, pan); burst(t0() + 0.18, 0.12, 0.05 * g, 400, 280, 1.4, pan); })(),
    nibble: (pan) => gate(() => tone(t0(), 0.05, 0.03, [1200, 800], pan))(),
    pellets: (pan) => gate(() => { for (let i = 0; i < 3; i++) tone(t0() + i * 0.06, 0.05, 0.025, [rand(700, 1100), 500], pan); })(),
    oar: (pan) => gate(() => burst(t0(), 0.22, 0.035, 650, 320, 1.1, pan))(),
    wind: (level) => {
      if (!ctx || !wind) return;
      const now = performance.now();
      if (now - lastWind < 120) return;
      lastWind = now;
      wind.gain.gain.setTargetAtTime(0.003 + level * level * 0.02, ctx.currentTime, 0.8);
      wind.filter.frequency.setTargetAtTime(380 + 900 * level, ctx.currentTime, 0.8);
    },
  };

  return {
    get enabled() { return on; },
    setEnabled(v) {
      on = v;
      if (v) start();
      apply();
    },
    setVisible(v) {
      visible = v;
      apply();
    },
    sfx,
    dispose() {
      window.clearInterval(timer);
      for (const n of live) { try { n.stop(); } catch { /* already stopped */ } }
      void ctx?.close();
      ctx = null;
    },
  };
}
