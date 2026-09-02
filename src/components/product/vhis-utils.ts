import type { CoverageItem } from "@/types/insurance";

/**
 * 自願醫保（VHIS）產品頁專用嘅純函數 helpers：
 * 認可編號萃取、官方標準保費年齡曲線 parse、官方來源 URL 標籤。
 * 全部唔掂 React，方便單獨測試；任何格式不符都回傳 null／空陣列，
 * 由 caller fallback 返原有渲染。
 */

/** 認可編號（S = 標準計劃，F = 靈活計劃），例如 S00043 / F00022 */
export const CERT_CODE_RE = /[SF]\d{5}/g;

export interface CertEntry {
  code: string;
  kind: "standard" | "flexi";
  /** 只供現有保單續保（官方名單「（另 … 只供現有保單續保）」標記） */
  renewalOnly: boolean;
}

/** 全覽 summary 行入面「（另 F00025、F00053 只供現有保單續保）」嘅續保專用編號 */
const RENEWAL_GROUP_RE = /（另\s*((?:[SF]\d{5}[、，,\s]*)+?)只供現有保單續保）/g;

/**
 * 由 plan_tiers（同埋產品名 fallback）萃取認可編號列表。
 * 排序：標準計劃 S → 靈活計劃 F，續保專用排尾。
 */
export function extractCertEntries(product: {
  plan_tiers?: string[];
  product_name_zh?: string;
  product_name?: string;
}): CertEntry[] {
  const tiers = product.plan_tiers ?? [];
  const renewalOnly = new Set<string>();
  const codes: string[] = [];

  for (const tier of tiers) {
    // summary 行：「（另 … 只供現有保單續保）」群組
    for (const m of tier.matchAll(RENEWAL_GROUP_RE)) {
      for (const code of m[1].match(CERT_CODE_RE) ?? []) renewalOnly.add(code);
    }
    // 個別計劃行：計劃名後直接標「（只供現有保單續保）」→ 行內編號全部續保專用
    if (!tier.includes("認可產品全覽") && tier.includes("只供現有保單續保")) {
      for (const code of tier.match(CERT_CODE_RE) ?? []) renewalOnly.add(code);
    }
    for (const code of tier.match(CERT_CODE_RE) ?? []) {
      if (!codes.includes(code)) codes.push(code);
    }
  }

  // fallback：plan_tiers 冇編號就掃產品名（舊格式產品）
  if (codes.length === 0) {
    const name = `${product.product_name_zh ?? ""} ${product.product_name ?? ""}`;
    for (const code of name.match(CERT_CODE_RE) ?? []) {
      if (!codes.includes(code)) codes.push(code);
    }
  }

  return codes
    .map<CertEntry>((code) => ({
      code,
      kind: code.startsWith("S") ? "standard" : "flexi",
      renewalOnly: renewalOnly.has(code),
    }))
    .sort((a, b) => {
      if (a.renewalOnly !== b.renewalOnly) return a.renewalOnly ? 1 : -1;
      if (a.kind !== b.kind) return a.kind === "standard" ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
}

/** 官方標準保費年齡曲線一行（年繳港元） */
export interface PremiumCurveRow {
  /** 例如 "0" / "30" / "50" / "60" */
  age: string;
  /** 千分位字串，例如 "2,720" */
  male: string;
  female: string;
}

export interface PremiumCurve {
  rows: PremiumCurveRow[];
  /** 曲線之後嘅備註原文（第一個「。」之後） */
  tail: string;
}

const CURVE_MARKER = "官方標準保費（年繳，港元）：";
const CURVE_ROW_RE = /^(\d+)歲：男 HK\$([\d,]+)／女 HK\$([\d,]+)$/;

/**
 * Parse「官方標準保費（年繳，港元）：0歲：男 HK$2,720／女 HK$2,375；…。」開頭嘅 premium_notes。
 * 任何一行唔啱格式即回傳 null（caller fallback 純文字渲染）。
 */
export function parsePremiumCurve(notes: string | undefined | null): PremiumCurve | null {
  if (!notes || !notes.startsWith(CURVE_MARKER)) return null;
  const rest = notes.slice(CURVE_MARKER.length);
  const dot = rest.indexOf("。");
  if (dot === -1) return null;
  const rows = rest
    .slice(0, dot)
    .split("；")
    .map((seg): PremiumCurveRow | null => {
      const m = seg.trim().match(CURVE_ROW_RE);
      return m ? { age: m[1], male: m[2], female: m[3] } : null;
    });
  if (rows.length === 0 || rows.some((r) => r === null)) return null;
  return { rows: rows as PremiumCurveRow[], tail: rest.slice(dot + 1).trim() };
}

/** 官方來源 URL 嘅人性化標籤（vhis.gov.hk 文件命名規律） */
export interface SourceLabel {
  /** 主標籤，例如「條款及保障 PDF」 */
  label: string;
  /** 副描述（文件名規律推斷） */
  hint?: string;
}

/**
 * 由 URL pattern 推斷官方文件標籤；認唔出就回傳 null（caller 顯示原 URL）。
 * PlanDoc → 條款及保障；StandardPremium → 標準保費表；
 * list-plans → 官方認可名單；官方 CSV → 數據 CSV；xlsx → 保費一覽表。
 */
export function labelForSourceUrl(url: string): SourceLabel | null {
  const path = url.toLowerCase();
  if (path.includes("plandoc")) {
    return { label: "條款及保障 PDF", hint: "認可產品官方保單條款" };
  }
  if (path.includes("standardpremium")) {
    return { label: "標準保費表 PDF", hint: "官方年繳標準保費（按年齡及性別）" };
  }
  if (path.includes("list-plans")) {
    return { label: "官方認可產品名單", hint: "vhis.gov.hk 自願醫保認可產品全覽" };
  }
  if (path.endsWith(".csv")) {
    if (path.includes("standard-plans")) {
      return { label: "標準計劃官方數據 CSV", hint: "vhis.gov.hk 公開數據" };
    }
    if (path.includes("flexi-plans")) {
      return { label: "靈活計劃官方數據 CSV", hint: "vhis.gov.hk 公開數據" };
    }
    return { label: "官方數據 CSV", hint: "vhis.gov.hk 公開數據" };
  }
  if (path.endsWith(".xlsx") || path.includes("premium_summary")) {
    return { label: "官方標準保費一覽表", hint: "醫務衞生局編製（按年齡及性別）" };
  }
  return null;
}

/** 標準計劃保障表項目（vhis.gov.hk 劃一規格）＋可選嘅靈活計劃級別行 */
const STANDARD_BENEFIT_ITEMS = new Set([
  "每年保障限額",
  "終身保障限額",
  "病房及膳食",
  "雜項開支",
  "主診醫生巡房費",
  "專科醫生費",
  "深切治療",
  "訂明診斷成像檢測",
  "訂明非手術癌症治療",
  "精神科治療",
  "入院前後門診護理",
  "靈活計劃保障級別",
]);

/**
 * 判斷 coverage 係咪自願醫保標準計劃規格保障表：
 * 有「每年保障限額」 headline 行，而且全部項目都喺標準清單入面。
 */
export function isStandardBenefitTable(coverage: CoverageItem[]): boolean {
  if (coverage.length < 5) return false;
  if (!coverage.some((c) => c.item === "每年保障限額")) return false;
  return coverage.every((c) => STANDARD_BENEFIT_ITEMS.has(c.item));
}

/** 產品頁「重點一覽」嘅關鍵數字（全部 optional——有數據先顯示） */
export interface KeyFacts {
  /** 每年保障限額嘅首個 HK$ 金額，例如 "HK$420,000" */
  annualLimitAmount?: string;
  /** 每年保障限額原文（無金額可抽時顯示用） */
  annualLimitRaw?: string;
  /** 30 歲年繳保費（千分位字串，來自官方標準保費曲線） */
  premium30?: { male: string; female: string };
  /** 無保費曲線時嘅保費參考（premium_range 原文） */
  premiumFallback?: string;
  /** 提供形式，例如「獨立保單」（key_terms「提供形式：」行） */
  formType?: string;
  /** 新單投保年齡，例如「0-80」（key_terms「新單投保年齡：」行） */
  entryAge?: string;
  /** 保證類亮點 chips（保證續保／冷靜期／稅務扣減，括號註腳已去除） */
  guarantees: string[];
}

/** HK$ 金額（可帶 萬／億 後綴，例如 HK$420,000、HK$4,000萬） */
const HK_AMOUNT_RE = /HK\$[\d,]+(?:\.\d+)?[萬億]?/;
const GUARANTEE_RE = /保證續保|冷靜期|稅務扣減/;

/**
 * 萃取產品嘅關鍵數字（重點一覽卡＋側欄用）。
 * 所有欄位按數據存在與否填充，caller 只渲染有值嘅 tiles。
 */
export function deriveKeyFacts(product: {
  coverage?: CoverageItem[];
  premium_notes?: string;
  premium_range?: string;
  premium_available?: boolean;
  key_terms?: string[];
}): KeyFacts {
  const facts: KeyFacts = { guarantees: [] };

  // 每年保障限額（「標準計劃每年保障限額」等舊格式都包）
  const annual = (product.coverage ?? []).find((c) => c.item.includes("每年保障限額"));
  if (annual) {
    facts.annualLimitAmount = annual.limit.match(HK_AMOUNT_RE)?.[0];
    facts.annualLimitRaw = annual.limit;
  }

  // 30 歲年繳保費：官方曲線優先，否則 fallback premium_range 原文
  const row30 = parsePremiumCurve(product.premium_notes)?.rows.find((r) => r.age === "30");
  if (row30) {
    facts.premium30 = { male: row30.male, female: row30.female };
  } else if (product.premium_available && product.premium_range) {
    facts.premiumFallback = product.premium_range;
  }

  for (const term of product.key_terms ?? []) {
    if (term.startsWith("提供形式：")) {
      facts.formType = term.slice("提供形式：".length).trim();
    } else if (term.startsWith("新單投保年齡：")) {
      facts.entryAge = term.slice("新單投保年齡：".length).trim();
    } else if (GUARANTEE_RE.test(term)) {
      facts.guarantees.push(term.replace(/（[^）]*）/g, "").trim());
    }
  }

  return facts;
}
