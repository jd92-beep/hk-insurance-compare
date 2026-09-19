import type { CoverageItem } from "@/types/insurance";

/**
 * Neutral lexical themes for policy summary text.
 * A theme hit is NOT proof a benefit is excluded; a miss is NOT proof it is covered.
 * Always surface the original excerpt strings — never invent ranking or reduction %.
 */

export type ExclusionThemeId =
  | "pre-existing"
  | "high-risk-sports"
  | "psychiatric"
  | "waiting-period"
  | "maternity"
  | "age-limit"
  | "region-overseas"
  | "known-event"
  | "other";

export interface ExclusionThemeHit {
  themeId: ExclusionThemeId;
  label: string;
  excerpts: string[];
}

export interface ExclusionThemeSourceProduct {
  exclusions?: string[] | null;
  key_terms?: string[] | null;
  coverage?: CoverageItem[] | null;
}

export const EXCLUSION_THEME_LABELS: Record<ExclusionThemeId, string> = {
  "pre-existing": "既有病症",
  "high-risk-sports": "高危運動",
  psychiatric: "精神科",
  "waiting-period": "等候期",
  maternity: "產科",
  "age-limit": "年齡限制",
  "region-overseas": "地區／海外",
  "known-event": "已知事件",
  other: "其他",
};

/** UI honesty note — keep aligned with tests. */
export const EXCLUSION_THEMES_NOTE =
  "主題只係摘要字面檢索：命中唔代表已證實不保；冇命中唔等於受保。請核對保單原文。";

export const AGE_REDUCTION_NOTICE =
  "摘要有提到年齡相關限制／扣減字眼，請打開原文核對；唔代表已證實扣減幅度";

/** Consumer Council-style senior/kid reduction language — lexical warning only. */
export const AGE_REDUCTION_LEXICAL_PATTERN =
  /長者|兒童|年齡扣減|(?:60|65|70)\s*歲/;

const THEME_PATTERNS: {
  themeId: Exclude<ExclusionThemeId, "other">;
  label: string;
  pattern: RegExp;
}[] = [
  {
    themeId: "pre-existing",
    label: EXCLUSION_THEME_LABELS["pre-existing"],
    pattern:
      /既有|已存在|投保前|既往症|原有疾病|pre[-\s]?existing|已患有|出發前已存在|受保前已存在/i,
  },
  {
    themeId: "high-risk-sports",
    label: EXCLUSION_THEME_LABELS["high-risk-sports"],
    pattern:
      /高危|極限運動|危險活動|職業運動|專業運動|職業體育|競賽|賽車|滑雪|潛水|冬季運動|道外|off[-\s]?piste|特技活動|體力勞動工作/i,
  },
  {
    themeId: "psychiatric",
    label: EXCLUSION_THEME_LABELS.psychiatric,
    pattern: /精神科|精神缺陷|精神衰弱|心理|psychiatric|mental\s*(?:illness|health)/i,
  },
  {
    themeId: "waiting-period",
    label: EXCLUSION_THEME_LABELS["waiting-period"],
    pattern: /等候期|等待期|等候\s*\d|waiting\s*period/i,
  },
  {
    themeId: "maternity",
    label: EXCLUSION_THEME_LABELS.maternity,
    pattern: /產科|分娩|懷孕|孕婦|妊娠|生育|產前|產後|maternity|childbirth|pregnan/i,
  },
  {
    themeId: "age-limit",
    label: EXCLUSION_THEME_LABELS["age-limit"],
    pattern:
      /年齡|投保年齡|受保年齡|長者|兒童|(?:60|65|70)\s*歲|歲以上|歲以下|年齡扣減|age\s*limit/i,
  },
  {
    themeId: "region-overseas",
    label: EXCLUSION_THEME_LABELS["region-overseas"],
    pattern:
      /地區|海外|境外|全球|美國|非香港|香港境外|境外住院|海外住院|海外醫療|目的地|war\s*zone|restricted\s*territor/i,
  },
  {
    themeId: "known-event",
    label: EXCLUSION_THEME_LABELS["known-event"],
    pattern: /已知之|已知的|已知事件|known\s+event|投保前已知|任何已知/i,
  },
];

const normalizeText = (value: string): string =>
  value.normalize("NFKC").toLowerCase();

interface LexicalSource {
  text: string;
  field: "exclusions" | "key_terms" | "coverage";
}

function collectLexicalSources(
  product: ExclusionThemeSourceProduct,
): LexicalSource[] {
  const sources: LexicalSource[] = [];
  for (const raw of product.exclusions ?? []) {
    if (typeof raw === "string" && raw.trim()) {
      sources.push({ text: raw.trim(), field: "exclusions" });
    }
  }
  for (const raw of product.key_terms ?? []) {
    if (typeof raw === "string" && raw.trim()) {
      sources.push({ text: raw.trim(), field: "key_terms" });
    }
  }
  for (const row of product.coverage ?? []) {
    const item = typeof row?.item === "string" ? row.item : "";
    const limit = typeof row?.limit === "string" ? row.limit : "";
    const text = `${item} ${limit}`.trim();
    if (text) sources.push({ text, field: "coverage" });
  }
  return sources;
}

function pushUnique(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

/**
 * Derive neutral theme buckets from summary text via lexical match only.
 * Returns only themes with at least one excerpt; empty array ≠ 受保.
 */
export function deriveExclusionThemes(
  product: ExclusionThemeSourceProduct,
): ExclusionThemeHit[] {
  const sources = collectLexicalSources(product);
  const hits: ExclusionThemeHit[] = [];
  const claimed = new Set<string>();

  for (const theme of THEME_PATTERNS) {
    const excerpts: string[] = [];
    for (const source of sources) {
      if (theme.pattern.test(normalizeText(source.text))) {
        pushUnique(excerpts, source.text);
        claimed.add(source.text);
      }
    }
    if (excerpts.length > 0) {
      hits.push({
        themeId: theme.themeId,
        label: theme.label,
        excerpts,
      });
    }
  }

  // 其他: exclusions that matched no named theme — still original strings only.
  const otherExcerpts: string[] = [];
  for (const source of sources) {
    if (source.field === "exclusions" && !claimed.has(source.text)) {
      pushUnique(otherExcerpts, source.text);
    }
  }
  if (otherExcerpts.length > 0) {
    hits.push({
      themeId: "other",
      label: EXCLUSION_THEME_LABELS.other,
      excerpts: otherExcerpts,
    });
  }

  return hits;
}

/**
 * Age-related lexical signals for a non-blocking amber notice.
 * Never invents per-product reduction percentages.
 */
export function deriveAgeReductionExcerpts(
  product: ExclusionThemeSourceProduct,
): string[] {
  const excerpts: string[] = [];
  for (const source of collectLexicalSources(product)) {
    if (AGE_REDUCTION_LEXICAL_PATTERN.test(normalizeText(source.text))) {
      pushUnique(excerpts, source.text);
    }
  }
  return excerpts;
}
