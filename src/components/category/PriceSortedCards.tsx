import { useMemo } from "react";
import { Link } from "react-router";
import { Check, ExternalLink, Plus } from "lucide-react";
import type { FlatProductItem } from "@/lib/price-sorting";
import { purchaseUrl } from "@/lib/product-availability";
import { useCompare } from "@/providers/CompareProvider";
import { toastCompareToggle } from "@/lib/ui-feedback";
import { getInsurerColor } from "@/lib/insurer-colors";
import Card3DGem from "@/components/fx/Card3DGem";
import TiltCard from "@/components/fx/TiltCard";
import { cn } from "@/lib/utils";

/**
 * 保費 Unknown / 需 Quote 價錢的極簡報價卡（老細特別指示）：
 * 僅顯示公司名、保險計劃名、需報價提示，十分簡短！
 */
export function MinimalQuoteCard({ item }: { item: FlatProductItem }) {
  const buyUrl = purchaseUrl(item.product);
  const detailHref = `/product/${item.product.id}${item.tier ? `?tier=${item.tier.id}` : ""}`;
  const highlightColor = getInsurerColor(item.product.insurer || item.insurerZh);

  return (
    <article
      className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-paper-2/70 p-4 shadow-xs transition-all hover:border-line-strong hover:bg-paper"
      aria-label={`${item.insurerZh} ${item.title}`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: highlightColor }}
        aria-hidden="true"
      />
      <div>
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: highlightColor }} />
            {item.insurerZh} <span className="font-grotesk">{item.insurer}</span>
          </p>
          <span className="rounded bg-amber-wash px-2 py-0.5 text-[11px] font-bold text-amber">
            需往官網即時報價
          </span>
        </div>

        <h4 className="mt-2 text-base font-bold leading-snug text-ink truncate" title={item.title}>
          <Link to={detailHref} className="hover:text-jade hover:underline">
            {item.title}
          </Link>
        </h4>

        {item.tier?.roomType && (
          <p className="mt-1 text-xs text-ink-faint">
            房型規格：{item.tier.roomType}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line/60 pt-3 text-xs">
        <Link
          to={detailHref}
          className="font-bold text-ink hover:text-jade transition-colors"
        >
          睇計劃詳情 →
        </Link>
        {buyUrl && (
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-red hover:underline"
          >
            <span>官網報價</span>
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}

/**
 * 具有明確保費參考的平鋪產品卡片
 */
export function FlatPriceCard({ item }: { item: FlatProductItem }) {
  const compare = useCompare();
  const selected = compare.has(item.product.id);
  const buyUrl = purchaseUrl(item.product);
  const detailHref = `/product/${item.product.id}${item.tier ? `?tier=${item.tier.id}` : ""}`;
  const highlightColor = getInsurerColor(item.product.insurer || item.insurerZh);

  // 提取核心賣點
  const sellingPoints = useMemo(() => {
    const points: string[] = [];
    if (item.product.coverage && item.product.coverage.length > 0) {
      for (const cov of item.product.coverage) {
        if (points.length >= 2) break;
        if (cov.item && cov.limit && cov.limit !== "未提供" && cov.limit !== "未收錄") {
          points.push(`${cov.item}：${cov.limit}`);
        }
      }
    }
    return points;
  }, [item.product]);

  return (
    <TiltCard max={10} glare className="h-full rounded-card">
      <article
        className="depth-surface group relative flex h-full flex-col justify-between overflow-hidden rounded-card border border-line bg-paper"
        aria-label={`${item.insurerZh} ${item.title}`}
      >
        <div className="h-1.5 depth-z-bar" style={{ background: highlightColor }} aria-hidden="true" />
        <div className="p-5 md:p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-ink-soft">
                {item.insurerZh} <span className="font-grotesk">{item.insurer}</span>
              </p>
              <div className="shrink-0 rounded-lg border border-line-strong/20 bg-paper-2/60 p-1 shadow-xs">
                <Card3DGem size={20} color={highlightColor} glow={false} />
              </div>
            </div>

            <h3 className="mt-2 text-lg font-bold leading-snug text-ink">
              <Link to={detailHref} className="hover:text-jade hover:underline">
                {item.title}
              </Link>
            </h3>

            {/* 突出展示參考保費 */}
            <div className="mt-3 rounded-lg border border-jade/30 bg-jade-wash/30 p-3">
              <p className="text-[11px] font-bold text-jade">參考保費（快照數據）</p>
              <p className="mt-0.5 font-grotesk text-base font-bold text-ink">
                {item.priceDisplay}
              </p>
            </div>

            {/* 核心賣點 */}
            {sellingPoints.length > 0 && (
              <div className="mt-2 rounded-lg border border-line bg-paper-2/60 p-2 text-xs">
                <ul className="space-y-1 text-ink font-medium">
                  {sellingPoints.map((sp, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="font-bold select-none text-[11px]" style={{ color: highlightColor }}>✓</span>
                      <span className="line-clamp-1 text-[11px]">{sp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.tier?.roomType && (
              <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                <span className="rounded border bg-paper-2 px-1.5 py-0.5 font-medium text-ink-soft" style={{ borderColor: "var(--line)" }}>
                  房型：{item.tier.roomType}
                </span>
                {item.tier.code && (
                  <span className="rounded bg-jade-wash px-1.5 py-0.5 font-bold text-jade font-grotesk">
                    {item.tier.code}
                  </span>
                )}
              </div>
            )}
          </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={detailHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line-strong px-2 py-2 text-center text-sm font-bold text-ink hover:bg-paper-2"
            >
              睇計劃詳情
            </Link>
            <button
              type="button"
              aria-pressed={selected}
              disabled={!selected && compare.isFull}
              onClick={() => {
                if (!selected && compare.isFull) {
                  toastCompareToggle(item.title, false, true);
                  return;
                }
                compare.toggle(item.product.id);
                toastCompareToggle(item.title, !selected);
              }}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-bold transition-colors",
                selected
                  ? "border-jade bg-jade-wash text-jade"
                  : "border-ink bg-ink text-paper hover:bg-ink-soft"
              )}
            >
              {selected ? <Check size={16} /> : <Plus size={16} />}
              <span>{selected ? "已加入" : "加入比較"}</span>
            </button>
          </div>
          {buyUrl && (
            <a
              href={buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 text-xs font-bold text-red hover:underline pt-1"
            >
              <span>前往保險公司官網即時報價</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
        </div>
      </article>
    </TiltCard>
  );
}

/**
 * 價格排序時的整體視圖：有明確金額在前，Unknown 在後且為極簡報價卡
 */
export default function PriceSortedCards({ items }: { items: FlatProductItem[] }) {
  const pricedItems = items.filter((i) => !i.isQuoteOnly && i.numericPrice !== null);
  const quoteItems = items.filter((i) => i.isQuoteOnly || i.numericPrice === null);

  return (
    <div className="flex flex-col gap-8">
      {/* 有保費數據的獨立產品卡片 */}
      {pricedItems.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
            <span>有參考保費之獨立計劃 ({pricedItems.length})</span>
            <span className="text-ink-faint">按換算年費基準排序</span>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-6 fold:grid-cols-2 lg:grid-cols-3">
            {pricedItems.map((item) => (
              <FlatPriceCard key={item.key} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Unknown / 需即時 Quote 價錢的極簡卡片 */}
      {quoteItems.length > 0 && (
        <div className="flex flex-col gap-3 pt-4 border-t border-line">
          <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
            <span>需向保險公司索取報價之計劃 ({quoteItems.length})</span>
            <span className="text-ink-faint">快照無公開劃一定價</span>
          </div>
          <div className="grid grid-cols-1 items-stretch gap-4 fold:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {quoteItems.map((item) => (
              <MinimalQuoteCard key={item.key} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
