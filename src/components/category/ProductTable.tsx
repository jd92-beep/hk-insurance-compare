import VerifiedPromotion from "@/components/VerifiedPromotion";
import { purchaseUrl } from "@/lib/product-availability";
import { Fragment, useState, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import type { CoverageItem, Product } from "@/types/insurance";
import type { FeatureMatchResult } from "@/lib/feature-filters";
import PdfViewerDrawer from "@/components/product/PdfViewerDrawer";
import { useCompare } from "@/providers/CompareProvider";
import { cn } from "@/lib/utils";

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
    <li className="group/cov flex items-start gap-2 text-base leading-[1.65]">
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
          <div className="grid grid-cols-1 gap-6 py-5 fold:grid-cols-2">
            <div className="col-span-full"><VerifiedPromotion product={product} /></div>
            <div>
              <p className="mb-2.5 text-base font-bold text-ink">
                全部保障項目
                <span className="ml-2 font-grotesk font-medium text-ink-faint">
                  {coverage.length} 項
                </span>
              </p>
              {coverage.length === 0 ? (
                <p className="text-base text-ink-faint">本站未逐項整理，請核對來源。</p>
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
              <p className="mb-2.5 text-base font-bold text-ink">主要條款</p>
              {terms.length === 0 ? (
                <p className="text-base text-ink-faint">—</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {terms.map((t, i) => (
                    <li key={i} className="flex gap-2 text-base leading-[1.65] text-ink-soft">
                      <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to={`/product/${product.id}`}
                  className="inline-flex items-center gap-1.5 rounded-[8px] bg-ink px-4 py-2 text-base font-bold text-paper transition-colors hover:bg-red"
                >
                  睇完整產品檔案
                  <ExternalLink size={13} />
                </Link>
                {product.source_urls?.[0] && (
                  <a
                    href={product.source_urls[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-base font-medium text-jade hover:underline"
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
  productMatchMap,
}: {
  products: Product[];
  color: string;
  coverageKeywords: string[];
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
      toast.error("⚖️ 比較車最多 3 份。請先移除一份，再加入新產品。", {
        position: "top-center",
        duration: 5000,
        style: { fontSize: "14px", fontWeight: 700, padding: "14px 18px" },
      });
      return;
    }
    compare.toggle(id);
  };

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const COL_SPAN = 7;

  const thBase =
    "sticky top-16 z-20 bg-paper/95 backdrop-blur-md px-4 py-3.5 text-left text-base font-bold text-ink-soft border-b border-line-strong [box-shadow:inset_0_-1px_0_var(--line-strong)]";

  return (
    <div
      className="rounded-card border bg-paper shadow-card max-lg:overflow-x-auto"
      style={{ borderColor: "var(--line)" }}
    >
      <table className="w-full border-collapse text-left text-base leading-[1.55] max-lg:min-w-[900px] max-md:min-w-[760px] lg:min-w-0 ">
        <caption className="p-4 text-left text-base leading-relaxed text-ink-soft">網站摘要，唔係全市場或即時報價。先對齊級別、自付及不保。</caption>
        <thead className="sticky top-16 z-20">
          <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
            <th scope="col" className={cn(thBase, "w-[21%] px-5")}>保險公司 / 產品</th>
            <th scope="col" className={cn(thBase, "w-[19%]")}>保費資料（非即時報價）</th>
            <th scope="col" className={cn(thBase, "w-[15%]")}>計劃層級</th>
            <th scope="col" className={cn(thBase, "w-[21%]")}>重點保障</th>
            <th scope="col" className={cn(thBase, "w-[13%]")}>先睇不保事項</th>
            <th scope="col" className={cn(thBase, "w-[7%]")}>文件</th>
            <th scope="col" className={cn(thBase, "w-[4%] text-center")}>比較</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            const inTray = compare.has(p.id);
            const expanded = expandedId === p.id;
            const keyCoverage = pickKeyCoverage(p.coverage ?? [], coverageKeywords);
            const tiers = p.plan_tiers ?? [];
            const sourceUrl = p.source_urls?.[0];
            const match = productMatchMap?.get(p.id);
            const enterDelay = i < 9 ? i * 0.05 : 0;
            return (
              <Fragment key={p.id}>
                <motion.tr
                  
                  className={cn(
                    "group cursor-pointer border-b transition-colors duration-200 hover:bg-paper-2",
                    expanded && "bg-paper-2/70",
                  )}
                  style={{ borderColor: "var(--line)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: enterDelay }}
                >
                  {/* 保險公司 / 產品 */}
                  <td className="relative px-5 py-4 align-top">
                    <span
                      className="pointer-events-none absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 transition-transform duration-200 group-hover:scale-y-100"
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                    <span className="block text-base">
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
                    </span>
                    {match && match.totalSelected > 0 && <p className="mt-2 text-sm text-ink-soft">摘要對照 {match.matchedCount}/{match.totalSelected} · 仍要核對原文</p>}
                    <VerifiedPromotion product={p} />
                    <button type="button" aria-expanded={expanded} onClick={() => toggleRow(p.id)} className="min-h-11 mt-1.5 inline-flex items-center gap-1 text-base font-medium text-ink-faint transition-colors group-hover:text-ink-soft">
                      <ChevronDown
                        size={13}
                        className={cn("transition-transform duration-300", expanded && "rotate-180")}
                      />
                      {expanded ? "收合詳情" : "展開保障詳情"}
                    </button>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold text-ink">{p.premium_available ? "有參考保費資料" : "需個別報價"}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">唔同年齡／計劃／保障期，唔可直接比價。</p>
                    <details className="mt-2" onClick={(event) => event.stopPropagation()}>
                      <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-jade">查看保費資料快照</summary>
                      <p className="mt-2 whitespace-normal break-words text-sm leading-relaxed text-ink-soft">{p.premium_range}</p>
                    </details>
                  </td>

                  {/* 計劃層級 */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {tiers.slice(0, 2).map((t) => (
                        <span key={t} className="chip bg-paper-3 text-ink-soft">
                          {t}
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
                        另有 {(p.coverage?.length ?? 0) - keyCoverage.length} 項，可展開詳情
                      </span>
                    )}
                  </td>

                  {/* 主要條款 */}
                  <td className="px-4 py-4 align-top text-ink-soft">
                    {p.exclusions?.[0] || "未提供（唔等於全部受保）"}<Link to={`/product/${p.id}`} className="mt-2 flex min-h-11 items-center text-jade underline">睇完整限制</Link>
                  </td>

                  {/* 文件 / 來源 */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-col items-start gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-base text-ink-faint"
                        title="收錄文件數量，唔代表已核實"
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
                          className="inline-flex min-h-11 items-center gap-1 text-base font-medium text-jade transition-colors hover:underline"
                        >
                          官方來源
                          <ExternalLink size={12} />
                        </a>
                      )}
                      {(purchaseUrl(p)) && (
                        <a
                          href={purchaseUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded bg-red text-paper hover:bg-red/90 px-2 py-0.5 text-sm font-bold min-h-11 shadow-2xs active:scale-95 transition-all"
                          title="直達該保險公司官方投保／報價頁面"
                        >
                          <span>{p.premium_available ? "官網投保" : "官網報價"}</span>
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
                        "inline-flex h-12 w-12 items-center justify-center rounded-[8px] border transition-all duration-300",
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
