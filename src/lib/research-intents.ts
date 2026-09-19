/**
 * Curated research / navigation intents for education UX.
 * Chips route to guides, glossary anchors, categories, or VHIS — never product ranking.
 */
import { matchesSearchQuery } from "./search-query.ts";
import { GLOSSARY_ENTRIES } from "./glossary.ts";
import { GUIDES } from "../components/guides/guides-data.ts";
import { VHIS_SCHEME_FACTS } from "./vhis-facts.ts";

export type ResearchIntentGroup = "guides" | "glossary" | "category" | "vhis" | "medical-path";

export interface ResearchIntent {
  id: string;
  label: string;
  hint: string;
  to: string;
  group: ResearchIntentGroup;
  /** Extra search keys for palette matching */
  matchKeys: string[];
}

export const RESEARCH_INTENTS: ReadonlyArray<ResearchIntent> = [
  {
    id: "travel-exclusions",
    label: "旅遊不保事項",
    hint: "不保事項點讀 · 旅遊指南",
    to: "/guides#travel",
    group: "guides",
    matchKeys: ["旅遊不保事項", "旅遊保險 不保", "travel exclusions"],
  },
  {
    id: "vhis-vs-group",
    label: "VHIS vs 公司醫保",
    hint: "制度重點 · 唔係邊份好啲",
    to: "/guides#vhis",
    group: "vhis",
    matchKeys: ["VHIS vs 公司醫保", "自願醫保 公司醫保", "VHIS 公司醫保"],
  },
  {
    id: "deductible",
    label: "自負額",
    hint: "詞彙：墊底費／自付費",
    to: "/guides",
    group: "glossary",
    matchKeys: ["自負額", "墊底費", "自付費", "deductible"],
  },
  {
    id: "waiting-period",
    label: "等候期",
    hint: "詞彙：生效後幾耐先有保障",
    to: "/guides",
    group: "glossary",
    matchKeys: ["等候期", "等待期", "waiting period"],
  },
  {
    id: "single-vs-annual-travel",
    label: "單次 vs 全年",
    hint: "旅遊保險類別 · 導航",
    to: "/category/travel",
    group: "category",
    matchKeys: ["單次 vs 全年", "單次 全年旅保", "annual travel"],
  },
  {
    id: "medical-vhis",
    label: "自願醫保類別",
    hint: "類別頁 · 摘要資料",
    to: "/category/medical",
    group: "category",
    matchKeys: ["自願醫保", "VHIS類別", "medical vhis"],
  },
  {
    id: "vhis-official-list",
    label: "VHIS 官方名單",
    hint: "vhis.gov.hk 公開數據整理",
    to: "/vhis",
    group: "vhis",
    matchKeys: ["VHIS 官方名單", "認可產品名單", "vhis list"],
  },
  {
    id: "medical-path-chips",
    label: "醫療路徑對照",
    hint: "標準／公司醫保／Top-up／高端 · 維度",
    to: "/guides#medical-path",
    group: "medical-path",
    matchKeys: ["醫療路徑", "Standard Flexi", "Top-up SMM", "高端醫療 對照"],
  },
  {
    id: "high-end-medical",
    label: "高端醫療類別",
    hint: "類別頁 · 導航",
    to: "/category/high-end-medical",
    group: "category",
    matchKeys: ["高端醫療", "high end medical"],
  },
  {
    id: "top-up-medical",
    label: "Top-up 醫療類別",
    hint: "類別頁 · 導航",
    to: "/category/top-up-medical",
    group: "category",
    matchKeys: ["Top-up醫療", "top up medical", "SMM"],
  },
  {
    id: "how-we-rank",
    label: "點樣排序",
    hint: "摘要命中排序 · 非贊助",
    to: "/about",
    group: "guides",
    matchKeys: ["點樣排序", "排序方法", "how we rank", "摘要命中"],
  },
  {
    id: "guides-overview",
    label: "投保指南",
    hint: "九類「點揀」重點",
    to: "/guides",
    group: "guides",
    matchKeys: ["投保指南", "指南", "guides"],
  },
] as const;

/** Glossary lives on `/guides`; no per-term anchors on the page today. */
export const GLOSSARY_HREF = "/guides" as const;

export const MEDICAL_FAMILY_CATEGORY_IDS: ReadonlySet<string> = new Set([
  "medical",
  "high-end-medical",
  "top-up-medical",
]);

/** Navigation chips only — no product ranking, no “better path”. */
export const MEDICAL_PATH_CHIPS: ReadonlyArray<{ id: string; label: string; to: string }> = [
  { id: "vhis-category", label: "自願醫保", to: "/category/medical" },
  { id: "high-end-category", label: "高端", to: "/category/high-end-medical" },
  { id: "top-up-category", label: "Top-up", to: "/category/top-up-medical" },
  { id: "vhis-official", label: "官方名單", to: "/vhis" },
  { id: "guides-vhis", label: "指南", to: "/guides#vhis" },
];

export interface EducationNavItem {
  id: string;
  kind: "intent" | "glossary" | "guide" | "vhis-fact" | "medical-path";
  label: string;
  sublabel: string;
  to: string;
  groupLabel: string;
}

export const EDUCATION_GROUP_HEADING = "教育／導航";

const VhisFactItems: EducationNavItem[] = [
  {
    id: "vhis-fact-standard",
    kind: "vhis-fact",
    label: "VHIS 標準計劃",
    sublabel: VHIS_SCHEME_FACTS.standardVsFlexi[0]?.title ?? "制度重點",
    to: "/guides#vhis",
    groupLabel: EDUCATION_GROUP_HEADING,
  },
  {
    id: "vhis-fact-flexi",
    kind: "vhis-fact",
    label: "VHIS 靈活計劃",
    sublabel: VHIS_SCHEME_FACTS.standardVsFlexi[1]?.title ?? "制度重點",
    to: "/guides#vhis",
    groupLabel: EDUCATION_GROUP_HEADING,
  },
  {
    id: "vhis-official-site",
    kind: "vhis-fact",
    label: "vhis.gov.hk 官方網站",
    sublabel: "認可名單同制度資料以官方為準",
    to: "/vhis",
    groupLabel: EDUCATION_GROUP_HEADING,
  },
];

function intentToEducation(intent: ResearchIntent): EducationNavItem {
  return {
    id: `intent-${intent.id}`,
    kind: intent.group === "medical-path" ? "medical-path" : "intent",
    label: intent.label,
    sublabel: intent.hint,
    to: intent.to,
    groupLabel: EDUCATION_GROUP_HEADING,
  };
}

function baseEducationPool(): EducationNavItem[] {
  const intents = RESEARCH_INTENTS.map(intentToEducation);
  const glossary = GLOSSARY_ENTRIES.map((entry) => ({
    id: `glossary-${entry.id}`,
    kind: "glossary" as const,
    label: entry.term,
    sublabel: entry.en || "詞彙",
    to: GLOSSARY_HREF,
    groupLabel: EDUCATION_GROUP_HEADING,
  }));
  const guides = GUIDES.map((guide) => ({
    id: `guide-${guide.id}`,
    kind: "guide" as const,
    label: `${guide.shortName}點揀`,
    sublabel: "投保指南",
    to: `/guides#${guide.id}`,
    groupLabel: EDUCATION_GROUP_HEADING,
  }));
  return [...intents, ...VhisFactItems, ...glossary, ...guides];
}

const EDUCATION_POOL = baseEducationPool();

/**
 * Education / navigation matches for SearchPalette.
 * Empty query returns curated intents first (bounded).
 */
export function educationNavItems(query: string, limit = 12): EducationNavItem[] {
  const trimmed = query.trim();
  if (!trimmed) {
    const curated = RESEARCH_INTENTS.map(intentToEducation);
    return [...curated, ...VhisFactItems].slice(0, limit);
  }
  const extraKeys = new Map<string, string[]>();
  for (const intent of RESEARCH_INTENTS) {
    extraKeys.set(`intent-${intent.id}`, intent.matchKeys);
  }
  const matched = EDUCATION_POOL.filter((item) => {
    const keys = extraKeys.get(item.id) ?? [];
    const texts = [`${item.label} ${item.sublabel} ${item.to}`, ...keys];
    return texts.some((text) => matchesSearchQuery(text, trimmed));
  });
  matched.sort(
    (a, b) =>
      Number(b.kind === "intent" || b.kind === "medical-path") -
        Number(a.kind === "intent" || a.kind === "medical-path") ||
      a.label.localeCompare(b.label),
  );
  return matched.slice(0, limit);
}

/** Curated chips for empty / zero-result search states. */
export function emptyStateIntentChips(limit = 8): ReadonlyArray<ResearchIntent> {
  return RESEARCH_INTENTS.slice(0, limit);
}

export function isMedicalFamilyCategory(categoryId: string): boolean {
  return MEDICAL_FAMILY_CATEGORY_IDS.has(categoryId);
}
