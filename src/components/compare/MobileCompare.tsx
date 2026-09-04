import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import type { Product } from "@/types/insurance";
import { categoryColor, categoryName } from "@/lib/categories";
import { useCategories } from "@/providers/InsuranceDataProvider";
import { cn } from "@/lib/utils";
import { resolveCoverage } from "@/components/compare/canonical-benefits";
import {
  CoverageLimitCell,
  DocumentsCell,
  ExclusionsCell,
  KeyTermsCell,
  PlanTiersCell,
  PremiumNotesCell,
  PremiumRangeCell,
  PremiumStatusCell,
  SourceLinksCell,
} from "@/components/compare/cells";

const TAB_LETTERS = ["A", "B", "C"];

/** 單欄內嘅標籤 + 內容塊 */
function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b px-4 py-4" style={{ borderColor: "var(--line)" }}>
      <p className="mb-2 text-[13px] font-bold text-ink-soft">{label}</p>
      {children}
    </div>
  );
}

/** 對照組（mobile）：標題橫條 + 「切換 Tab 對照其他產品」小字 */
function Group({
  en,
  zh,
  multi,
  children,
}: {
  en: string;
  zh: string;
  /** 多於一份產品先顯示提示 */
  multi: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-card border bg-paper" style={{ borderColor: "var(--line)" }}>
      <div className="border-b bg-paper-3 px-4 py-2.5" style={{ borderColor: "var(--line)" }}>
        <p className="eyebrow text-ink-soft">
          {en}
          <span className="eyebrow-zh ml-3 font-sans font-bold normal-case tracking-[0.3em] text-ink">
            {zh}
          </span>
        </p>
        {multi && <p className="mt-1 text-[12px] text-ink-faint">切換 Tab 對照其他產品</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * 比較表 mobile 版（compare.md Mobile 適配 <768px）：
 * 頂部類別色 Tab（產品 A / B / C）切換單欄顯示全部 5 組；
 * 差異／最優高亮喺單欄模式隱藏。
 */
export default function MobileCompare({
  products,
  onRemove,
}: {
  products: Product[];
  onRemove?: (id: string) => void;
}) {
  const categories = useCategories();
  const [activeId, setActiveId] = useState<string | undefined>(products[0]?.id);

  // 已移除嘅產品 → 自動落返第一份（唔使 effect，直接 derive）
  const active = products.find((p) => p.id === activeId) ?? products[0];
  const resolved = active ? resolveCoverage([active]) : { matched: [], others: [] };
  const multi = products.length > 1;

  if (!active) return null;

  return (
    <div>
      {/* 產品分頁 Tab（sticky） */}
      <div
        className="sticky top-[72px] z-30 -mx-1 border-b bg-paper/85 px-1 pb-2 pt-2 backdrop-blur-[12px]"
        style={{ borderColor: "var(--line)" }}
      >
        <div className="flex gap-1.5" role="tablist" aria-label="切換產品">
          {products.map((p, i) => {
            const isActive = p.id === active.id;
            const color = categoryColor(p.category);
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(p.id)}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                  isActive ? "bg-paper-2" : "hover:bg-paper-2/60",
                )}
              >
                <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  產品 {TAB_LETTERS[i] ?? i + 1}
                </span>
                <span className={cn("w-full truncate text-[13px] font-medium", isActive ? "text-ink" : "text-ink-soft")}>
                  {p.insurer_zh}
                </span>
                {onRemove && (
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(p.id);
                    }}
                    className="absolute right-1 top-1 rounded-full p-1 text-ink-faint transition-colors hover:bg-red-wash hover:text-red"
                    aria-label={`移除 ${p.product_name_zh || p.product_name}`}
                  >
                    <X size={12} />
                  </span>
                )}
                {isActive && (
                  <motion.span
                    layoutId="compare-tab-indicator"
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full"
                    style={{ background: color }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 單欄 5 組內容 */}
      <div className="mt-5 flex flex-col gap-6">
        <Group en="PRICE" zh="保費" multi={multi}>
          <Block label="保費範圍"><PremiumRangeCell product={active} /></Block>
          <Block label="保費備註"><PremiumNotesCell product={active} /></Block>
          <Block label="公開保費">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <PremiumStatusCell product={active} />
              {(active.official_buy_url || active.promo?.buy_url) && (
                <a
                  href={active.official_buy_url || active.promo?.buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-red px-3 py-1.5 text-[12px] font-bold text-paper shadow-xs active:scale-95 transition-all"
                >
                  <span>官網投保</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </Block>
        </Group>

        <Group en="COVERAGE" zh="保障項目" multi={multi}>
          {resolved.matched.length === 0 && resolved.others.length === 0 && (
            <Block label="保障項目"><span className="text-ink-faint">—</span></Block>
          )}
          {resolved.matched.map((row) => (
            <Block key={row.key} label={row.label}>
              <CoverageLimitCell limit={row.limits[0]} highlight={false} />
            </Block>
          ))}
          {resolved.others.length > 0 && (
            <>
              <p className="border-b bg-paper-3/60 px-4 py-2 text-[12px] font-bold text-ink-faint">
                其他保障
              </p>
              {resolved.others.map((row) => (
                <Block key={row.key} label={row.label}>
                  <CoverageLimitCell limit={row.limits[0]} highlight={false} />
                </Block>
              ))}
            </>
          )}
        </Group>

        <Group en="PLANS" zh="計劃層級" multi={multi}>
          <Block label={`計劃層級 · ${categoryName(categories, active.category)}`}>
            <PlanTiersCell product={active} />
          </Block>
        </Group>

        <Group en="KEY TERMS" zh="主要條款" multi={multi}>
          <Block label="主要條款"><KeyTermsCell product={active} /></Block>
        </Group>

        <Group en="EXCLUSIONS & DOCS" zh="不保事項與文件" multi={multi}>
          <Block label="不保事項"><ExclusionsCell product={active} /></Block>
          <Block label="官方文件"><DocumentsCell product={active} /></Block>
          <Block label="官方來源"><SourceLinksCell product={active} /></Block>
        </Group>
      </div>
    </div>
  );
}
