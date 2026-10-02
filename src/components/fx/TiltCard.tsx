import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Card stage: on hover the card lifts straight up (2D translate, thicker paper edge from .depth-* CSS) and a soft
 * sunlight glare follows the pointer. No 3D rotation — perspective-rotated text gets resampled by the browser and
 * blurs away from the pointer, so the whole card stays pixel-sharp while hovered.
 * `max` / `perspective` are accepted for call-site compatibility and ignored.
 */
export default function TiltCard({ children, className, glare = true, sketch }: {
  children: React.ReactNode; className?: string; max?: number; glare?: boolean; perspective?: number;
  /** pencil-hatched cast shadow in this colour (hand-drawn cards) */
  sketch?: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stage}
      className={cn("tilt-stage relative h-full", sketch && "tilt-sketch", className)}
      style={sketch ? ({ "--sketch": sketch } as React.CSSProperties) : undefined}
      onPointerMove={event => {
        if (!glare || event.pointerType === "touch") return;
        const el = stage.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${Math.round(((event.clientX - rect.left) / rect.width) * 100)}%`);
        el.style.setProperty("--gy", `${Math.round(((event.clientY - rect.top) / rect.height) * 100)}%`);
      }}
    >
      <div className="tilt-face h-full w-full">
        <div className="tilt-face-card relative h-full w-full">{children}</div>
        {glare && <div aria-hidden="true" className="tilt-glare pointer-events-none absolute inset-0 z-20 rounded-[inherit]" />}
      </div>
    </div>
  );
}
