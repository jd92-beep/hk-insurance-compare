import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Depth toolkit for the landing page:
 *  - <Parallax speed>   a layer that travels at its own speed while the page scrolls
 *  - <Sticker>          die-cut, slightly thick sticker: tilts toward the pointer, can be picked up & dropped
 */

/** speed > 0 drifts up faster than the page (foreground), < 0 lags behind (background) */
export function Parallax({
  speed = 0.2,
  rotate = 0,
  x = 0,
  className,
  style,
  children,
  progress,
}: {
  speed?: number;
  rotate?: number;
  /** horizontal drift in px over the layer's journey */
  x?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  /** drive by an external progress instead of this layer's own scroll position */
  progress?: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const own = useScroll({ target: ref, offset: ["start end", "end start"] }).scrollYProgress;
  const p = progress ?? own;
  const y = useTransform(p, [0, 1], [speed * 220, -speed * 220]);
  const r = useTransform(p, [0, 1], [-rotate, rotate]);
  const dx = useTransform(p, [0, 1], [-x / 2, x / 2]);
  return (
    <motion.div ref={ref} className={className} style={reduced ? style : { ...style, y, rotate: r, x: dx }}>
      {children}
    </motion.div>
  );
}

const fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function Sticker({
  children,
  className,
  tilt = 0,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  /** resting rotation (deg) */
  tilt?: number;
  /** accessible description; omit for purely decorative stickers */
  label?: string;
}) {
  const reduced = useReducedMotion();
  const [interactive] = useState(() => fine() && !reduced);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 260, damping: 18 });
  const sy = useSpring(ry, { stiffness: 260, damping: 18 });
  const glossX = useTransform(sy, [-25, 25], ["0%", "100%"]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const r = e.currentTarget.getBoundingClientRect();
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 40);
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 40);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("sticker pointer-events-auto relative select-none", interactive && "cursor-grab active:cursor-grabbing", className)}
      style={{ rotate: tilt, rotateX: sx, rotateY: sy, transformPerspective: 500 }}
      drag={interactive}
      dragSnapToOrigin
      dragElastic={0.5}
      dragTransition={{ bounceStiffness: 260, bounceDamping: 14 }}
      whileHover={interactive ? { scale: 1.1, z: 40 } : undefined}
      whileDrag={{ scale: 1.18, rotate: 0, zIndex: 50 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div className="sticker-cut">{children}</div>
      {/* vinyl gloss that slides with the tilt */}
      <motion.div
        aria-hidden="true"
        className="sticker-gloss pointer-events-none absolute inset-0"
        style={{ backgroundPositionX: glossX }}
      />
    </motion.div>
  );
}
