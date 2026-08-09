import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];
export const EASE_IN_OUT_QUART = [0.76, 0, 0.24, 1] as [number, number, number, number];
export const EASE_STAMP = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/** 小節標題：紅色序號 + Serif h3（product.md S2）；aside 可掛內文引文標記 */
export default function SectionHeading({
  index,
  title,
  aside,
}: {
  index: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-18% 0px" }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className="mb-6 flex items-baseline gap-3"
    >
      <span className="font-grotesk text-small font-bold text-red">{index}</span>
      <h2 className="h3-style text-ink">{title}</h2>
      {aside}
    </motion.div>
  );
}
