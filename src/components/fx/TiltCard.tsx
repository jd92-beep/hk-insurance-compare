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

/** Stable, untransformed hit area. Depth never requires hover or distorts keyboard controls. */
export default function TiltCard({ children, className, max = 6, glare = true, perspective = 1000 }: {
  children: React.ReactNode; className?: string; max?: number; glare?: boolean; perspective?: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useSyncExternalStore(subscribePointer, finePointer, serverPointer);
  const [focused, setFocused] = useState(false);
  const enabled = fine && !reduced && !focused;
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 220, damping: 28, mass: .65 });
  const rotateY = useSpring(y, { stiffness: 220, damping: 28, mass: .65 });
  const glareX = useTransform(y, [-7, 7], [15, 85]);
  const glareY = useTransform(x, [-7, 7], [85, 15]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,.12), transparent 65%)`;
  const reset = () => { x.set(0); y.set(0); };
  return <div ref={stage} className={cn("tilt-stage relative", className)} data-tilt-enabled={enabled ? "true" : "false"}
    style={{ perspective: Math.max(700, Number.isFinite(perspective) ? perspective : 1000) }}
    onPointerMove={event => {
      if (!enabled || event.pointerType === "touch") return;
      const rect = stage.current?.getBoundingClientRect();
      if (!rect) return;
      const angle = tiltAt(event.clientX-rect.left, event.clientY-rect.top, rect.width, rect.height, max);
      x.set(angle.x); y.set(angle.y);
    }}
    onPointerLeave={reset} onPointerCancel={reset}
    onFocusCapture={() => { reset(); setFocused(true); }}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <motion.div className="tilt-face relative h-full rounded-[inherit]" style={{ rotateX: enabled ? rotateX : 0, rotateY: enabled ? rotateY : 0, transformStyle: "preserve-3d" }}>
      {children}
      {glare && <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" style={{ background: enabled ? glareBg : "none" }} />}
    </motion.div>
  </div>;
}
