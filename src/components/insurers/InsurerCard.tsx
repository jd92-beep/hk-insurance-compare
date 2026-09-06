import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Category, Insurer, Product } from "@/types/insurance";
import { CATEGORY_META, CATEGORY_ORDER, categoryColor } from "@/lib/categories";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** 9 個類別色小方點：有產品 = 類別色實心（可點去類別頁）；無 = 空心 */
function CoverageDots({
  insurer,
  categories,
}: {
  insurer: Insurer;
  categories: Category[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="類別覆蓋">
      {CATEGORY_ORDER.map((catId) => {
        const has = insurer.categories.includes(catId);
        const name = categories.find((c) => c.id === catId)?.name_zh ?? catId;
        const color = categoryColor(catId);
        const className = cn(
          "h-4 w-4 rounded-[4px] border transition-transform",
          has ? "hover:scale-125" : "bg-paper-3",
        );
        if (!has) {
          return (
            <span
              key={catId}
              title={`${name}（未有產品）`}
              className={className}
              style={{ borderColor: "var(--line)" }}
            />
          );
        }
        return (
          <Link
            key={catId}
            to={`/category/${catId}?insurer=${encodeURIComponent(insurer.name)}`}
            title={name}
            aria-label={`${insurer.name_zh}嘅${name}產品`}
            className={className}
            style={{ background: color, borderColor: color }}
          />
        );
      })}
    </div>
  );
}

/**
 * 保險公司卡（insurers.md S3）：
 * 頂行公司名 + 產品數 → 類別色小方點 + 類別 chips → 保費公開行 → 產品預覽 → 睇全部連結。
 */
export default function InsurerCard({
  insurer,
  products,
  categories,
  index,
  flash = false,
}: {
  insurer: Insurer;
  /** 呢間公司嘅全部產品（產品預覽用） */
  products: Product[];
  categories: Category[];
  index: number;
  /** 錨點到達：閃一次紅色外框 */
  flash?: boolean;
}) {
  const covered = CATEGORY_ORDER.filter((id) => insurer.categories.includes(id));
  const preview = products.slice(0, 3);
  const firstCategory = insurer.categories[0];
  // 首屏 ≤9 張卡 stagger 0.06s；之後直接渲染
  const staggerDelay = index < 9 ? index * 0.06 : 0;

  return (
    <motion.article
      id={insurer.name}
      layout="position"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.6, delay: staggerDelay, ease: EASE_OUT_EXPO }}
      className="group relative flex min-w-0 scroll-mt-[104px] flex-col gap-4 rounded-card border bg-paper p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
      style={{ borderColor: "var(--line)" }}
    >
      {/* 錨點紅框閃爍 */}
      {flash && (
        <motion.span
          initial={{ boxShadow: "0 0 0 3px rgba(200,16,46,0.9)" }}
          animate={{ boxShadow: "0 0 0 3px rgba(200,16,46,0)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-card"
          aria-hidden="true"
        />
      )}

      {/* 頂行：公司名 + 產品數 */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words font-grotesk text-[22px] font-bold leading-tight text-ink">
            {insurer.name}
          </h2>
          <p className="mt-0.5 text-[16px] font-medium text-ink-soft">{insurer.name_zh}</p>
        </div>
        <div className="shrink-0 text-right transition-transform duration-300 group-hover:scale-105">
          <p className="font-grotesk text-[32px] font-bold leading-none text-red">
            {insurer.productCount}
          </p>
          <p className="mt-1 text-[12px] text-ink-faint">份產品</p>
        </div>
      </div>

      {/* 覆蓋類別 */}
      <div className="flex flex-col gap-2.5">
        <CoverageDots insurer={insurer} categories={categories} />
        {covered.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {covered.map((catId) => {
              const color = categoryColor(catId);
              const name = categories.find((c) => c.id === catId)?.name_zh ?? catId;
              return (
                <Link
                  key={catId}
                  to={`/category/${catId}?insurer=${encodeURIComponent(insurer.name)}`}
                  className="chip transition-opacity hover:opacity-80"
                  style={{
                    background: `color-mix(in srgb, ${color} 12%, transparent)`,
                    color,
                  }}
                >
                  <span
                    className="cat-icon h-3.5 w-3.5"
                    style={{
                      color,
                      WebkitMaskImage: `url(${CATEGORY_META[catId]?.icon ?? "/cat-home.svg"})`,
                      maskImage: `url(${CATEGORY_META[catId]?.icon ?? "/cat-home.svg"})`,
                    }}
                    aria-hidden="true"
                  />
                  {name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 保費公開情況 */}
      <p className="flex items-center gap-2 text-small">
        {insurer.premiumCount > 0 ? (
          <>
            <span className="h-2 w-2 rounded-full bg-jade" />
            <span className="text-ink-soft">
              <span className="font-grotesk font-bold text-jade">{insurer.premiumCount}</span>
              {" "}份有公開保費
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="font-medium text-amber">全部需即時報價</span>
          </>
        )}
      </p>

      {/* 產品預覽（最多 3 行） */}
      {preview.length > 0 && (
        <ul className="flex flex-col gap-1 border-t pt-3 text-small" style={{ borderColor: "var(--line)" }}>
          {preview.map((p) => (
            <li key={p.id}>
              <Link
                to={`/product/${p.id}`}
                className="flex items-baseline gap-1.5 text-ink-soft transition-colors hover:text-red"
              >
                <span aria-hidden="true">·</span>
                <span className="min-w-0 truncate">
                  {p.product_name_zh || p.product_name}
                  <span className="ml-1.5 text-ink-faint">
                    （{categories.find((c) => c.id === p.category)?.name_zh ?? p.category}）
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* 底行：睇全部 */}
      {firstCategory && (
        <Link
          to={`/category/${firstCategory}?insurer=${encodeURIComponent(insurer.name)}`}
          className="mt-auto inline-flex w-fit items-center gap-1.5 text-small font-bold text-red transition-colors hover:text-red-deep hover:underline"
        >
          查看{categories.find(c => c.id === firstCategory)?.name_zh ?? "此類別"}產品
          <ArrowRight size={14} />
        </Link>
      )}
    </motion.article>
  );
}
