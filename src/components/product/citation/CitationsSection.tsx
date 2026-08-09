import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Stamp } from "lucide-react";
import type { Citation } from "@/types/insurance";
import SectionHeading, { EASE_OUT_EXPO } from "@/components/product/SectionHeading";
import { cn } from "@/lib/utils";
import {
  CITATION_HIGHLIGHT_EVENT,
  buildCitationEntries,
  citationAnchorId,
  groupEntries,
  pageLabel,
  type CitationEntry,
} from "@/components/product/citation/citation-utils";

/** 引文多於 8 條時預設收摺 */
const COLLAPSE_THRESHOLD = 8;
const HIGHLIGHT_MS = 2000;

/**
 * 頁尾「資料出處」：每條資料嘅官方文件原文出處（文件 + 頁碼 + 原文）。
 * 幼線卡列表，按 claim_field 分組；多於 8 條預設收摺；
 * 內文 CitationRef click 會捲到對應卡並短暫高亮（jade-wash 閃爍）。
 * 產品無 citations 時由 ProductDetail 判斷唔渲染呢個 section。
 */
export default function CitationsSection({ citations }: { citations: Citation[] }) {
  const entries = buildCitationEntries(citations);
  const groups = groupEntries(entries);
  const total = entries.length;

  const [expanded, setExpanded] = useState(false);
  const [highlightNum, setHighlightNum] = useState<number | null>(null);
  const highlightTimer = useRef<number | null>(null);

  // 內文引文標記 click → 確保目標卡可見（展開收摺）+ 短暫高亮
  useEffect(() => {
    const onHighlight = (e: Event) => {
      const num = (e as CustomEvent<number>).detail;
      const target = entries.find((en) => en.num === num);
      if (!target) return;
      // 目標喺收摺區 → 展開
      const flatIndex = entries.indexOf(target);
      if (flatIndex >= COLLAPSE_THRESHOLD) setExpanded(true);
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
      setHighlightNum(num);
      highlightTimer.current = window.setTimeout(() => setHighlightNum(null), HIGHLIGHT_MS);
    };
    window.addEventListener(CITATION_HIGHLIGHT_EVENT, onHighlight);
    return () => {
      window.removeEventListener(CITATION_HIGHLIGHT_EVENT, onHighlight);
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    };
  }, [entries]);

  if (total === 0) return null;

  const collapsed = total > COLLAPSE_THRESHOLD && !expanded;
  // 收摺時只顯示首 8 條（按全頁編號次序）
  const visibleNums = collapsed
    ? new Set(entries.slice(0, COLLAPSE_THRESHOLD).map((e) => e.num))
    : null;

  return (
    <div>
      <SectionHeading index="06" title="資料出處" />
      <p className="-mt-3 mb-6 flex items-center gap-2 text-small text-ink-faint">
        <Stamp size={14} className="shrink-0 text-jade" aria-hidden="true" />
        以下係呢頁資料嘅官方文件原文出處（共 {total} 條）
      </p>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-12% 0px" }}
        transition={{ staggerChildren: 0.05 }}
        className="flex flex-col gap-3"
      >
        {groups.map(({ meta, items }) => (
          <div key={meta.key} className="flex flex-col gap-3">
            {/* 組標題 eyebrow */}
            <p className="mt-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint first:mt-0">
              <span
                className="inline-block h-[7px] w-[7px] rounded-[2px]"
                style={{ background: meta.color }}
                aria-hidden="true"
              />
              {meta.label}（{items.length}）
            </p>
            {items.map((entry) => {
              if (visibleNums && !visibleNums.has(entry.num)) return null;
              return (
                <CitationCard
                  key={entry.num}
                  entry={entry}
                  color={meta.color}
                  highlighted={highlightNum === entry.num}
                />
              );
            })}
          </div>
        ))}
      </motion.div>

      {total > COLLAPSE_THRESHOLD && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border bg-transparent px-4 py-2 font-sans text-small font-bold text-ink transition-colors duration-300 hover:bg-paper-3"
          style={{ borderColor: "var(--line-strong)" }}
        >
          {expanded ? "收摺出處" : `顯示全部 ${total} 條出處`}
          <ChevronDown
            size={14}
            className={cn("transition-transform duration-300", expanded && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      )}

      <p className="mt-4 text-small text-ink-faint">
        引文為官方文件原文節錄，連結將於新分頁開啟；內容以保險公司正式文件為準。
      </p>
    </div>
  );
}

/** 單條引文卡：編號 + Serif italic 原文（3px 類別色引文線）+ metadata + 「飛去出處 ↗」 */
function CitationCard({
  entry,
  color,
  highlighted,
}: {
  entry: CitationEntry;
  color: string;
  highlighted: boolean;
}) {
  const { citation, num } = entry;

  return (
    <motion.article
      id={citationAnchorId(num)}
      variants={{
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
      }}
      style={{ scrollMarginTop: "110px" }}
      className={cn(
        "paper-card flex gap-4 p-5 transition-colors duration-700 max-md:flex-col max-sm:p-4",
        highlighted && "bg-jade-wash",
      )}
    >
      {/* 直排編號（Space Grotesk 細字） */}
      <span
        className="shrink-0 font-grotesk text-[12px] font-bold tracking-wider text-ink-faint max-md:text-[11px]"
        aria-hidden="true"
      >
        {String(num).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1">
        {/* 原文（Noto Serif TC italic + 3px 類別色引文線） */}
        <blockquote
          className="border-l-[3px] pl-3.5 font-serif text-[15px] italic leading-[1.85] text-ink"
          style={{ borderColor: color }}
        >
          {citation.quote}
        </blockquote>

        {/* metadata：文件名（粗體）+ 頁碼 chip + claim_summary 小字標籤 */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-small font-bold text-ink">{citation.document}</span>
          <span className="chip bg-jade-wash px-2.5 py-[2px] text-[11px] font-bold text-jade">
            {pageLabel(citation.page)}
          </span>
          <span className="text-[12px] leading-[1.6] text-ink-faint">
            {citation.claim_summary}
          </span>
        </div>
      </div>

      {/* 飛去出處 ↗：新分頁開官方文件 */}
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 shrink-0 items-center gap-1.5 self-center whitespace-nowrap rounded-[10px] bg-jade px-4 font-sans text-[13px] font-bold text-paper transition-colors duration-300 hover:bg-ink max-md:self-start"
      >
        飛去出處
        <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </motion.article>
  );
}
