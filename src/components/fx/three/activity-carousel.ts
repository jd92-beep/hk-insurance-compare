import * as THREE from "three";
import { createSketchMaterial, loadPhoto, makePaperTexture } from "./sketch-material";

export interface CarouselHandle {
  /** fractional index; the carousel eases towards it */
  setTarget(index: number): void;
  onSelect(cb: (index: number) => void): void;
  dispose(): void;
}

const CARD_W = 2.9;
const CARD_H = 2.0;

/**
 * Sketchbook pages hung on a slow 3D ring. The page facing you is fully painted;
 * pages turning away fade back to pencil, so colour "follows" your attention.
 */
export function createActivityCarousel(canvas: HTMLCanvasElement, urls: string[], reduced: boolean): CarouselHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  const n = urls.length;
  const radius = Math.max(3.2, (n * (CARD_W + 0.5)) / (2 * Math.PI));
  camera.position.set(0, 0.2, radius + 3.7);
  camera.lookAt(0, 0, radius - 1);

  const paper = makePaperTexture();
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  const ring = new THREE.Group();
  scene.add(ring);

  // a page: slightly curled plane + paper mount + soft contact shadow
  const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 24, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, -Math.pow(x / (CARD_W / 2), 2) * 0.12);
  }
  geo.computeVertexNormals();
  const mountGeo = new THREE.PlaneGeometry(CARD_W + 0.16, CARD_H + 0.16, 24, 1);
  const mpos = mountGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < mpos.count; i++) mpos.setZ(i, -Math.pow(mpos.getX(i) / (CARD_W / 2 + 0.08), 2) * 0.12 - 0.01);
  const mountMat = new THREE.MeshBasicMaterial({ color: "#FFFFFF" });
  const shadowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(32, 32, 4, 32, 32, 32);
    gr.addColorStop(0, "rgba(90,60,20,.38)");
    gr.addColorStop(1, "rgba(90,60,20,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const shadowGeo = new THREE.PlaneGeometry(CARD_W * 1.25, CARD_H * 1.3);

  const cards: { g: THREE.Group; mat?: THREE.ShaderMaterial; face: THREE.Mesh }[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const g = new THREE.Group();
    g.position.set(Math.sin(a) * radius, 0, Math.cos(a) * radius);
    g.rotation.y = a;
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.set(0.12, -0.16, -0.06);
    const mount = new THREE.Mesh(mountGeo, mountMat);
    const face = new THREE.Mesh<THREE.BufferGeometry, THREE.Material>(geo, new THREE.MeshBasicMaterial({ color: "#F4E9D6" }));
    face.userData.index = i;
    g.add(shadow, mount, face);
    ring.add(g);
    cards.push({ g, face });
    loadPhoto(urls[i]).then((tex) => {
      if (disposed) return tex.dispose();
      const mat = createSketchMaterial(tex, paper, blank);
      const img = tex.image as HTMLImageElement;
      const imgAspect = img.width / img.height;
      const cardAspect = CARD_W / CARD_H;
      mat.uniforms.uCover.value.set(imgAspect > cardAspect ? cardAspect / imgAspect : 1, imgAspect > cardAspect ? 1 : imgAspect / cardAspect);
      mat.uniforms.uAspect.value = cardAspect;
      mat.uniforms.uLines.value = 1;
      mat.uniforms.uWash.value = 1;
      mat.uniforms.uSoftLod.value = 0.4;
      mat.uniforms.uFade.value.set(0, 0, 0);
      mat.uniforms.uSun.value.set(0.8, 0.85);
      mat.uniforms.uWashOrigin.value.set(0.5, 0.5);
      (face.material as THREE.Material).dispose();
      face.material = mat;
      cards[i].mat = mat;
      if (reduced) render();
    });
  }

  let target = 0;
  let current = 0;
  let raf = 0;
  let running = false;
  let disposed = false;
  let selectCb: ((i: number) => void) | null = null;
  const pointer = new THREE.Vector2(9, 9);
  const raycaster = new THREE.Raycaster();

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 52 : 34;
    camera.updateProjectionMatrix();
    render();
  };

  const render = () => {
    ring.rotation.y = -(current / n) * Math.PI * 2;
    const t = performance.now() / 1000;
    cards.forEach((c, i) => {
      // angular distance from the front, in "cards"
      let d = ((i - current) % n + n) % n;
      if (d > n / 2) d -= n;
      const facing = Math.min(1, Math.abs(d));
      if (c.mat) {
        c.mat.uniforms.uDim.value = facing;
        c.mat.uniforms.uTime.value = t;
      }
      c.g.position.y = Math.sin(t * 0.8 + i) * 0.04 * (1 - facing);
      c.g.scale.setScalar(1 + (1 - facing) * 0.06);
    });
    renderer.render(scene, camera);
  };

  const loop = () => {
    raf = requestAnimationFrame(loop);
    current += (target - current) * 0.08;
    render();
  };
  const start = () => {
    if (running || reduced) return;
    running = true;
    loop();
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
  io.observe(canvas);
  resize();

  const onClick = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(cards.map((c) => c.face))[0];
    if (hit) selectCb?.(hit.object.userData.index as number);
  };
  canvas.addEventListener("click", onClick);

  return {
    setTarget(index) {
      target = index;
      if (reduced) {
        current = index;
        render();
      }
    },
    onSelect(cb) {
      selectCb = cb;
    },
    dispose() {
      disposed = true;
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("click", onClick);
      cards.forEach((c) => {
        c.mat?.uniforms.uImage.value.dispose();
        (c.face.material as THREE.Material).dispose();
      });
      [geo, mountGeo, shadowGeo].forEach((g) => g.dispose());
      [mountMat, shadowMat].forEach((m) => m.dispose());
      shadowTex.dispose();
      paper.dispose();
      blank.dispose();
      renderer.dispose();
    },
  };
}
