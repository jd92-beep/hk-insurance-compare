/**
 * Educational VHIS scheme facts only.
 * Not product advice, not a premium quote, not certification of any insurer plan.
 * Official scheme details can change — always re-check vhis.gov.hk / IRD.
 */
export const VHIS_SCHEME_FACTS = {
  sourceLabel: "自願醫保計劃（VHIS）官方公開資料",
  sourceUrl: "https://www.vhis.gov.hk",
  irdTaxUrl: "https://www.ird.gov.hk/eng/tax/ahc_faq.htm",
  disclaimer:
    "以下只係計劃制度重點整理，唔係投保建議、報價或核保結果。認可產品數目、稅務安排及條款以官方最新公佈為準。",
  standardVsFlexi: [
    {
      id: "standard",
      title: "標準計劃（Standard Plan）",
      body: "由政府劃一基本保障項目同部分條件設計；唔同保險公司之間，標準計劃嘅核心保障框架較接近。保費、服務同附加安排仍可能唔同。",
    },
    {
      id: "flexi",
      title: "靈活計劃（Flexi Plan）",
      body: "喺標準保障之上提供更高限額、更廣保障或唔同自付費／病房選項。計劃之間差異可以好大，唔可以直接用名稱或「Flexi」字眼當成同等保障。",
    },
    {
      id: "compare",
      title: "點樣格價先穩陣",
      body: "先分清標準定靈活，再對齊自付費、病房級別、每年／終身限額、共同保險同不保事項。金額大唔代表更適合；唔好跨類別直接排名。",
    },
  ],
  taxDeduction: [
    "合資格投保人可就指定受保人嘅合資格保費申請薪俸税個人入息免税額（每年每名受保人有上限）。",
    "指定受保人通常包括本人、配偶、子女、父母／祖父母／外祖父母等，但資格條件同證明文件以稅務局最新規則為準。",
    "有認可產品編號唔等於保費一定合資格扣税；要保留保費單據並核對計劃是否仍屬合資格安排。",
  ],
  taxCapNote:
    "上限金額、合資格親屬定義及申請方式可能更新；請以 IRD / vhis.gov.hk 最新公佈為準，本站唔提供報税建議。",
} as const;

export interface FamilyMemberProfile {
  id: string;
  label: string;
  ageBand: "0-17" | "18-39" | "40-59" | "60+";
  notes: string;
}

export const DEFAULT_FAMILY_PROFILES: FamilyMemberProfile[] = [
  { id: "self", label: "本人", ageBand: "18-39", notes: "" },
  { id: "spouse", label: "配偶", ageBand: "18-39", notes: "" },
  { id: "child", label: "子女", ageBand: "0-17", notes: "" },
  { id: "parent", label: "父母／祖父母", ageBand: "60+", notes: "" },
];

export interface FamilyChecklistItem {
  id: string;
  title: string;
  body: string;
}

/** Research checklist only — never a suitability score or product recommendation. */
export const FAMILY_RESEARCH_CHECKLIST: FamilyChecklistItem[] = [
  {
    id: "existing-cover",
    title: "而家已有咩保障？",
    body: "公司醫保、學校／團體計劃、已有個人醫保／危疾。唔好假設兩份保單會自動雙重賠償同一筆開支。",
  },
  {
    id: "vhis-type",
    title: "需要標準定靈活？",
    body: "先按每個人嘅年齡、地區、病房需要分開研究。標準同靈活計劃唔可以直接用同一條金額尺比較。",
  },
  {
    id: "deductible",
    title: "自付費承受到幾多？",
    body: "自付費愈高，公開保費通常愈低，但實際出資責任愈大。要寫低每個人可接受嘅自付上限。",
  },
  {
    id: "exclusions",
    title: "不保事項同等候期",
    body: "逐份睇投保前已有病症、精神病科、產科、牙科等限制；等候期會影響幾時先用到保障。",
  },
  {
    id: "evidence",
    title: "保存官方文件",
    body: "下載保單條款、保費表同保費收據；格價網站快照唔等於現行合約。",
  },
];
