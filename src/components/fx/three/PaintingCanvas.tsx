import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { createPainting, type PaintingHandle, type PaintingOptions } from "./painting";

function hasWebGL(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/**
 * Live pencil + watercolour painting of a real photo. Falls back to the softly
 * graded photo itself when WebGL2 is unavailable or the image can't be loaded.
 */
export default function PaintingCanvas({
  src,
  alt,
  progress,
  playOnView = false,
  ...opts
}: Omit<PaintingOptions, "reduced" | "autoplay" | "src"> & {
  src: string;
  alt: string;
  progress?: MotionValue<number>;
  /** wait until the canvas is mostly on screen before drawing */
  playOnView?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [failed, setFailed] = useState(() => !hasWebGL());
  const [ready, setReady] = useState(false);
  const optsRef = useRef(opts);
  const handle = useRef<PaintingHandle | null>(null);
  const shown = useRef(src);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || failed) return;
    const h = createPainting(canvas, { ...optsRef.current, src: shown.current, reduced, autoplay: !playOnView });
    handle.current = h;
    let alive = true;
    h.ready.then(() => alive && setReady(true)).catch(() => alive && setFailed(true));
    const io = playOnView
      ? new IntersectionObserver(([e]) => e.intersectionRatio > 0.35 && h.play(), { threshold: [0, 0.35, 0.6] })
      : null;
    io?.observe(canvas);
    const unsub = progress?.on("change", (v) => h.setScroll(v));
    return () => {
      alive = false;
      io?.disconnect();
      unsub?.();
      h.dispose();
      handle.current = null;
    };
  }, [failed, reduced, playOnView, progress]);

  // a new src (slideshow) repaints in place instead of rebuilding the renderer
  useEffect(() => {
    optsRef.current = opts;
    if (src === shown.current) return;
    shown.current = src;
    handle.current?.setScene({ src, focus: opts.focus, sun: opts.sun, washOrigin: opts.washOrigin });
  });

  if (failed) {
    return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover saturate-[.85] sepia-[.12]" />;
  }
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`${alt}（手繪水彩效果）`}
      className="absolute inset-0 h-full w-full transition-opacity duration-700"
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}
