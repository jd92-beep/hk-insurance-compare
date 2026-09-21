import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
 * - At rest: Zero translateZ and clean resting rotation so text is 100% vector-sharp (pixel-sharp).
 * - Interactive: Smooth 3D tilt + dynamic lift + glare reflection.
 * - Settle: Spring physics smoothly returns to (0,0), then settles cleanly with zero floating point jitter.
 * Stage/face/shadow match card bounds — callers pass `h-full` to prevent empty plates under short cards.
 */
export default function TiltCard({ children, className, max = 12, glare = true, perspective = 1200 }: {
  children: React.ReactNode; className?: string; max?: number; glare?: boolean; perspective?: number;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const fine = useSyncExternalStore(subscribePointer, finePointer, serverPointer);
  const [focused, setFocused] = useState(false);
  const enabled = fine && !reduced && !focused;

  const [isInteracting, setIsInteracting] = useState(false);
  const [isSettled, setIsSettled] = useState(true);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 280, damping: 18, mass: 0.55 });
  const rotateY = useSpring(y, { stiffness: 280, damping: 18, mass: 0.55 });
  // At rest, lift is strictly 0 so resting text stays directly on the baseline canvas plane
  const lift = useSpring(0, { stiffness: 200, damping: 20 });
  const glareX = useTransform(y, [-max, max], [12, 88]);
  const glareY = useTransform(x, [-max, max], [88, 12]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,.22), transparent 62%)`;

  const reset = () => {
    setIsInteracting(false);
    x.set(0);
    y.set(0);
    lift.set(0);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    // After spring physics naturally returns to rest (~320ms), settle cleanly to avoid subpixel floating point blur
    settleTimer.current = setTimeout(() => {
      setIsSettled(true);
    }, 320);
  };

  useEffect(() => {
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  return (
    <div
      ref={stage}
      className={cn("tilt-stage perspective-card relative h-full", className)}
      data-tilt-enabled={enabled ? "true" : "false"}
      data-tilt-active={isInteracting ? "true" : "false"}
      data-tilt-settled={isSettled ? "true" : "false"}
      style={{ perspective: Math.max(800, Number.isFinite(perspective) ? perspective : 1200) }}
      onPointerEnter={() => {
        if (!enabled) return;
        if (settleTimer.current) {
          clearTimeout(settleTimer.current);
          settleTimer.current = null;
        }
        setIsSettled(false);
      }}
      onPointerMove={event => {
        if (!enabled || event.pointerType === "touch") return;
        const rect = stage.current?.getBoundingClientRect();
        if (!rect) return;
        if (settleTimer.current) {
          clearTimeout(settleTimer.current);
          settleTimer.current = null;
        }
        setIsInteracting(true);
        setIsSettled(false);
        const angle = tiltAt(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height, max);
        x.set(angle.x);
        y.set(angle.y);
        lift.set(12);
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <motion.div
        className={cn("tilt-face h-full w-full", !isSettled && "preserve-3d")}
        style={{
          rotateX: isSettled ? 0 : rotateX,
          rotateY: isSettled ? 0 : rotateY,
          z: isSettled ? 0 : lift,
          transformStyle: isSettled ? "flat" : "preserve-3d",
        }}
      >
        {/*
          Content card container:
          - At rest (settled): transformStyle is "flat", NO forced translateZ, text & 1px border rules stay 100% vector-sharp with 2D pixel snapping.
          - During interactive 3D tilt: transformStyle switches to "preserve-3d", subtle translateZ(8px) parallax adds real spatial depth.
        */}
        <div
          className="tilt-face-card relative h-full w-full"
          style={{
            transform: isSettled ? "none" : "translateZ(8px)",
            transition: isSettled ? "transform 0.15s ease-out" : undefined,
          }}
        >
          {children}
        </div>
        {glare && enabled && !isSettled && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
            style={{ background: glareBg, mixBlendMode: "soft-light" }}
          />
        )}
      </motion.div>
    </div>
  );
}
