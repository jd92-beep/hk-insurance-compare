import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { createActivityCarousel, type CarouselHandle } from "./activity-carousel";

/** three.js ring of sketchbook pages; `index` may be fractional (scroll-driven). */
export default function ActivityCarouselCanvas({
  urls,
  index,
  onSelect,
}: {
  urls: string[];
  index: number;
  onSelect: (i: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const handle = useRef<CarouselHandle | null>(null);
  const reduced = useReducedMotion() ?? false;
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let h: CarouselHandle;
    try {
      h = createActivityCarousel(canvas, urls, reduced);
    } catch {
      return;
    }
    h.onSelect((i) => selectRef.current(i));
    handle.current = h;
    return () => {
      h.dispose();
      handle.current = null;
    };
  }, [urls, reduced]);

  useEffect(() => {
    handle.current?.setTarget(index);
  }, [index]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full cursor-pointer" />;
}
