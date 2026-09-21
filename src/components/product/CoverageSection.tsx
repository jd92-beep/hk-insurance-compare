import * as React from "react";
import { ExternalLink, Eye, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { CoverageItem } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import CitationRef from "@/components/product/citation/CitationRef";
import type { CitationEntry } from "@/components/product/citation/citation-utils";
import PdfViewerDrawer from "@/components/product/PdfViewerDrawer";
import PlanSelectorBar from "@/components/product/PlanSelectorBar";
import { extractTierCoverageLimit, type PlanTierItem } from "@/components/product/plan-parser";
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
  if (citationEntries && citationEntries.length > 0) {
    const match = citationEntries.find((entry) => {
      const summary = (entry.citation.claim_summary || "").trim();
      const quote = (entry.citation.quote || "").trim();
      const item = c.item.trim();
      if (entry.citation.claim_field !== "coverage" || item.length === 0 || summary.length === 0) return false;
      const ITEM_SEPARATORS = new Set(["：", ":", "—", "–", "-", "·", "／", "/", " ", "（", "("]);
      const summaryMatches =
        summary === item || (summary.startsWith(item) && ITEM_SEPARATORS.has(summary.charAt(item.length)));
      return summaryMatches || quote === item;
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
 * 支援點擊呼叫內置 PDF 閱讀抽屜，同時支援新分頁開啟與官方出處佐證。
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

          <a
            href={sourceUrl}
            target={`doc_viewer_${productId.replace(/[^a-zA-Z0-9_-]/g, "_")}`}
            rel="noreferrer"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink-soft transition-colors hover:text-jade"
            title="在新分頁獨立開啟"
            aria-label={`${item}：在新分頁開啟來源`}
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
            資料來源：{documentName ?? "官方文件"}
            {page != null ? ` · 第 ${page} 頁` : ""}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * 方案 A：多欄矩陣對比表格組件（Multi-Plan Comparison Matrix Table）
 * - 左側第一欄保障項目固定凍結（Sticky Column）
 * - 右側各子計劃獨立並排成欄，每格只顯示該計劃專屬限額
 * - 支援平滑橫向滾動，告別一坨長文字重疊截斷
 */
function MultiPlanMatrixTable({
  coverage,
  tiers,
  citationEntries,
  onOpenDoc,
  onSelectTier,
  productId,
}: {
  coverage: CoverageItem[];
  tiers: PlanTierItem[];
  citationEntries?: CitationEntry[];
  onOpenDoc: (c: CoverageItem, info: ReturnType<typeof resolveSourceInfo>, effectiveLimit?: string) => void;
  onSelectTier?: (tierId: string | null) => void;
  productId: string;
}) {
  const groups = groupBenefitRows(coverage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex flex-col gap-2"
    >
      {/* 橫向滑動提示 */}
      <div className="flex items-center justify-between px-1 text-[12px] text-ink-faint">
        <span className="inline-flex items-center gap-1">
          <span>✦ 多計劃規格橫向對照矩陣</span>
          <span className="hidden sm:inline">（各欄獨立顯示專屬限額）</span>
        </span>
        <span className="font-grotesk text-[11px]">
          ← 左右滑動對照全部 {tiers.length} 個計劃 →
        </span>
      </div>

      <div
        className="relative overflow-x-auto rounded-[12px] border bg-paper shadow-card scrollbar-none"
        style={{ borderColor: "var(--line)" }}
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--line-strong)" }}>
              {/* 凍結首欄：保障項目 */}
              <th
                className="sticky left-0 z-20 bg-paper-2 px-4 py-3 text-small font-bold text-ink-soft min-w-[170px] sm:min-w-[210px] border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]"
                style={{ borderColor: "var(--line)" }}
              >
                保障項目
              </th>

              {/* 後續各子計劃獨立欄位 */}
              {tiers.map((t) => (
                <th
                  key={t.id}
                  className="bg-paper-2 px-4 py-3 align-top min-w-[170px] border-r last:border-r-0"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-sans text-[14px] font-bold text-ink truncate" title={t.name}>
                        {t.name}
                      </span>
                      {t.code && (
                        <span className="rounded bg-jade-wash px-1.5 py-0.5 font-grotesk text-[10px] font-bold text-jade shrink-0">
                          {t.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 text-[11px] text-ink-faint">
                      <span>{t.roomType || (t.isStandard ? "普通房" : "靈活規格")}</span>
                      {onSelectTier && (
                        <button
                          type="button"
                          onClick={() => onSelectTier(t.id)}
                          className="text-[11px] font-medium text-jade hover:underline inline-flex items-center gap-0.5 cursor-pointer shrink-0"
                          title={`專注檢視「${t.name}」細項`}
                        >
                          <span>專注</span>
                          <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {groups.map((group) => (
            <tbody key={group.label}>
              <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                <td
                  colSpan={tiers.length + 1}
                  className="bg-paper-2/60 px-4 pb-1.5 pt-2.5 text-[11px] font-bold tracking-[0.1em] text-ink-faint"
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
                      "border-b transition-colors duration-150 last:border-b-0 hover:bg-paper-2/50",
                      headline && "bg-jade-wash/40"
                    )}
                    style={{ borderColor: "var(--line)" }}
                  >
                    {/* 左側 Sticky 保障項目 */}
                    <td
                      className={cn(
                        "sticky left-0 z-10 bg-paper px-4 py-3 align-top font-sans text-[14px] leading-[1.6] border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]",
                        headline && "bg-jade-wash/70 font-bold"
                      )}
                      style={{ borderColor: "var(--line)" }}
                    >
                      <CoverageItemTitle
                        item={c.item}
                        headline={headline}
                        sourceUrl={info.sourceUrl}
                        documentName={info.documentName}
                        page={info.page}
                        textSizeClass="text-[14px]"
                        onPreviewDoc={() => onOpenDoc(c, info)}
                        productId={productId}
                      />
                    </td>

                    {/* 各子計劃專屬限額格 */}
                    {tiers.map((t) => {
                      const tierLimit = extractTierCoverageLimit(c.limit, t);
                      return (
                        <td
                          key={t.id}
                          className={cn(
                            "px-4 py-3 align-top text-[14px] leading-[1.6] border-r last:border-r-0 font-sans",
                            headline
                              ? "font-grotesk text-[15px] font-bold text-jade"
                              : "text-ink"
                          )}
                          style={{ borderColor: "var(--line)" }}
                        >
                          <div className="whitespace-pre-line break-words">
                            {tierLimit}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
    </motion.div>
  );
}

/**
 * S2.1 保障一覽。
 * - 多計劃產品在「全部計劃對比」下自動升級為【多欄對比矩陣表格】（方案 A）
 * - 選擇特定計劃時展示該計劃的【專注視圖】
 * - 單一計劃產品維持原標準視圖
 */
export default function CoverageSection({
  coverage,
  standardTable = false,
  citationEntries,
  productId = "insurance",
  tiers = [],
  selectedTier = null,
  onSelectTier,
}: {
  coverage: CoverageItem[];
  standardTable?: boolean;
  citationEntries?: CitationEntry[];
  productId?: string;
  tiers?: PlanTierItem[];
  selectedTier?: PlanTierItem | null;
  onSelectTier?: (tierId: string | null) => void;
}) {
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
    info: ReturnType<typeof resolveSourceInfo>,
    effectiveLimit?: string
  ) => {
    if (!info.sourceUrl) return;
    setActiveDoc({
      isOpen: true,
      pdfUrl: info.sourceUrl,
      documentName: info.documentName,
      page: info.page,
      itemTitle: c.item,
      limitText: effectiveLimit || c.limit,
      quote: info.quote,
    });
  };

  const hasMultipleTiers = tiers && tiers.length > 1;

  return (
    <div>
      <SectionHeading
        index="01"
        title="保障一覽"
        aside={citationEntries && <CitationRef entries={citationEntries} />}
      />

      {/* 智能計劃切換器（PlanSelectorBar） */}
      {hasMultipleTiers && onSelectTier && (
        <PlanSelectorBar
          tiers={tiers}
          selectedTierId={selectedTier?.id}
          onSelectTier={onSelectTier}
          className="mb-6"
        />
      )}

      {/* ── 方案 A：多計劃「全部對比」模式下的多欄對照矩陣 ── */}
      {hasMultipleTiers && !selectedTier ? (
        <MultiPlanMatrixTable
          coverage={coverage}
          tiers={tiers}
          citationEntries={citationEntries}
          onOpenDoc={handleOpenDoc}
          onSelectTier={onSelectTier}
          productId={productId}
        />
      ) : standardTable ? (
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
                  {selectedTier ? `${selectedTier.name} 賠償限額` : "賠償限額"}
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
                  const effectiveLimit = extractTierCoverageLimit(c.limit, selectedTier);
                  const isFiltered = Boolean(selectedTier && effectiveLimit !== c.limit);

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
                          onPreviewDoc={() => handleOpenDoc(c, info, effectiveLimit)}
                          productId={productId}
                        />
                      </td>
                      <td
                        className={cn(
                          "px-5 py-3.5 text-right align-top text-[15px] leading-[1.7]",
                          headline
                            ? "font-grotesk text-[16px] font-bold text-jade"
                            : isFiltered
                              ? "font-medium text-ink"
                              : "text-ink-soft",
                        )}
                      >
                        <div>{effectiveLimit}</div>
                        {isFiltered && (
                          <div
                            className="mt-0.5 text-[11px] font-normal text-ink-faint cursor-help"
                            title={`原始全部計劃條款：${c.limit}`}
                          >
                            已聚焦專屬限額
                          </div>
                        )}
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
            const effectiveLimit = extractTierCoverageLimit(c.limit, selectedTier);
            const isFiltered = Boolean(selectedTier && effectiveLimit !== c.limit);

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
                  onPreviewDoc={() => handleOpenDoc(c, info, effectiveLimit)}
                  productId={productId}
                />
                <div className="flex flex-col sm:max-w-[60%] sm:shrink-0 sm:items-end">
                  <span
                    className={cn(
                      "text-[15px] leading-[1.7] sm:text-right",
                      isFiltered ? "font-medium text-ink" : "text-ink-soft"
                    )}
                  >
                    {effectiveLimit}
                  </span>
                  {isFiltered && (
                    <span
                      className="text-[11px] text-ink-faint sm:text-right cursor-help"
                      title={`原始全部計劃條款：${c.limit}`}
                    >
                      已聚焦專屬限額
                    </span>
                  )}
                </div>
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
