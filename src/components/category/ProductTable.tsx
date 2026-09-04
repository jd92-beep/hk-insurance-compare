import { Fragment, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import type { CoverageItem, Product } from "@/types/insurance";
import type { PremiumSpectrum } from "@/lib/categories";
import type { FeatureMatchResult } from "@/lib/feature-filters";
import { parsePremiumAmounts, premiumUnitHint } from "@/lib/categories";
import PriceRangeBar from "@/components/PriceRangeBar";
import StampBadge from "@/components/StampBadge";
import PdfViewerDrawer from "@/components/product/PdfViewerDrawer";
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

/** 表格細項條款組件：支援點擊直達官方 PDF 頁碼與原文佐證 */
function TableCoverageItem({
  item,
  productId,
  color,
  onOpenDoc,
}: {
  item: CoverageItem;
  productId: string;
  color: string;
  onOpenDoc: (c: CoverageItem, productId: string) => void;
}) {
  const hasDoc = Boolean(item.source_url);
  const pageText = item.page != null ? `P.${item.page}` : null;

  return (
    <li className="group/cov flex items-start gap-2 text-small leading-[1.65]">
      <span
        className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full transition-transform group-hover/cov:scale-125"
        style={{ background: color }}
      />
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        {hasDoc ? (
          <div className="inline-flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDoc(item, productId);
              }}
              className="inline-flex items-center gap-1 text-left font-semibold text-ink transition-colors duration-200 hover:text-jade hover:underline cursor-pointer"
              title={`點擊於內置抽屜查閱「${item.item}」官方條款${
                item.document_name ? `（${item.document_name}${item.page ? ` · 第 ${item.page} 頁` : ""}）` : ""
              }`}
            >
              <span>{item.item}</span>
              <FileText
                size={12}
                className="shrink-0 text-jade/70 transition-transform duration-200 group-hover/cov:scale-110 group-hover/cov:text-jade"
                aria-hidden="true"
              />
            </button>
            {pageText && (
              <span className="rounded bg-paper-3 px-1.5 py-0.5 text-[10px] font-mono font-medium text-ink-faint">
                {pageText}
              </span>
            )}
            <a
              href={item.source_url}
              target={`doc_viewer_${productId.replace(/[^a-zA-Z0-9_-]/g, "_")}`}
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-ink-faint transition-colors duration-200 hover:text-jade"
              title="在新分頁獨立開啟官方文件"
            >
              <ExternalLink size={11} className="shrink-0" />
            </a>
          </div>
        ) : (
          <span className="font-medium text-ink">{item.item}</span>
        )}
        <span className="text-ink-faint">·</span>
        <span className="whitespace-normal break-words text-ink-soft">{item.limit}</span>
      </div>
    </li>
  );
}

/** 展開行：全部保障項目 + 主要條款 + 前往產品頁 */
function ExpandedRow({
  product,
  color,
  colSpan,
  onOpenDoc,
}: {
  product: Product;
  color: string;
  colSpan: number;
  onOpenDoc: (c: CoverageItem, productId: string) => void;
}) {
  const coverage = product.coverage ?? [];
  const terms = product.key_terms ?? [];
  return (
    <tr className="border-b" style={{ borderColor: "var(--line)" }}>
      <td colSpan={colSpan} className="bg-paper-2/60 px-5 py-0">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-6 py-5 md:grid-cols-2">
            {product.promo && (
              <div className="col-span-full rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-small">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                      <Sparkles size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                      專屬推廣優惠：{product.promo.tag}
                    </span>
                    {product.promo.discount && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        {product.promo.discount}
                      </span>
                    )}
                  </div>
                  {product.promo.code && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(product.promo!.code!);
                        toast.success(`已複製優惠碼：${product.promo!.code}`, { position: "top-center" });
                      }}
                      className="inline-flex items-center gap-1.5 rounded border border-amber-400/40 bg-paper px-2.5 py-1 font-mono text-[11.5px] font-bold text-amber-800 shadow-2xs hover:bg-amber-100 dark:bg-paper-2 dark:text-amber-200"
                      title="點擊複製優惠碼"
                    >
                      <span>複製優惠碼: {product.promo.code}</span>
                      <Copy size={12} className="text-amber-600" />
                    </button>
                  )}
                </div>
                {product.promo.note && (
                  <p className="mt-1.5 text-[12px] text-ink-soft">{product.promo.note}</p>
                )}
              </div>
            )}
            <div>
              <p className="mb-2.5 text-small font-bold text-ink">
                全部保障項目
                <span className="ml-2 font-grotesk font-medium text-ink-faint">
                  {coverage.length} 項
                </span>
              </p>
              {coverage.length === 0 ? (
                <p className="text-small text-ink-faint">官方文件未逐項列出，請睇產品頁。</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {coverage.map((c) => (
                    <TableCoverageItem
                      key={c.item}
                      item={c}
                      productId={product.id}
                      color={color}
                      onOpenDoc={onOpenDoc}
                    />
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col">
              <p className="mb-2.5 text-small font-bold text-ink">主要條款</p>
              {terms.length === 0 ? (
                <p className="text-small text-ink-faint">—</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {terms.map((t, i) => (
                    <li key={i} className="flex gap-2 text-small leading-[1.65] text-ink-soft">
                      <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to={`/product/${product.id}`}
                  className="inline-flex items-center gap-1.5 rounded-[8px] bg-ink px-4 py-2 text-small font-bold text-paper transition-colors hover:bg-red"
                >
                  睇完整產品檔案
                  <ExternalLink size={13} />
                </Link>
                {product.source_urls?.[0] && (
                  <a
                    href={product.source_urls[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-small font-medium text-jade hover:underline"
                  >
                    官方來源
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </td>
    </tr>
  );
}

/**
 * 類別比較表（category.md S3A）
 * 表頭 sticky 喺篩選列之下（頁面級 sticky，唔經 overflow 容器）；
 * 點擊行展開全部保障詳情，保費／保額永遠完整顯示唔截斷。
 */
export default function ProductTable({
  products,
  color,
  coverageKeywords,
  spectrum,
  premiumSortDir,
  onTogglePremiumSort,
  productMatchMap,
}: {
  products: Product[];
  color: string;
  coverageKeywords: string[];
  spectrum: PremiumSpectrum | null;
  /** null = 未按保費排序 */
  premiumSortDir: "asc" | "desc" | null;
  onTogglePremiumSort: () => void;
  productMatchMap?: Map<string, FeatureMatchResult>;
}) {
  const navigate = useNavigate();
  const compare = useCompare();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 內置 PDF 抽屜閱讀器狀態（支援同份文件無感跳頁與新分頁獨立開啟）
  const [activeDoc, setActiveDoc] = useState<{
    isOpen: boolean;
    pdfUrl?: string;
    documentName?: string;
    page?: number | null;
    itemTitle?: string;
    limitText?: string;
    quote?: string;
    productId?: string;
  }>({
    isOpen: false,
  });

  const handleOpenDoc = (c: CoverageItem, productId: string) => {
    if (!c.source_url) return;
    setActiveDoc({
      isOpen: true,
      pdfUrl: c.source_url,
      documentName: c.document_name,
      page: c.page,
      itemTitle: c.item,
      limitText: c.limit,
      quote: c.quote,
      productId,
    });
  };

  const handleCompare = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (!compare.has(id) && compare.isFull) {
      toast.error("最多比較 3 份，請先移除一份", { position: "top-center" });
      return;
    }
    compare.toggle(id);
  };

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const COL_SPAN = 7;

  const thBase =
    "sticky top-[72px] z-20 bg-paper/95 backdrop-blur-md px-4 py-3.5 text-left text-small font-bold text-ink-soft border-b border-line-strong [box-shadow:inset_0_-1px_0_var(--line-strong)]";

  return (
    <div
      className="rounded-card border bg-paper shadow-card max-lg:overflow-x-auto"
      style={{ borderColor: "var(--line)" }}
    >
      <table className="w-full border-collapse text-left text-[14.5px] leading-[1.55] max-lg:min-w-[1080px] max-md:text-[13.5px]">
        <thead className="sticky top-[72px] z-20">
          <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
            <th className={cn(thBase, "w-[21%] px-5")}>保險公司 / 產品</th>
            <th className={cn(thBase, "w-[19%]")}>
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
            <th className={cn(thBase, "w-[15%]")}>計劃層級</th>
            <th className={cn(thBase, "w-[21%]")}>重點保障</th>
            <th className={cn(thBase, "w-[13%]")}>主要條款</th>
            <th className={cn(thBase, "w-[7%]")}>文件</th>
            <th className={cn(thBase, "w-[4%] text-center")}>比較</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            const inTray = compare.has(p.id);
            const expanded = expandedId === p.id;
            const amounts = p.premium_available ? parsePremiumAmounts(p.premium_range) : [];
            const unitHint = p.premium_available ? premiumUnitHint(p.premium_range) : null;
            const keyCoverage = pickKeyCoverage(p.coverage ?? [], coverageKeywords);
            const tiers = p.plan_tiers ?? [];
            const sourceUrl = p.source_urls?.[0];
            const match = productMatchMap?.get(p.id);
            const enterDelay = i < 9 ? i * 0.05 : 0;
            return (
              <Fragment key={p.id}>
                <motion.tr
                  onClick={() => toggleRow(p.id)}
                  className={cn(
                    "group cursor-pointer border-b transition-colors duration-200 hover:bg-paper-2",
                    expanded && "bg-paper-2/70",
                  )}
                  style={{ borderColor: "var(--line)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: enterDelay }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target === e.currentTarget) toggleRow(p.id);
                  }}
                  aria-expanded={expanded}
                  aria-label={`${p.insurer_zh} ${p.product_name_zh || p.product_name}（點擊展開保障詳情）`}
                >
                  {/* 保險公司 / 產品 */}
                  <td className="relative px-5 py-4 align-top">
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${p.id}`);
                        }}
                        className="text-left font-sans font-medium leading-snug text-ink underline-offset-2 transition-colors hover:text-red hover:underline"
                      >
                        {p.product_name_zh || p.product_name}
                      </button>
                      <StampBadge
                        variant={p.premium_available ? "jade" : "ink"}
                        size={16}
                        className="mt-0.5 shrink-0"
                      />
                    </span>
                    {/* 智能契合度 Badge（用戶自選重視保障命中狀態） */}
                    {match && match.totalSelected > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-bold shadow-2xs",
                            match.matchedCount === match.totalSelected
                              ? "bg-jade/15 text-jade border border-jade/30"
                              : "bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30"
                          )}
                        >
                          {match.matchedCount === match.totalSelected
                            ? `🎯 完美符合全部 ${match.matchedCount}/${match.totalSelected} 項重視保障`
                            : `✨ 符合 ${match.matchedCount}/${match.totalSelected} 項重視保障`}
                          <span className="font-mono text-[10px] opacity-85">({match.score}%)</span>
                        </span>
                      </div>
                    )}
                    {p.promo && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                          <Sparkles size={11} className="shrink-0 text-amber-600 dark:text-amber-400" />
                          {p.promo.tag}
                        </span>
                        {p.promo.discount && (
                          <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                            {p.promo.discount}
                          </span>
                        )}
                        {p.promo.code && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(p.promo!.code!);
                              toast.success(`已複製優惠碼：${p.promo!.code}`, { position: "top-center" });
                            }}
                            className="inline-flex items-center gap-0.5 rounded border border-amber-400/40 bg-paper px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-amber-800 shadow-2xs hover:bg-amber-100/70 dark:bg-paper-2 dark:text-amber-200"
                            title="點擊複製優惠碼"
                          >
                            <span>碼: {p.promo.code}</span>
                            <Copy size={9} className="ml-0.5 text-amber-600" />
                          </button>
                        )}
                      </div>
                    )}
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-ink-faint transition-colors group-hover:text-ink-soft">
                      <ChevronDown
                        size={13}
                        className={cn("transition-transform duration-300", expanded && "rotate-180")}
                      />
                      {expanded ? "收合詳情" : "展開保障詳情"}
                    </span>
                  </td>

                  {/* 保費範圍（完整顯示，唔截斷；支援實付折後價與劃線原價） */}
                  <td className="px-4 py-4 align-top">
                    {p.premium_available && amounts.length > 0 ? (
                      <div>
                        {/* 若有即時官方折扣，顯示劃線原價與實付折後價 */}
                        {((p.discounted_price && p.original_price && p.original_price > p.discounted_price) ||
                          (p.promo?.discounted_price && p.promo?.original_price && p.promo.original_price > p.promo.discounted_price)) && (
                          <div className="flex items-baseline gap-1.5 mb-0.5">
                            <span className="text-[12px] font-grotesk text-ink-faint line-through">
                              HK${(p.original_price || p.promo?.original_price)?.toLocaleString()}
                            </span>
                            <span className="font-grotesk text-[17px] font-black text-red">
                              HK${(p.discounted_price || p.promo?.discounted_price)?.toLocaleString()} 起
                            </span>
                            <span className="rounded bg-red/10 px-1 py-0.2 text-[10px] font-bold text-red">
                              {p.promo?.discount || "折後價"}
                            </span>
                          </div>
                        )}
                        <span className="text-price text-ink">
                          {formatHKD(Math.min(...amounts))}
                          {Math.max(...amounts) !== Math.min(...amounts) && (
                            <span className="text-ink-faint"> 起</span>
                          )}
                          {unitHint && (
                            <span className="ml-1.5 font-sans text-[11.5px] font-medium text-ink-faint">
                              {unitHint}
                            </span>
                          )}
                        </span>
                        <PriceRangeBar product={p} spectrum={spectrum} className="mt-1 h-12" />
                        <span className="mt-1 block whitespace-normal break-words text-[12.5px] leading-[1.6] text-ink-faint">
                          {p.premium_range}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="chip bg-amber-wash font-bold text-amber">官網即時報價</span>
                        <span className="mt-2 block whitespace-normal break-words text-small leading-[1.6] text-ink-faint">
                          {p.premium_range}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* 計劃層級 */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {tiers.slice(0, 2).map((t) => (
                        <span key={t} className="chip bg-paper-3 text-ink-soft">
                          {truncate(t, 14)}
                        </span>
                      ))}
                      {tiers.length > 2 && (
                        <span
                          className="chip bg-paper-3 font-grotesk text-ink-faint"
                          title={tiers.join("／")}
                        >
                          +{tiers.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 重點保障（保額完整顯示） */}
                  <td className="px-4 py-4 align-top">
                    <ul className="flex flex-col gap-1.5">
                      {keyCoverage.map((c) => (
                        <TableCoverageItem
                          key={c.item}
                          item={c}
                          productId={p.id}
                          color={color}
                          onOpenDoc={handleOpenDoc}
                        />
                      ))}
                    </ul>
                    {(p.coverage?.length ?? 0) > keyCoverage.length && (
                      <span className="mt-1.5 block text-[12px] text-ink-faint">
                        另有 {(p.coverage?.length ?? 0) - keyCoverage.length} 項，點行展開
                      </span>
                    )}
                  </td>

                  {/* 主要條款 */}
                  <td className="px-4 py-4 align-top text-ink-soft">
                    {p.key_terms?.[0] ? truncate(p.key_terms[0], 60) : "—"}
                  </td>

                  {/* 文件 / 來源 */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col items-start gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-small text-ink-faint"
                        title="官方文件數量"
                      >
                        <FileText size={13} />
                        {p.documents_found?.length ?? 0} 份
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
                      {(p.official_buy_url || p.promo?.buy_url) && (
                        <a
                          href={p.official_buy_url || p.promo?.buy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded bg-red text-paper hover:bg-red/90 px-2 py-0.5 text-[11px] font-bold shadow-2xs active:scale-95 transition-all"
                          title="直達該保險公司官方投保／報價頁面"
                        >
                          <span>官網投保</span>
                          <ExternalLink size={10} />
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
                <AnimatePresence initial={false}>
                  {expanded && (
                    <ExpandedRow
                      key={`${p.id}-expanded`}
                      product={p}
                      color={color}
                      colSpan={COL_SPAN}
                      onOpenDoc={handleOpenDoc}
                    />
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {/* 內置官方 PDF 原生抽屜閱讀器 */}
      <PdfViewerDrawer
        isOpen={activeDoc.isOpen}
        onClose={() => setActiveDoc((prev) => ({ ...prev, isOpen: false }))}
        pdfUrl={activeDoc.pdfUrl}
        documentName={activeDoc.documentName}
        page={activeDoc.page}
        itemTitle={activeDoc.itemTitle}
        limitText={activeDoc.limitText}
        quote={activeDoc.quote}
        productId={activeDoc.productId}
      />
    </div>
  );
}
