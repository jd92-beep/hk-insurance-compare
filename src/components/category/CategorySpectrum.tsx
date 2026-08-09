import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import type { Product } from "@/types/insurance";
import { categorySpectrum, parsePremiumAmounts } from "@/lib/categories";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];
const BACK_OUT = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

function shorten(text: string, max = 36): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

interface Dot {
  product: Product;
  /** 0–100（對數刻度位置） */
  pos: number;
}

/**
 * 類別價錢光譜尺規（categories.md S2）
 * 以類別色圓點標出「有公開保費」產品嘅相對價位分佈（對數刻度）。
 * 點圓點直達產品詳情頁。
 */
export default function CategorySpectrum({
  products,
  color,
  className,
}: {
  products: Product[];
  color: string;
  className?: string;
}) {
  const navigate = useNavigate();

  const dots = useMemo<Dot[]>(() => {
    const spec = categorySpectrum(products);
    if (!spec) return [];
    const lo = Math.log(spec.min);
    const hi = Math.log(spec.max);
    const pos = (n: number) => {
      const v = Math.log(Math.max(spec.min, Math.min(spec.max, n)));
      return ((v - lo) / (hi - lo)) * 100;
    };
    return products
      .filter((p) => p.premium_available)
      .map((p) => {
        const amounts = parsePremiumAmounts(p.premium_range);
        if (amounts.length === 0) return null;
        return { product: p, pos: pos(Math.min(...amounts)) };
      })
      .filter((d): d is Dot => d !== null)
      .sort((a, b) => a.pos - b.pos);
  }, [products]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative h-7">
        {/* 底線（尺規生長） */}
        <motion.div
          className="absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2"
          style={{ background: "var(--line-strong)" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        />
        {dots.length === 0 ? (
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed"
            style={{ borderColor: "var(--line-strong)" }}
          />
        ) : (
          dots.map((d, i) => (
            <motion.button
              key={d.product.id}
              type="button"
              title={`${d.product.insurer_zh} ${d.product.product_name_zh || d.product.product_name} · ${shorten(d.product.premium_range)}`}
              aria-label={`${d.product.product_name_zh || d.product.product_name}：${d.product.premium_range}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                navigate(`/product/${d.product.id}`);
              }}
              className="group/dot absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1.5"
              style={{ left: `${d.pos}%` }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.3, ease: BACK_OUT, delay: 0.3 + i * 0.05 }}
            >
              <span
                className="block h-2.5 w-2.5 rounded-full border-2 bg-paper transition-transform duration-200 group-hover/dot:scale-125"
                style={{ borderColor: color, background: color }}
              />
            </motion.button>
          ))
        )}
      </div>
      <div className="flex items-center justify-between text-small text-ink-faint">
        <span>較平</span>
        <span>較貴</span>
      </div>
    </div>
  );
}
