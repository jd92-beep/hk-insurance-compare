import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useEffect, useRef, useState } from "react";

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
  playOnView = false,
  ...opts
}: Omit<PaintingOptions, "reduced" | "autoplay" | "src"> & {
  src: string;
  alt: string;
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
    let alive = true;
    let h: PaintingHandle | undefined;
    let io: IntersectionObserver | undefined;
    const onLost = () => setFailed(true);
    canvas.addEventListener("webglcontextlost", onLost);
    void Promise.resolve().then(async () => {
      if (!alive) return;
      setReady(false);
      h = createPainting(canvas, { ...optsRef.current, src: shown.current, reduced, autoplay: !playOnView });
      handle.current = h;
      if (playOnView) {
        io = new IntersectionObserver(([e]) => { if (e.intersectionRatio > 0.35) h?.play(); }, { threshold: [0, 0.35, 0.6] });
        io.observe(canvas);
      }
      await h.ready;
      if (alive) setReady(true);
    }).catch(() => { if (alive) setFailed(true); });
    return () => {
      alive = false;
      io?.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      h?.dispose();
      handle.current = null;
    };
  }, [failed, reduced, playOnView]);

  // a new src (slideshow) repaints in place instead of rebuilding the renderer
  useEffect(() => {
    optsRef.current = opts;
    if (src === shown.current) return;
    shown.current = src;
    const current = handle.current;
    void current?.setScene({ src, focus: opts.focus, sun: opts.sun, washOrigin: opts.washOrigin }).catch(() => {
      if (handle.current === current && shown.current === src) setFailed(true);
    });
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
