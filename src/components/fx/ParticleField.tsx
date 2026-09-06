import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createAnimationLoop, makeParticles, projectParticle } from "@/lib/particle-scene";

/** Faceted jade, champagne and ruby micro-crystals, projected at different depths. */
export default function ParticleField({ className, density = 1 }: { className?: string; density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;
    const coarse = matchMedia("(pointer: coarse)").matches;
    const particles = makeParticles((coarse ? 24 : 56) * density);
    // Pre-render materials once; no gradients, shadows or allocations in the draw loop.
    const sprites = ["14,124,102", "180,131,51", "180,35,61"].map((color) => {
      const sprite = document.createElement("canvas"); sprite.width = sprite.height = 64;
      const g = sprite.getContext("2d")!;
      const glow = g.createRadialGradient(30, 27, 2, 32, 32, 29);
      glow.addColorStop(0, `rgba(${color},.18)`); glow.addColorStop(1, `rgba(${color},0)`);
      g.fillStyle = glow; g.fillRect(0, 0, 64, 64);
      const face = g.createLinearGradient(21, 15, 43, 48);
      face.addColorStop(0, "rgba(255,255,255,.95)"); face.addColorStop(.48, `rgba(${color},.65)`); face.addColorStop(1, `rgba(${color},.12)`);
      g.beginPath(); g.moveTo(32, 11); g.lineTo(45, 29); g.lineTo(32, 53); g.lineTo(19, 29); g.closePath();
      g.fillStyle = face; g.fill(); g.strokeStyle = `rgba(${color},.45)`; g.lineWidth = .8; g.stroke();
      g.beginPath(); g.moveTo(32, 12); g.lineTo(28, 30); g.lineTo(32, 52); g.moveTo(20, 29); g.lineTo(44, 29);
      g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 1; g.stroke();
      return sprite;
    });
    let width = 1, height = 1, visible = false, previous = 0, elapsed = 0, scroll = 0;
    let px = 0, py = 0, tx = 0, ty = 0;
    let pointerX = -9999, pointerY = -9999;
    const resize = () => {
      const rect = parent.getBoundingClientRect(); width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const loop = createAnimationLoop((time) => {
      const dt = previous ? Math.min((time - previous) / 1000, .033) : 0;
      previous = time; elapsed += dt;
      const follow = 1 - Math.exp(-5 * dt); px += (tx - px) * follow; py += (ty - py) * follow;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const q = projectParticle(p, width, height, elapsed, px, py, scroll);
        const dx = q.x - pointerX, dy = q.y - pointerY, distance = Math.hypot(dx, dy);
        const force = Math.max(0, 1 - distance / 150) ** 2 * 18 * q.scale;
        const x = q.x + dx / Math.max(1, distance) * force, y = q.y + dy / Math.max(1, distance) * force;
        const size = p.size * q.scale;
        ctx.save(); ctx.translate(x, y); ctx.rotate(q.angle);
        ctx.globalAlpha = .28 + q.scale * .5;
        ctx.drawImage(sprites[p.material], -size / 2, -size / 2, size, size); ctx.restore();
      }
    }, { request: requestAnimationFrame, cancel: cancelAnimationFrame });
    const sync = () => {
      previous = 0;
      if (visible && !document.hidden && width > 0 && height > 0) loop.start(); else loop.stop();
    };
    const onScroll = () => { scroll = Math.max(0, Math.min(height, -parent.getBoundingClientRect().top)); };
    const move = (e: PointerEvent) => {
      if (coarse || e.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect(); pointerX = e.clientX - rect.left; pointerY = e.clientY - rect.top;
      tx = pointerX / Math.max(1, width) - .5; ty = pointerY / Math.max(1, height) - .5;
    };
    const leave = () => { tx = ty = 0; pointerX = pointerY = -9999; };
    resize();
    const ro = new ResizeObserver(() => { resize(); sync(); }); ro.observe(parent);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }); io.observe(parent);
    document.addEventListener("visibilitychange", sync);
    parent.addEventListener("pointermove", move, { passive: true }); parent.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      loop.stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", sync);
      parent.removeEventListener("pointermove", move); parent.removeEventListener("pointerleave", leave); window.removeEventListener("scroll", onScroll);
    };
  }, [reduced, density]);
  if (reduced) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
