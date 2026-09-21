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
 * Web3D-style depth stage: perspective tilt + glare + layered face.
 * Stage/face/shadow must match the card bounds — callers pass `h-full`
 * and the child card must also be `h-full`, or grid stretch leaves a
 * light empty plate under short cards.
 */
export default function TiltCard({ children, className, max = 12, glare = true, perspective = 1200 }: {
  children: React.ReactNode; className?: string; max?: number; glare?: boolean; perspective?: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useSyncExternalStore(subscribePointer, finePointer, serverPointer);
  const [focused, setFocused] = useState(false);
  const enabled = fine && !reduced && !focused;
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 280, damping: 18, mass: 0.55 });
  const rotateY = useSpring(y, { stiffness: 280, damping: 18, mass: 0.55 });
  const lift = useSpring(enabled ? 8 : 0, { stiffness: 200, damping: 20 });
  const glareX = useTransform(y, [-max, max], [12, 88]);
  const glareY = useTransform(x, [-max, max], [88, 12]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,.22), transparent 62%)`;
  const reset = () => { x.set(0); y.set(0); };
  return <div ref={stage} className={cn("tilt-stage perspective-card relative h-full", className)} data-tilt-enabled={enabled ? "true" : "false"}
    style={{ perspective: Math.max(800, Number.isFinite(perspective) ? perspective : 1200) }}
    onPointerMove={event => {
      if (!enabled || event.pointerType === "touch") return;
      const rect = stage.current?.getBoundingClientRect();
      if (!rect) return;
      const angle = tiltAt(event.clientX-rect.left, event.clientY-rect.top, rect.width, rect.height, max);
      x.set(angle.x); y.set(angle.y);
      lift.set(12);
    }}
    onPointerLeave={() => { reset(); lift.set(enabled ? 8 : 0); }}
    onPointerCancel={() => { reset(); lift.set(enabled ? 8 : 0); }}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
  >
    <motion.div
      className="tilt-face preserve-3d h-full w-full"
      style={{
        rotateX,
        rotateY,
        z: lift,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Face shadow only when a child card actually paints the face — avoids a ghost plate on empty stage height */}
      <div className="tilt-face-card relative h-full w-full" style={{ transform: "translateZ(12px)" }}>
        {children}
      </div>
      {glare && enabled && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
          style={{ background: glareBg, mixBlendMode: "soft-light" }}
        />
      )}
    </motion.div>
  </div>;
}
