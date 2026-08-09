import type { Citation } from "@/types/insurance";
import { getLenis } from "@/lib/lenis";

/** 引文分組 key（按 claim_field 歸類） */
export type CitationGroupKey = "premium" | "coverage" | "terms" | "exclusions" | "other";

/** 帶全頁編號（1 起）同分組嘅引文條目 */
export interface CitationEntry {
  citation: Citation;
  /** 全頁流水編號（1-based），對應頁尾卡片 id `pd-citation-N` */
  num: number;
  group: CitationGroupKey;
}

export interface CitationGroupMeta {
  key: CitationGroupKey;
  label: string;
  /** 引文卡左邊 3px 引文線顏色（CSS color） */
  color: string;
}

/** 分組顯示次序同顏色（跟全站 paper/ink/紅/jade/amber 色系） */
export const CITATION_GROUPS: CitationGroupMeta[] = [
  { key: "premium", label: "保費", color: "var(--red, #C8102E)" },
  { key: "coverage", label: "保障", color: "var(--jade, #0E7C66)" },
  { key: "terms", label: "條款", color: "var(--amber, #D98E04)" },
  { key: "exclusions", label: "不保事項", color: "#3C4A63" },
  { key: "other", label: "其他", color: "var(--ink-faint, #8A8FA0)" },
];

export function groupKeyOf(claimField: string): CitationGroupKey {
  switch (claimField) {
    case "premium_range":
    case "premium_notes":
      return "premium";
    case "coverage":
      return "coverage";
    case "key_terms":
      return "terms";
    case "exclusions":
      return "exclusions";
    default:
      return "other";
  }
}

/** 將產品引文陣列變成帶編號、分組嘅條目（保持原本次序編號） */
export function buildCitationEntries(citations: Citation[] | undefined): CitationEntry[] {
  return (citations ?? []).map((citation, i) => ({
    citation,
    num: i + 1,
    group: groupKeyOf(citation.claim_field),
  }));
}

/** 按 CITATION_GROUPS 次序分組；唔會出現空組 */
export function groupEntries(entries: CitationEntry[]): { meta: CitationGroupMeta; items: CitationEntry[] }[] {
  return CITATION_GROUPS.map((meta) => ({
    meta,
    items: entries.filter((e) => e.group === meta.key),
  })).filter((g) => g.items.length > 0);
}

/** 攞某個分組嘅條目（畀 section 標題旁嘅引文標記用） */
export function entriesForGroup(entries: CitationEntry[], group: CitationGroupKey): CitationEntry[] {
  return entries.filter((e) => e.group === group);
}

/** 引文卡 anchor id */
export function citationAnchorId(num: number): string {
  return `pd-citation-${num}`;
}

/** 引文高亮事件（內文標記 click → 頁尾卡閃爍 highlight） */
export const CITATION_HIGHLIGHT_EVENT = "hkic:citation-highlight";

const NAV_OFFSET = 110;

/** 平滑捲去頁尾第 N 條引文卡，並廣播高亮事件（頁尾收摺時會自動展開） */
export function scrollToCitation(num: number): void {
  // 先廣播：CitationsSection 收到後會確保目標卡已展開渲染
  window.dispatchEvent(new CustomEvent<number>(CITATION_HIGHLIGHT_EVENT, { detail: num }));
  const doScroll = () => {
    const el = document.getElementById(citationAnchorId(num));
    if (!el) return;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, {
        offset: -NAV_OFFSET,
        duration: 0.9,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };
  // 卡片可能因收摺而未渲染 → 等一個 tick 畀 React 展開後再捲
  if (document.getElementById(citationAnchorId(num))) doScroll();
  else window.setTimeout(doScroll, 120);
}

/** 頁碼顯示：有頁碼 →「第 N 頁」，null →「官方網頁」 */
export function pageLabel(page: number | null): string {
  return page === null ? "官方網頁" : `第 ${page} 頁`;
}
