import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pageLabel,
  scrollToCitation,
  type CitationEntry,
} from "@/components/product/citation/citation-utils";

const MAX_TOOLTIP_DOCS = 3;

/**
 * 內文引文標記（subtle inline ref）：section 標題旁嘅 jade 細字「[N]」，
 * N = 呢個 section 有幾多條官方出處。
 * hover / focus 顯示 tooltip（文件名 + 頁碼），click 平滑捲到頁尾第一條對應引文卡。
 * 設計克制：每個 section 只出現一次，唔會逐行加標記。
 */
export default function CitationRef({
  entries,
  className,
}: {
  entries: CitationEntry[];
  className?: string;
}) {
  if (entries.length === 0) return null;

  const first = entries[0];
  // tooltip 文件列表：按 文件+頁碼 去重，最多列 3 行
  const docLines: string[] = [];
  for (const e of entries) {
    const line = `${e.citation.document} · ${pageLabel(e.citation.page)}`;
    if (!docLines.includes(line)) docLines.push(line);
    if (docLines.length >= MAX_TOOLTIP_DOCS) break;
  }
  const moreDocs = entries.length - docLines.length;

  return (
    <span className={cn("group/citref relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => scrollToCitation(first.num)}
        className="inline-flex translate-y-[-2px] items-baseline gap-[2px] rounded-full px-1.5 py-[1px] font-grotesk text-[11px] font-bold leading-[1.4] text-jade transition-colors duration-300 hover:bg-jade-wash focus-visible:bg-jade-wash focus-visible:outline-none"
        aria-label={`${entries.length} 條官方出處，撳去頁尾資料出處`}
      >
        <span className="inline-block h-[5px] w-[5px] self-center rounded-full bg-jade" aria-hidden="true" />
        [{entries.length}]
      </button>

      {/* tooltip：文件名 + 頁碼（hover / focus-within 顯示） */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-max max-w-[280px] -translate-x-1/2 rounded-[10px] bg-ink px-3.5 py-3 text-left opacity-0 shadow-lift transition-all duration-300 group-hover/citref:opacity-100 group-focus-within/citref:opacity-100"
      >
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-jade-wash/70">
          {entries.length} 條官方出處
        </span>
        {docLines.map((line) => (
          <span key={line} className="mt-1.5 block text-[12px] leading-[1.6] text-paper">
            {line}
          </span>
        ))}
        {moreDocs > 0 && (
          <span className="mt-1.5 block text-[12px] leading-[1.6] text-paper/60">
            …及其他 {moreDocs} 條
          </span>
        )}
        <span className="mt-2 flex items-center gap-1 text-[11px] font-bold text-jade-wash">
          <ArrowDown size={11} aria-hidden="true" />
          撳去頁尾對應出處
        </span>
        {/* 小三角 */}
        <span
          className="absolute -top-[5px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rotate-45 bg-ink"
          aria-hidden="true"
        />
      </span>
    </span>
  );
}
