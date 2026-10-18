/**
 * Three small sounds, synthesised, so there is nothing to download: the stamp thudding on paper, the stamp dabbing the pad,
 * and a bare knock on the desk. Off by default; the AudioContext is only created after the visitor turns sound on.
 */
export function createSfx() {
  let ctx: AudioContext | null = null;
  const get = () => {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  const noise = (c: AudioContext, seconds: number) => {
    const buf = c.createBuffer(
      1,
      Math.ceil(c.sampleRate * seconds),
      c.sampleRate,
    );
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    return src;
  };

  const hit = (
    c: AudioContext,
    opts: {
      freq: number;
      lp: number;
      gain: number;
      dur: number;
      pan: number;
      thump: number;
    },
  ) => {
    const t = c.currentTime;
    const out = c.createGain();
    out.gain.setValueAtTime(opts.gain, t);
    out.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
    const pan = c.createStereoPanner();
    pan.pan.value = opts.pan;
    out.connect(pan).connect(c.destination);

    const n = noise(c, opts.dur);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = opts.lp;
    n.connect(lp).connect(out);
    n.start(t);

    if (opts.thump > 0) {
      const o = c.createOscillator();
      const og = c.createGain();
      o.frequency.setValueAtTime(opts.freq, t);
      o.frequency.exponentialRampToValueAtTime(opts.freq * 0.55, t + opts.dur);
      og.gain.setValueAtTime(opts.thump, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
      o.connect(og).connect(out);
      o.start(t);
      o.stop(t + opts.dur);
    }
  };

  return {
    /** the stamp coming down on paper; firmer press, deeper sound */
    stamp(pressure: number, pan = 0) {
      const c = get();
      if (c)
        hit(c, {
          freq: 95,
          lp: 700 + 700 * pressure,
          gain: 0.35 + 0.3 * pressure,
          dur: 0.16,
          pan,
          thump: 0.5,
        });
    },
    /** the stamp dabbed on the ink pad: softer, wetter */
    pad(pan = 0) {
      const c = get();
      if (c)
        hit(c, { freq: 140, lp: 420, gain: 0.3, dur: 0.22, pan, thump: 0.2 });
    },
    /** pressed on bare desk */
    knock(pan = 0) {
      const c = get();
      if (c)
        hit(c, { freq: 160, lp: 900, gain: 0.28, dur: 0.1, pan, thump: 0.45 });
    },
  };
}
