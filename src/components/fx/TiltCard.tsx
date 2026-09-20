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
 * Depth stage. At rest the face is a **plain 2D div** (no perspective/z/rotate)
 * so card copy stays pixel-sharp. Tilt/glare only mount while the pointer moves.
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

  // Resting: zero 3D chrome — perspective must not sit on the text raster path.
  return (
    <div
      ref={stage}
      className={cn("tilt-stage relative card-text-sharp", className)}
      data-tilt-enabled={enabled ? "true" : "false"}
      data-tilt-active={active ? "true" : "false"}
      style={active ? { perspective: Math.max(800, perspective || 1200) } : undefined}
      onPointerMove={(event) => {
        if (!enabled || event.pointerType === "touch") return;
        const rect = stage.current?.getBoundingClientRect();
        if (!rect) return;
        setHovering(true);
        const angle = tiltAt(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height, max);
        x.set(angle.x);
        y.set(angle.y);
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {!active ? (
        <div className="tilt-face h-full w-full" style={{ transform: "none" }}>
          {children}
        </div>
      ) : (
        <motion.div
          className="tilt-face h-full w-full"
          style={{
            rotateX,
            rotateY,
            transformStyle: "flat",
            boxShadow: "0 18px 40px -20px rgba(27,43,37,.45), 0 36px 60px -36px rgba(27,43,37,.35)",
          }}
        >
          <div className="relative h-full w-full">{children}</div>
          {glare && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
              style={{ background: glareBg, mixBlendMode: "soft-light" }}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}
