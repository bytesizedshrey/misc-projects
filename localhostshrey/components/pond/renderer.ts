import { FLOATS, VERTS_PER_FISH, ROWS, createSchool, type School } from "./school";

/**
 * The pond, drawn in four steps on one WebGL2 canvas:
 *   1. a wave simulation (height + velocity in a half-float texture), stirred by fish and fingers
 *   2. the pond bed (pebbles, stones, weeds), the fish's shadows, then the fish, drawn into an offscreen scene
 *   3. the scene is looked at through the moving water surface: refracted by the wave gradient, lit by caustics,
 *      with sun glints on the ripples
 * Written for this site; the ideas (strip-mesh koi on a trail, a wave sim for the surface) are standard.
 */

const VERT_FULL = `#version 300 es
precision highp float;
out vec2 v_uv;
void main() {
  float x = float((gl_VertexID << 1) & 2);
  float y = float(gl_VertexID & 2);
  v_uv = vec2(x, y);
  gl_Position = vec4(v_uv * 2.0 - 1.0, 0.0, 1.0);
}`;

const NOISE = `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash2(vec2 p){ return vec2(hash(p), hash(p + 19.19)); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`;

const FRAG_STEP = `#version 300 es
precision highp float;
uniform sampler2D u_state;
uniform vec2 u_texel;
in vec2 v_uv;
out vec4 o;
void main() {
  vec4 s = texture(u_state, v_uv);
  float h = s.r, v = s.g;
  float n = texture(u_state, v_uv + vec2(u_texel.x, 0.0)).r + texture(u_state, v_uv - vec2(u_texel.x, 0.0)).r
          + texture(u_state, v_uv + vec2(0.0, u_texel.y)).r + texture(u_state, v_uv - vec2(0.0, u_texel.y)).r;
  v += (n * 0.25 - h) * 1.2;
  v *= 0.9935;
  h += v;
  vec2 e = min(v_uv, 1.0 - v_uv) / (u_texel * 8.0);
  float a = mix(0.93, 1.0, clamp(min(e.x, e.y), 0.0, 1.0));
  o = vec4(h * a, v * a, 0.0, 1.0);
}`;

const FRAG_DROP = `#version 300 es
precision highp float;
uniform vec2 u_pos;
uniform float u_r;
uniform float u_amp;
uniform float u_aspect;
in vec2 v_uv;
out vec4 o;
void main() {
  vec2 d = v_uv - u_pos; d.x *= u_aspect;
  o = vec4(u_amp * exp(-dot(d, d) / (u_r * u_r)), 0.0, 0.0, 0.0);
}`;

const FRAG_FLOOR = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform vec4 u_stones[6];
uniform vec4 u_stoneInfo[6];
in vec2 v_uv;
out vec4 o;
${NOISE}
vec3 pebbles(vec2 p) {
  vec2 g = floor(p), f = fract(p);
  float d1 = 8.0, d2 = 8.0; vec2 id = vec2(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = vec2(float(i), float(j));
    vec2 r = c + hash2(g + c) * 0.8 + 0.1 - f;
    float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; id = g + c; } else if (d < d2) d2 = d;
  }
  float edge = sqrt(d2) - sqrt(d1);
  return vec3(1.0 - sqrt(d1) * 1.15, smoothstep(0.0, 0.22, edge), hash(id));
}
void main() {
  vec2 p = vec2(v_uv.x * u_res.x, (1.0 - v_uv.y) * u_res.y);
  vec2 q = p / u_res;
  // deep green water-bed, lighter where the sun reaches
  float broad = fbm(p * 0.006 + 3.0);
  vec3 col = mix(vec3(0.045, 0.125, 0.115), vec3(0.11, 0.25, 0.21), broad);
  col += vec3(0.05, 0.09, 0.06) * smoothstep(0.9, 0.0, distance(q, vec2(0.3, 0.35)) * 1.4);
  // pebbles
  vec3 pb = pebbles(p / 21.0);
  vec3 stoneTint = mix(vec3(0.19, 0.24, 0.2), vec3(0.3, 0.3, 0.24), pb.z);
  float lit = clamp(pb.x, 0.0, 1.0);
  vec3 peb = stoneTint * (0.5 + 0.7 * lit) * mix(0.74, 1.0, pb.y);
  col = mix(col, peb, 0.48 * smoothstep(0.0, 0.2, fbm(p * 0.02 + 9.0) + 0.1));
  // larger stones, lit from the top-left, with a soft shadow on the bed
  for (int i = 0; i < 6; i++) {
    vec4 s = u_stones[i]; vec4 inf = u_stoneInfo[i];
    if (s.z <= 0.0) continue;
    vec2 c = s.xy * u_res;
    float cs = cos(inf.x), sn = sin(inf.x);
    vec2 lp = p - c; lp = vec2(cs * lp.x + sn * lp.y, -sn * lp.x + cs * lp.y);
    vec2 rad = s.zw;
    vec2 sh = lp - vec2(7.0, 10.0); // shadow offset
    float ds = length(sh / (rad * 1.08));
    col *= 1.0 - 0.42 * smoothstep(1.25, 0.7, ds);
    float rough = (vnoise(lp * 0.09 + inf.y * 31.0) - 0.5) * 0.22;
    float d = length(lp / rad) + rough;
    if (d < 1.0) {
      float hgt = sqrt(max(1.0 - d * d, 0.0));
      vec3 n = normalize(vec3(-lp / rad * 0.85, hgt + 0.35));
      float diff = clamp(dot(n, normalize(vec3(-0.5, -0.6, 0.65))), 0.0, 1.0);
      vec3 base = mix(vec3(0.34, 0.37, 0.33), vec3(0.47, 0.44, 0.37), inf.y);
      base = mix(base, vec3(0.2, 0.34, 0.2), smoothstep(0.1, 0.8, fbm(lp * 0.05 + inf.y * 9.0)) * 0.42); // moss
      vec3 sc = base * (0.28 + 0.95 * diff);
      col = mix(col, sc, smoothstep(1.0, 0.9, d));
    }
  }
  o = vec4(col, 1.0);
}`;

const VERT_WEED = `#version 300 es
precision highp float;
in vec2 a_pos;
in vec4 a_info; // t along blade, side, seed, length
uniform vec2 u_res;
uniform float u_time;
out vec4 v_info;
void main() {
  float t = a_info.x;
  float sway = sin(u_time * 0.9 + a_info.z * 9.0 + t * 2.6) * t * t * a_info.w * 0.1;
  vec2 p = a_pos + vec2(sway, sway * 0.45);
  v_info = a_info;
  gl_Position = vec4(p.x / u_res.x * 2.0 - 1.0, 1.0 - p.y / u_res.y * 2.0, 0.0, 1.0);
}`;

const FRAG_WEED = `#version 300 es
precision highp float;
in vec4 v_info;
out vec4 o;
void main() {
  float t = v_info.x;
  vec3 c = mix(vec3(0.05, 0.17, 0.1), vec3(0.2, 0.42, 0.2), t);
  float a = 0.92 * (1.0 - smoothstep(0.7, 1.0, abs(v_info.y)));
  o = vec4(c, a);
}`;

const VERT_FISH = `#version 300 es
precision highp float;
in vec4 a_geo;  // x, y, a, b
in vec4 a_meta; // id, length, fear, part
uniform vec2 u_res;
uniform vec2 u_off;
uniform float u_shadow;
out vec2 v_ab;
out vec4 v_meta;
out vec2 v_px;
void main() {
  vec2 p = a_geo.xy + u_off * u_shadow;
  v_ab = a_geo.zw; v_meta = a_meta; v_px = a_geo.xy;
  gl_Position = vec4(p.x / u_res.x * 2.0 - 1.0, 1.0 - p.y / u_res.y * 2.0, 0.0, 1.0);
}`;

const FRAG_FISH = `#version 300 es
precision highp float;
in vec2 v_ab;
in vec4 v_meta;
in vec2 v_px;
uniform float u_shadow;
out vec4 o;
${NOISE}
float halfW(float t) {
  if (t <= 0.0) return 0.0;
  if (t <= 1.0) {
    float nose = sqrt(max(0.0, 1.0 - pow(max(0.3 - t, 0.0) / 0.3, 2.0)));
    return mix(0.11, 0.028, smoothstep(0.32, 1.0, t)) * nose;
  }
  return 0.028 + 0.13 * smoothstep(1.0, 1.28, t) * (1.0 - 0.45 * smoothstep(1.28, 1.5, t));
}
vec3 body(float kind, float seed, float t, float s, float L) {
  vec2 w = vec2(t * 3.4 + seed * 7.0, s * 1.5 + seed * 13.0);
  float n = fbm(w);
  float n2 = fbm(w * 1.9 + 31.0);
  float bell = 1.0 - smoothstep(0.55, 1.0, abs(s)); // patches stay on the back
  if (kind < 0.5) { // kohaku: white with red-orange patches
    vec3 white = vec3(0.97, 0.955, 0.93);
    float m = smoothstep(0.5, 0.58, n + (0.5 - abs(s)) * 0.25 + 0.1 * sin(t * 5.0 + seed * 9.0)) * bell;
    m = max(m, smoothstep(0.1, 0.0, abs(t - 0.14)) * 0.95 * bell); // head
    vec3 red = mix(vec3(0.93, 0.3, 0.1), vec3(0.98, 0.5, 0.14), n2);
    return mix(white, red, m);
  } else if (kind < 1.5) { // showa: black, with white and a little orange
    vec3 black = vec3(0.045, 0.045, 0.06);
    float wm = smoothstep(0.46, 0.56, n + 0.05 * sin(t * 6.0 + seed * 5.0));
    float om = smoothstep(0.58, 0.66, n2) * wm;
    vec3 c = mix(black, vec3(0.95, 0.93, 0.9), wm * bell);
    return mix(c, vec3(0.95, 0.4, 0.1), om * bell);
  } else if (kind < 2.5) { // ogon: solid gold
    vec3 gold = mix(vec3(0.82, 0.55, 0.12), vec3(0.98, 0.78, 0.3), n);
    return gold + 0.1 * smoothstep(0.2, 0.0, abs(s + 0.35));
  } else { // tancho: white, red crown
    vec3 white = vec3(0.97, 0.96, 0.94);
    vec2 d = vec2((t - 0.13) * L, s * halfW(t) * L);
    float crown = 1.0 - smoothstep(0.052 * L, 0.06 * L, length(d));
    return mix(white, vec3(0.9, 0.17, 0.1), crown);
  }
}
void main() {
  float kind = floor(v_meta.x + 0.0001);
  float seed = fract(v_meta.x) * 1.0101 * 13.0 + 1.0;
  float L = v_meta.y, part = v_meta.w;
  if (u_shadow > 0.5) {
    float a;
    if (part > 0.5) {
      float v = abs(v_ab.y - 0.5) * 2.0;
      a = (1.0 - smoothstep(0.55 - 0.4 * v_ab.x, 1.0, v)) * 0.45;
    } else {
      float t = v_ab.x, s = abs(v_ab.y);
      a = 1.0 - smoothstep(0.55, 1.0, s);
      if (t > 1.0) { a *= 0.5 * (1.0 - smoothstep(1.3, 1.5, t)); if (t > 1.5 - 0.16 * pow(1.0 - s, 0.8)) discard; }
    }
    o = vec4(0.0, 0.015, 0.01, 0.34 * a);
    return;
  }
  if (part > 0.5) { // pectoral fin: pale, translucent, with rays
    float u = v_ab.x, v = abs(v_ab.y - 0.5) * 2.0;
    float shape = 1.0 - smoothstep(0.7 - 0.5 * u, 1.0, v);
    float rays = 0.9 + 0.1 * sin(v_ab.y * 40.0 + u * 3.0);
    vec3 tint = kind < 0.5 ? vec3(0.98, 0.85, 0.78) : kind < 1.5 ? vec3(0.78, 0.78, 0.8) : kind < 2.5 ? vec3(0.98, 0.82, 0.45) : vec3(0.96, 0.93, 0.9);
    o = vec4(tint * rays, shape * (0.62 - 0.3 * u));
    return;
  }
  float t = v_ab.x, s = v_ab.y;
  float edge = 1.0 - smoothstep(0.9, 1.0, abs(s));
  vec3 c = body(kind, seed, clamp(t, 0.0, 1.0), s, L);
  float dome = sqrt(max(1.0 - s * s, 0.0));
  float shade = mix(0.74, 1.06, dome);
  shade += 0.1 * smoothstep(0.25, 0.0, abs(s + 0.4)) * dome; // wet sheen along the back
  float scales = 0.96 + 0.04 * sin(v_px.x * 0.55 + v_px.y * 0.35) * sin(v_px.y * 0.5 - v_px.x * 0.3);
  c *= shade * scales;
  float alpha = edge;
  if (t > 1.0) { // tail fin: soft, forked and see-through
    float tip = 1.5 - 0.16 * pow(1.0 - abs(s), 0.8);
    if (t > tip) discard;
    vec3 fin = mix(c, vec3(0.97, 0.93, 0.88), 0.5);
    fin *= 0.92 + 0.08 * sin(s * 30.0 + t * 4.0);
    c = fin;
    alpha = edge * mix(0.85, 0.5, smoothstep(1.02, 1.4, t));
  }
  // eyes
  float eyeD = length(vec2((t - 0.075) * L, (abs(s) - 0.62) * halfW(t) * L));
  c = mix(c, vec3(0.02), (1.0 - smoothstep(0.012 * L, 0.02 * L, eyeD)) * step(t, 0.2));
  o = vec4(c, alpha);
}`;

const FRAG_COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D u_scene;
uniform sampler2D u_state;
uniform vec2 u_res;
uniform vec2 u_simTexel;
uniform float u_time;
in vec2 v_uv;
out vec4 o;
${NOISE}
float ridge(vec2 p) { return 1.0 - abs(2.0 * vnoise(p) - 1.0); }
float caustic(vec2 p, float t) {
  p *= 0.02;
  vec2 w = vec2(fbm(p + vec2(t * 0.05, 0.0)) - 0.5, fbm(p + vec2(0.0, -t * 0.06) + 7.0) - 0.5);
  float a = ridge(p * 1.6 + w * 1.7 + vec2(t * 0.07, -t * 0.04));
  float b = ridge(p * 2.4 + w * 2.1 + vec2(-t * 0.05, t * 0.06) + 3.7);
  return pow(a * b, 3.2);
}
void main() {
  vec2 st = u_simTexel;
  float h  = texture(u_state, v_uv).r;
  float hl = texture(u_state, v_uv - vec2(st.x, 0.0)).r;
  float hr = texture(u_state, v_uv + vec2(st.x, 0.0)).r;
  float hd = texture(u_state, v_uv - vec2(0.0, st.y)).r;
  float hu = texture(u_state, v_uv + vec2(0.0, st.y)).r;
  vec2 grad = vec2(hr - hl, hu - hd);
  vec2 uv = clamp(v_uv + grad * 60.0 / u_res, 0.002, 0.998);
  vec3 col = texture(u_scene, uv).rgb;
  vec2 p = v_uv * u_res;
  float c = caustic(p, u_time + h * 3.0);
  col += vec3(0.42, 0.88, 0.7) * c * 0.34 * (0.7 + 0.8 * clamp(h * 6.0 + 0.5, 0.0, 1.0));
  vec3 N = normalize(vec3(-grad * 16.0, 1.0));
  vec3 Ld = normalize(vec3(-0.45, 0.5, 0.75));
  float spec = pow(max(dot(reflect(-Ld, N), vec3(0.0, 0.0, 1.0)), 0.0), 40.0);
  col += vec3(0.9, 1.0, 0.95) * spec * 0.55;
  col += vec3(0.05, 0.09, 0.08) * clamp(h * 5.0, -1.0, 1.0);
  vec2 q = v_uv - 0.5;
  col *= 1.0 - dot(q, q) * 0.7;
  o = vec4(col, 1.0);
}`;

type Target = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

export type PondOptions = { fishCount: number };

export type Pond = {
  resize(cssW: number, cssH: number, dpr: number): void;
  step(dt: number, now: number): void;
  render(now: number): void;
  tap(x: number, y: number): void;
  drag(x: number, y: number): void;
  intro(): void;
  dispose(): void;
};

export function createPond(canvas: HTMLCanvasElement, opts: PondOptions): Pond | null {
  const ctx = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!ctx) return null;
  const gl: WebGL2RenderingContext = ctx;
  if (!gl.getExtension("EXT_color_buffer_float")) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const program = (vs: string, fs: string, attribs: string[] = []) => {
    const v = compile(gl.VERTEX_SHADER, vs),
      f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    attribs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  };
  const progs = {
    step: program(VERT_FULL, FRAG_STEP),
    drop: program(VERT_FULL, FRAG_DROP),
    floor: program(VERT_FULL, FRAG_FLOOR),
    weed: program(VERT_WEED, FRAG_WEED, ["a_pos", "a_info"]),
    fish: program(VERT_FISH, FRAG_FISH, ["a_geo", "a_meta"]),
    comp: program(VERT_FULL, FRAG_COMPOSITE),
  };
  if (Object.values(progs).some((p) => !p)) return null;
  const P = progs as Record<keyof typeof progs, WebGLProgram>;
  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);

  const target = (w: number, h: number, float: boolean): Target => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (float) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h };
  };
  const free = (t?: Target) => {
    if (!t) return;
    gl.deleteTexture(t.tex);
    gl.deleteFramebuffer(t.fbo);
  };

  const vaoEmpty = gl.createVertexArray()!;
  const fishVao = gl.createVertexArray()!;
  const fishBuf = gl.createBuffer()!;
  const weedVao = gl.createVertexArray()!;
  const weedBuf = gl.createBuffer()!;
  let weedCount = 0;

  let W = 0,
    H = 0,
    dpr = 1;
  let sim: [Target, Target] | null = null;
  let scene: Target | null = null;
  let school: School | null = null;
  let verts = new Float32Array(0);
  let stones = new Float32Array(24);
  let stoneInfo = new Float32Array(24);
  let acc = 0;
  let time = 0;

  const fullscreen = () => {
    gl.bindVertexArray(vaoEmpty);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  function layoutScenery() {
    // stones: positions as fractions of the pond, sizes in px
    const base = Math.min(W, H * 1.6);
    const spec = [
      [0.07, 0.8, 0.075, 0.055, 0.5],
      [0.93, 0.16, 0.06, 0.045, -0.7],
      [0.34, 0.9, 0.04, 0.03, 0.2],
      [0.62, 0.08, 0.05, 0.036, 1.2],
      [0.86, 0.78, 0.035, 0.026, -0.3],
    ];
    stones = new Float32Array(24);
    stoneInfo = new Float32Array(24);
    spec.forEach((s, i) => {
      stones.set([s[0], s[1], s[2] * base, s[3] * base], i * 4);
      stoneInfo.set([s[4], (i * 0.37 + 0.13) % 1, 0, 0], i * 4);
    });
    // weeds: three clumps of blades rooted near the edges
    const clumps = [
      { x: 0.03, y: 0.9, angle: -0.6, n: 9 },
      { x: 0.97, y: 0.94, angle: -2.5, n: 7 },
      { x: 0.42, y: 0.02, angle: 1.3, n: 6 },
    ];
    const data: number[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const SEG = 10;
    for (const c of clumps) {
      for (let b = 0; b < c.n; b++) {
        const ang = c.angle + (rnd() - 0.5) * 1.3;
        const len = (0.1 + 0.13 * rnd()) * Math.min(W, H * 1.6);
        const wid = (0.006 + 0.006 * rnd()) * Math.min(W, H * 1.6);
        const curve = (rnd() - 0.5) * 0.7;
        const rx = c.x * W + (rnd() - 0.5) * 18,
          ry = c.y * H + (rnd() - 0.5) * 18;
        const dx = Math.cos(ang),
          dy = Math.sin(ang);
        const sd = rnd();
        const blade: number[] = [];
        for (let i = 0; i <= SEG; i++) {
          const t = i / SEG;
          const cx = rx + dx * len * t + -dy * curve * len * t * t;
          const cy = ry + dy * len * t + dx * curve * len * t * t;
          const w = wid * (1 - t * 0.9);
          for (const side of [-1, 1]) blade.push(cx + -dy * w * side, cy + dx * w * side, t, side, sd, len);
        }
        // repeat the strip's first and last vertex so blades join through degenerate triangles
        data.push(...blade.slice(0, 6), ...blade, ...blade.slice(-6));
      }
    }
    weedCount = data.length / 6;
    gl.bindVertexArray(weedVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, weedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
  }

  function setupFishVao() {
    gl.bindVertexArray(fishVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, fishBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, FLOATS * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, FLOATS * 4, 16);
  }
  setupFishVao();

  const drop = (x: number, y: number, r: number, amp: number) => {
    if (!sim) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, sim[0].fbo);
    gl.viewport(0, 0, sim[0].w, sim[0].h);
    gl.useProgram(P.drop);
    gl.uniform2f(U(P.drop, "u_pos"), x / W, 1 - y / H);
    gl.uniform1f(U(P.drop, "u_r"), r / H);
    gl.uniform1f(U(P.drop, "u_amp"), amp);
    gl.uniform1f(U(P.drop, "u_aspect"), W / H);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    fullscreen();
    gl.disable(gl.BLEND);
  };

  function resize(cssW: number, cssH: number, ratio: number) {
    const w = Math.max(1, Math.round(cssW)),
      h = Math.max(1, Math.round(cssH));
    const sameBox = w === W && h === H;
    dpr = ratio;
    const pw = Math.max(1, Math.round(w * dpr)),
      ph = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    if (!school) {
      W = w;
      H = h;
      school = createSchool(w, h, opts.fishCount);
    } else if (!sameBox) {
      W = w;
      H = h;
      school.resize(w, h);
    }
    const n = school.count;
    verts = new Float32Array(n * VERTS_PER_FISH * FLOATS);
    gl.bindBuffer(gl.ARRAY_BUFFER, fishBuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts.byteLength, gl.DYNAMIC_DRAW);

    free(sim?.[0]);
    free(sim?.[1]);
    free(scene ?? undefined);
    const cell = 3.2;
    const sw = Math.min(320, Math.max(48, Math.round(w / cell))),
      sh = Math.max(32, Math.round((sw * h) / w));
    sim = [target(sw, sh, true), target(sw, sh, true)];
    scene = target(pw, ph, false);
    layoutScenery();
  }

  function stepSim() {
    if (!sim) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, sim[1].fbo);
    gl.viewport(0, 0, sim[1].w, sim[1].h);
    gl.useProgram(P.step);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sim[0].tex);
    gl.uniform1i(U(P.step, "u_state"), 0);
    gl.uniform2f(U(P.step, "u_texel"), 1 / sim[0].w, 1 / sim[0].h);
    fullscreen();
    sim = [sim[1], sim[0]];
  }

  const sink = { drop };

  function step(dt: number, now: number) {
    if (!school || !sim) return;
    time = now;
    school.update(dt, now);
    school.emitRipples(sink);
    acc += dt;
    let n = 0;
    while (acc >= 1 / 120 && n < 6) {
      stepSim();
      acc -= 1 / 120;
      n++;
    }
    if (acc > 0.1) acc = 0;
  }

  function render(now: number) {
    if (!school || !sim || !scene) return;
    time = now;
    const count = school.writeVertices(verts);
    gl.bindBuffer(gl.ARRAY_BUFFER, fishBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts, 0, count * FLOATS);

    // 2. the scene: bed, weeds, shadows, fish
    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fbo);
    gl.viewport(0, 0, scene.w, scene.h);
    gl.disable(gl.BLEND);
    gl.useProgram(P.floor);
    gl.uniform2f(U(P.floor, "u_res"), W, H);
    gl.uniform4fv(U(P.floor, "u_stones"), stones);
    gl.uniform4fv(U(P.floor, "u_stoneInfo"), stoneInfo);
    fullscreen();

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
    gl.useProgram(P.weed);
    gl.uniform2f(U(P.weed, "u_res"), W, H);
    gl.uniform1f(U(P.weed, "u_time"), now);
    gl.bindVertexArray(weedVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, weedCount);

    gl.useProgram(P.fish);
    gl.uniform2f(U(P.fish, "u_res"), W, H);
    gl.bindVertexArray(fishVao);
    const draw = (shadow: boolean) => {
      gl.uniform1f(U(P.fish, "u_shadow"), shadow ? 1 : 0);
      for (let f = 0; f < school!.count; f++) {
        const L = school!.fish[f].L;
        gl.uniform2f(U(P.fish, "u_off"), L * 0.06, L * 0.1);
        const first = f * VERTS_PER_FISH;
        gl.drawArrays(gl.TRIANGLE_STRIP, first, ROWS * 2);
        gl.drawArrays(gl.TRIANGLE_STRIP, first + ROWS * 2, 4);
        gl.drawArrays(gl.TRIANGLE_STRIP, first + ROWS * 2 + 4, 4);
      }
    };
    draw(true);
    draw(false);
    gl.disable(gl.BLEND);

    // 3. look through the water
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(P.comp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, scene.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, sim[0].tex);
    gl.uniform1i(U(P.comp, "u_scene"), 0);
    gl.uniform1i(U(P.comp, "u_state"), 1);
    gl.uniform2f(U(P.comp, "u_res"), W, H);
    gl.uniform2f(U(P.comp, "u_simTexel"), 1 / sim[0].w, 1 / sim[0].h);
    gl.uniform1f(U(P.comp, "u_time"), now);
    fullscreen();
    gl.activeTexture(gl.TEXTURE0);
  }

  // a finger on the water: a splash, and the nearest fish may bolt
  function tap(x: number, y: number) {
    if (!school) return;
    const hit = school.hitTest(x, y);
    if (hit) {
      const [sx, sy] = school.scare(hit, x, y);
      drop(x, y, 7, -1.4);
      drop(sx, sy, 8, -1.6);
    } else {
      drop(x, y, 9, -2.6);
      drop(x, y, 3, 0.5);
      school.disturb(x, y, 0.3 * W, 0.45);
    }
  }
  function drag(x: number, y: number) {
    if (!school) return;
    drop(x, y, 6, -0.9);
    school.disturb(x, y, 0.2 * W, 0.3);
  }

  // when the pond first comes into view: a few drops land, and the fish glance away
  function intro() {
    if (!school) return;
    drop(W * 0.3, H * 0.45, 10, -2.2);
    drop(W * 0.62, H * 0.58, 8, -1.8);
    drop(W * 0.82, H * 0.3, 7, -1.5);
    school.startle(0.35);
  }

  function dispose() {
    free(sim?.[0]);
    free(sim?.[1]);
    free(scene ?? undefined);
    Object.values(P).forEach((p) => gl.deleteProgram(p));
    gl.deleteBuffer(fishBuf);
    gl.deleteBuffer(weedBuf);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  return { resize, step, render, tap, drag, intro, dispose };
}
