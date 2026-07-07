interface ToneLayer {
  kind: "tone";
  waveform: OscillatorType;
  frequency: number;
  offset?: number;
  attack: number;
  decay: number;
  peak: number;
  detune?: number;
  glideTo?: number;
  glideTime?: number;
}

interface NoiseLayer {
  kind: "noise";
  filterType: BiquadFilterType;
  filterFrequency: number;
  filterQ?: number;
  offset?: number;
  attack: number;
  decay: number;
  peak: number;
}

type Layer = ToneLayer | NoiseLayer;

interface ShimmerConfig {
  delay: number;
  feedback: number;
  wet: number;
  lowpass: number;
}

interface SoundConfig {
  masterGain: number;
  layers: Layer[];
  shimmer?: ShimmerConfig;
}

const SOUNDS: Record<string, SoundConfig> = {
  chime: {
    masterGain: 0.5,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 1046.5, attack: 0.006, decay: 0.22, peak: 0.09 },
      { kind: "tone", waveform: "sine", frequency: 1568, offset: 0.09, attack: 0.006, decay: 0.26, peak: 0.08 }
    ],
    shimmer: { delay: 0.12, feedback: 0.25, wet: 0.18, lowpass: 4000 }
  },
  sparkle: {
    masterGain: 0.5,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 1760, offset: 0, attack: 0.003, decay: 0.09, peak: 0.045 },
      { kind: "tone", waveform: "sine", frequency: 2217, offset: 0.045, attack: 0.003, decay: 0.09, peak: 0.04 },
      { kind: "tone", waveform: "sine", frequency: 2637, offset: 0.09, attack: 0.003, decay: 0.1, peak: 0.038 },
      { kind: "tone", waveform: "sine", frequency: 3520, offset: 0.135, attack: 0.003, decay: 0.12, peak: 0.032 }
    ],
    shimmer: { delay: 0.07, feedback: 0.35, wet: 0.22, lowpass: 6000 }
  },
  droplet: {
    masterGain: 0.55,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 1200, glideTo: 550, glideTime: 0.14, attack: 0.004, decay: 0.2, peak: 0.075 }
    ],
    shimmer: { delay: 0.09, feedback: 0.2, wet: 0.15, lowpass: 3000 }
  },
  bloom: {
    masterGain: 0.5,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 528, attack: 0.06, decay: 0.32, peak: 0.06 },
      { kind: "tone", waveform: "sine", frequency: 528, detune: 12, attack: 0.06, decay: 0.34, peak: 0.05 }
    ],
    shimmer: { delay: 0.15, feedback: 0.2, wet: 0.12, lowpass: 2500 }
  },
  whisper: {
    masterGain: 0.5,
    layers: [
      { kind: "noise", filterType: "lowpass", filterFrequency: 1200, filterQ: 0.7, attack: 0.04, decay: 0.16, peak: 0.05 }
    ]
  },
  tick: {
    masterGain: 0.4,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 5400, filterQ: 1.8, attack: 0.001, decay: 0.018, peak: 0.14 },
      { kind: "tone", waveform: "sine", frequency: 2600, attack: 0.001, decay: 0.012, peak: 0.018 }
    ]
  },
  press: {
    masterGain: 0.4,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 1700, filterQ: 1.4, attack: 0.001, decay: 0.02, peak: 0.13 }
    ]
  },
  release: {
    masterGain: 0.4,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 4600, filterQ: 1.8, attack: 0.001, decay: 0.016, peak: 0.12 },
      { kind: "tone", waveform: "sine", frequency: 3200, offset: 0.006, attack: 0.001, decay: 0.05, peak: 0.02 }
    ]
  },
  toggle: {
    masterGain: 0.4,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 2200, filterQ: 1.6, attack: 0.001, decay: 0.016, peak: 0.12 },
      { kind: "noise", filterType: "bandpass", filterFrequency: 3800, filterQ: 1.6, offset: 0.024, attack: 0.001, decay: 0.02, peak: 0.1 }
    ]
  },
  success: {
    masterGain: 0.5,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 880, attack: 0.004, decay: 0.09, peak: 0.06 },
      { kind: "tone", waveform: "sine", frequency: 1108.73, offset: 0.06, attack: 0.004, decay: 0.1, peak: 0.06 },
      { kind: "tone", waveform: "sine", frequency: 1318.51, offset: 0.12, attack: 0.004, decay: 0.18, peak: 0.07 }
    ],
    shimmer: { delay: 0.1, feedback: 0.22, wet: 0.16, lowpass: 4500 }
  }
};

function playTone(ctx: AudioContext, dest: AudioNode, config: ToneLayer, startTime: number) {
  const osc = ctx.createOscillator();
  osc.type = config.waveform;
  osc.frequency.setValueAtTime(config.frequency, startTime);

  if (config.detune) {
    osc.detune.setValueAtTime(config.detune, startTime);
  }

  if (config.glideTo !== undefined) {
    const glideTime = config.glideTime ?? config.attack + config.decay;
    osc.frequency.exponentialRampToValueAtTime(config.glideTo, startTime + glideTime);
  }

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(1e-4, startTime);
  gainNode.gain.exponentialRampToValueAtTime(config.peak, startTime + config.attack);
  gainNode.gain.exponentialRampToValueAtTime(1e-4, startTime + config.attack + config.decay);

  osc.connect(gainNode).connect(dest);
  osc.start(startTime);
  osc.stop(startTime + config.attack + config.decay + 0.05);
}

function playNoise(ctx: AudioContext, dest: AudioNode, config: NoiseLayer, startTime: number) {
  const duration = config.attack + config.decay + 0.05;
  const bufferSize = Math.max(1, Math.floor(duration * ctx.sampleRate));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = config.filterType;
  filter.frequency.setValueAtTime(config.filterFrequency, startTime);

  if (config.filterQ !== undefined) {
    filter.Q.setValueAtTime(config.filterQ, startTime);
  }

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(1e-4, startTime);
  gainNode.gain.exponentialRampToValueAtTime(config.peak, startTime + config.attack);
  gainNode.gain.exponentialRampToValueAtTime(1e-4, startTime + config.attack + config.decay);

  source.connect(filter).connect(gainNode).connect(dest);
  source.start(startTime);
  source.stop(startTime + duration);
}

function playShimmer(ctx: AudioContext, input: AudioNode, output: AudioNode, config: ShimmerConfig) {
  const delay = ctx.createDelay(1);
  delay.delayTime.setValueAtTime(config.delay, ctx.currentTime);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.setValueAtTime(config.lowpass, ctx.currentTime);

  const feedback = ctx.createGain();
  feedback.gain.setValueAtTime(config.feedback, ctx.currentTime);

  const wet = ctx.createGain();
  wet.gain.setValueAtTime(config.wet, ctx.currentTime);

  input.connect(delay);
  delay.connect(lowpass);
  lowpass.connect(feedback);
  feedback.connect(delay);
  lowpass.connect(wet);
  wet.connect(output);
}

function playSoundConfig(ctx: AudioContext, config: SoundConfig) {
  const startTime = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(config.masterGain, startTime);
  master.connect(ctx.destination);

  if (config.shimmer) {
    playShimmer(ctx, master, ctx.destination, config.shimmer);
  }

  for (const layer of config.layers) {
    const layerTime = startTime + (layer.offset ?? 0);
    if (layer.kind === "tone") {
      playTone(ctx, master, layer, layerTime);
    } else {
      playNoise(ctx, master, layer, layerTime);
    }
  }
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  audioCtx = new AudioContextClass();
  return audioCtx;
}

export function playAudio(soundName: string = "chime") {
  const ctx = getAudioContext();
  if (!ctx) return;

  const config = SOUNDS[soundName];
  if (!config) return;

  if (ctx.state === "running") {
    playSoundConfig(ctx, config);
  } else {
    ctx.resume().then(() => {
      playSoundConfig(ctx, config);
    });
  }
}
