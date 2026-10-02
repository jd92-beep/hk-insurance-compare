/**
 * 「寫實手繪」材質：把真實相片即時畫成 鉛筆線稿 → 排線陰影 → 水彩暈染 → 紙紋。
 * A photo stays recognisably real; the rendering is pencil + watercolour on cold-press paper.
 *
 *  uLines  0→1  pencil contours draw themselves in (diagonal, noisy reveal)
 *  uWash   0→1  watercolour bleeds outward from uWashOrigin with a ragged, blooming edge
 *  uPaint       canvas mask: where the visitor hovers, the painting turns closer to the real photo
 *  uFade        keeps one side of the sheet as a light pencil study (text sits there)
 */
import * as THREE from "three";

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uPaper;
uniform sampler2D uPaint;
uniform vec2 uTexel;
uniform vec2 uCover;
uniform vec2 uFocus;
uniform vec2 uMouse;
uniform vec2 uSun;
uniform vec2 uWashOrigin;
uniform vec3 uFade;      // xy = direction the light study fades from, z = strength
uniform float uAspect;
uniform float uTime;
uniform float uLines;
uniform float uWash;
uniform float uScroll;
uniform float uDim;      // 0 = vivid, 1 = pencil-only (used by the 3D carousel)
uniform float uSoftLod;  // blur of the watercolour body (lower = crisper, for small pages)
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

float sobel(vec2 uv, vec2 t) {
  float tl = luma(texture2D(uImage, uv + vec2(-t.x,  t.y), 1.0).rgb);
  float  l = luma(texture2D(uImage, uv + vec2(-t.x,  0.0), 1.0).rgb);
  float bl = luma(texture2D(uImage, uv + vec2(-t.x, -t.y), 1.0).rgb);
  float  u = luma(texture2D(uImage, uv + vec2( 0.0,  t.y), 1.0).rgb);
  float  d = luma(texture2D(uImage, uv + vec2( 0.0, -t.y), 1.0).rgb);
  float tr = luma(texture2D(uImage, uv + vec2( t.x,  t.y), 1.0).rgb);
  float  r = luma(texture2D(uImage, uv + vec2( t.x,  0.0), 1.0).rgb);
  float br = luma(texture2D(uImage, uv + vec2( t.x, -t.y), 1.0).rgb);
  float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
  float gy = -tl - 2.0 * u - tr + bl + 2.0 * d + br;
  return length(vec2(gx, gy));
}

void main() {
  vec2 uv = vUv;
  // 2.5D: the lower (nearer) part of the scene drifts more with the pointer & scroll
  float near = 1.0 - uv.y;
  uv += uMouse * 0.012 * (0.25 + near);
  uv.y -= uScroll * 0.05 * near;
  vec2 iuv = (uv - 0.5) * uCover + uFocus;

  // the painting sits on the page with a deckled, brushy border
  float border = min(min(iuv.x, 1.0 - iuv.x), min(iuv.y, 1.0 - iuv.y));
  float area = smoothstep(0.0, 0.07, border + (fbm(iuv * 7.0) - 0.5) * 0.06);
  iuv = clamp(iuv, 0.001, 0.999);

  // hand-drawn "boil": contours re-trace a few times per second
  float boil = floor(uTime * 4.0);
  vec2 wob = (vec2(noise(iuv * 30.0 + boil), noise(iuv * 30.0 + boil + 9.1)) - 0.5) * 0.0022;

  // ── watercolour body ──
  vec3 sharp = texture2D(uImage, iuv).rgb;
  vec3 soft = texture2D(uImage, iuv + wob * 2.0, uSoftLod).rgb;
  vec3 broad = texture2D(uImage, iuv, 4.0).rgb;
  float grain = fbm(gl_FragCoord.xy * 0.03);
  float bloom = fbm(iuv * 3.2 + 1.7);
  vec3 q = soft * 6.0 + grain * 0.6;
  vec3 band = (floor(q) + smoothstep(0.3, 0.7, fract(q))) / 6.0;          // soft-edged pigment layers
  vec3 wc = pow(band * 0.55 + soft * 0.45, vec3(0.88));                  // lift shadows: watercolour stays luminous   // flat pigment layers
  wc = mix(vec3(luma(wc)), wc, 1.18);                                   // clean, bright pigment
  wc *= vec3(1.03, 1.0, 0.93);                                           // sunshine warmth
  float pool = clamp(abs(luma(broad) - luma(soft)) * 2.6, 0.0, 1.0);    // pigment pools at shape edges
  wc *= 1.0 - pool * 0.28;
  wc *= 0.9 + 0.22 * bloom;                                             // backruns / blooms
  wc = mix(wc, vec3(1.0), 0.1 + 0.08 * grain);                          // transparent wash lets paper glow

  // the visitor's brush brings the scene closer to the real photo
  float painted = texture2D(uPaint, vUv).r;
  vec3 realish = mix(sharp, soft, 0.2) * vec3(1.03, 1.0, 0.95);
  wc = mix(wc, realish, smoothstep(0.0, 1.0, painted) * 0.9);

  // ── wash reveal: blooms out from the origin with a ragged edge ──
  float spread = distance(vUv * vec2(uAspect, 1.0), uWashOrigin * vec2(uAspect, 1.0));
  float edgeN = fbm(vUv * 5.0 + 3.0) * 0.45;
  float washMask = 1.0 - smoothstep(uWash * 2.1 - 0.1, uWash * 2.1, spread + edgeN);
  float fadePos = dot(vUv - 0.5, uFade.xy) + 0.5;
  float fade = smoothstep(0.3, 0.62, fadePos + (fbm(vUv * 6.0) - 0.5) * 0.25);
  washMask *= mix(1.0, fade, uFade.z);
  washMask = max(washMask, painted * smoothstep(0.0, 0.3, uWash));
  washMask *= 1.0 - uDim * 0.92;
  washMask *= area;
  // wet edge: pigment collects where the wash stops
  float rim = smoothstep(0.02, 0.2, washMask) * (1.0 - smoothstep(0.2, 0.5, washMask));
  wc *= 1.0 - rim * 0.25;

  // ── pencil ──
  float e = sobel(iuv + wob, uTexel * 1.6) + 0.5 * sobel(iuv + wob * 1.6, uTexel * 3.5);
  float pencil = smoothstep(0.14 + 0.16 * uDim, 0.55 + 0.25 * uDim, e);
  pencil *= 0.5 + 0.5 * noise(gl_FragCoord.xy * vec2(0.8, 0.1));        // graphite tooth
  float L = luma(soft);
  float h1 = smoothstep(0.7, 0.98, sin((gl_FragCoord.x + gl_FragCoord.y) * 0.7 + noise(gl_FragCoord.xy * 0.04) * 4.0));
  float hatch = h1 * smoothstep(0.42, 0.12, L) * area * (1.0 - 0.7 * uDim);
  // contours draw in along a noisy diagonal sweep
  float sweep = (vUv.x * 0.55 + (1.0 - vUv.y) * 0.45) + (noise(vUv * 14.0) - 0.5) * 0.25;
  float drawn = smoothstep(sweep - 0.05, sweep, uLines * 1.25);
  // the light-study side keeps only the faintest contours so text stays clean
  float study = mix(1.0, 0.35 + 0.65 * fade, uFade.z);

  // ── compose on paper ──
  vec3 paper = texture2D(uPaper, gl_FragCoord.xy / 512.0).rgb;
  vec3 c = mix(paper, paper * wc * 1.03, washMask);
  float ink = pencil * drawn * area * study * (1.0 - washMask * 0.3) * (1.0 - painted * 0.7);
  c = mix(c, vec3(0.2, 0.18, 0.24), ink * 0.85);
  c *= 1.0 - hatch * drawn * 0.14 * study;

  // sunlight bloom
  vec2 sp = (vUv - uSun) * vec2(uAspect, 1.0);
  float sun = exp(-dot(sp, sp) * 4.0);
  c += vec3(1.0, 0.8, 0.45) * sun * (0.2 + 0.04 * sin(uTime * 1.3)) * (0.5 + 0.5 * washMask);

  gl_FragColor = vec4(c, 1.0);
}
`;

export function makePaperTexture(): THREE.CanvasTexture {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 249 + r() * 6;
    img.data[i] = n;
    img.data[i + 1] = n - 1;
    img.data[i + 2] = n - 3;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  for (let i = 0; i < 700; i++) {
    const x = r() * size, y = r() * size, a = r() * Math.PI * 2, l = 4 + r() * 18;
    g.globalAlpha = 0.03 + r() * 0.06;
    g.strokeStyle = r() > 0.5 ? "#8a6a3a" : "#ffffff";
    g.lineWidth = 0.5 + r() * 0.7;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function loadPhoto(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.generateMipmaps = true;
        t.anisotropy = 4;
        resolve(t);
      },
      undefined,
      reject,
    );
  });
}

export interface SketchUniforms {
  [k: string]: THREE.IUniform;
}

export function createSketchMaterial(image: THREE.Texture, paper: THREE.Texture, paint: THREE.Texture): THREE.ShaderMaterial {
  const w = (image.image as HTMLImageElement).width || 1600;
  const h = (image.image as HTMLImageElement).height || 1000;
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uImage: { value: image },
      uPaper: { value: paper },
      uPaint: { value: paint },
      uTexel: { value: new THREE.Vector2(1 / w, 1 / h) },
      uCover: { value: new THREE.Vector2(1, 1) },
      uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      uMouse: { value: new THREE.Vector2() },
      uSun: { value: new THREE.Vector2(0.2, 0.85) },
      uWashOrigin: { value: new THREE.Vector2(0.65, 0.5) },
      uFade: { value: new THREE.Vector3(-1, 0, 0) },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uLines: { value: 0 },
      uWash: { value: 0 },
      uScroll: { value: 0 },
      uDim: { value: 0 },
      uSoftLod: { value: 1.5 },
    },
  });
}

/** "cover" scale; `focus` = image coordinate (0–1) placed at the view centre (may pan past the edge onto bare paper) */
export function fitCover(mat: THREE.ShaderMaterial, viewAspect: number, focus: [number, number]) {
  const img = mat.uniforms.uImage.value.image as HTMLImageElement;
  const imgAspect = img.width / img.height;
  const cover = viewAspect > imgAspect ? new THREE.Vector2(1, imgAspect / viewAspect) : new THREE.Vector2(viewAspect / imgAspect, 1);
  mat.uniforms.uCover.value.copy(cover);
  mat.uniforms.uFocus.value.set(focus[0], focus[1]);
  mat.uniforms.uAspect.value = viewAspect;
}

/** Soft persistent "brush" mask painted by the pointer, fading slowly back to the sketch. */
export class PaintMask {
  readonly canvas = document.createElement("canvas");
  readonly texture: THREE.CanvasTexture;
  private g: CanvasRenderingContext2D;
  constructor(size = 256) {
    this.canvas.width = this.canvas.height = size;
    this.g = this.canvas.getContext("2d")!;
    this.g.fillStyle = "#000";
    this.g.fillRect(0, 0, size, size);
    this.texture = new THREE.CanvasTexture(this.canvas);
  }
  /** x,y in 0–1 (uv space, y up) */
  stroke(x: number, y: number, radius = 0.09, strength = 0.35) {
    const s = this.canvas.width;
    const grad = this.g.createRadialGradient(x * s, (1 - y) * s, 0, x * s, (1 - y) * s, radius * s);
    grad.addColorStop(0, `rgba(255,255,255,${strength})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    this.g.fillStyle = grad;
    this.g.fillRect(0, 0, s, s);
  }
  fade(amount = 0.012) {
    this.g.fillStyle = `rgba(0,0,0,${amount})`;
    this.g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.texture.needsUpdate = true;
  }
  dispose() {
    this.texture.dispose();
  }
}
