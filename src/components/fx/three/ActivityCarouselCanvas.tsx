import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useEffect, useRef, useState } from "react";

import { createActivityCarousel, type CarouselHandle } from "./activity-carousel";

/** three.js ring of sketchbook pages; `index` may be fractional (scroll-driven). */
export default function ActivityCarouselCanvas({
  urls,
  index,
  onSelect,
  alt,
}: {
  urls: string[];
  index: number;
  onSelect: (i: number) => void;
  alt: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const handle = useRef<CarouselHandle | null>(null);
  const reduced = useReducedMotion() ?? false;
  const [ready, setReady] = useState(false);
  const indexRef = useRef(index);
  useEffect(() => { indexRef.current = index; }, [index]);
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let alive = true;
    let h: CarouselHandle | undefined;
    const onLost = () => setReady(false);
    canvas.addEventListener("webglcontextlost", onLost);
    // GPU initialization and texture loading share one failure path.
    void Promise.resolve().then(async () => {
      if (!alive) return;
      setReady(false);
      h = createActivityCarousel(canvas, urls, reduced);
      h.onSelect((i) => selectRef.current(i));
      h.setTarget(indexRef.current);
      handle.current = h;
      await h.ready;
      if (alive) setReady(true);
    }).catch(() => { if (alive) setReady(false); });
    return () => {
      alive = false;
      canvas.removeEventListener("webglcontextlost", onLost);
      h?.dispose();
      handle.current = null;
    };
  }, [urls, reduced]);

  useEffect(() => {
    handle.current?.setTarget(index);
  }, [index]);

  const active = ((Math.round(index) % urls.length) + urls.length) % urls.length;
  return <>
    {!ready && <img src={urls[active]} alt={alt} className="absolute inset-0 h-full w-full object-contain" />}
    <canvas ref={ref} role="img" aria-label={alt} aria-hidden={!ready} className="absolute inset-0 h-full w-full cursor-pointer" style={{ opacity: ready ? 1 : 0 }} />
  </>;
}
