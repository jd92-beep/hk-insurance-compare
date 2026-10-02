import * as THREE from "three";
import { createSketchMaterial, fitCover, loadPhoto, makePaperTexture, PaintMask } from "./sketch-material";

export interface PaintingOptions {
  src: string;
  /** image coordinate (0–1, y up) shown at the view centre, per orientation */
  focus: { landscape: [number, number]; portrait: [number, number] };
  /** sun bloom position in view space (0–1, y up) */
  sun: [number, number];
  washOrigin: [number, number];
  /** light-study side: direction (x,y) and strength; recomputed for portrait screens */
  fade: { landscape: [number, number, number]; portrait: [number, number, number] };
  reduced: boolean;
  /** start drawing immediately (hero) or wait for play() (below-the-fold) */
  autoplay: boolean;
}

export type PaintingScene = Pick<PaintingOptions, "src" | "focus" | "sun" | "washOrigin">;

export interface PaintingHandle {
  ready: Promise<void>;
  play(): void;
  /** wash the current painting off the page, then sketch & paint a new photo */
  setScene(scene: PaintingScene): void;
  setPointer(x: number, y: number): void;
  setScroll(p: number): void;
  dispose(): void;
}

/** Full-bleed photo → live pencil-and-watercolour painting. */
export function createPainting(canvas: HTMLCanvasElement, opts: PaintingOptions): PaintingHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
  const paper = makePaperTexture();
  const mask = new PaintMask();
  let mat: THREE.ShaderMaterial | null = null;
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
  scene.add(quad);

  let raf = 0;
  let running = false;
  let started = opts.autoplay;
  let startAt = performance.now();
  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  let lastPaint: THREE.Vector2 | null = null;
  let scroll = 0;
  let disposed = false;
  let cfg: PaintingScene = { src: opts.src, focus: opts.focus, sun: opts.sun, washOrigin: opts.washOrigin };
  let outro: { at: number; next: THREE.Texture; scene: PaintingScene; lines: number; wash: number } | null = null;
  let sceneToken = 0;

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    if (mat) {
      const aspect = w / h;
      const portrait = aspect < 0.9;
      fitCover(mat, aspect, portrait ? cfg.focus.portrait : cfg.focus.landscape);
      const f = portrait ? opts.fade.portrait : opts.fade.landscape;
      mat.uniforms.uFade.value.set(f[0], f[1], f[2]);
    }
    if (!running) render();
  };

  const render = () => {
    if (mat) renderer.render(scene, camera);
  };

  const frame = (now: number) => {
    if (!mat) return;
    const t = (now - startAt) / 1000;
    const u = mat.uniforms;
    u.uTime.value = now / 1000;
    if (outro) {
      // the old painting dissolves: colour lifts first, then the pencil
      const k = Math.min(1, (now - outro.at) / 900);
      u.uWash.value = outro.wash * (1 - Math.min(1, k * 1.6));
      u.uLines.value = outro.lines * (1 - Math.max(0, k * 1.6 - 0.6));
      if (k >= 1) applyScene(outro.next, outro.scene);
    } else if (started) {
      // pencil draws for ~1.8s, watercolour blooms from 0.9s to ~3.6s
      u.uLines.value = Math.min(1, t / 1.8);
      const w = Math.min(1, Math.max(0, (t - 0.9) / 2.7));
      u.uWash.value = 1 - Math.pow(1 - w, 2.4);
    }
    smooth.lerp(pointer, 0.06);
    u.uMouse.value.copy(smooth);
    u.uScroll.value = scroll;
    mask.fade(0.008);
    render();
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    frame(now);
  };
  const start = () => {
    if (running || opts.reduced || !mat) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
  const ro = new ResizeObserver(resize);

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = 1 - (e.clientY - r.top) / r.height;
    pointer.set(x * 2 - 1, y * 2 - 1);
    if (e.pointerType !== "mouse" || x < 0 || x > 1 || y < 0 || y > 1) return;
    // brush strokes interpolate between pointer samples so fast moves stay continuous
    const p = new THREE.Vector2(x, y);
    if (lastPaint) {
      const steps = Math.ceil(lastPaint.distanceTo(p) / 0.02);
      for (let i = 1; i <= steps; i++) {
        const q = lastPaint.clone().lerp(p, i / steps);
        mask.stroke(q.x, q.y, 0.1, 0.3);
      }
    } else mask.stroke(x, y);
    lastPaint = p;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const applyScene = (tex: THREE.Texture, scene: PaintingScene) => {
    if (!mat) return;
    const old = mat.uniforms.uImage.value as THREE.Texture;
    const img = tex.image as HTMLImageElement;
    mat.uniforms.uImage.value = tex;
    mat.uniforms.uTexel.value.set(1 / img.width, 1 / img.height);
    mat.uniforms.uSun.value.set(scene.sun[0], scene.sun[1]);
    mat.uniforms.uWashOrigin.value.set(scene.washOrigin[0], scene.washOrigin[1]);
    cfg = scene;
    old.dispose();
    outro = null;
    started = true;
    startAt = performance.now();
    resize();
  };

  const ready = loadPhoto(opts.src).then((tex) => {
    if (disposed) {
      tex.dispose();
      return;
    }
    mat = createSketchMaterial(tex, paper, mask.texture);
    mat.uniforms.uSun.value.set(opts.sun[0], opts.sun[1]);
    mat.uniforms.uWashOrigin.value.set(opts.washOrigin[0], opts.washOrigin[1]);
    if (opts.reduced) {
      mat.uniforms.uLines.value = 1;
      mat.uniforms.uWash.value = 1;
    }
    quad.material = mat;
    startAt = performance.now();
    ro.observe(canvas);
    io.observe(canvas);
    resize();
    render();
  });

  return {
    ready,
    play() {
      if (!started) {
        started = true;
        startAt = performance.now();
      }
    },
    setScene(scene) {
      const token = ++sceneToken;
      loadPhoto(scene.src).then((tex) => {
        if (disposed || token !== sceneToken || !mat) return tex.dispose();
        if (opts.reduced || !running) {
          applyScene(tex, scene);
          if (opts.reduced) {
            mat.uniforms.uLines.value = 1;
            mat.uniforms.uWash.value = 1;
          }
          render();
          return;
        }
        outro?.next.dispose();
        outro = { at: performance.now(), next: tex, scene, lines: mat.uniforms.uLines.value, wash: mat.uniforms.uWash.value };
      }, () => undefined);
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    setScroll(p) {
      scroll = p;
      if (opts.reduced) render();
    },
    dispose() {
      disposed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (mat) {
        mat.uniforms.uImage.value.dispose();
        mat.dispose();
      }
      quad.geometry.dispose();
      paper.dispose();
      mask.dispose();
      renderer.dispose();
    },
  };
}
