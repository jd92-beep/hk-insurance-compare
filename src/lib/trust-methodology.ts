/**
 * Trust + ranking methodology for the comparison catalogue.
 * Educational only — never suitability, underwriting, claim outcome, or advice.
 * Do not invent official statistics; official links only.
 */

export type CatalogueSortId = "default" | "fit-score" | "insurer-az";

export const HOW_WE_RANK = {
  cardTitle: "我哋點樣排",
  cardKicker: "HOW WE RANK · 排序方法",
  alwaysVisibleLead:
    "預設係「摘要命中排序」——只對照網站摘要同你揀嘅條件，唔係贊助位、佣金排名或適合度評分。可自行改排列。",
  snapshotLabelPrefix: "資料快照",
  snapshotNote: "排序只反映快照摘要；快照唔等於現行條款。",
  defaultSortId: "default" as CatalogueSortId,
  defaultSortLabel: "摘要命中排序",
  defaultSortShort: "預設：摘要命中排序（非贊助）",
  isSponsored: false,
  hasLeadForms: false,
  sellsData: false,
  hasSuitabilityScores: false,
} as const;

export const HOW_WE_RANK_POINTS: ReadonlyArray<{ id: string; title: string; body: string }> = [
  {
    id: "default-sort",
    title: "預設＝摘要命中排序",
    body: "按快照摘要同你嘅條件呈現。命中唔等於受保、批核或賠償。",
  },
  {
    id: "user-sort",
    title: "你可以改排列方式",
    body: "可改「公司英文名 A–Z」或「摘要符合項目由多至少」。只影響展示次序。",
  },
  {
    id: "no-sponsored",
    title: "唔係贊助排序",
    body: "唔賣保險、唔收轉介費、冇付費置頂。",
  },
  {
    id: "no-lead-no-data",
    title: "冇留資料、唔賣資料",
    body: "冇收集電話／電郵嘅 lead form；比較清單只存喺你部機。",
  },
  {
    id: "no-suitability",
    title: "冇「適合度」分數",
    body: "唔輸出最適合你評分、核保機會或預計賠償率；命中只係摘要檢索。",
  },
] as const;

export const SORT_METHODOLOGY: ReadonlyArray<{
  id: CatalogueSortId;
  label: string;
  explanation: string;
  sponsored: boolean;
}> = [
  {
    id: "default",
    label: "預設（摘要命中排序）",
    explanation: "按快照摘要同目前條件對應呈現；冇商業排序。",
    sponsored: false,
  },
  {
    id: "fit-score",
    label: "摘要符合項目由多至少",
    explanation: "只喺揀咗保障項目時有用；分數係命中數，唔係適合度。",
    sponsored: false,
  },
  {
    id: "insurer-az",
    label: "公司英文名稱 A–Z",
    explanation: "純字母順序，唔代表品質排序。",
    sponsored: false,
  },
] as const;

export interface OfficialEduLink {
  id: string;
  org: string;
  label: string;
  href: string;
}

/** Whitelisted official education / scheme / complaint hosts only. */
export const OFFICIAL_EDU_LINKS: ReadonlyArray<OfficialEduLink> = [
  {
    id: "vhis",
    org: "VHIS",
    label: "自願醫保官方網站（vhis.gov.hk）",
    href: "https://www.vhis.gov.hk",
  },
  {
    id: "ia-education",
    org: "IA",
    label: "保監局教育專區（education.ia.org.hk）",
    href: "https://education.ia.org.hk",
  },
  {
    id: "icb",
    org: "ICB",
    label: "保險投訴局（icb.org.hk）",
    href: "https://www.icb.org.hk",
  },
  {
    id: "ifec",
    org: "IFEC",
    label: "投資者及理財教育委員會（ifec.org.hk）",
    href: "https://www.ifec.org.hk",
  },
  {
    id: "consumer-council",
    org: "消委會",
    label: "消費者委員會（consumer.org.hk）",
    href: "https://www.consumer.org.hk",
  },
] as const;

export const TRUST_PANEL = {
  kicker: "TRUST · 本站邊界",
  title: "唔收電話、唔開戶口、只指去官方",
  lead:
    "呢度係資料整理同比較工具，唔係中介人平台。你可以自己研究、自己改排序、自己核對官方文件；我哋唔需要你嘅聯絡方法先畀你睇資料。",
  promises: [
    {
      id: "no-account",
      title: "唔使開戶口",
      body: "瀏覽、搜尋、加入比較清單都唔要求註冊。收藏只存喺呢部機嘅瀏覽器，唔會上載去我哋伺服器當帳戶資料。",
    },
    {
      id: "no-phone",
      title: "唔收電話／電郵去「跟進」",
      body: "站內冇 lead form，冇「留低電話我哋搵 agent 幫你」流程。你見到嘅連結，只會去本站頁面或下列官方教育／制度網站。",
    },
    {
      id: "official-only",
      title: "官方連結先會列",
      body: "教育同制度入口限於 vhis.gov.hk、education.ia.org.hk、icb.org.hk、ifec.org.hk、consumer.org.hk 等官方公開網站。本站唔代辦投保、唔代收投訴。",
    },
    {
      id: "no-sell",
      title: "唔賣資料、唔做轉介費",
      body: "本站唔銷售保險、唔收轉介費，亦唔將你嘅搜尋／比較行為當商品出售。產品排序唔受付費影響。",
    },
  ],
} as const;

export const VHIS_FRAUD_WARNING = {
  title: "VHIS 防騙提示",
  body:
    "有關自願醫保嘅認可產品名單、計劃資料同稅務安排，只應以 www.vhis.gov.hk 及保監局官方域名公布為準。任何自稱「VHIS 官方代理」、要求你喺非官方網站填身份證／信用卡、或保證「一定批核／一定扣税」嘅訊息，都要提高警覺，並自行到官方網站核實。",
  trustedHostLabels: ["www.vhis.gov.hk", "保監局官方域名（例如 education.ia.org.hk）"],
  trustedHrefs: ["https://www.vhis.gov.hk", "https://education.ia.org.hk"],
} as const;

export const COMPLAINT_DATA_NOTE = {
  title: "投訴數目點樣讀",
  body:
    "如果要睇投訴或爭議數字，請直接去官方機構網站查閱最新公佈。投訴宗數唔等於拒賠率，亦唔可以直接換算成「邊間公司比較好賠」。宗數會受投保量、產品組合、投訴渠道同統計口徑影響；本站唔會自行編造或排名官方投訴統計。",
  limitLine: "投訴宗數 ≠ 拒賠率；唔好用單一投訴數字做公司好壞結論。",
  officialLink: {
    id: "icb",
    org: "ICB",
    label: "保險投訴局（icb.org.hk）",
    href: "https://www.icb.org.hk",
  } as OfficialEduLink,
} as const;

const OFFICIAL_HOST_PATTERNS = [
  "vhis.gov.hk",
  "ia.org.hk",
  "icb.org.hk",
  "ifec.org.hk",
  "consumer.org.hk",
  "ird.gov.hk",
] as const;

/** True when href host is on the official education whitelist. */
export function isOfficialEduHref(href: string): boolean {
  try {
    const url = new URL(href);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return OFFICIAL_HOST_PATTERNS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** True when a hostname is trusted for VHIS scheme information. */
export function isTrustedVhisHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return host === "vhis.gov.hk" || host === "ia.org.hk" || host.endsWith(".ia.org.hk");
}

/* ── Medical path education (dimensions only; no “which is better”) ── */

export const MEDICAL_PATH_COMPARE = {
  kicker: "MEDICAL PATHS · 醫療路徑對照",
  title: "四條常見醫療路徑，淨係對照結構",
  lead:
    "下面只列教育向維度，幫你分清資料喺邊度搵、制度上點分類。唔會話「邊條路徑比較好」，亦唔係個人投保建議。保費、核保、病房同不保事項仍然要逐份保單核對。",
  notBetterNote:
    "本表冇冠軍、冇星級、冇「最適合你」。路徑之間往往唔係互斥；有公司醫保都可能另有人壽／醫療需要，但具體安排要自己同持牌中介人或保險公司查清楚。",
  links: {
    vhisList: { to: "/vhis", label: "官方認可名單" },
    medicalCategory: { to: "/category/medical", label: "自願醫保類別" },
    topUpCategory: { to: "/category/top-up-medical", label: "Top-up 類別" },
    guidesVhis: { to: "/guides#vhis", label: "VHIS 制度重點" },
  },
} as const;

export const MEDICAL_PATH_COLUMNS: ReadonlyArray<{
  id: string;
  label: string;
  short: string;
}> = [
  { id: "vhis-standard-flexi", label: "VHIS 標準／靈活", short: "標準 / Flexi" },
  { id: "group-employer", label: "公司醫保", short: "公司醫保" },
  { id: "top-up-smm", label: "Top-up／SMM 類加保", short: "Top-up / SMM" },
  { id: "high-end", label: "高端醫療", short: "高端" },
] as const;

export const MEDICAL_PATH_DIMENSIONS: ReadonlyArray<{
  id: string;
  label: string;
  values: Record<(typeof MEDICAL_PATH_COLUMNS)[number]["id"], string>;
}> = [
  {
    id: "source",
    label: "主要資料來源",
    values: {
      "vhis-standard-flexi": "vhis.gov.hk 認可產品名單＋各公司官方條款／保費表",
      "group-employer": "僱主／受託人提供之團體保單摘要；個人未必持有完整合約",
      "top-up-smm": "保險公司產品小冊子、條款及保費表；分類以本站類別頁為準",
      "high-end": "各公司高端醫療官方文件；地域／醫院網絡限制通常寫得好細",
    },
  },
  {
    id: "vhis-status",
    label: "VHIS 認可身份",
    values: {
      "vhis-standard-flexi": "屬自願醫保認可產品框架（標準或靈活）；認可以官方名單為準",
      "group-employer": "多數唔屬個人自願醫保認可產品；要問清楚保單性質",
      "top-up-smm": "通常係另一類醫療／加保安排，唔好見「醫保」兩字就當係 VHIS",
      "high-end": "一般係高端醫療產品線，唔自動等於 VHIS 認可計劃",
    },
  },
  {
    id: "who-buys",
    label: "常見投保／持有方式",
    values: {
      "vhis-standard-flexi": "個人或家庭自行向保險公司投保",
      "group-employer": "由僱主集體安排；離職後保障安排因公司同保單而異",
      "top-up-smm": "多數係個人加保，用嚟填補自負額或特定缺口（定義因產品而異）",
      "high-end": "個人／家庭投保；核保同保費門檻通常較高（係觀察，唔係評分）",
    },
  },
  {
    id: "deductible-design",
    label: "自負額／墊底費結構（維度）",
    values: {
      "vhis-standard-flexi": "計劃可設唔同自付費選項；標準同靈活唔可以直接用同一條金額尺比較",
      "group-employer": "常見公司墊底或共保安排；員工要睇公司福利文件先知自己負責幾多",
      "top-up-smm": "產品設計往往圍繞「主保單自負額之上」之類邊界——詳細定義以條款為準",
      "high-end": "可見年度自付費、共同保險或地區加費等設計；要逐項對照",
    },
  },
  {
    id: "boundary",
    label: "設計邊界（唔係好唔好）",
    values: {
      "vhis-standard-flexi": "標準框架較統一；靈活計劃之間差異可以好大，名稱唔代表同等保障",
      "group-employer": "保障跟公司合約同員工等級；個人可控性低，離職時要問續保／轉保安排",
      "top-up-smm": "通常唔係完整取代主醫保；觸發條件、等待同不保事項要逐條睇",
      "high-end": "可能涵蓋更廣醫院／地區選項，同時有網絡、授權同不保限制",
    },
  },
  {
    id: "where-to-look",
    label: "站內導航（純導航）",
    values: {
      "vhis-standard-flexi": "官方名單 · 類別「醫療保險（自願醫保）」· 指南 #vhis",
      "group-employer": "先向僱主／受託人索取保單摘要；再用公司醫保相關關鍵字自行研究",
      "top-up-smm": "類別「Top-up 醫療保險」· 指南醫療篇",
      "high-end": "類別「高端醫療保險」· 指南高醫篇",
    },
  },
] as const;

export function medicalPathLinkTargets(): ReadonlyArray<{ to: string; label: string }> {
  return [
    MEDICAL_PATH_COMPARE.links.vhisList,
    MEDICAL_PATH_COMPARE.links.medicalCategory,
    MEDICAL_PATH_COMPARE.links.topUpCategory,
    MEDICAL_PATH_COMPARE.links.guidesVhis,
  ];
}
