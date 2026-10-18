// The WebGL half: a ground shader (grass, path, pond, dappled sun, lit
// sprites) rendered to a texture, then a post pass that gives it a
// tilt-shift miniature focus, halation, a warm grade and film grain.

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const GROUND = `
precision highp float;
varying vec2 vUv;
uniform vec2 uSize;
uniform float uM, uTime, uWind;
uniform vec2 uCam, uSun;
uniform sampler2D uMap, uSprites, uShade, uAir, uFore, uCanopy;
uniform vec4 uRipples[12];

float hash(vec2 p) {
  p = fract(p * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}
float vn(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += vn(p) * a;
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1;
    a *= 0.5;
  }
  return s;
}

// Sunflecks: the low sun stretches them along its direction, and they
// crawl slowly as the leaves move.
float fleck(vec2 m) {
  vec2 d = normalize(uSun);
  vec2 q = vec2(dot(m, d) * 0.62, dot(m, vec2(-d.y, d.x)));
  float t = uTime * (0.6 + uWind * 0.6);
  float n = vn(q * 2.3 + vec2(t * 0.2, t * 0.06)) * 0.5
          + vn(q * 4.6 - vec2(t * 0.13, -t * 0.21) + 7.0) * 0.3
          + vn(q * 0.7 + 3.0) * 0.2;
  return smoothstep(0.57, 0.7, n);
}

// Water surface: a handful of drifting directional swells, warped by noise
// so nothing lines up, plus ripples written into the same height field.
float swell(vec2 p) {
  float t = uTime;
  p += 0.7 * vec2(vn(p * 0.32 + t * 0.05), vn(p * 0.32 - t * 0.04 + 5.0));
  float h = sin(dot(p, vec2(0.90, 0.42)) * 1.7 + t * 1.3) * 0.50;
  h += sin(dot(p, vec2(-0.42, 0.90)) * 2.6 - t * 1.7) * 0.22;
  h += sin(dot(p, vec2(0.71, -0.70)) * 4.1 + t * 2.3) * 0.09;
  h += sin(dot(p, vec2(-0.95, -0.30)) * 6.7 - t * 2.9) * 0.04;
  return h;
}
float ringWaves(vec2 wp, float slope) {
  float r = 0.0;
  for (int i = 0; i < 12; i++) {
    vec4 rp = uRipples[i];
    if (rp.w <= 0.0) continue;
    vec2 d = wp - rp.xy / uM * 0.85;
    float dist = length(d + 0.15 * vec2(vn(wp * 3.0 + uTime * 0.5) - 0.5));
    float front = rp.z * 4.5 * (1.0 + slope * 0.1);
    float env = exp(-pow(dist - front, 2.0) / 1.5) * exp(-rp.z * 1.4);
    r += rp.w * 0.26 * env * cos(dist * 5.0 - uTime * 6.0);
  }
  return r;
}
float surface(vec2 wp) {
  float s = swell(wp);
  return s + ringWaves(wp, s);
}
float glints(vec2 wp, vec3 n) {
  vec3 refl = reflect(vec3(0.0, -1.0, 0.0), n);
  float spec = max(dot(refl, normalize(vec3(0.4, 0.7, 0.3))), 0.0);
  float ph = fract(uTime / 5.0);
  float burst = smoothstep(0.0, 0.03, ph) * smoothstep(0.30, 0.26, ph);
  float gate = step(0.9, spec) * burst;
  if (gate < 0.001) return 0.0;
  vec2 g = wp / 30.0 / 0.025;
  vec2 id = floor(g);
  vec2 f = fract(g);
  vec2 c = vec2(hash(id + 12.1), hash(id + 31.7)) * 0.5 + 0.25;
  vec2 dl = (f - c) * 0.025;
  float star = exp(-dot(dl, dl) / 0.0000012)
             + exp(-abs(dl.x) / 0.0018) * exp(-dl.y * dl.y / 0.0000004)
             + exp(-abs(dl.y) / 0.0018) * exp(-dl.x * dl.x / 0.0000004);
  float tw = pow(max(sin(uTime * (10.0 + hash(id + 70.1) * 15.0) + hash(id + 50.3) * 6.283), 0.0), 20.0);
  return star * step(0.62, hash(id + 90.7)) * gate * tw;
}
vec3 pondColor(vec2 wp, float deep, out float glint) {
  float h = surface(wp);
  float e = 0.01;
  vec3 n = normalize(vec3(h - surface(wp + vec2(e, 0.0)), e * 4.5, h - surface(wp + vec2(0.0, e))));
  vec3 L = normalize(vec3(0.4, 0.7, 0.3));
  vec3 eye = vec3(0.0, 1.0, 0.0);
  float fres = clamp(pow(1.0 - max(dot(n, eye), 0.0), 3.0) * 0.65, 0.0, 1.0);
  vec3 deepC = mix(vec3(0.12, 0.30, 0.26), vec3(0.02, 0.18, 0.32), deep);
  vec3 skyC = vec3(0.50, 0.82, 0.88);
  vec3 waterC = vec3(0.25, 0.65, 0.60);
  vec3 c = mix(deepC + pow(dot(n, L) * 0.4 + 0.6, 80.0) * waterC * 0.12, skyC, fres);
  c += waterC * (h - 0.1) * 0.12;
  c += vec3(pow(max(dot(reflect(-eye, n), L), 0.0), 80.0) * 0.16);
  glint = glints(wp, n);
  return pow(clamp(c, 0.0, 1.0), vec3(0.75));
}

void main() {
  vec2 p = vUv * uSize + uCam;
  vec2 m = p / uM;
  vec4 map = texture2D(uMap, clamp(p / uSize, 0.001, 0.999));

  // Grass: broad clumps, then blades, then per-pixel grit.
  float clump = fbm(m * 0.55);
  float blade = vn(vec2(m.x * 3.2 + m.y * 1.1, m.y * 14.0 + vn(m * 0.8) * 3.0));
  float fine = vn(m * vec2(9.0, 26.0));
  vec3 grass = mix(vec3(0.16, 0.44, 0.12), vec3(0.36, 0.68, 0.17), clump);
  grass *= 0.72 + blade * 0.36 + fine * 0.16 + (hash(floor(p * 1.5)) - 0.5) * 0.14;
  grass *= 0.82 + 0.3 * smoothstep(0.25, 0.7, fbm(m * 1.7 + 4.0));
  grass = mix(grass, vec3(0.5, 0.68, 0.2), smoothstep(0.55, 0.8, fbm(m * 0.12 + 9.0)) * 0.4);

  // Path: pale, sun-bleached, the lawn fraying across its edges.
  float edge = map.r + (vn(m * 1.1) - 0.5) * 0.2 + (vn(m * 4.0 + 7.0) - 0.5) * 0.1;
  float onPath = smoothstep(0.47, 0.55, edge);
  vec3 path = vec3(0.82, 0.80, 0.72) * (0.94 + vn(m * 3.0) * 0.06);
  path = mix(path * 0.93, path, smoothstep(0.55, 0.9, map.r));
  float verge = smoothstep(0.3, 0.5, map.r) * (1.0 - onPath);
  vec3 col = mix(grass, vec3(0.62, 0.60, 0.32), verge * 0.45);
  // Hexagonal pavers on the plaza, barely there.
  vec2 hx = m * vec2(1.0, 1.1547) / 0.34;
  hx.x += mod(floor(hx.y), 2.0) * 0.5;
  vec2 hf = abs(fract(hx) - 0.5);
  float grout = smoothstep(0.42, 0.5, max(hf.x, hf.y * 0.9 + hf.x * 0.3));
  path *= 1.0 - map.b * grout * 0.12;
  col = mix(col, path, onPath);

  // Pond.
  float depth = map.g;
  float wet = smoothstep(0.488, 0.512, depth + (vn(m * 1.6) - 0.5) * 0.03);
  float deep = smoothstep(0.5, 0.82, depth);
  float glint = 0.0;
  vec3 water = wet > 0.0 ? pondColor(m * 0.85, deep, glint) : vec3(0.0);
  float cloud = smoothstep(0.55, 0.8, fbm(m * vec2(0.07, 0.1) + vec2(uTime * 0.012, uTime * 0.004)));
  water = mix(water, vec3(0.8, 0.88, 0.9), cloud * 0.25);
  float bank = smoothstep(0.44, 0.5, depth) * (1.0 - wet);
  col = mix(col, vec3(0.1, 0.24, 0.12), bank * 0.75);

  // Light: crowns shade the ground along the sun, with flecks opening up
  // inside them; people and benches add their own small shadows on top.
  float canopy = texture2D(uCanopy, vUv).a;
  float light = 1.0 - canopy * (1.0 - fleck(m) * 0.92);
  float shade = texture2D(uShade, vUv).a;
  float lightUp = light;               // figures stand above the ground's shadows
  light = min(light, 1.0 - shade * 0.82);
  vec3 sun = vec3(1.2, 1.14, 1.0);
  vec3 amb = vec3(0.24, 0.36, 0.66);
  vec3 lit = mix(amb, sun, light);

  vec3 ground = col * lit;
  // The pond's colour is final, so undo the tone curve for it.
  vec3 wt = clamp((water * 1.18 + vec3(0.0, 0.05, 0.05)) * mix(0.72, 1.0, light) + glint * light * 1.2, 0.0, 0.94);
  ground = mix(ground, -log(1.0 - wt) / 1.5, wet);

  vec4 sp = texture2D(uSprites, vUv);
  ground = ground * (1.0 - sp.a) + sp.rgb * mix(amb * 1.1, sun, lightUp);

  vec4 air = texture2D(uAir, vUv);
  ground = ground * (1.0 - air.a * 0.3) + air.rgb * mix(0.5, 1.25, light);

  vec4 fore = texture2D(uFore, vUv);
  ground = ground * (1.0 - fore.a) + fore.rgb * vec3(1.32, 1.26, 1.12);

  gl_FragColor = vec4(1.0 - exp(-ground * 1.5), 1.0);
}`;

const POST = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform float uFocus, uSeed, uDim;

float hash(vec2 p) {
  p = fract(p * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec2 px = 1.0 / uRes;
  float k = uRes.x / 1100.0;

  // Miniature focus: a sharp band through the bench, softer above and below.
  float blur = smoothstep(0.28, 0.7, abs(vUv.y - uFocus)) * 2.2 * k;
  vec3 c = texture2D(uScene, uv).rgb;
  float rot = hash(gl_FragCoord.xy) * 6.283;
  if (blur > 0.25) {
    vec3 acc = c;
    for (int i = 1; i < 12; i++) {
      float fi = float(i);
      float a = fi * 2.39996 + rot;
      acc += texture2D(uScene, uv + vec2(cos(a), sin(a)) * sqrt(fi / 11.0) * blur * px * 1.6).rgb;
    }
    c = acc / 12.0;
  }

  // Halation and a faint mist: highlights bleed a little light around.
  vec3 bloom = vec3(0.0);
  vec3 veil = vec3(0.0);
  for (int i = 1; i < 9; i++) {
    float fi = float(i);
    float a = fi * 2.39996 + rot;
    vec3 s = texture2D(uScene, uv + vec2(cos(a), sin(a)) * sqrt(fi / 8.0) * px * 26.0 * k).rgb;
    bloom += max(s - 0.72, 0.0);
    veil += s;
  }
  c = mix(c, veil / 8.0, 0.12);
  c += bloom / 8.0 * vec3(1.0, 0.94, 0.88) * 1.3;

  // Grade: rich colour, ink-blue blacks, cream whites, warm highlights.
  float l0 = dot(c, vec3(0.3, 0.59, 0.11));
  c = clamp(mix(vec3(l0), c, 1.18), 0.0, 1.0);
  c = mix(vec3(0.04, 0.08, 0.18), vec3(1.0, 0.99, 0.95), c);
  float lum = dot(c, vec3(0.3, 0.59, 0.11));
  c += vec3(0.05, 0.04, 0.0) * smoothstep(0.6, 1.0, lum);
  // Low western sun: a warm haze leaks in from that side, pastel at the corners.
  c += vec3(0.10, 0.085, 0.05) * smoothstep(0.8, 0.0, length((vUv - vec2(-0.05, 0.75)) * vec2(1.0, 0.8)));
  c += vec3(0.07, 0.03, 0.06) * smoothstep(0.55, 0.0, length(vUv - vec2(1.05, -0.05)));
  c += vec3(0.0, 0.05, 0.045) * smoothstep(0.5, 0.0, length(vUv - vec2(0.95, 1.05)));
  vec2 v = vUv - 0.5;
  c *= 1.0 - dot(v, v) * 0.12;
  float g = hash(gl_FragCoord.xy + uSeed) + hash(gl_FragCoord.xy * 1.37 - uSeed) - 1.0;
  c += g * mix(0.065, 0.035, lum);

  gl_FragColor = vec4(c * uDim, 1.0);
}`;

export interface FrameParams {
  w: number;
  h: number;
  m: number;
  time: number;
  wind: number;
  camX: number;
  camY: number;
  sunX: number;
  sunY: number;
  ripples: Float32Array;
  focus: number;
  dim: number;
}

export interface Renderer {
  setMap(data: Uint8Array, w: number, h: number): void;
  resize(w: number, h: number): void;
  draw(p: FrameParams, layers: TexImageSource[]): void;
  dispose(): void;
}

function compile(gl: WebGLRenderingContext, frag: string) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
  return prog;
}

function texture(gl: WebGLRenderingContext) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: false });
  if (!gl) return null;
  const ground = compile(gl, GROUND);
  const post = compile(gl, POST);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.useProgram(ground);
  const u = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const gu = {
    size: u(ground, "uSize"), m: u(ground, "uM"), time: u(ground, "uTime"), wind: u(ground, "uWind"),
    cam: u(ground, "uCam"), sun: u(ground, "uSun"), ripples: u(ground, "uRipples"),
  };
  const names = ["uMap", "uSprites", "uShade", "uAir", "uFore", "uCanopy"];
  const texs = names.map((n, i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    const t = texture(gl);
    gl.uniform1i(u(ground, n), i);
    return t;
  });

  gl.useProgram(post);
  const pu = { scene: u(post, "uScene"), res: u(post, "uRes"), focus: u(post, "uFocus"), seed: u(post, "uSeed"), dim: u(post, "uDim") };
  gl.uniform1i(pu.scene, 6);
  gl.activeTexture(gl.TEXTURE6);
  const sceneTex = texture(gl);
  const fbo = gl.createFramebuffer();
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

  return {
    setMap(data, w, h) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texs[0]);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    },
    resize(w, h) {
      canvas.width = w;
      canvas.height = h;
      gl.activeTexture(gl.TEXTURE6);
      gl.bindTexture(gl.TEXTURE_2D, sceneTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    draw(p, layers) {
      gl.useProgram(ground);
      for (let i = 0; i < 5; i++) {
        gl.activeTexture(gl.TEXTURE1 + i);
        gl.bindTexture(gl.TEXTURE_2D, texs[i + 1]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layers[i]);
      }
      gl.uniform2f(gu.size, p.w, p.h);
      gl.uniform1f(gu.m, p.m);
      gl.uniform1f(gu.time, p.time);
      gl.uniform1f(gu.wind, p.wind);
      gl.uniform2f(gu.cam, p.camX, p.camY);
      gl.uniform2f(gu.sun, p.sunX, p.sunY);
      gl.uniform4fv(gu.ripples, p.ripples);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(post);
      gl.uniform2f(pu.res, canvas.width, canvas.height);
      gl.uniform1f(pu.focus, p.focus);
      gl.uniform1f(pu.seed, Math.floor(12 * p.time) % 97);
      gl.uniform1f(pu.dim, p.dim);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      for (const t of texs) gl.deleteTexture(t);
      gl.deleteTexture(sceneTex);
      gl.deleteFramebuffer(fbo);
      gl.deleteBuffer(buf);
      gl.deleteProgram(ground);
      gl.deleteProgram(post);
    },
  };
}
