import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { createFrameLoop, particleBudget, seededRandom } from "@/lib/motion-runtime";

/** Faceted optical gems: pre-rendered atlas, perspective depth, no WebGL payload. */
function jewel(hue: string): HTMLCanvasElement {
  const tile = document.createElement("canvas"); tile.width = tile.height = 96;
  const c = tile.getContext("2d")!;
  c.translate(48, 48);
  const glow = c.createRadialGradient(-5, -8, 1, 0, 0, 44);
  glow.addColorStop(0, `${hue}45`); glow.addColorStop(1, `${hue}00`);
  c.fillStyle = glow; c.fillRect(-48, -48, 96, 96);
  const points = [[0, -24], [17, -10], [21, 9], [0, 26], [-20, 9], [-16, -11]];
  c.beginPath(); points.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath();
  const body = c.createLinearGradient(-18, -24, 20, 26);
  body.addColorStop(0, "#ffffff"); body.addColorStop(.36, `${hue}aa`); body.addColorStop(1, `${hue}33`);
  c.fillStyle = body; c.fill(); c.strokeStyle = `${hue}aa`; c.lineWidth = .8; c.stroke();
  points.forEach(([x,y], i) => {
    const next = points[(i + 1) % points.length];
    c.beginPath(); c.moveTo(-3,-4); c.lineTo(x,y); c.lineTo(next[0],next[1]); c.closePath();
    c.fillStyle = i % 2 ? "#ffffff44" : `${hue}22`; c.fill();
    c.strokeStyle = "#ffffff66"; c.lineWidth = .55; c.stroke();
  });
  c.fillStyle = "#ffffffdd"; c.fillRect(-8,-14,2,7);
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
    const atlas = ["#0e7c66", "#b58a48", "#779cae", "#c8102e"].map(jewel);
    const particles = Array.from({ length: particleBudget(density, coarse.matches) }, (_, i) => ({
      u: random(), v: random(), z: .18 + random() * .82, phase: random() * Math.PI * 2,
      vx: 0, vy: 0, ox: 0, oy: 0, sprite: i % 4,
    }));
    let width = 1, height = 1, top = 0, left = 0, visible = false, last = 0, elapsed = 0;
    const pointer = { x: -10000, y: -10000 };
    const resize = () => {
      const r = host.getBoundingClientRect();
      width = Math.max(1, r.width); height = Math.max(1, r.height);
      top = r.top + window.scrollY; left = r.left + window.scrollX;
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
        const force = !reduced.matches && distance < 145 ? (1 - distance / 145) * 100 * depth : 0;
        p.vx += ((dx / (distance || 1)) * force - p.ox * 7 - p.vx * 6) * dt;
        p.vy += ((dy / (distance || 1)) * force - p.oy * 7 - p.vy * 6) * dt;
        p.ox += p.vx * dt; p.oy += p.vy * dt;
        const size = (18 + p.z * 23) * depth;
        ctx.save(); ctx.translate(x + p.ox, y + p.oy);
        ctx.rotate(p.phase + elapsed * .06 * depth);
        ctx.scale(.72 + .28 * Math.cos(elapsed * .25 + p.phase) ** 2, 1);
        ctx.globalAlpha = .25 + p.z * .48;
        ctx.drawImage(atlas[p.sprite], -size / 2, -size / 2, size, size); ctx.restore();
      }
    };
    const loop = createFrameLoop(draw);
    const sync = () => {
      last = 0;
      if (visible && !document.hidden && !reduced.matches) loop.start();
      else { loop.stop(); if (visible && !document.hidden) draw(performance.now()); }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch" || coarse.matches || reduced.matches) return;
      pointer.x = e.clientX + window.scrollX - left; pointer.y = e.clientY + window.scrollY - top;
    };
    const leave = () => { pointer.x = pointer.y = -10000; };
    resize();
    const ro = new ResizeObserver(() => { resize(); if (reduced.matches) draw(performance.now()); }); ro.observe(host);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }); io.observe(host);
    host.addEventListener("pointermove", move, { passive: true }); host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync); reduced.addEventListener("change", sync);
    return () => {
      loop.stop(); ro.disconnect(); io.disconnect();
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync); reduced.removeEventListener("change", sync);
    };
  }, [density]);
  return <canvas ref={canvasRef} aria-hidden="true" data-particle-quality="faceted-depth" className={cn("pointer-events-none absolute inset-0", className)} />;
}
