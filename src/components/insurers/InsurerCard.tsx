import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import type { Category, Insurer, Product } from "@/types/insurance";
import { CATEGORY_META, categoryColor } from "@/lib/categories";
import {
  type InsurerCategoryCount,
  insurerDetailPath,
} from "@/lib/insurer-catalogue";
import { cn } from "@/lib/utils";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

/**
 * 保險公司卡（company-first）：
 * 公司名 + 產品數 → 類別 chips（附產品數）→ 保費公開行 → 產品預覽 → 睇晒呢間公司。
 * 錨點 id = insurer.name，保留 /insurers#INSURER 行為。
 */
export default function InsurerCard({
  insurer,
  products,
  categories,
  categoryCounts,
  index,
  flash = false,
}: {
  insurer: Insurer;
  /** 呢間公司嘅全部產品（預覽用） */
  products: Product[];
  categories: Category[];
  /** 類別產品數（空類別已省略） */
  categoryCounts: InsurerCategoryCount[];
  index: number;
  /** 錨點到達：閃一次紅色外框 */
  flash?: boolean;
}) {
  const preview = products.slice(0, 3);
  const staggerDelay = index < 9 ? index * 0.06 : 0;
  const detailHref = insurerDetailPath(insurer.name);

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
      data-insurer-card={insurer.name}
    >
      {flash && (
        <motion.span
          initial={{ boxShadow: "0 0 0 3px rgba(200,16,46,0.9)" }}
          animate={{ boxShadow: "0 0 0 3px rgba(200,16,46,0)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-card"
          aria-hidden="true"
        />
      )}

      {/* 頂行：公司名（點擊去公司頁）+ 產品數 */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words font-grotesk text-[22px] font-bold leading-tight text-ink">
            <Link
              to={detailHref}
              className="rounded transition-colors hover:text-red focus-visible:outline-offset-4"
            >
              {insurer.name}
            </Link>
          </h2>
          <p className="mt-0.5 text-[16px] font-medium text-ink-soft">
            <Link to={detailHref} className="rounded hover:text-red hover:underline">
              {insurer.name_zh}
            </Link>
          </p>
        </div>
        <div className="shrink-0 text-right transition-transform duration-300 group-hover:scale-105">
          <p className="font-grotesk text-[32px] font-bold leading-none text-red">
            {insurer.productCount}
          </p>
          <p className="mt-1 text-[12px] text-ink-faint">份產品</p>
        </div>
      </div>

      {/* 類別 chips + 產品數（公司產品分組預覽） */}
      {categoryCounts.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="站內類別覆蓋">
          {categoryCounts.map(({ categoryId, count }) => {
            const color = categoryColor(categoryId);
            const name = categories.find((c) => c.id === categoryId)?.name_zh ?? categoryId;
            return (
              <Link
                key={categoryId}
                to={`${detailHref}#cat-${categoryId}`}
                className="chip inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
                style={{
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  color,
                }}
                title={`${insurer.name_zh}・${name}：${count} 份`}
              >
                <span
                  className="cat-icon h-3.5 w-3.5"
                  style={{
                    color,
                    WebkitMaskImage: `url(${CATEGORY_META[categoryId]?.icon ?? "/cat-home.svg"})`,
                    maskImage: `url(${CATEGORY_META[categoryId]?.icon ?? "/cat-home.svg"})`,
                  }}
                  aria-hidden="true"
                />
                {name}
                <span className="font-grotesk text-[11px] font-bold opacity-90">{count}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* 保費公開情況（資料可得性，唔係報價） */}
      <p className="flex items-center gap-2 text-small">
        {insurer.premiumCount > 0 ? (
          <>
            <span className="h-2 w-2 rounded-full bg-jade" />
            <span className="text-ink-soft">
              <span className="font-grotesk font-bold text-jade">{insurer.premiumCount}</span>
              {" "}份有公開保費欄
            </span>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-amber" />
            <span className="font-medium text-amber">站內未見公開保費欄</span>
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

      {/* 主 CTA：睇晒呢間公司全部產品（按類別分組） */}
      <Link
        to={detailHref}
        className={cn(
          "mt-auto inline-flex w-fit items-center gap-1.5 text-small font-bold text-red",
          "transition-colors hover:text-red-deep hover:underline",
        )}
      >
        睇晒呢間公司產品
        <ArrowRight size={14} />
      </Link>
    </motion.article>
  );
}
