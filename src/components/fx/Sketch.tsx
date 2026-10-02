import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Hand-drawn doodles shared across pages: underline, arrow, torn paper edge, sun mark, heart. */

const draw = (delay = 0, duration = 0.9) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { pathLength: { delay, duration, ease: [0.65, 0, 0.35, 1] as const }, opacity: { delay, duration: 0.01 } },
});

export function Scribble({ className, color = "var(--amber)", delay = 0.3 }: { className?: string; color?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" className={cn("pointer-events-none", className)} aria-hidden="true">
      <motion.path d="M3 13 C 40 6, 80 6, 118 10 S 170 15, 197 7" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" {...draw(delay)} />
      <motion.path d="M10 17 C 60 11, 120 12, 190 12" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity={0.6} {...draw(delay + 0.35, 0.6)} />
    </svg>
  );
}

export function HandArrow({ className, delay = 0.6, flip = false }: { className?: string; delay?: number; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 70" className={cn("pointer-events-none", className)} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden="true">
      <motion.path d="M6 12 C 30 60, 70 66, 108 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" {...draw(delay, 1)} />
      <motion.path d="M92 34 L110 39 L101 55" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...draw(delay + 0.9, 0.35)} />
    </svg>
  );
}

export function SunMark({ className, spin = true }: { className?: string; spin?: boolean }) {
  return (
    <svg viewBox="-50 -50 100 100" className={cn("pointer-events-none", className)} aria-hidden="true">
      <g className={spin ? "animate-sun" : undefined} style={{ transformOrigin: "center", transformBox: "fill-box" }}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M-4 -30 L0 -46 L4 -30Z" fill={i % 2 ? "#FFD66B" : "#F2A71B"} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r="24" fill="#FFC93C" stroke="#2E2A45" strokeOpacity=".45" strokeWidth="1.6" />
      <path d="M-9 4 Q0 12 9 4" fill="none" stroke="#2E2A45" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
      <circle cx="-8" cy="-5" r="2" fill="#2E2A45" fillOpacity=".55" />
      <circle cx="8" cy="-5" r="2" fill="#2E2A45" fillOpacity=".55" />
    </svg>
  );
}

export function DoodleHeart({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 36" className={cn("pointer-events-none", className)} style={style} aria-hidden="true">
      <path d="M20 33 C 6 23, 1 15, 4 9 C 7 2, 16 2, 20 9 C 24 2, 33 2, 36 9 C 39 15, 34 23, 20 33Z" fill="currentColor" stroke="#2E2A45" strokeOpacity=".35" strokeWidth="1.4" />
      <path d="M10 10 Q12 7 15 8" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleLeaf({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("pointer-events-none", className)} style={style} aria-hidden="true">
      <path d="M6 34 C 6 14, 18 4, 36 4 C 36 22, 26 34, 6 34Z" fill="currentColor" stroke="#2E2A45" strokeOpacity=".35" strokeWidth="1.3" />
      <path d="M8 32 C 16 22, 24 14, 32 8" fill="none" stroke="#2E2A45" strokeOpacity=".35" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleCloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 60" className={cn("pointer-events-none", className)} style={style} aria-hidden="true">
      <path
        d="M14 50 C 2 50, 2 32, 16 32 C 14 18, 34 12, 42 24 C 46 6, 74 4, 78 22 C 90 14, 108 22, 104 36 C 118 36, 118 50, 104 50Z"
        fill="#fff"
        stroke="#2E2A45"
        strokeOpacity=".3"
        strokeWidth="1.5"
        style={{ filter: "drop-shadow(0 6px 6px rgba(120,80,30,.12))" }}
      />
    </svg>
  );
}

/** Watercolour bleed edge — the painting dissolves into the page instead of a hard cut. */
export function WashEdge({ className, fill = "var(--paper)" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={cn("pointer-events-none block h-16 w-full md:h-24", className)} aria-hidden="true">
      <defs>
        <filter id="wash-bleed" x="-5%" y="-40%" width="110%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="3" seed="8" />
          <feDisplacementMap in="SourceGraphic" scale="34" />
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <path d="M-40 70 C 200 40 420 86 720 60 C 1000 36 1220 84 1480 56 L1480 160 L-40 160Z" fill={fill} filter="url(#wash-bleed)" />
      <path d="M-40 92 C 260 76 520 104 820 86 C 1100 70 1300 96 1480 84 L1480 160 L-40 160Z" fill={fill} />
    </svg>
  );
}

/** pencil circle drawn around a number */
export function PencilCircle({ className, color = "var(--red)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 70" preserveAspectRatio="none" className={cn("pointer-events-none", className)} aria-hidden="true">
      <motion.path
        d="M64 6 C 22 4, 4 20, 8 38 C 12 60, 70 68, 100 56 C 122 46, 116 14, 82 8 C 70 6, 50 8, 40 12"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        {...draw(1.4, 0.9)}
      />
    </svg>
  );
}

/**
 * Hand-drawn pencil outline for cards: an ink loop plus a looser second pass in the accent colour.
 * Strokes are non-scaling so the line weight stays the same on any card size. Parent must be `relative`.
 */
export function SketchFrame({ color = "var(--ink)", className }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("sketch-frame-svg pointer-events-none absolute inset-0 z-[3] h-full w-full", className)} aria-hidden="true">
      <path
        d="M3.2 1.7 C30 0.9 70 2.3 96.9 1.5 C98.6 1.7 98.9 3.1 98.7 5 C99.2 35 98.4 70 98.8 95.4 C98.7 97.9 97.4 98.6 95 98.4 C65 99.1 35 98.2 4.6 98.7 C2.1 98.8 1.4 97.5 1.5 95 C1 65 1.9 30 1.3 4.6 C1.4 2.5 2.1 1.8 3.2 1.7Z"
        fill="none"
        stroke="#2E2A45"
        strokeOpacity=".6"
        strokeWidth="1.6"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0.8 3.4 C30 2.6 70 3.8 99.3 2.8 M97.8 0.6 C97.2 30 98.3 70 97.6 99.4 M99.4 97.3 C70 97.9 30 96.8 0.7 97.6 M2.5 99.4 C2.1 70 3 30 2.4 0.6"
        fill="none"
        stroke={color}
        strokeOpacity=".55"
        strokeWidth="1.1"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
