import { useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { tiltAt } from "@/lib/depth-geometry";

const pointerQuery = "(hover: hover) and (pointer: fine)";
function subscribePointer(callback: () => void) {
  const query = window.matchMedia(pointerQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const finePointer = () => window.matchMedia(pointerQuery).matches;
const serverPointer = () => false;

/**
 * Depth stage: perspective + optional tilt/glare.
 * Text stays on a 2D face (no translateZ) so type is always sharp;
 * depth comes from shadows + rotate, not lifting copy into a 3D layer.
 */
export default function TiltCard({ children, className, max = 12, glare = true, perspective = 1200 }: {
  children: React.ReactNode; className?: string; max?: number; glare?: boolean; perspective?: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useSyncExternalStore(subscribePointer, finePointer, serverPointer);
  const [focused, setFocused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const enabled = fine && !reduced && !focused;
  const active = enabled && hovering;
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 280, damping: 18, mass: 0.55 });
  const rotateY = useSpring(y, { stiffness: 280, damping: 18, mass: 0.55 });
  const glareX = useTransform(y, [-max, max], [12, 88]);
  const glareY = useTransform(x, [-max, max], [88, 12]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,.22), transparent 62%)`;
  const reset = () => { x.set(0); y.set(0); setHovering(false); };
  return <div ref={stage} className={cn("tilt-stage perspective-card relative", className)} data-tilt-enabled={enabled ? "true" : "false"}
    style={{ perspective: Math.max(800, Number.isFinite(perspective) ? perspective : 1200) }}
    onPointerMove={event => {
      if (!enabled || event.pointerType === "touch") return;
      const rect = stage.current?.getBoundingClientRect();
      if (!rect) return;
      setHovering(true);
      const angle = tiltAt(event.clientX-rect.left, event.clientY-rect.top, rect.width, rect.height, max);
      x.set(angle.x); y.set(angle.y);
    }}
    onPointerLeave={reset} onPointerCancel={reset}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
  >
    <motion.div
      className="tilt-face h-full w-full"
      data-tilt-active={active ? "true" : "false"}
      style={{
        rotateX: active ? rotateX : 0,
        rotateY: active ? rotateY : 0,
        transformStyle: "flat",
        boxShadow: active
          ? "0 18px 40px -20px rgba(27,43,37,.45), 0 36px 60px -36px rgba(27,43,37,.35)"
          : "0 10px 28px -16px rgba(27,43,37,.28), 0 22px 40px -28px rgba(27,43,37,.2)",
      }}
    >
      <div className="relative h-full w-full">
        {children}
      </div>
      {glare && active && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
          style={{ background: glareBg, mixBlendMode: "soft-light" }}
        />
      )}
    </motion.div>
  </div>;
}
