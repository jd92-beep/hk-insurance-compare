import { ExternalLink, FileText, Plus, Check } from "lucide-react";
import { useNavigate } from "react-router";
import type { Product } from "@/types/insurance";
import { categoryColor } from "@/lib/categories";
import { useCompare } from "@/providers/CompareProvider";
import PriceRangeBar from "@/components/PriceRangeBar";
import StampBadge from "@/components/StampBadge";
import { cn } from "@/lib/utils";

/**
 * 產品卡（§7.3）— 全站核心組件。
 * 點卡身 → 產品詳情頁；右下「+ 加入比較」獨立按鈕。
 */
export default function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const navigate = useNavigate();
  const compare = useCompare();
  const color = categoryColor(product.category);
  const inTray = compare.has(product.id);
  const tiers = product.plan_tiers ?? [];
  const shownTiers = tiers.slice(0, 3);
  const extraTiers = tiers.length - shownTiers.length;
  const highlights = (product.coverage ?? []).slice(0, 3);
  const sourceUrl = product.source_urls?.[0];

  const goDetail = () => navigate(`/product/${product.id}`);

  return (
    <article
      onClick={goDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) goDetail();
      }}
      tabIndex={0}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-card border bg-paper shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
      style={{ borderColor: "var(--line)" }}
      aria-label={`${product.insurer_zh} ${product.product_name_zh || product.product_name}`}
    >
      {/* 頂部類別色條 */}
      <div
        className="h-[3px] w-full transition-all duration-300 group-hover:h-[5px]"
        style={{ background: color }}
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* 保險公司 + 印章 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-small">
              <span className="font-grotesk font-bold text-ink">{product.insurer}</span>
              <span className="ml-2 font-sans font-medium text-ink-soft">{product.insurer_zh}</span>
            </p>
            <h3 className="mt-1 font-sans text-[20px] font-bold leading-[1.35] text-ink max-md:text-[18px]">
              {product.product_name_zh || product.product_name}
            </h3>
          </div>
          <StampBadge
            variant={product.premium_available ? "jade" : "gray"}
            size={28}
          />
        </div>

        {/* 計劃層級 chips */}
        {shownTiers.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {shownTiers.map((t) => (
              <span key={t} className="chip bg-paper-3 text-ink-soft">
                {t.length > 14 ? `${t.slice(0, 14)}…` : t}
              </span>
            ))}
            {extraTiers > 0 && (
              <span className="chip bg-paper-3 font-grotesk text-ink-faint">+{extraTiers}</span>
            )}
          </div>
        )}

        {/* 保費尺規 / 即時報價 */}
        <PriceRangeBar product={product} />

        {/* 保障亮點 */}
        {highlights.length > 0 && (
          <ul className="flex flex-col gap-1 text-small text-ink-soft">
            {highlights.map((c) => (
              <li key={c.item} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
                <span>
                  <span className="font-medium text-ink">{c.item}</span>
                  <span className="mx-1 text-ink-faint">·</span>
                  <span>{c.limit.length > 42 ? `${c.limit.slice(0, 42)}…` : c.limit}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* 底部行：文件數 + 官方來源 + 加入比較 */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3" style={{ borderColor: "var(--line)" }}>
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
                className="inline-flex items-center gap-1 font-medium text-jade transition-colors hover:underline"
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
