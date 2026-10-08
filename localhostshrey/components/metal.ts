/**
 * Black anodized metal, lit by a point light that follows the cursor.
 *
 * The surface is a height field (bevelled edge + brushed micro-relief + an X engraved
 * into it). Normals come from that field; shading is diffuse + anisotropic brushed-metal
 * specular + a polished (isotropic) response inside the engraving + a faint environment
 * reflection. No painted gradients: the look comes from the light interacting with relief.
 */

const X_PATH =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";

const VERT = `
attribute vec2 aPos;
uniform vec2 uSize;
varying vec2 vP;
void main(){
  vP = (aPos * .5 + .5) * vec2(uSize.x, uSize.y);
  vP.y = uSize.y - vP.y;
  gl_Position = vec4(aPos, 0., 1.);
}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uSize;     // css px
uniform vec2 uMouse;    // -1..1 (spring-smoothed)
uniform float uLift;    // 0..1
uniform float uLightMode; // 0 = black/gunmetal, 1 = silver
uniform vec2 uShift;    // css px parallax of the engraving
uniform sampler2D uX;
varying vec2 vP;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float sdBox(vec2 p){
  vec2 h = uSize * .5; float r = 10.;
  vec2 q = abs(p - h) - (h - r);
  return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r;
}
float mask(vec2 p){
  vec2 q = (p - uShift) / uSize;
  return texture2D(uX, vec2(q.x, 1. - q.y)).a;
}
float maskB(vec2 p){
  float m = mask(p + vec2(1.6, 0.)) + mask(p - vec2(1.6, 0.)) + mask(p + vec2(0., 1.6)) + mask(p - vec2(0., 1.6));
  return m * .25;
}
float height(vec2 p){
  float d = sdBox(p);
  float bevel = smoothstep(0., 5., -d) * 3.2;                       // chamfered edge
  float brush = vnoise(vec2(p.x * .05, p.y * 2.4)) * .5 + vnoise(vec2(p.x * .13, p.y * 6.1)) * .3;
  float x = mask(p) * .55 + maskB(p) * .45;                            // engraving, slightly soft-edged
  return bevel + brush * .14 - x * 2.0;
}

void main(){
  vec2 p = vP;
  float d = sdBox(p);
  float alpha = 1. - smoothstep(-.6, .6, d);
  if (alpha < .01) discard;

  float e = .9;
  float hx = height(p + vec2(e, 0.)) - height(p - vec2(e, 0.));
  float hy = height(p + vec2(0., e)) - height(p - vec2(0., e));
  vec3 N = normalize(vec3(-hx / (2. * e), -hy / (2. * e), 1.));

  // point light above the card; rests up-left, follows the cursor while hovering
  vec2 half_ = uSize * .5;
  vec2 lm = mix(vec2(-.55, -.8), uMouse, uLift);
  vec3 Lp = vec3(half_ + lm * half_ * 1.1, 150.);
  vec3 Lv = Lp - vec3(p, 0.);
  float dist = length(Lv);
  vec3 L = Lv / dist;
  float att = 1. / (1. + pow(dist / 250., 2.));                        // real falloff across the surface

  vec3 V = vec3(0., 0., 1.);
  vec3 H = normalize(L + V);
  float ndl = max(dot(N, L), 0.);
  float ndh = max(dot(N, H), 0.);

  float m = mask(p), mb = maskB(p);
  float xm = smoothstep(.12, .88, mb);

  // brushed metal: highlight is stretched perpendicular to the brushing direction (x)
  float sinTH = sqrt(max(1. - H.x * H.x, 0.));
  float aniso = pow(sinTH, 110.) * smoothstep(0., .35, ndl);
  float iso = pow(ndh, 46.);

  // two materials: black anodized gunmetal (dark page) and silver / light graphite (light page)
  vec3 darkBase = mix(vec3(.050, .051, .056), vec3(.024, .025, .029), xm);
  vec3 silverBase = mix(vec3(.80, .805, .825), vec3(.52, .525, .545), xm);
  vec3 base = mix(darkBase, silverBase, uLightMode);
  float grain = vnoise(vec2(p.x * .04, p.y * 3.)) * .4 + vnoise(vec2(p.x * .1, p.y * 8.)) * .25;
  base *= mix(.78 + grain * .6, .86 + grain * .34, uLightMode);

  float specSurface = (aniso * .31 + iso * .15) * (1. - xm);
  float specX = (iso * .7 + pow(ndh, 14.) * .12) * xm;               // polished, tighter, its own response

  vec3 R = reflect(-V, N);
  float env = pow(max(dot(R, normalize(vec3(-.4, -.6, .7))), 0.), 6.) * .085;

  float ao = mix(mix(.6, .5, uLightMode), 1., smoothstep(0., 10., -d)) * (1. - mix(.42, .38, uLightMode) * xm);
  float edge = abs(m - mb) * 2.;

  float diff = mix(.55 + ndl * .95, .78 + ndl * .42, uLightMode);
  float attBase = mix(att, mix(att, 1., .65), uLightMode);          // a metal sheet is lit more evenly than black anodize
  float specGain = mix(1., 1.5, uLightMode);
  vec3 col = base * diff * attBase
           + vec3(.86, .88, .93) * (specSurface + specX) * specGain * att * (.72 + .4 * uLift)
           + vec3(.7, .72, .76) * env * mix(1., 1.6, uLightMode) * (1. - xm * .5);
  col *= ao * (1. - edge * .5);
  col = mix(col, col / (1. + col * .18), uLightMode);                   // soften the silver so highlights roll off, never blow out
  gl_FragColor = vec4(col * alpha, alpha);
}`;

export type Metal = {
  render: (nx: number, ny: number, lift: number) => void;
  setLight: (light: boolean) => void;
  resize: () => void;
  destroy: () => void;
};

export function createMetal(canvas: HTMLCanvasElement): Metal | null {
  const gl = (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true }) ||
    canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {
    size: gl.getUniformLocation(prog, "uSize"),
    mouse: gl.getUniformLocation(prog, "uMouse"),
    lift: gl.getUniformLocation(prog, "uLift"),
    shift: gl.getUniformLocation(prog, "uShift"),
    x: gl.getUniformLocation(prog, "uX"),
    mode: gl.getUniformLocation(prog, "uLightMode"),
  };

  const tex = gl.createTexture();
  const maskCanvas = document.createElement("canvas");
  const path = new Path2D(X_PATH);
  let cssW = 0;
  let cssH = 0;
  let last = { nx: 0, ny: 0, lift: 0 };
  let lightMode = 0;

  const resize = () => {
    cssW = canvas.clientWidth;
    cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const ctx = maskCanvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    /* same placement as the old SVG: height 122% of the card, right edge at 106% of its width */
    const size = cssH * 1.22;
    ctx.translate(cssW * 1.06 - size, cssH / 2 - size / 2);
    ctx.scale(size / 24, size / 24);
    ctx.fillStyle = "#fff";
    ctx.fill(path);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, maskCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw(last.nx, last.ny, last.lift);
  };

  const draw = (nx: number, ny: number, lift: number) => {
    last = { nx, ny, lift };
    if (!cssW || !cssH) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.size, cssW, cssH);
    gl.uniform2f(U.mouse, nx, ny);
    gl.uniform1f(U.lift, Math.max(0, Math.min(1, lift)));
    gl.uniform1f(U.mode, lightMode);
    gl.uniform2f(U.shift, -nx * 5, -ny * 4); // the engraving shifts a touch against the tilt
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(U.x, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  return {
    render: draw,
    setLight: (light: boolean) => {
      lightMode = light ? 1 : 0;
      draw(last.nx, last.ny, last.lift);
    },
    resize,
    destroy: () => {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
