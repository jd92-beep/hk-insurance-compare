import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { createFrameLoop, particleBudget, seededRandom } from "@/lib/motion-runtime";

import { projectGem } from "@/lib/depth-geometry";

const FRAMES = 24;
/** Cache real rotated 3D facets in a bounded atlas; animation only composites sprites. */
function jewel(hue: string, frame: number): HTMLCanvasElement {
  const tile = document.createElement("canvas"); tile.width = tile.height = 96;
  const c = tile.getContext("2d"); if (!c) return tile;
  c.translate(48, 43);
  const rgb = [1,3,5].map(offset => parseInt(hue.slice(offset, offset+2), 16));
  const yaw = frame / FRAMES * Math.PI * 2;
  const geometry = projectGem(.37 + Math.sin(yaw)*.16, yaw);
  c.fillStyle = `${hue}12`; c.beginPath(); c.ellipse(3, 33, 23, 5, 0, 0, Math.PI*2); c.fill();
  for (const face of geometry) {
    c.beginPath(); face.points.forEach((p,i) => i ? c.lineTo(p.x*30,p.y*30) : c.moveTo(p.x*30,p.y*30)); c.closePath();
    const tint = face.light > .7 ? (face.light-.7)*2.5 : 0;
    const color = rgb.map(channel => Math.round(channel*(.48+face.light*.5)*(1-tint)+248*tint));
    c.fillStyle = `rgb(${color.join(",")})`; c.fill();
    c.strokeStyle = "rgba(255,255,255,.30)"; c.lineWidth = .55; c.stroke();
  }
  return tile;
}

export default function ParticleField({ className, density = 1 }: { className?: string; density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current, host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d", { alpha: true }); if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)"), coarse = matchMedia("(pointer: coarse)");
    const random = seededRandom(92831);
    const atlas = ["#0e7c66", "#b58a48", "#779cae", "#c8102e"].map(hue => Array.from({ length: FRAMES }, (_, frame) => jewel(hue, frame)));
    let particles = Array.from({ length: particleBudget(density, coarse.matches) }, (_, i) => ({
      u: random(), v: random(), z: .18 + random() * .82, phase: random() * Math.PI * 2,
      vx: 0, vy: 0, ox: 0, oy: 0, sprite: i % 4,
    }));
    let width = 1, height = 1, visible = false, last = 0, elapsed = 0;
    const pointer = { x: -10000, y: -10000 };
    const resize = () => {
      const r = host.getBoundingClientRect();
      width = Math.max(1, r.width); height = Math.max(1, r.height);
      const dpr = Math.min(devicePixelRatio || 1, 1.75, Math.sqrt(2_000_000 / (width * height)));
      canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, .04) : 1 / 60;
      last = now; if (!reduced.matches) elapsed += dt;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const depth = 1 / (1.6 - p.z * .6);
        const x = p.u * width + Math.sin(elapsed * .16 + p.phase) * 14 * depth;
        const y = p.v * height + Math.cos(elapsed * .12 + p.phase) * 18 * depth;
        const dx = x + p.ox - pointer.x, dy = y + p.oy - pointer.y, distance = Math.hypot(dx, dy);
        const force = !reduced.matches && distance < 210 ? (1 - distance / 210) * 220 * depth : 0;
        p.vx += ((dx / (distance || 1)) * force - p.ox * 6.5 - p.vx * 5.5) * dt;
        p.vy += ((dy / (distance || 1)) * force - p.oy * 6.5 - p.vy * 5.5) * dt;
        p.ox += p.vx * dt; p.oy += p.vy * dt;
        const size = (30 + p.z * 48) * depth;
        ctx.save(); ctx.translate(x + p.ox, y + p.oy);
        ctx.rotate(Math.sin(p.phase) * .3);
        ctx.globalAlpha = .3 + p.z * .55;
        const frame = Math.floor((elapsed * .8 * depth + p.phase * FRAMES / (Math.PI*2)) % FRAMES);
        ctx.drawImage(atlas[p.sprite][frame], -size / 2, -size / 2, size, size); ctx.restore();
      }
    };
    const loop = createFrameLoop(draw);
    const sync = () => {
      last = 0;
      if (reduced.matches) { leave(); for (const p of particles) p.ox = p.oy = p.vx = p.vy = 0; }
      if (visible && !document.hidden && !reduced.matches) loop.start();
      else { loop.stop(); if (visible && !document.hidden) draw(performance.now()); }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" || coarse.matches || reduced.matches) return;
      // 即場讀 rect：async 數據載入會推移位佈局，cache 咗嘅 top/left 會過期
      const r = host.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    };
    const leave = () => { pointer.x = pointer.y = -10000; };
    const updatePointerBudget = () => {
      const budget = particleBudget(density, coarse.matches);
      if (particles.length > budget) particles = particles.slice(0, budget);
      while (particles.length < budget) particles.push({ u: random(), v: random(), z: .18+random()*.82, phase: random()*Math.PI*2, vx: 0, vy: 0, ox: 0, oy: 0, sprite: particles.length%4 });
      leave(); sync();
    };
    resize();
    const ro = new ResizeObserver(() => { resize(); if (reduced.matches) draw(performance.now()); }); ro.observe(host);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }); io.observe(host);
    host.addEventListener("pointermove", move, { passive: true }); host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync); reduced.addEventListener("change", sync); coarse.addEventListener("change", updatePointerBudget);
    return () => {
      loop.stop(); ro.disconnect(); io.disconnect();
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync); reduced.removeEventListener("change", sync); coarse.removeEventListener("change", updatePointerBudget);
    };
  }, [density]);
  return <canvas ref={canvasRef} aria-hidden="true" data-particle-quality="faceted-depth" data-gem-geometry="projected-3d-33-faces" className={cn("pointer-events-none absolute inset-0", className)} />;
}
