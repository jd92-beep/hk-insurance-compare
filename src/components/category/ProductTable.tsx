import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ExternalLink, FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { CoverageItem, Product } from "@/types/insurance";
import type { PremiumSpectrum } from "@/lib/categories";
import { parsePremiumAmounts } from "@/lib/categories";
import PriceRangeBar from "@/components/PriceRangeBar";
import StampBadge from "@/components/StampBadge";
import { useCompare } from "@/providers/CompareProvider";
import { cn } from "@/lib/utils";

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatHKD(n: number): string {
  return `HK$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/** 表格「重點保障」欄：按類別關鍵字揀 coverage 項目，唔夠就用順序補夠 2 項 */
export function pickKeyCoverage(coverage: CoverageItem[], keywords: string[]): CoverageItem[] {
  const picked: CoverageItem[] = [];
  const used = new Set<CoverageItem>();
  for (const kw of keywords) {
    const hit = coverage.find((c) => !used.has(c) && (c.item.includes(kw) || c.limit.includes(kw)));
    if (hit) {
      picked.push(hit);
      used.add(hit);
    }
    if (picked.length >= 2) break;
  }
  for (const c of coverage) {
    if (picked.length >= 2) break;
    if (!used.has(c)) picked.push(c);
  }
  return picked;
}

/**
 * 類別比較表（category.md S3A）
 * 左欄 sticky，表頭 sticky 喺篩選列之下，橫向可滾動。
 */
export default function ProductTable({
  products,
  color,
  coverageKeywords,
  spectrum,
  premiumSortDir,
  onTogglePremiumSort,
}: {
  products: Product[];
  color: string;
  coverageKeywords: string[];
  spectrum: PremiumSpectrum | null;
  /** null = 未按保費排序 */
  premiumSortDir: "asc" | "desc" | null;
  onTogglePremiumSort: () => void;
}) {
  const navigate = useNavigate();
  const compare = useCompare();

  const handleCompare = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (!compare.has(id) && compare.isFull) {
      toast.error("最多比較 3 份，請先移除一份", { position: "top-center" });
      return;
    }
    compare.toggle(id);
  };

  return (
    <div
      className="overflow-x-auto rounded-card border bg-paper shadow-card"
      style={{ borderColor: "var(--line)" }}
    >
      <table className="w-full min-w-[1180px] border-collapse text-left text-[14.5px] leading-[1.55] max-md:text-[13.5px]">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
            <th className="sticky left-0 top-[130px] z-30 w-[240px] min-w-[240px] bg-paper-2 px-5 py-3.5 text-small font-bold text-ink-soft">
              保險公司 / 產品
            </th>
            <th className="sticky top-[130px] z-20 w-[220px] min-w-[220px] bg-paper-2 px-4 py-3.5 text-small font-bold text-ink-soft">
              <button
                type="button"
                onClick={onTogglePremiumSort}
                className="inline-flex items-center gap-1 transition-colors hover:text-red"
              >
                保費範圍
                {premiumSortDir === "asc" && <ArrowUp size={13} className="text-red" />}
                {premiumSortDir === "desc" && <ArrowDown size={13} className="text-red" />}
                {premiumSortDir === null && (
                  <ArrowUp size={13} className="opacity-30" aria-hidden="true" />
                )}
              </button>
            </th>
            <th className="sticky top-[130px] z-20 w-[200px] min-w-[200px] bg-paper-2 px-4 py-3.5 text-small font-bold text-ink-soft">
              計劃層級
            </th>
            <th className="sticky top-[130px] z-20 w-[280px] min-w-[280px] bg-paper-2 px-4 py-3.5 text-small font-bold text-ink-soft">
              重點保障
            </th>
            <th className="sticky top-[130px] z-20 w-[260px] min-w-[260px] bg-paper-2 px-4 py-3.5 text-small font-bold text-ink-soft">
              主要條款
            </th>
            <th className="sticky top-[130px] z-20 w-[140px] min-w-[140px] bg-paper-2 px-4 py-3.5 text-small font-bold text-ink-soft">
              文件 / 來源
            </th>
            <th className="sticky top-[130px] z-20 w-[90px] min-w-[90px] bg-paper-2 px-4 py-3.5 text-center text-small font-bold text-ink-soft">
              比較
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            const inTray = compare.has(p.id);
            const amounts = p.premium_available ? parsePremiumAmounts(p.premium_range) : [];
            const keyCoverage = pickKeyCoverage(p.coverage ?? [], coverageKeywords);
            const tiers = p.plan_tiers ?? [];
            const sourceUrl = p.source_urls?.[0];
            const enterDelay = i < 9 ? i * 0.05 : 0;
            return (
              <motion.tr
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="group cursor-pointer border-b transition-colors duration-200 hover:bg-paper-2"
                style={{ borderColor: "var(--line)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: enterDelay }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target === e.currentTarget) navigate(`/product/${p.id}`);
                }}
                aria-label={`${p.insurer_zh} ${p.product_name_zh || p.product_name}`}
              >
                {/* 保險公司 / 產品（sticky 左欄） */}
                <td className="sticky left-0 z-10 bg-paper px-5 py-4 align-top transition-colors duration-200 group-hover:bg-paper-2">
                  <span
                    className="pointer-events-none absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-200 group-hover:scale-y-100"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="block text-small">
                    <span className="font-grotesk font-bold text-ink">{p.insurer}</span>
                    <span className="ml-1.5 text-ink-soft">{p.insurer_zh}</span>
                  </span>
                  <span className="mt-0.5 flex items-start gap-1.5">
                    <span className="font-sans font-medium leading-snug text-ink transition-colors group-hover:text-red">
                      {p.product_name_zh || p.product_name}
                    </span>
                    <StampBadge variant={p.premium_available ? "jade" : "ink"} size={16} className="mt-0.5 shrink-0" />
                  </span>
                </td>

                {/* 保費範圍 */}
                <td className="px-4 py-4 align-top">
                  {p.premium_available && amounts.length > 0 ? (
                    <div>
                      <span className="text-price text-ink">
                        {formatHKD(Math.min(...amounts))}
                        {Math.max(...amounts) !== Math.min(...amounts) && (
                          <span className="text-ink-faint"> 起</span>
                        )}
                      </span>
                      <PriceRangeBar product={p} spectrum={spectrum} className="mt-1 h-12" />
                    </div>
                  ) : (
                    <div title={p.premium_range}>
                      <span className="chip bg-amber-wash font-bold text-amber">官網即時報價</span>
                      <span className="mt-2 block text-small text-ink-faint">
                        {truncate(p.premium_range, 40)}
                      </span>
                    </div>
                  )}
                </td>

                {/* 計劃層級 */}
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-1.5">
                    {tiers.slice(0, 2).map((t) => (
                      <span key={t} className="chip bg-paper-3 text-ink-soft">
                        {truncate(t, 12)}
                      </span>
                    ))}
                    {tiers.length > 2 && (
                      <span className="chip bg-paper-3 font-grotesk text-ink-faint" title={tiers.join("／")}>
                        +{tiers.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* 重點保障 */}
                <td className="px-4 py-4 align-top">
                  <ul className="flex flex-col gap-1.5">
                    {keyCoverage.map((c) => (
                      <li key={c.item} className="flex gap-2">
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
                        <span>
                          <span className="font-medium text-ink">{truncate(c.item, 16)}</span>
                          <span className="mx-1 text-ink-faint">·</span>
                          <span className="text-ink-soft">{truncate(c.limit, 40)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>

                {/* 主要條款 */}
                <td className="px-4 py-4 align-top text-ink-soft">
                  {p.key_terms?.[0] ? truncate(p.key_terms[0], 60) : "—"}
                </td>

                {/* 文件 / 來源 */}
                <td className="px-4 py-4 align-top">
                  <div className="flex flex-col items-start gap-2">
                    <span className="inline-flex items-center gap-1.5 text-small text-ink-faint" title="官方文件數量">
                      <FileText size={13} />
                      {p.documents_found?.length ?? 0} 份文件
                    </span>
                    {sourceUrl && (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-small font-medium text-jade transition-colors hover:underline"
                      >
                        官方來源
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </td>

                {/* 比較 */}
                <td className="px-4 py-4 text-center align-top">
                  <button
                    type="button"
                    onClick={(e) => handleCompare(e, p.id)}
                    aria-pressed={inTray}
                    aria-label={inTray ? "移出比較" : "加入比較"}
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-[8px] border transition-all duration-300",
                      inTray
                        ? "border-jade bg-jade-wash text-jade"
                        : "text-ink-soft hover:border-red hover:bg-red hover:text-paper",
                    )}
                    style={!inTray ? { borderColor: "var(--line-strong)" } : undefined}
                  >
                    {inTray ? <Check size={15} /> : <Plus size={15} />}
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
