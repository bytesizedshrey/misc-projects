/**
 * A still photograph that breathes: a cinemagraph-style effect in one small WebGL canvas.
 *
 * The photo is shown as it is; no colour grade, nothing redrawn. Only a few regions are allowed to move, and each only by
 * a pixel or two, because that is all the original already implies:
 *   - the hanging plants sway,
 *   - the haze in the windows shimmers,
 *   - the already motion-blurred people at the sides drift,
 *   - the bright window light slowly breathes,
 *   - a few dust motes float through the sunbeams,
 *   - and a very fine film grain.
 * He (face, hair, hands, cup, body) sits inside a protected mask and never moves.
 * Coordinates below are fractions of the photo (0..1), measured on the 736x414 original.
 */

const VERT = `#version 300 es
precision highp float;
out vec2 v_uv;
void main() {
  float x = float((gl_VertexID << 1) & 2);
  float y = float(gl_VertexID & 2);
  v_uv = vec2(x, y);
  gl_Position = vec4(v_uv * 2.0 - 1.0, 0.0, 1.0);
}`;

const SHARED = `
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){ return 0.6 * vnoise(p) + 0.4 * vnoise(p * 2.07 + 11.3); }
float ell(vec2 p, vec2 c, vec2 r){ return 1.0 - smoothstep(0.62, 1.12, length((p - c) / r)); }
// him: head and hair, the cup and hands, shoulders and arms
float subject(vec2 p){
  return max(ell(p, vec2(0.51, 0.447), vec2(0.115, 0.2)), ell(p, vec2(0.503, 0.773), vec2(0.17, 0.26)));
}
`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o;
uniform sampler2D u_tex;
uniform float u_time, u_reveal, u_motion;
uniform vec2 u_span, u_off;
${SHARED}
void main() {
  vec2 c = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 p = u_off + c * u_span;
  float t = u_time;
  float free = 1.0 - clamp(subject(p) * 1.7, 0.0, 1.0);
  float aroundHead = ell(p, vec2(0.51, 0.44), vec2(0.19, 0.3));
  float calm = free * (1.0 - 0.7 * aroundHead);

  // where the picture is allowed to move
  float plants = smoothstep(0.42, 0.3, p.y) * smoothstep(0.27, 0.36, p.x) * smoothstep(0.92, 0.82, p.x);
  float windows = smoothstep(0.56, 0.64, p.x) * smoothstep(0.62, 0.45, p.y);
  float folks = max(ell(p, vec2(0.23, 0.59), vec2(0.07, 0.3)), ell(p, vec2(0.83, 0.52), vec2(0.075, 0.3)));

  vec2 n = vec2(fbm(p * 7.0 + vec2(t * 0.05, 0.0)), fbm(p * 7.0 + vec2(5.2, -t * 0.04))) - 0.5;
  float sway = sin(t * 0.55 + p.x * 11.0 + n.x * 2.0) * (1.0 - p.y / 0.42);
  vec2 d = vec2(sway, sway * 0.25) * plants * 0.0026
         + n * windows * 0.0022
         + vec2(n.x, n.y * 0.3) * folks * 0.0022;
  d *= calm * u_motion;

  vec3 col = texture(u_tex, p + d).rgb;

  // the window light breathes, very slowly, only where it is already bright
  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  float centre = smoothstep(0.4, 0.46, p.x) * smoothstep(0.6, 0.54, p.x) * smoothstep(0.12, 0.2, p.y) * smoothstep(0.42, 0.32, p.y);
  float zone = max(windows, centre);
  float breathe = 0.5 + 0.5 * sin(t * 0.47 + p.x * 2.5) * (0.6 + 0.4 * sin(t * 0.21 + 1.3));
  col += vec3(1.0, 0.83, 0.58) * smoothstep(0.5, 0.92, lum) * zone * free * (breathe * 0.075 - 0.025) * u_motion;

  // coming up out of the dark when the footer arrives
  float e = clamp(u_reveal, 0.0, 1.0);
  col *= mix(0.3, 1.0, e * e * (3.0 - 2.0 * e));

  // fine film grain, at film speed
  float g = hash(floor(gl_FragCoord.xy) + floor(t * 12.0) * 17.31) - 0.5;
  col += g * 0.03 * u_motion;
  o = vec4(col, 1.0);
}`;

const VERT_DUST = `#version 300 es
precision highp float;
uniform sampler2D u_tex;
uniform float u_time, u_reveal, u_motion, u_dpr, u_scale;
uniform vec2 u_span, u_off;
out float v_a;
${SHARED}
float h1(float n){ return fract(sin(n * 91.345) * 47453.5453); }
void main() {
  float id = float(gl_VertexID);
  float s1 = h1(id + 1.0), s2 = h1(id + 2.0), s3 = h1(id + 3.0), s4 = h1(id + 4.0);
  float tt = u_time * mix(0.004, 0.011, s3) + s4 * 10.0;
  float phase = fract(s2 - tt);
  vec2 p = vec2(fract(s1 + tt * 0.35 + sin(u_time * 0.11 + id) * 0.012), phase);
  vec2 c = (p - u_off) / u_span;
  gl_Position = vec4(c.x * 2.0 - 1.0, 1.0 - c.y * 2.0, 0.0, 1.0);
  float lum = dot(textureLod(u_tex, p, 3.0).rgb, vec3(0.3, 0.59, 0.11));
  float inside = step(0.0, c.x) * step(c.x, 1.0) * step(0.0, c.y) * step(c.y, 1.0);
  float free = 1.0 - clamp(subject(p) * 1.7, 0.0, 1.0);
  float twinkle = 0.55 + 0.45 * sin(u_time * (0.5 + s3) + id * 3.1);
  v_a = smoothstep(0.34, 0.72, lum) * free * sin(3.14159 * phase) * inside * twinkle * u_reveal * u_motion;
  gl_PointSize = mix(1.5, 4.0, s3 * s3) * u_dpr * u_scale;
}`;

const FRAG_DUST = `#version 300 es
precision highp float;
in float v_a;
out vec4 o;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  float a = v_a * smoothstep(1.0, 0.0, r);
  o = vec4(vec3(1.0, 0.9, 0.7) * a * 0.5, a);
}`;

export type LivingPhoto = {
  resize(cssW: number, cssH: number, dpr: number): void;
  render(now: number, reveal: number, motion: number): void;
  dispose(): void;
};

export function createLivingPhoto(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  opts: { dust: number; focusX?: number; focusY?: number },
): LivingPhoto | null {
  const ctx = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    powerPreference: "low-power",
  });
  if (!ctx) return null;
  const gl: WebGL2RenderingContext = ctx;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const prog = (vs: string, fs: string) => {
    const v = sh(gl.VERTEX_SHADER, vs),
      f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  };
  const mainP = prog(VERT, FRAG);
  const dustP = prog(VERT_DUST, FRAG_DUST);
  if (!mainP || !dustP) return null;
  const main: WebGLProgram = mainP;
  const dust: WebGLProgram = dustP;
  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);

  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const vao = gl.createVertexArray()!;
  const imgAspect = image.naturalWidth / image.naturalHeight;
  const fx = opts.focusX ?? 0.52,
    fy = opts.focusY ?? 0.5;
  let W = 1,
    H = 1,
    dpr = 1;
  let span = [1, 1],
    off = [0, 0];

  function resize(cssW: number, cssH: number, ratio: number) {
    W = Math.max(1, Math.round(cssW));
    H = Math.max(1, Math.round(cssH));
    dpr = ratio;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    // "cover": fill the frame, cropping the longer side around the focus point
    const a = W / H;
    span = [Math.min(1, a / imgAspect), Math.min(1, imgAspect / a)];
    off = [(1 - span[0]) * fx, (1 - span[1]) * fy];
  }

  function render(now: number, reveal: number, motion: number) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.disable(gl.BLEND);
    gl.useProgram(main);
    gl.uniform1i(U(main, "u_tex"), 0);
    gl.uniform1f(U(main, "u_time"), now);
    gl.uniform1f(U(main, "u_reveal"), reveal);
    gl.uniform1f(U(main, "u_motion"), motion);
    gl.uniform2f(U(main, "u_span"), span[0], span[1]);
    gl.uniform2f(U(main, "u_off"), off[0], off[1]);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (motion > 0 && opts.dust > 0) {
      gl.useProgram(dust);
      gl.uniform1i(U(dust, "u_tex"), 0);
      gl.uniform1f(U(dust, "u_time"), now);
      gl.uniform1f(U(dust, "u_reveal"), reveal);
      gl.uniform1f(U(dust, "u_motion"), motion);
      gl.uniform1f(U(dust, "u_dpr"), dpr);
      gl.uniform1f(U(dust, "u_scale"), Math.max(0.7, Math.min(1.4, W / 800)));
      gl.uniform2f(U(dust, "u_span"), span[0], span[1]);
      gl.uniform2f(U(dust, "u_off"), off[0], off[1]);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, opts.dust);
      gl.disable(gl.BLEND);
    }
  }

  function dispose() {
    gl.deleteTexture(tex);
    gl.deleteProgram(main);
    gl.deleteProgram(dust);
    gl.deleteVertexArray(vao);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  return { resize, render, dispose };
}
