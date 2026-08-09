import { motion } from "framer-motion";
import { ArrowRight, Check, ExternalLink, FileText, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { Product } from "@/types/insurance";
import { categoryColor } from "@/lib/categories";
import { useCompare } from "@/providers/CompareProvider";
import PriceRangeBar from "@/components/PriceRangeBar";
import StampBadge from "@/components/StampBadge";
import { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * compact 版產品卡（S3 專用）：公司 / 產品名 / 保費行 / 文件數，
 * 隱藏保障亮點同計劃 chips。
 */
function CompactProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const compare = useCompare();
  const color = categoryColor(product.category);
  const inTray = compare.has(product.id);
  const sourceUrl = product.source_urls?.[0];

  return (
    <article
      onClick={() => navigate(`/product/${product.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) navigate(`/product/${product.id}`);
      }}
      tabIndex={0}
      className="group flex w-[300px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-card border bg-paper shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift max-sm:w-[260px]"
      style={{ borderColor: "var(--line)" }}
      aria-label={`${product.insurer_zh} ${product.product_name_zh || product.product_name}`}
    >
      <div
        className="h-[3px] w-full transition-all duration-300 group-hover:h-[5px]"
        style={{ background: color }}
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-small">
              <span className="font-grotesk font-bold text-ink">{product.insurer}</span>
              <span className="ml-2 font-sans font-medium text-ink-soft">{product.insurer_zh}</span>
            </p>
            <h3 className="mt-1 line-clamp-2 font-sans text-[18px] font-bold leading-[1.35] text-ink">
              {product.product_name_zh || product.product_name}
            </h3>
          </div>
          <StampBadge variant={product.premium_available ? "jade" : "gray"} size={28} />
        </div>

        <PriceRangeBar product={product} />

        <div
          className="mt-auto flex items-center justify-between gap-2 border-t pt-3"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex items-center gap-3 text-small text-ink-faint">
            <span className="inline-flex items-center gap-1" title="官方文件">
              <FileText size={13} />
              {product.documents_found?.length ?? 0}
            </span>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 font-medium text-jade hover:underline"
              >
                官方來源
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              compare.toggle(product.id);
            }}
            disabled={!inTray && compare.isFull}
            className={cn(
              "inline-flex items-center gap-1 rounded-[10px] border px-3 py-1.5 text-small font-bold transition-all duration-300",
              inTray
                ? "border-jade bg-jade-wash text-jade"
                : "text-ink hover:border-red hover:bg-red hover:text-paper disabled:cursor-not-allowed disabled:opacity-40",
            )}
            style={!inTray ? { borderColor: "var(--line-strong)" } : undefined}
          >
            {inTray ? <Check size={13} /> : <Plus size={13} />}
            {inTray ? "已加入" : "加入比較"}
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * S3 同類產品推薦：同類別其他產品，優先有公開保費，最多 6 張。
 * 只有 1 份其他產品 → 單卡（附錄 5）。
 */
export default function RelatedProducts({
  current,
  categoryProducts,
  catName,
}: {
  current: Product;
  categoryProducts: Product[];
  catName: string;
}) {
  const related = categoryProducts
    .filter((p) => p.id !== current.id)
    .sort((a, b) => Number(b.premium_available) - Number(a.premium_available))
    .slice(0, 6);

  if (related.length === 0) return null;

  return (
    <section className="hairline-t hairline-b bg-paper-2 py-24">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="mb-10 flex flex-wrap items-end justify-between gap-4"
        >
          <h2 className="h3-style text-ink">同類產品</h2>
          <Link
            to={`/category/${current.category}`}
            className="group inline-flex items-center gap-1.5 font-bold text-red"
          >
            全部{catName}
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ staggerChildren: 0.07 }}
          className={cn(
            related.length > 1 &&
              "-mx-5 flex gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:thin]",
            related.length === 1 && "flex",
          )}
        >
          {related.map((p) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, x: 40 },
                show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
              }}
              className="shrink-0"
            >
              <CompactProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>

        {related.length === 1 && (
          <Link
            to={`/category/${current.category}`}
            className="mt-4 inline-flex items-center gap-1.5 text-small font-bold text-red hover:underline"
          >
            瀏覽全部{catName}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </section>
  );
}
