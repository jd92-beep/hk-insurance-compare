import type { Product } from "@/types/insurance";

/**
 * Canonical benefit mapping（比較頁逐項對齊用）。
 *
 * 各保險公司對同一保障嘅命名唔同（例如「緊急醫療費用及支援—醫療費用」vs
 * 「醫療費用」），直接用條目原文做 row key 會令等值保障永遠唔同一行。
 * 呢度按類別定義標準保障項目（canonical benefits），用關鍵字匹配將各產品
 * coverage 條目歸入標準行；對唔到嘅歸入「其他保障」組。
 */

export interface CanonicalBenefit {
  id: string;
  /** 標準行名（顯示用） */
  label: string;
  /** 關鍵字（條目名包含其中一個即歸入；按順序首個命中為準） */
  keywords: string[];
}

/** 一行對齊後嘅保障：limits[i] = 第 i 份產品嘅 limit 原文（冇 → undefined） */
export interface CanonicalRow {
  key: string;
  label: string;
  limits: (string | undefined)[];
}

export interface ResolvedCoverage {
  /** 標準保障行（按類別定義順序，只保留至少一份產品有值嘅行） */
  matched: CanonicalRow[];
  /** 對唔到標準項目嘅條目（以原文名做 key） */
  others: CanonicalRow[];
}

/* ── 各類別標準保障項目（keywords 順序＝匹配優先順序） ───────────── */

const TRAVEL: CanonicalBenefit[] = [
  { id: "medical", label: "海外醫療及門診費用", keywords: ["海外醫療及門診", "醫療及相關費用", "海外醫療費用", "醫療費用", "海外醫療", "海外及內地醫療", "住院費用", "門診"] },
  { id: "follow-up-medical", label: "回港後覆診（含中醫跌打）", keywords: ["覆診", "中醫跌打", "後續醫療", "物理治療"] },
  { id: "hospital-cash", label: "海外住院 / 隔離現金津貼", keywords: ["住院現金", "海外住院", "強制隔離", "住院津貼", "入院保證金"] },
  { id: "evacuation", label: "緊急醫療運送 / 遺體運返", keywords: ["醫療運送", "遺體運返", "遺體送返", "遺體遣返", "緊急援助", "緊急支援", "24小時全球", "24/7", "環球支援"] },
  { id: "cancellation", label: "取消旅程 / 任何原因取消", keywords: ["任何原因取消", "取消旅程", "未能成行", "旅程取消"] },
  { id: "curtailment", label: "縮短 / 提早結束旅程", keywords: ["縮短旅程", "提早結束", "旅程中斷", "行程中斷", "取消/縮短"] },
  { id: "trip-delay", label: "旅程延誤 / 航班延誤", keywords: ["旅程延誤", "航班延誤", "旅程阻礙", "超額訂票", "行程改道", "延誤現金"] },
  { id: "baggage-delay", label: "行李延誤（應急津貼）", keywords: ["行李延誤", "行李延遲", "誤送行李"] },
  { id: "mobile-laptop", label: "手提電話 / 數碼設備保障", keywords: ["手提電話", "流動設備", "平板電腦", "手提電腦", "電子設備", "電話及平板"] },
  { id: "baggage", label: "行李及個人隨身物品", keywords: ["行李及個人物品", "行李及個人財物", "個人行李", "隨身行李", "行李", "個人物品", "個人財物"] },
  { id: "money-passport", label: "個人錢財 / 遺失旅遊證件", keywords: ["個人錢財", "旅遊證件", "遺失護照", "個人金錢", "現金被盜", "重新補領"] },
  { id: "personal-accident", label: "個人意外（身故及傷殘）", keywords: ["個人意外", "人身意外", "意外死亡", "公共交通工具意外", "雙倍賠償"] },
  { id: "rental-car", label: "租車自負額 / 自駕遊保障", keywords: ["租車自負額", "租車自駕遊", "自駕遊", "租賃車輛", "租車", "車輛碰撞"] },
  { id: "liability", label: "個人第三者法律責任", keywords: ["第三者法律責任", "個人法律責任", "個人第三者", "法律責任", "個人責任"] },
  { id: "activities", label: "業餘高危運動 / 冬季滑雪 / 潛水", keywords: ["危險活動", "冬季運動", "滑雪", "業餘", "水肺潛水", "消閒活動", "運動用品", "運動器材", "高爾夫", "Golfer"] },
  { id: "credit-card-fraud", label: "信用卡被盜用保障", keywords: ["信用卡", "未經授權", "盜刷", "流動支付"] },
  { id: "home-contents", label: "外遊期間家居防盜保障", keywords: ["家居物品", "家居財物", "家居防盜"] },
  { id: "cruise", label: "郵輪假期專屬保障", keywords: ["郵輪"] },
];

const HOME: CanonicalBenefit[] = [
  { id: "moving", label: "搬遷保障", keywords: ["搬遷"] },
  { id: "renovation", label: "裝修 / 翻新工程", keywords: ["裝修", "翻新"] },
  { id: "contents", label: "家居財物", keywords: ["家居財物", "家居物品"] },
  { id: "water-leakage", label: "室內爆水喉 / 滲水賠償", keywords: ["爆水喉", "水管爆裂", "滲水", "水損", "內部水管", "水浸及滲水"] },
  { id: "locksmith", label: "緊急開鎖換鎖及水喉急修", keywords: ["換鎖", "開鎖", "鎖匠", "水喉急修", "爆水喉急修"] },
  { id: "liability", label: "第三者 / 公眾責任", keywords: ["第三者", "公眾", "法律責任", "個人責任"] },
  { id: "accommodation", label: "臨時住宿 / 租金損失", keywords: ["臨時住宿", "臨時居所", "臨時住所", "租金損失", "庇護住宿"] },
  { id: "building", label: "樓宇結構", keywords: ["樓宇"] },
  { id: "valuables", label: "貴重物品", keywords: ["貴重物品"] },
  { id: "helper-belongings", label: "外傭個人財物保障", keywords: ["外傭財物", "家傭財物", "家庭傭工財物"] },
  { id: "landlord", label: "放租業主租金追討 / 凶宅津貼", keywords: ["放租", "未付租金", "凶宅", "租客拖欠", "租金保障"] },
  { id: "worldwide", label: "全球個人物品", keywords: ["全球個人物品", "個人物品（全球）", "全球個人責任", "個人物品"] },
  { id: "hotline", label: "24小時家居支援", keywords: ["24小時"] },
  { id: "debris", label: "清理碎礫", keywords: ["清理碎礫", "碎礫"] },
  { id: "frozen-food", label: "冷凍食品", keywords: ["冷凍食品"] },
];

const LIFE: CanonicalBenefit[] = [
  { id: "death", label: "身故賠償", keywords: ["身故"] },
  { id: "age", label: "投保 / 繕發年齡", keywords: ["投保年齡", "繕發年齡"] },
  { id: "term", label: "保障年期 / 續保", keywords: ["保障年期", "保障期", "保險保障期", "續保"] },
  { id: "sum-insured", label: "保額 / 投保額", keywords: ["保額", "投保額", "保障額"] },
  { id: "premium-structure", label: "保費結構 / 繳費", keywords: ["保費", "繳費"] },
  { id: "underwriting", label: "核保", keywords: ["核保"] },
  { id: "conversion", label: "轉換權益", keywords: ["轉換"] },
  { id: "currency", label: "保單貨幣", keywords: ["保單貨幣"] },
  { id: "terminal-illness", label: "末期疾病保障", keywords: ["末期疾病"] },
  { id: "cash-value", label: "現金價值 / 紅利", keywords: ["紅利", "支取現金"] },
];

const CRITICAL_ILLNESS: CanonicalBenefit[] = [
  { id: "severe", label: "嚴重危疾 / 嚴重疾病", keywords: ["嚴重危疾", "嚴重疾病（", "主要危疾", "危疾保障（涵蓋", "3-in-1", "3大危疾", "3大疾病"] },
  { id: "early", label: "早期危疾 / 早期嚴重疾病", keywords: ["早期危疾", "早期嚴重疾病"] },
  { id: "special", label: "特別 / 非嚴重疾病", keywords: ["特別疾病", "非嚴重疾病"] },
  { id: "children", label: "兒童疾病", keywords: ["兒童", "子女"] },
  { id: "multi", label: "多重 / 持續賠償", keywords: ["多重", "持續", "延伸嚴重疾病", "額外癌症", "額外賠償", "賠償升級", "額外保障", "加強"] },
  { id: "icu", label: "深切治療（ICU）", keywords: ["ICU", "深切治療", "維生"] },
  { id: "death", label: "身故賠償", keywords: ["身故"] },
  { id: "refund", label: "保費回贈", keywords: ["保費回贈", "回贈", "退回"] },
  { id: "annuity", label: "終身年金", keywords: ["年金"] },
  { id: "mental", label: "精神健康保障", keywords: ["精神健康"] },
];

const ACCIDENT: CanonicalBenefit[] = [
  { id: "double", label: "雙倍 / 三倍賠償", keywords: ["雙倍", "三倍"] },
  { id: "death", label: "意外身故及永久傷殘", keywords: ["意外身故", "意外身亡", "死亡及永久傷殘", "永久傷殘", "永久完全傷殘", "斷肢", "人身意外"] },
  { id: "medical", label: "意外醫療費用", keywords: ["意外醫療", "醫療費用", "醫療保障"] },
  { id: "hospital-cash", label: "住院現金 / 入息保障", keywords: ["住院", "入息", "每週"] },
  { id: "tcm", label: "跌打 / 中醫治療", keywords: ["跌打", "中醫", "針灸"] },
  { id: "emergency", label: "24小時緊急支援", keywords: ["24小時", "緊急支援", "緊急援助", "緊急服務", "全球支援", "全球緊急"] },
  { id: "liability", label: "個人責任", keywords: ["個人責任"] },
  { id: "fracture", label: "骨折保障", keywords: ["骨折"] },
  { id: "burns", label: "燒傷 / 疤痕 / 毀容", keywords: ["燒傷", "疤痕", "毀容"] },
  { id: "funeral", label: "殯葬 / 火化費用", keywords: ["殯葬", "火葬", "火化", "運返"] },
  { id: "credit-card", label: "信用卡欠款保障", keywords: ["信用卡"] },
  { id: "income", label: "收入 / 付款保障", keywords: ["收入", "付款保障"] },
];

const MEDICAL: CanonicalBenefit[] = [
  // 順序＝匹配優先次序（首個命中為準）：
  // 終身限額必須排喺每年限額之前，否則「終身保障限額」會被「保障限額」關鍵字攔截；
  // 現金行排喺主要醫療費用之前，等「住院現金」唔會被「住院」攔截。
  { id: "lifetime-limit", label: "終身保障限額", keywords: ["終身保障限額"] },
  { id: "annual-limit", label: "每年保障限額", keywords: ["每年保障限額", "年度保額", "最高保障", "年度限額", "保障限額"] },
  { id: "plan-level", label: "靈活計劃保障級別", keywords: ["保障級別", "靈活計劃"] },
  { id: "area", label: "保障地域", keywords: ["保障地域", "保障地區"] },
  // VHIS 標準化住院項目（vhis.gov.hk 認可產品統一命名）
  { id: "room-board", label: "病房及膳食", keywords: ["病房及膳食", "病房膳食"] },
  { id: "misc-expenses", label: "雜項開支", keywords: ["雜項開支"] },
  { id: "ward-round", label: "主診醫生巡房費", keywords: ["巡房"] },
  { id: "specialist", label: "專科醫生費", keywords: ["專科醫生"] },
  { id: "icu", label: "深切治療", keywords: ["深切治療"] },
  { id: "imaging", label: "訂明診斷成像檢測", keywords: ["診斷成像", "成像檢測"] },
  { id: "cash", label: "現金保障", keywords: ["現金"] },
  { id: "main-medical", label: "主要醫療費用（住院及手術）", keywords: ["主要項目", "主要醫療費用", "住院醫療", "涵蓋項目", "住院"] },
  { id: "cancer", label: "癌症治療", keywords: ["癌症"] },
  { id: "psychiatric", label: "精神科治療", keywords: ["精神科"] },
  { id: "nursing", label: "私人看護 / 復康支援", keywords: ["私人看護", "私家看護", "復康"] },
  { id: "prepost", label: "入院前及出院後門診護理", keywords: ["入院前", "出院後", "門診"] },
  { id: "deductible", label: "自付費選項", keywords: ["自付費"] },
  { id: "age", label: "投保年齡 / 資格", keywords: ["投保年齡", "投保資格"] },
  { id: "maternity", label: "產科保障", keywords: ["產科"] },
  { id: "reconstruction", label: "乳房重建手術", keywords: ["乳房重建"] },
];

const HIGH_END_MEDICAL: CanonicalBenefit[] = [
  // 順序＝匹配優先次序（具體關鍵字在前，避免被通用關鍵字如「自付費」攔截）
  { id: "full-cover", label: "全數賠償保障範圍", keywords: ["全數賠償", "全額賠償", "全額", "全數", "Full Cover"] },
  { id: "annual-lifetime-limit", label: "每年及終身保障限額", keywords: ["終身保障限額", "每年保障限額", "終身保額", "每年最高", "終身最高", "年度保額", "保障限額", "終身限額", "年度限額"] },
  { id: "room-level", label: "涵蓋病房級別（私家房 / 半私家房）", keywords: ["病房級別", "病房級數", "標準私家房", "半私家房", "私家房", "半私家", "私家病房", "病房及膳食", "病房"] },
  { id: "cashless", label: "全球出院免找數直付網絡", keywords: ["出院免找數", "免找數", "醫療費用直付", "直付", "醫療網絡", "Cashless"] },
  { id: "ncd-deductible", label: "無索償墊底費折扣", keywords: ["無索償", "扣減自付費", "減免自付費", "墊底費扣減", "墊底費折扣", "自付費折扣", "NCD"] },
  { id: "deductible", label: "自付費（墊底費）選項", keywords: ["自付費", "墊底費", "自負額", "Deductible"] },
  { id: "area", label: "保障地域（亞洲 / 全球除美 / 環球）", keywords: ["保障地域", "保障地區", "地域", "亞洲", "全球除美", "環球", "全球"] },
  { id: "evacuation", label: "緊急醫療運送與海外專車/包機", keywords: ["醫療運送", "遺體運返", "海外專車", "專車", "包機", "緊急支援", "緊急援助", "緊急運送"] },
];

const TOP_UP_MEDICAL: CanonicalBenefit[] = [
  { id: "group-coordination", label: "公司醫保銜接機制 / 墊底費抵銷", keywords: ["團體醫保", "公司醫保", "銜接", "墊底費抵銷", "自付額抵銷", "自付費抵銷", "其他保險", "僱主醫保"] },
  { id: "smm-ratio", label: "超額醫療差額賠償比率（80%–100% SMM）", keywords: ["超額醫療", "SMM", "差額賠償", "賠償比率", "超額賠償", "補助醫療", "差額"] },
  { id: "annual-limit", label: "每年最高賠償限額", keywords: ["每年最高", "年度最高", "每年保障限額", "每年限額", "年度保額", "最高保障", "保障限額"] },
  { id: "simplified-underwriting", label: "免核保加入條件", keywords: ["免核保", "簡易核保", "免驗身", "加入條件", "投保資格", "核保"] },
  { id: "guaranteed-conversion", label: "離職 / 退休保證轉保個人醫保權限（Guaranteed Conversion）", keywords: ["保證轉保", "保證轉換", "轉保權", "離職轉保", "退休轉保", "轉換權益", "轉換至個人", "Guaranteed Conversion"] },
  { id: "outpatient-followup", label: "門診手術及專科覆診", keywords: ["門診手術", "日間手術", "專科覆診", "出院後覆診", "出院後", "門診護理", "覆診", "門診"] },
  { id: "hospital-surgical", label: "住院及手術涵蓋項目", keywords: ["住院及手術", "主要醫療", "住院費用", "外科手術", "手術費用", "病房及膳食", "住院醫療", "住院"] },
];

const MOTOR: CanonicalBenefit[] = [
  { id: "tp-injury", label: "第三者人身傷亡責任", keywords: ["第三者死", "第三者人身", "第三者身體", "第三者責任 - 身體"] },
  { id: "tp-property", label: "第三者財物損毀責任", keywords: ["第三者財"] },
  { id: "new-for-old", label: "新車替換 / 以新換舊", keywords: ["新換舊", "以新換舊", "新車替換", "新車賠償", "全新車", "新車"] },
  { id: "depreciation", label: "維修零件折舊", keywords: ["折舊"] },
  { id: "own-damage", label: "自身汽車損毀", keywords: ["自身汽車", "車輛本身", "受保車輛", "汽車自身"] },
  { id: "medical", label: "醫療費用", keywords: ["醫療費用"] },
  { id: "personal-accident", label: "個人意外保障", keywords: ["個人意外", "人身意外", "交通意外人壽"] },
  { id: "windscreen", label: "擋風玻璃保障", keywords: ["擋風玻璃"] },
  { id: "ncd", label: "無索償折扣（NCD）保障", keywords: ["無索償", "NCD"] },
  { id: "assistance", label: "24小時緊急援助 / 拖車", keywords: ["24小時", "拖車", "緊急", "路邊", "路面", "禮賓", "車輛移除", "事故通知", "汽車支援"] },
  { id: "rental-car", label: "租車 / 代用車輛", keywords: ["租車", "代用"] },
  { id: "recovery", label: "第三者責任追討服務", keywords: ["追討"] },
  { id: "keys", label: "遺失車匙保障", keywords: ["車匙"] },
  { id: "cross-border", label: "跨境 / 港粵通保障", keywords: ["港粵通", "跨境"] },
  { id: "belongings", label: "車內個人物品", keywords: ["個人物品"] },
];

const DOMESTIC_HELPER: CanonicalBenefit[] = [
  { id: "employer-liability", label: "僱主責任（僱員補償）", keywords: ["僱員補償", "僱主責任"] },
  { id: "outpatient", label: "門診費用", keywords: ["門診"] },
  { id: "hospital", label: "住院及手術費用", keywords: ["住院", "手術"] },
  { id: "dental", label: "牙科費用", keywords: ["牙科", "牙醫"] },
  { id: "interruption", label: "服務中斷津貼", keywords: ["服務中斷", "中斷服務", "臨時替工"] },
  { id: "repatriation", label: "遣返 / 送返費用", keywords: ["遣返", "送返"] },
  { id: "replacement", label: "補聘家傭費用", keywords: ["補聘"] },
  { id: "fidelity", label: "家傭誠信保障", keywords: ["誠信", "不誠實", "忠誠"] },
  { id: "personal-accident", label: "個人意外（休假期間）", keywords: ["個人意外", "人身意外"] },
  { id: "liability", label: "第三者責任", keywords: ["第三者", "個人責任"] },
  { id: "critical", label: "危疾保障（自選）", keywords: ["危疾", "嚴重疾病"] },
  { id: "loan", label: "僱主借貸保障", keywords: ["借貸"] },
  { id: "family", label: "家庭成員保障", keywords: ["家庭成員"] },
];

const PET: CanonicalBenefit[] = [
  { id: "surgery", label: "手術保障", keywords: ["手術"] },
  { id: "medical", label: "醫療保障（診症及住院）", keywords: ["醫療", "診症", "診金", "門診", "獸醫", "住房"] },
  { id: "chemo", label: "化療 / 癌症保障", keywords: ["化療", "癌症"] },
  { id: "dental", label: "牙科治療 / 洗牙保障", keywords: ["牙科", "洗牙", "牙齒", "口腔"] },
  { id: "liability", label: "第三者責任", keywords: ["第三者"] },
  { id: "death", label: "身故 / 殮葬服務", keywords: ["身故", "殮葬", "火化", "人道毀滅"] },
  { id: "boarding", label: "緊急寄宿 / 寄養", keywords: ["寄宿", "寄養"] },
  { id: "lost-pet", label: "走失尋寵廣告及酬金", keywords: ["走失", "尋寵", "廣告費", "酬金"] },
  { id: "overseas", label: "海外保障", keywords: ["海外"] },
  { id: "hereditary", label: "遺傳及先天性疾病", keywords: ["遺傳", "先天"] },
  { id: "chronic", label: "慢性疾病保障", keywords: ["慢性"] },
  { id: "mri-ct", label: "MRI / CT 保障", keywords: ["MRI", "CT"] },
];

const CANONICAL_BY_CATEGORY: Record<string, CanonicalBenefit[]> = {
  travel: TRAVEL,
  home: HOME,
  life: LIFE,
  "critical-illness": CRITICAL_ILLNESS,
  accident: ACCIDENT,
  medical: MEDICAL,
  "high-end-medical": HIGH_END_MEDICAL,
  "top-up-medical": TOP_UP_MEDICAL,
  motor: MOTOR,
  "domestic-helper": DOMESTIC_HELPER,
  pet: PET,
};

/** 該類別嘅標準保障項目（未知類別 → 空陣列，全部落入「其他保障」） */
export function canonicalBenefitsFor(category: string): CanonicalBenefit[] {
  return CANONICAL_BY_CATEGORY[category] ?? [];
}

/** 條目名命中嘅首個標準保障（按定義順序） */
function matchBenefit(itemName: string, benefits: CanonicalBenefit[]): CanonicalBenefit | undefined {
  return benefits.find((b) => b.keywords.some((kw) => itemName.includes(kw)));
}

/**
 * 將多份產品嘅 coverage 條目對齊到標準保障行。
 * limit 保留官方原文；同一產品多條目命中同一行 → 以「；」串起原文。
 */
export function resolveCoverage(products: Product[]): ResolvedCoverage {
  const benefits = canonicalBenefitsFor(products[0]?.category ?? "");

  // benefitId -> per-product limits
  const matchedLimits = new Map<string, (string | undefined)[]>();
  // others: itemName -> per-product limits（保留首次出現順序）
  const otherOrder: string[] = [];
  const otherLimits = new Map<string, (string | undefined)[]>();

  products.forEach((p, pi) => {
    for (const c of p.coverage ?? []) {
      const benefit = matchBenefit(c.item, benefits);
      if (benefit) {
        const arr = matchedLimits.get(benefit.id) ?? products.map(() => undefined);
        arr[pi] = arr[pi] ? `${arr[pi]}；${c.limit}` : c.limit;
        matchedLimits.set(benefit.id, arr);
      } else {
        if (!otherLimits.has(c.item)) {
          otherOrder.push(c.item);
          otherLimits.set(c.item, products.map(() => undefined));
        }
        const arr = otherLimits.get(c.item)!;
        arr[pi] = arr[pi] ? `${arr[pi]}；${c.limit}` : c.limit;
      }
    }
  });

  const matched: CanonicalRow[] = benefits
    .filter((b) => {
      const arr = matchedLimits.get(b.id);
      return arr?.some((v) => v !== undefined);
    })
    .map((b) => ({ key: b.id, label: b.label, limits: matchedLimits.get(b.id)! }));

  const others: CanonicalRow[] = otherOrder.map((item) => ({
    key: `other-${item}`,
    label: item,
    limits: otherLimits.get(item)!,
  }));

  return { matched, others };
}
