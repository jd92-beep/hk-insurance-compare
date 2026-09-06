import * as React from "react";
import { ExternalLink, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { CoverageItem } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import CitationRef from "@/components/product/citation/CitationRef";
import type { CitationEntry } from "@/components/product/citation/citation-utils";
import PdfViewerDrawer from "@/components/product/PdfViewerDrawer";
import { cn } from "@/lib/utils";

/** 標準計劃保障表分組：限額行置頂，靈活計劃級別排尾，其餘為基本保障 */
const LIMIT_ITEMS = new Set(["每年保障限額", "終身保障限額"]);
const FLEXI_ITEM = "靈活計劃保障級別";

function groupBenefitRows(coverage: CoverageItem[]): { label: string; rows: CoverageItem[] }[] {
  const limits = coverage.filter((c) => LIMIT_ITEMS.has(c.item));
  const flexi = coverage.filter((c) => c.item === FLEXI_ITEM);
  const basic = coverage.filter((c) => !LIMIT_ITEMS.has(c.item) && c.item !== FLEXI_ITEM);
  return [
    { label: "保障限額", rows: limits },
    { label: "基本保障", rows: basic },
    { label: "靈活計劃", rows: flexi },
  ].filter((g) => g.rows.length > 0);
}

/** 智能解析來源 URL 與官方出處佐證 */
function resolveSourceInfo(c: CoverageItem, citationEntries?: CitationEntry[]) {
  if (c.source_url) {
    return {
      sourceUrl: c.source_url,
      documentName: c.document_name,
      page: c.page,
      quote: c.quote,
    };
  }
  // 智能 fallback：如果 citationEntries 有對應保障項目，自動對齊
  if (citationEntries && citationEntries.length > 0) {
    const match = citationEntries.find((entry) => {
      const summary = entry.citation.claim_summary || "";
      const quote = entry.citation.quote || "";
      return entry.citation.claim_field === "coverage" && c.item.trim().length > 0 && summary.trim().length > 0 &&
        (summary.trim() === c.item.trim() || summary.startsWith(`${c.item}：`) || quote.trim() === c.item.trim());
    });
    if (match) {
      return {
        sourceUrl: match.citation.url,
        documentName: match.citation.document,
        page: match.citation.page,
        quote: match.citation.quote,
      };
    }
  }
  return {
    sourceUrl: undefined,
    documentName: c.document_name,
    page: c.page,
    quote: c.quote,
  };
}

/**
 * 保障項目標題渲染組件：
 * 支援點擊呼叫內置 PDF 閱讀抽屜（同份文件無感跳頁，不重新下載），
 * 同時支援新分頁開啟與官方出處佐證。
 */
function CoverageItemTitle({
  item,
  headline = false,
  sourceUrl,
  documentName,
  page,
  textSizeClass = "text-[15px]",
  onPreviewDoc,
  productId = "insurance",
}: {
  item: string;
  headline?: boolean;
  sourceUrl?: string;
  documentName?: string;
  page?: number | null;
  textSizeClass?: string;
  onPreviewDoc?: () => void;
  productId?: string;
}) {
  const hasDoc = Boolean(documentName || page != null);

  return (
    <div className="flex flex-col items-start gap-1">
      {sourceUrl ? (
        <div className="inline-flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onPreviewDoc}
            className={cn(
              "group/cov inline-flex items-center gap-1.5 text-left transition-colors duration-200 hover:text-jade hover:underline cursor-pointer",
              textSizeClass,
              headline ? "font-bold text-ink" : "font-medium text-ink"
            )}
            title={`點擊於內置抽屜查閱「${item}」官方條款`}
          >
            <span>{item}</span>
            <Eye
              size={14}
              className="shrink-0 text-jade/70 transition-transform duration-200 group-hover/cov:scale-110 group-hover/cov:text-jade"
              aria-hidden="true"
            />
          </button>

          {/* 右側新分頁按鈕：鎖定相同 window 名稱，避免重複開分頁 */}
          <a
            href={sourceUrl}
            target={`doc_viewer_${productId.replace(/[^a-zA-Z0-9_-]/g, "_")}`}
            rel="noreferrer"
            className="text-ink-faint transition-colors hover:text-jade"
            title="在新分頁獨立開啟"
          >
            <ExternalLink size={12} className="shrink-0" />
          </a>
        </div>
      ) : (
        <span
          className={cn(
            textSizeClass,
            headline ? "font-bold text-ink" : "font-medium text-ink"
          )}
        >
          {item}
        </span>
      )}
      {hasDoc && (
        <span className="inline-flex items-center gap-1 text-[11px] font-normal leading-normal text-ink-faint">
          <span>
            📄 官方出處：{documentName ?? "官方文件"}
            {page != null ? ` · 第 ${page} 頁` : ""}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * S2.1 保障一覽。
 * 預設：左保障項目 + 右賠償上限，髮線分行（附錄 3）。
 * standardTable（自願醫保標準計劃規格）：分組 definition 表卡
 * （保障限額 → 基本保障 → 靈活計劃），「每年保障限額」headline 行 jade 強調。
 * 標題旁可掛引文標記（citationEntries）。
 */
export default function CoverageSection({
  coverage,
  standardTable = false,
  citationEntries,
  productId = "insurance",
}: {
  coverage: CoverageItem[];
  standardTable?: boolean;
  citationEntries?: CitationEntry[];
  productId?: string;
}) {
  // 內置 PDF 抽屜閱讀器狀態（同份文件點第二格無感切換頁碼，不重複下載）
  const [activeDoc, setActiveDoc] = React.useState<{
    isOpen: boolean;
    pdfUrl?: string;
    documentName?: string;
    page?: number | null;
    itemTitle?: string;
    limitText?: string;
    quote?: string;
  }>({
    isOpen: false,
  });

  const handleOpenDoc = (
    c: CoverageItem,
    info: ReturnType<typeof resolveSourceInfo>
  ) => {
    if (!info.sourceUrl) return;
    setActiveDoc({
      isOpen: true,
      pdfUrl: info.sourceUrl,
      documentName: info.documentName,
      page: info.page,
      itemTitle: c.item,
      limitText: c.limit,
      quote: info.quote,
    });
  };
  return (
    <div>
      <SectionHeading
        index="01"
        title="保障一覽"
        aside={citationEntries && <CitationRef entries={citationEntries} />}
      />
      {standardTable ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-18% 0px" }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="overflow-hidden rounded-card border bg-paper shadow-card"
          style={{ borderColor: "var(--line)" }}
        >
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
                <th className="bg-paper-2 px-5 py-3 text-small font-bold text-ink-soft">
                  保障項目
                </th>
                <th className="bg-paper-2 px-5 py-3 text-right text-small font-bold text-ink-soft">
                  賠償限額
                </th>
              </tr>
            </thead>
            {groupBenefitRows(coverage).map((group) => (
              <tbody key={group.label}>
                <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                  <td
                    colSpan={2}
                    className="bg-paper-2/60 px-5 pb-1.5 pt-3 text-[11px] font-bold tracking-[0.1em] text-ink-faint"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.rows.map((c, i) => {
                  const headline = c.item === "每年保障限額";
                  const info = resolveSourceInfo(c, citationEntries);
                  return (
                    <tr
                      key={`${c.item}-${i}`}
                      className={cn(
                        "border-b transition-colors duration-200 last:border-b-0",
                        headline ? "bg-jade-wash/60" : "hover:bg-paper-2",
                      )}
                      style={{ borderColor: "var(--line)" }}
                    >
                      <td
                        className={cn(
                          "px-5 py-3.5 align-top font-sans text-[15px] leading-[1.7]",
                          headline ? "font-bold text-ink" : "font-medium text-ink",
                        )}
                      >
                        <CoverageItemTitle
                          item={c.item}
                          headline={headline}
                          sourceUrl={info.sourceUrl}
                          documentName={info.documentName}
                          page={info.page}
                          textSizeClass="text-[15px]"
                          onPreviewDoc={() => handleOpenDoc(c, info)}
                          productId={productId}
                        />
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3.5 text-right align-top text-[15px] leading-[1.7]",
                          headline
                            ? "font-grotesk text-[16px] font-bold text-jade"
                            : "text-ink-soft",
                        )}
                      >
                        {c.limit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </motion.div>
      ) : (
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-18% 0px" }}
          transition={{ staggerChildren: 0.05 }}
          className="hairline-t"
        >
          {coverage.map((c, i) => {
            const info = resolveSourceInfo(c, citationEntries);
            return (
              <motion.li
                key={`${c.item}-${i}`}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
                }}
                className="hairline-b flex flex-col gap-1 px-2 py-4 transition-colors duration-300 hover:bg-paper-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <CoverageItemTitle
                  item={c.item}
                  sourceUrl={info.sourceUrl}
                  documentName={info.documentName}
                  page={info.page}
                  textSizeClass="text-[16px]"
                  onPreviewDoc={() => handleOpenDoc(c, info)}
                  productId={productId}
                />
                <span className="text-[15px] leading-[1.7] text-ink-soft sm:max-w-[60%] sm:shrink-0 sm:text-right">
                  {c.limit}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
      {standardTable && (
        <p className="mt-3 text-small text-ink-faint">
          自願醫保標準計劃保障由政府劃一釐定，各認可產品基本保障完全相同。
        </p>
      )}

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
        productId={productId}
      />
    </div>
  );
}
