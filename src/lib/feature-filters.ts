import type { Product } from "../types/insurance";

export interface FeatureFilterTag {
  id: string;
  label: string;
  keywords: string[];
}

export interface PersonaPreset {
  id: string;
  label: string;
  icon?: string;
  description: string;
  tagIds: string[];
  /** Alias of tagIds for backwards compatibility */
  featureIds: string[];
}

/** 相容舊版名稱別名 */
export type ScenarioPreset = PersonaPreset;

export interface FeatureMatchResult {
  score: number; // 0 - 100
  matchedCount: number;
  totalSelected: number;
  matchedTags: FeatureFilterTag[];
  missingTags: FeatureFilterTag[];
  matchRatio: number; // 0 - 1
  matchedKeywords: string[];
}

/** 11 大類別專屬特點篩選標籤體系（Category-Specific Feature Tags） */
export const CATEGORY_FEATURE_TAGS: Record<string, FeatureFilterTag[]> = {
  // 1. 旅遊保險 (travel - 16 tags)
  travel: [
    {
      id: "full-cover",
      label: "零自負額 / 全數賠償",
      keywords: ["全數賠償", "全額賠償", "不設自負額", "無自負額", "零自負額", "0自負額", "全額支付", "不設分項", "實報實銷", "100%實報實銷"],
    },
    {
      id: "rental-car",
      label: "租車自負額保障 (Rental Vehicle Excess)",
      keywords: ["租車", "自駕遊", "自負額", "rental car", "rental vehicle excess", "車輛自負額", "海外租車", "私家車或露營車"],
    },
    {
      id: "sports-cover",
      label: "滑雪 / 潛水等業餘及極限運動",
      keywords: ["業餘運動", "滑雪", "潛水", "業餘消閒運動", "消閒運動", "水上運動", "冬季運動", "高空彈跳", "熱氣球", "運動保障", "無高度限制", "無深度限制", "極限及消閒"],
    },
    {
      id: "mobile-laptop",
      label: "手提電話 / 筆電 / 數碼設備損壞被盜",
      keywords: ["手提電話", "流動設備", "平板電腦", "筆記型電腦", "電腦", "手機", "手提電腦", "電子產品", "電子設備", "數碼"],
    },
    {
      id: "flight-delay",
      label: "航班延誤現金津貼（滿5-6小時起賠）",
      keywords: ["旅程延誤", "航班延誤", "延誤現金", "延誤津貼", "行程延誤", "每滿6小時", "延誤6小時", "每滿5小時", "滿5小時起賠", "延誤現金賠償"],
    },
    {
      id: "baggage-delay",
      label: "行李延誤緊急生活津貼",
      keywords: ["行李延誤", "應急物品", "應急物資", "應急用品", "應急津貼", "行李延誤應急"],
    },
    {
      id: "trip-cancel-cfar",
      label: "任何原因取消 (CFAR) / 靈活取消行程",
      keywords: ["因任何原因取消", "任何原因取消", "不可預見私事", "CFUR", "CFAR", "因任何不可預見私事取消行程", "取消旅程", "取消行程"],
    },
    {
      id: "emergency-evac",
      label: "全球緊急醫療運送及遺體送返無上限",
      keywords: ["緊急醫療運送", "緊急運送", "救援及運送", "遺體送返", "遺體運返", "專機運送", "救援網絡", "海外緊急援助", "緊急醫療救援"],
    },
    {
      id: "revisit-chinese-med",
      label: "回港覆診含中醫跌打針灸",
      keywords: ["覆診", "回港後", "中醫", "跌打", "針灸", "回港覆診", "物理治療/脊醫", "骨傷"],
    },
    {
      id: "cruise-cover",
      label: "郵輪假期專屬保障（泊岸延誤/取消）",
      keywords: ["郵輪", "郵輪假期", "遊輪", "岸上觀光", "泊岸延誤", "環球郵輪計劃"],
    },
    {
      id: "senior-friendly",
      label: "長者高齡受保 / 保障額不縮水",
      keywords: ["不設年齡上限", "無年齡上限", "85歲", "80歲", "長者及小童100%", "年長受保人", "長者", "受保年齡"],
    },
    {
      id: "pet-care-cover",
      label: "同行毛孩醫療 / 留港寵物寄宿保障",
      keywords: ["寵物", "毛孩", "留港寵物", "寵物照顧", "寵物同行", "寵物緊急寄養", "延誤寄宿"],
    },
    {
      id: "outbound-alert",
      label: "紅色/黑色外遊警示伸延賠償",
      keywords: ["外遊警示", "黑色外遊警示", "紅色外遊警示", "外遊警示伸延保障"],
    },
    {
      id: "personal-liability",
      label: "個人第三者責任（含法律抗辯費用）",
      keywords: ["個人責任", "第三者責任", "第三者法律責任", "個人法律責任", "法律責任", "訴訟費用"],
    },
    {
      id: "credit-card-theft",
      label: "信用卡被盜用簽賬及個人錢財保障",
      keywords: ["信用卡", "未獲授權", "被盜用", "盜用簽賬", "個人錢財", "現金意外遺失", "流動支付被盜用"],
    },
    {
      id: "family-bundle",
      label: "親子同行 / 隨行子女專屬保障",
      keywords: ["雙人/家庭", "同行子女", "子女護送", "子女", "小童", "家庭保險"],
    },
    {
      id: "overbooked-flight",
      label: "機位超賣 / 航空取消重訂機票交通津貼",
      keywords: ["機位超賣", "超賣", "航空公司超額預訂", "取消旅程", "重新訂位", "額外交通", "延遲啟程", "更改行程", "超額預訂"],
    },
    {
      id: "loss-travel-docs",
      label: "遺失護照 / 旅行證件重發及補辦費用",
      keywords: ["旅行證件", "遺失護照", "護照", "簽證", "補領證件", "補發證件", "重發費用", "額外住宿費用", "重辦簽證"],
    },
    {
      id: "sports-equipment-extra",
      label: "自攜專用運動器材 / 高爾夫及滑雪裝備損壞",
      keywords: ["運動器材", "高爾夫", "滑雪裝備", "潛水裝備", "自行車", "單車", "體育器材", "一桿進洞", "運動用具"],
    },
    {
      id: "home-burglary-while-away",
      label: "外遊期間香港寓所爆竊及家居財物損毀",
      keywords: ["家居爆竊", "外遊期間家居", "住所爆竊", "寓所被竊", "家居盜竊", "入屋犯法", "香港住所", "家居財物被竊"],
    },
  ],

  // 2. 自願醫保 / 常規醫療 (medical - 16 tags)
  medical: [
    {
      id: "tax-deduction",
      label: "稅務扣減 (最高HK$8,000)",
      keywords: ["稅務扣減", "扣稅", "HK$8,000", "8,000", "8000", "課稅年度", "自願醫保認可", "可扣稅"],
    },
    {
      id: "full-cover",
      label: "全數賠償 / 不設細項上限",
      keywords: ["全數賠償", "全額賠償", "全額支付", "100%實報實銷", "不設細項", "實報實銷", "無細項上限"],
    },
    {
      id: "cashless",
      label: "出院免找數 / 醫療網絡直付",
      keywords: ["免找數", "直付", "醫療網絡直付", "預先批核", "出院免找數", "代繳住院費用", "綠色就醫通道"],
    },
    {
      id: "guaranteed-renewal",
      label: "保證續保至 100 歲 / 終身",
      keywords: ["保證續保", "續保至 100", "續保至100", "終身續保", "保證每年續保", "保證終身續保"],
    },
    {
      id: "day-surgery",
      label: "日間手術及日間護理保障",
      keywords: ["日間手術", "門診手術", "日間醫療", "日間護理", "日間手術現金"],
    },
    {
      id: "advanced-imaging",
      label: "先進診斷造影 (CT/MRI/PET)",
      keywords: ["CT", "MRI", "PET", "診斷成像", "訂明診斷成像", "先進診斷", "電腦斷層", "磁力共振"],
    },
    {
      id: "cancer-therapy",
      label: "癌症標靶 / 化療 / 免疫治療",
      keywords: ["標靶", "化療", "非手術癌症", "癌症藥物", "免疫治療", "質子治療", "癌症治療", "放射治療"],
    },
    {
      id: "kidney-dialysis",
      label: "門診洗腎 / 血液透析全額保障",
      keywords: ["洗腎", "透析", "血液透析", "腹膜透析", "門診透析"],
    },
    {
      id: "psychiatric",
      label: "精神科住院及門診治療",
      keywords: ["精神科", "精神科治療", "精神科住院", "精神疾病"],
    },
    {
      id: "deductible-options",
      label: "彈性自負額 (多檔墊底費選項)",
      keywords: ["自付費", "墊底費", "自負額", "自付額", "每年自付費", "自選自付費"],
    },
    {
      id: "unknown-pre-existing",
      label: "投保前未知的已有病症保障",
      keywords: ["未知的投保前已有病症", "已有病症", "未知的已有病症", "未知悉的已有病症", "既往病症"],
    },
    {
      id: "congenital-conditions",
      label: "先天性疾病保障 (8歲或以後)",
      keywords: ["先天性", "先天性疾病", "8歲或以後", "8歲後"],
    },
    {
      id: "companion-bed",
      label: "親屬陪床費 / 家長陪床津貼",
      keywords: ["陪床", "親屬陪床", "家長陪床", "陪床費"],
    },
    {
      id: "icu-care",
      label: "深切治療部 (ICU) 高額保障",
      keywords: ["深切治療", "ICU", "加護病房"],
    },
    {
      id: "pre-post-outpatient",
      label: "出院前及入院前門診 / 物理治療",
      keywords: ["出院前及入院前門診護理", "出院前", "入院前", "門診護理", "出院後覆診", "物理治療"],
    },
    {
      id: "compassionate-death",
      label: "恩恤身故賠償 / 慰問金",
      keywords: ["恩恤身故", "身故賠償", "恩恤賠償", "身故津貼", "恩恤金"],
    },
    {
      id: "post-surgery-tcm",
      label: "出院後中醫跌打針灸調理及復康門診",
      keywords: ["中醫", "跌打", "針灸", "中醫師", "中草藥", "出院後中醫", "術後中醫", "跌打骨傷", "出院後針灸"],
    },
    {
      id: "second-medical-opinion",
      label: "國際權威第二醫療意見及海外轉介服務",
      keywords: ["第二醫療意見", "第二意見", "國際權威", "海外名醫", "專科轉介", "專家會診", "國際第二意見", "海外轉介"],
    },
    {
      id: "reconstructive-surgery",
      label: "乳房切除重建及意外面部修復手術",
      keywords: ["乳房切除重建", "重建手術", "外觀修復", "乳房重建", "意外修復", "義肢", "切除重建", "面部修復"],
    },
    {
      id: "day-bed-cashless",
      label: "日間醫療中心網絡直付 (門診胃鏡腸鏡免找數)",
      keywords: ["日間醫療中心", "日間中心直付", "門診胃鏡", "門診腸鏡", "日間內窺鏡", "免找數", "直付中心", "醫療卡直付"],
    },
  ],

  // 3. 高端醫療 (high-end-medical - 14 tags)
  "high-end-medical": [
    {
      id: "full-cover-all",
      label: "主要醫療全數賠償 (不設細項上限)",
      keywords: ["全數賠償", "全額賠償", "全額支付", "100%實報實銷", "不設細項", "無細項", "無分項限額", "不設個別分項細項封頂"],
    },
    {
      id: "cashless-global",
      label: "全球私家醫院出院免找數 (Direct Billing)",
      keywords: ["免找數", "直付", "醫療網絡直付", "預先批核", "全球出院免找數", "Direct Billing", "出院免找數網絡", "全港私家醫院出院免找數"],
    },
    {
      id: "private-room",
      label: "標準私家房 / 半私家房全額保障",
      keywords: ["標準私家房", "私家房", "單人房", "尊貴病房", "半私家房", "私家房級別"],
    },
    {
      id: "high-annual-limit",
      label: "每年 2,000 萬至 4,000 萬超高保額",
      keywords: ["每年保障限額", "每年保障總額", "每年 HK$", "每年HK$", "每年最高", "20,000,000", "25,000,000", "30,000,000", "40,000,000", "33,000,000"],
    },
    {
      id: "unlimited-lifetime",
      label: "不設終身保障上限 (No Lifetime Limit)",
      keywords: ["不設終身", "終身最高", "終身保障額", "終身保障總額", "No Lifetime Limit", "無終身保障上限", "不設終身保障限額"],
    },
    {
      id: "advanced-cancer-proton",
      label: "頂級癌症標靶 / 質子重離子 / 免疫治療",
      keywords: ["標靶", "化療", "質子治療", "免疫治療", "癌症藥物", "非手術癌症", "放射治療", "癌症基因組", "非手術癌症專項治療", "非手術癌症標靶治療"],
    },
    {
      id: "advanced-imaging-zero-copay",
      label: "先進造影診斷 (CT/MRI/PET) 零共付全包",
      keywords: ["CT", "MRI", "PET", "診斷成像", "訂明診斷成像", "先進診斷", "先進影像造影", "影像造影", "0%共同保險", "免自負"],
    },
    {
      id: "dialysis-cover",
      label: "門診血液透析及洗腎全數賠償",
      keywords: ["洗腎", "透析", "血液透析", "腹膜透析", "門診透析", "門診洗腎"],
    },
    {
      id: "deductible-options",
      label: "彈性自選自負額 (高達8萬墊底微調保費)",
      keywords: ["自付費", "墊底費", "自負額", "自付額", "無索償折扣", "0自付", "零自付", "共付額", "自選自付費"],
    },
    {
      id: "organ-transplant",
      label: "重大器官移植專項手術費全包",
      keywords: ["器官移植", "活體器官", "移植手術", "重大器官移植", "器官移植專項"],
    },
    {
      id: "reconstructive-surgery",
      label: "乳房切除重建及外觀修補手術",
      keywords: ["重建手術", "乳房切除重建", "外貌修復", "外觀修補", "重建"],
    },
    {
      id: "icu-no-limit",
      label: "深切治療部 (ICU) 無天數限制全包",
      keywords: ["深切治療", "ICU", "加護病房", "重症深切治療部"],
    },
    {
      id: "post-hosp-rehab",
      label: "長達 365 日出院後居家護理及復康支援",
      keywords: ["康復護理", "居家護士", "出院後護理", "物理治療", "出院後居家護理", "復康", "私家看護", "出院後復康支援", "長達365日"],
    },
    {
      id: "second-opinion-concierge",
      label: "專屬健康管家與全球權威第二醫療意見",
      keywords: ["第二醫療意見", "健康管家", "專屬醫療顧問", "醫療個案管理", "醫療專案經理", "名醫轉介", "專家網絡", "臻一醫療", "綠色就醫通道"],
    },
    {
      id: "cashless-worldwide",
      label: "全球頂尖私家醫院全數免找數直付簽賬",
      keywords: ["全球免找數", "環球免找數", "直付簽賬", "醫療費用預先批核", "出院免找數", "全球直付", "直付網絡", "全球醫療直付"],
    },
    {
      id: "psychiatric-in-out",
      label: "精神科住院及專案心理專科門診治療",
      keywords: ["精神科", "精神疾病", "心理專科", "精神科住院", "心理諮詢", "精神科門診", "思覺失調", "專案心理治療"],
    },
    {
      id: "palliative-care",
      label: "末期疾病緩和治療及臨終紓緩安寧護理",
      keywords: ["緩和治療", "紓緩治療", "臨終安寧", "善終服務", "臨終照顧", "安寧病房", "紓緩護理", "末期緩和"],
    },
    {
      id: "pregnancy-complications",
      label: "懷孕嚴重併發症專項手術及深切治療全包",
      keywords: ["妊娠併發症", "懷孕併發症", "產科併發症", "子癇", "胎盤早期剝離", "妊娠期手術", "宮外孕", "產科急症"],
    },
  ],

  // 4. Top-up 差額醫療 (top-up-medical - 12 tags)
  "top-up-medical": [
    {
      id: "smm-excess",
      label: "SMM 80%–90% 高超額差額賠償",
      keywords: ["SMM", "差額賠償", "超額賠償", "超額差額", "超額醫療", "80%", "85%", "90%"],
    },
    {
      id: "shortfall-cover",
      label: "填補公司醫保細項不足 (Shortfall 缺口)",
      keywords: ["Shortfall", "差額補償", "差額填補", "填補", "打爆 cap", "細項不足", "公司醫保"],
    },
    {
      id: "deductible-offset",
      label: "僱主醫保直抵墊底費 (實現零自付)",
      keywords: ["抵銷墊底費", "抵扣墊底費", "抵銷本計劃墊底費", "零自付", "抵扣自負額", "直接抵銷"],
    },
    {
      id: "guaranteed-conversion",
      label: "離職/退休保證免驗身轉保個人醫保",
      keywords: ["保證轉保", "免核保轉保", "免核保轉換", "轉保個人醫保", "免驗身", "保證轉換", "離職或退休"],
    },
    {
      id: "simplified-underwriting",
      label: "持有公司醫保免體檢簡易申報加入",
      keywords: ["免核保加入", "免體檢", "簡易投保", "簡易核保", "免繁複體檢", "簡易健康申報"],
    },
    {
      id: "surgery-shortfall",
      label: "外科手術及麻醉費用差額加強補貼",
      keywords: ["外科手術差額", "手術室費用", "麻醉科", "外科手術費", "手術封頂", "手術及住院"],
    },
    {
      id: "room-upgrade",
      label: "病房及膳食升級差額補助 (升級半私家/私家房)",
      keywords: ["病房及膳食差額", "病房超額", "病房升級", "超額住宿", "病房費"],
    },
    {
      id: "cancer-supplement",
      label: "癌症自費標靶藥物及化療專項超額補充",
      keywords: ["癌症藥物", "標靶", "化療", "放射治療", "癌症標靶治療", "自費癌症標靶藥物"],
    },
    {
      id: "imaging-supplement",
      label: "先進診斷造影 (CT/MRI/PET) 超額補償",
      keywords: ["CT", "MRI", "PET", "先進診斷成像", "診斷成像", "電腦掃描", "核磁共振"],
    },
    {
      id: "post-hosp-physio",
      label: "出院後物理治療及專科覆診差額津貼",
      keywords: ["出院後專科覆診", "物理治療", "中醫覆診", "中醫跌打", "復康護理"],
    },
    {
      id: "day-surgery-extra",
      label: "日間門診手術差額實報實銷",
      keywords: ["門診手術", "日間護理", "門診手術差額", "日間手術", "日間門診手術"],
    },
    {
      id: "guaranteed-renewal-80",
      label: "保證續保至 80/85 歲或終身",
      keywords: ["保證續保至 80", "保證續保至 85", "保證續保至80", "保證續保至85", "終身保證續保", "保證續保年齡"],
    },
    {
      id: "medical-appliance-supplement",
      label: "訂明特定體內外科用器具超額補助 (心臟支架/人工關節)",
      keywords: ["體內外科用器具", "醫療器具", "支架", "人工關節", "心臟支架", "起搏器", "義肢", "內固定物", "特定器具"],
    },
    {
      id: "companion-bed-extra",
      label: "直系親屬陪床陪伴費超額差額津貼",
      keywords: ["陪床費", "陪伴費", "家屬陪床", "陪床床位", "額外陪床", "陪床津貼", "親屬陪伴"],
    },
    {
      id: "emergency-overseas-supplement",
      label: "外幹/海外公幹出差突發緊急醫療差額",
      keywords: ["海外出差", "公幹", "緊急醫療", "海外公幹", "跨境醫療", "外派公幹", "海外差額", "出差緊急醫療"],
    },
    {
      id: "chinese-medicine-extra",
      label: "手術出院後中醫跌打骨傷差額補充",
      keywords: ["中醫骨傷", "跌打", "中醫差額", "中醫超額", "術後中醫", "針灸差額", "中草藥", "跌打差額"],
    },
  ],

  // 5. 家居保險 (home - 14 tags)
  home: [
    {
      id: "tenant-plan",
      label: "租客專屬方案 / 租客法律責任",
      keywords: ["租客", "租戶", "租住", "Tenant", "租客責任", "租客專用", "租客法例責任", "承租人", "租客計劃"],
    },
    {
      id: "owner-occupier",
      label: "自住業主全包方案 / 家居財物全險",
      keywords: ["自住", "自住業主", "業主自住", "家居財物", "家庭財產", "室內傢俬", "室內電器", "全包方案", "自住計劃"],
    },
    {
      id: "landlord-protection",
      label: "放租業主保障（租金拖欠/惡意破壞/凶宅）",
      keywords: ["放租", "業主放租", "放租業主", "出租", "業主（出租）", "租金損失", "租金追討", "凶宅", "租客拖欠", "租客蓄意破壞", "未付租金", "出租物業"],
    },
    {
      id: "building-third-party",
      label: "大廈外牆、公用地方及法團責任分攤",
      keywords: ["大廈外牆", "公共地方", "公用地方", "第三者責任", "業主責任", "公眾責任", "公眾法律責任", "大廈公用地方", "法團責任", "法團公用部分", "外牆及公用地方分攤"],
    },
    {
      id: "locksmith-emergency",
      label: "24小時緊急開鎖換鎖及水喉急修",
      keywords: ["換鎖", "開鎖", "鎖匠", "水喉急修", "爆水喉急修", "緊急門鎖", "緊急家居支援", "24小時急修", "電工急修", "緊急維修", "緊急開鎖", "更換門鎖"],
    },
    {
      id: "temp-accommodation",
      label: "單位無法居住時臨時住宿及膳食津貼",
      keywords: ["臨時住宿", "不能居住", "另覓居所", "酒店住宿津貼", "另覓住所", "臨時居所", "庇護住宿", "租金及住宿津貼", "臨時居所租金", "膳食津貼"],
    },
    {
      id: "water-leakage",
      label: "爆水喉、暗渠滲水探測及冷氣漏水修復",
      keywords: ["滲水", "爆水喉", "漏水", "水浸", "水管爆裂", "水損", "爆水管", "探測費", "冷氣漏水", "冷氣機漏水", "水管破裂源頭探測費"],
    },
    {
      id: "window-storm",
      label: "颱風暴雨吹裂鋁窗及玻璃窗破損更換",
      keywords: ["窗戶", "玻璃窗", "鋁窗", "室內鋁窗", "更換玻璃窗", "暴風雨季節窗戶", "颱風期間窗戶", "窗戶玻璃", "窗戶風暴損壞"],
    },
    {
      id: "renovation-cover",
      label: "室內小型裝修工程期間財物損毀保障",
      keywords: ["室內裝修", "裝修期間", "翻新工程", "室內小型裝修", "家居裝修", "裝修工程", "裝修期內", "裝修或維修"],
    },
    {
      id: "helper-belongings",
      label: "同住家傭個人財物保障及僱工責任",
      keywords: ["家傭", "外傭", "家庭僱工", "家庭傭工", "同住家傭", "家傭個人物品", "家傭物品", "傭工隨身財物"],
    },
    {
      id: "gadget-electronics",
      label: "手機、平板及手提電腦等數碼設備保障",
      keywords: ["手提電話", "流動電話", "平板電腦", "筆記簿型", "桌面電腦", "手提電腦", "電子通訊產品", "個人電腦"],
    },
    {
      id: "frozen-food",
      label: "停電/斷電雪櫃冷藏食品變質損壞津貼",
      keywords: ["冷凍食品", "冷藏食品", "冷藏食物", "停電冷藏", "斷電冷藏", "食品變質", "食物損壞", "變質補貼", "變壞"],
    },
    {
      id: "worldwide-belongings",
      label: "全球隨身個人財物及貴重物品保障",
      keywords: ["全球個人物品", "全球個人財物", "全球性個人財物", "全球隨身", "貴重物品", "物業外的貴重物品", "珍藏品", "珠寶"],
    },
    {
      id: "pet-liability-damage",
      label: "寵物（貓狗）第三者法律責任及意外損害",
      keywords: ["寵物", "貓狗", "毛孩", "合法飼養寵物", "毛孩保障"],
    },
    {
      id: "solar-panel-ev",
      label: "天台太陽能光伏板及私家電車充電樁損毀保障",
      keywords: ["太陽能", "太陽能板", "光伏系統", "充電樁", "電動車充電器", "充電設備", "天台裝置", "光伏板"],
    },
    {
      id: "seepage-test-search",
      label: "尋找暗渠漏水水源探測及紅外線勘測專案費用",
      keywords: ["尋找水源", "漏水探測", "紅外線探測", "滲水測試", "水源探測", "暗渠滲水", "探測費用", "紅外線勘測"],
    },
    {
      id: "smart-home-iot",
      label: "智能家居設備 (IoT) 及全屋電器意外損壞全險",
      keywords: ["智能家居", "IoT", "智能門鎖", "全屋電器", "家電損壞", "智能影音", "智能設備", "家電意外"],
    },
    {
      id: "debris-removal",
      label: "火災或嚴重水浸後廢物清理及泥頭搬遷雜費",
      keywords: ["廢物清理", "泥頭清理", "殘礫清理", "火災瓦礫", "水浸雜費", "清理費用", "清除殘礫", "泥頭搬運"],
    },
  ],

  // 6. 危疾保險 (critical-illness - 14 tags)
  "critical-illness": [
    {
      id: "multi-claim-major",
      label: "癌症/心臟病/中風多次及多重賠償",
      keywords: ["多重賠償", "多次賠償", "多重保障", "多次索償", "三大危疾多重", "多次危疾", "持續賠償", "心臟病及中風多次賠償", "多達10次", "多達5次", "多達6次"],
    },
    {
      id: "early-stage-cis",
      label: "早期危疾及原位癌預支賠償 (通波仔/微創)",
      keywords: ["早期危疾", "原位癌", "非嚴重", "通波仔", "微創手術", "早期惡性腫瘤", "早期甲狀腺", "早期及非嚴重疾病"],
    },
    {
      id: "premium-waiver",
      label: "首次確診嚴重危疾即時永久豁免保費",
      keywords: ["豁免保費", "保費豁免", "免繳保費", "豁免往後", "永久豁免", "保費免繳"],
    },
    {
      id: "benign-tumor-surgery",
      label: "未確立為惡性之良性腫瘤切除手術保障",
      keywords: ["良性腫瘤", "良性病變", "未確立為惡性", "預防性切除", "良性情況", "切除未確立為惡性"],
    },
    {
      id: "icu-protection",
      label: "深切治療部 (ICU) 住院專項保障",
      keywords: ["深切治療", "ICU", "深切治療部", "深切治療病房"],
    },
    {
      id: "cancer-continuous-income",
      label: "癌症持續治療生活津貼 / 收入保障",
      keywords: ["持續癌症收入", "生活津貼", "入息保障", "入息津貼", "癌症治療額外保障", "每月生活現金津貼"],
    },
    {
      id: "child-development-disorder",
      label: "兒童特有疾病 (自閉症/ADHD/妥瑞症)",
      keywords: ["自閉症", "ADHD", "妥瑞症", "兒童疾病", "兒童嚴重疾病", "嚴重兒童疾病", "注意力不足", "兒童特有"],
    },
    {
      id: "family-care-protection",
      label: "直系親屬額外恩恤 / 父母配偶保費豁免",
      keywords: ["直系親屬", "親情支援", "親情守護", "父母", "配偶身故", "額外恩恤", "父母（保單持有人）於75歲前身故"],
    },
    {
      id: "prenatal-baby-cover",
      label: "準媽媽懷孕期投保 (保障初生嬰兒)",
      keywords: ["First Gift", "BabyPro", "孕婦", "初生嬰兒", "懷孕18週", "懷孕期", "臍帶血"],
    },
    {
      id: "stroke-cardio-extra",
      label: "心臟及中風額外專項高額給付",
      keywords: ["心臟及中風額外保障", "心臟病及中風多次賠償", "心血管", "急性心肌梗塞", "心臟病"],
    },
    {
      id: "simplified-exam-free",
      label: "免驗身 / 簡易健康核保極速出單",
      keywords: ["免體檢", "免驗身", "簡易核保", "3條健康問題", "3分鐘出單", "CareForAll", "純保障零儲蓄"],
    },
    {
      id: "savings-cash-value",
      label: "儲蓄分紅價值及終期紅利累積傳承",
      keywords: ["分紅", "現金價值", "終期紅利", "儲蓄分紅", "保證現金價值", "傳承", "財富傳承"],
    },
    {
      id: "short-waiting-period",
      label: "縮短等候期 (新發/復發癌症快速銜接)",
      keywords: ["等候期縮短", "3年等候期", "1年等候期", "縮短等候期", "等候期最少相隔1年", "相隔3年"],
    },
    {
      id: "second-opinion-global",
      label: "全球權威第二醫療意見與海外綠色通道",
      keywords: ["第二醫療意見", "海外醫療轉介", "專家意見", "醫療綠色通道", "歐美頂尖醫療"],
    },
    {
      id: "mental-health-extra",
      label: "精神疾病 (嚴重抑鬱/思 پژ失調/躁鬱症) 專項賠償",
      keywords: ["精神疾病", "嚴重抑鬱", "思覺失調", "躁鬱症", "雙極性情緒病", "精神疾患", "重度抑鬱症", "精神健康", "情緒病賠償"],
    },
    {
      id: "dementia-parkinsons",
      label: "大腦退化性疾病 (阿茲海默氏症/柏金遜症) 長期護理金",
      keywords: ["阿茲海默", "認知障礙", "柏金遜", "腦退化", "老年癡呆", "帕金森", "失智症", "長期護理", "大腦退化"],
    },
    {
      id: "re-employment-rehab",
      label: "重大危疾後重投職場培訓及無障礙家居改裝補助",
      keywords: ["重投職場", "職業培訓", "居家改裝", "無障礙改裝", "復康器材", "復職支援", "復康補助", "重返工作"],
    },
    {
      id: "loss-of-independent-existence",
      label: "喪失獨立生活能力 (ADL) 終身年金或每月生活津貼",
      keywords: ["喪失獨立生活能力", "日常生活活動", "ADL", "無法自理", "長期照顧", "護理津貼", "傷殘年金", "獨立生活能力"],
    },
  ],

  // 7. 個人意外保險 (accident - 14 tags)
  accident: [
    {
      id: "amateur-sports",
      label: "業餘及消閒運動受保 (滑雪/潛水/馬拉松)",
      keywords: ["業餘及消閒運動", "業餘運動", "消閒運動", "消閒及業餘", "滑雪", "潛水", "高空彈跳", "馬拉松", "水上運動", "危險運動", "休閒運動", "冬季運動", "無休閒運動除外", "運動保障", "運動服裝及器材"],
    },
    {
      id: "double-indemnity",
      label: "公共交通/特定事故雙倍至三倍賠償",
      keywords: ["雙倍", "三倍", "公共交通", "公共交通工具", "定期航班", "客機", "升降機", "火警", "雙倍賠償", "三倍賠償", "交通意外", "水浸或山泥傾瀉"],
    },
    {
      id: "medical-reimburse",
      label: "意外門診及住院手術實報實銷",
      keywords: ["意外醫療", "醫療費用", "實報實銷", "醫療保障", "門診醫療", "急症室", "救護車", "門診及手術", "意外醫療費用", "門診開支", "意外醫療費用實報實銷"],
    },
    {
      id: "bone-fracture",
      label: "骨折及關節脫臼專項現金津貼",
      keywords: ["骨折", "脫臼", "斷骨", "完全骨折", "不完全骨折", "骨裂", "關節脫臼", "骨折保障", "骨折及脫臼"],
    },
    {
      id: "chinese-bonesetter",
      label: "中醫跌打及針灸專項門診",
      keywords: ["跌打", "中醫", "針灸", "中醫治療", "中醫跌打", "骨傷", "中醫師", "骨傷科", "草藥"],
    },
    {
      id: "physio-chiropractor",
      label: "物理治療/脊醫/專職復康門診",
      keywords: ["物理治療", "脊醫", "脊椎", "脊椎治療", "物理治療師", "職業治療", "專職醫療", "脊骨神經"],
    },
    {
      id: "accidental-disability",
      label: "永久傷殘分級/完全殘廢 100-150% 賠償",
      keywords: ["永久傷殘", "完全殘廢", "永久完全傷殘", "喪失肢體", "失明", "雙目失明", "100%", "150%", "斷肢", "完全及永久", "永久部分傷殘", "分級賠償", "失聰"],
    },
    {
      id: "daily-hospital-cash",
      label: "意外住院每日現金津貼",
      keywords: ["住院現金", "每日津貼", "每日現金", "每日住院", "住院入息", "每日意外住院", "住院津貼", "額外每日住院現金"],
    },
    {
      id: "weekly-income-benefit",
      label: "暫時傷殘/停工每週意外入息保障",
      keywords: ["每週入息", "每週意外入息", "暫時傷殘", "暫時性傷殘", "每週賠償", "收入或付款保障", "轉工津貼", "完全暫時傷殘", "局部暫時傷殘", "收入保障"],
    },
    {
      id: "burn-scar-cosmetic",
      label: "重大燒傷/意外面部整容修復/疤痕保障",
      keywords: ["燒傷", "嚴重燒傷", "三級嚴重燒傷", "疤痕", "面部毀容", "整容手術", "意外整容", "疤痕保障", "重大創傷整容"],
    },
    {
      id: "mobility-appliances",
      label: "輪椅/助行拐杖等輔助復康器材租購",
      keywords: ["輪椅", "拐杖", "醫療器具", "復康器具", "助行拐杖", "輔助醫療器材", "家居改裝", "指定醫療器具"],
    },
    {
      id: "family-extension",
      label: "家庭延伸保障 (子女校內意外/家中看護/年假補償)",
      keywords: ["家中看護", "年假補償", "子女校內", "配偶延伸", "父母/配偶年假", "受虐保障", "學校實驗室", "家庭看護費"],
    },
    {
      id: "no-medical-exam",
      label: "免體檢極速核保 / 手機即時拍照理賠",
      keywords: ["免驗身", "免體檢", "免核保", "毋須驗身", "毋須體檢", "線上極速理賠", "一鍵線上拍照", "網上投保", "即時生效", "免驗身免核保"],
    },
    {
      id: "worldwide-emergency",
      label: "全球 24 小時緊急救援/醫療運送及送返",
      keywords: ["全球", "24小時", "世界各地", "環球", "緊急醫療撤離", "遺體運返", "入院按金", "近親探望", "全球緊急支援", "蘇黎世緊急支援", "24小時全球支援"],
    },
    {
      id: "food-poisoning",
      label: "食物中毒、遇溺及意外突發窒息緊急治療",
      keywords: ["食物中毒", "遇溺", "窒息", "吸入氣體", "細菌感染中毒", "急性食物中毒", "溺水", "突發窒息"],
    },
    {
      id: "animal-insect-bite",
      label: "動物襲擊咬傷及毒蟲叮咬狂犬破傷風針劑費",
      keywords: ["動物咬傷", "狗咬", "昆蟲叮咬", "狂犬病疫苗", "破傷風針", "蜂蜇", "爬蟲類咬傷", "動物襲擊", "毒蟲叮咬"],
    },
    {
      id: "coma-benefit",
      label: "意外創傷引致持續昏迷專項危急慰問現金",
      keywords: ["昏迷", "意外昏迷", "腦震盪昏迷", "昏迷津貼", "持續昏迷", "創傷昏迷", "昏迷給付", "昏迷慰問金"],
    },
    {
      id: "hearing-speech-loss",
      label: "意外導致言語能力喪失或聽覺永久受損專案賠償",
      keywords: ["聽覺受損", "言語能力喪失", "失聰", "失語", "耳膜破裂", "意外失聲", "聽力受損", "語言能力"],
    },
  ],

  // 8. 人壽保險 (life - 14 tags)
  life: [
    {
      id: "term-life",
      label: "定期壽險 (Term Life 純保障高槓桿)",
      keywords: ["定期壽險", "定期保險", "定期人壽", "Term Life", "自主保", "純人壽", "純保障", "純人壽保障", "消費型定期", "一年定期", "五年定期", "每年續保", "定期保障", "精選定期", "定期"],
    },
    {
      id: "whole-life-savings",
      label: "終身壽險 / 儲蓄分紅與現金價值",
      keywords: ["儲蓄分紅", "保證現金價值", "非保證紅利", "保證可支取現金", "盈豐寶", "終身人壽", "Whole Life", "保單現金價值", "退保價值", "期滿利益", "週年紅利", "終期紅利"],
    },
    {
      id: "no-medical-exam",
      label: "免體檢極速投保 (最高達 400-1,000 萬保額)",
      keywords: ["免驗身", "免體檢", "免核保", "簡易核保", "毋須體檢", "免身體檢查", "網上核保", "簡易健康申報", "毋須健康申報", "不需體檢", "無需身體檢查", "毋須核保", "免體驗極速核保"],
    },
    {
      id: "terminal-illness",
      label: "末期疾病提前預支 100% 身故保額",
      keywords: ["末期疾病", "提前給付", "預先給付", "預支身故權益", "末期絕症", "末期保障", "預支身故賠償", "預先支付", "提前支付", "預支發放", "提前賠償"],
    },
    {
      id: "double-accidental-death",
      label: "交通/突發意外雙倍身故賠償 (200%)",
      keywords: ["意外身故雙倍賠償", "雙倍身故", "額外身故", "意外身故", "雙倍賠償", "公共交通意外身故", "交通意外身故", "雙倍意外身故"],
    },
    {
      id: "conversion-privilege",
      label: "保證免核保轉換終身壽險權 (Guaranteed Conversion)",
      keywords: ["轉換權益", "轉換權", "免核保轉換", "保證轉換", "轉為終身", "轉換為終身", "可轉換", "Conversion", "轉換為終身保險", "保證免體檢轉換權", "轉換終身壽險", "終身保障計劃"],
    },
    {
      id: "premium-waiver",
      label: "完全永久傷殘豁免後續所有保費",
      keywords: ["豁免保費", "保費豁免", "免繳保費", "完全及永久傷殘", "永久完全傷殘", "豁免後續所有未繳保費", "豁免保費附加保障", "豁免保費保障"],
    },
    {
      id: "life-milestone-increase",
      label: "人生里程碑免體檢加保 (結婚/生仔/買樓)",
      keywords: ["人生里程碑", "免核保加保", "靈活增加保障選項", "伴你成長", "加保", "買樓等人生里程碑"],
    },
    {
      id: "mortgage-protection",
      label: "按揭供樓 / 房貸負債抵押專項保障",
      keywords: ["供樓保障", "樂安居", "按揭", "房貸", "負債", "信用卡欠款", "供樓"],
    },
    {
      id: "income-support-benefit",
      label: "傷殘或重疾每月入息生活津貼補助",
      keywords: ["入息及生活津貼", "生活津貼", "每月發放特定生活津貼", "入息補助", "每月生活津貼"],
    },
    {
      id: "smoker-friendly",
      label: "非吸煙者專屬優越健康費率折扣",
      keywords: ["非吸煙", "非吸煙者", "優質非吸煙", "優越非吸煙", "標準非吸煙", "Non-smoker", "健康折扣", "非吸煙特惠", "優待費率", "特優保費等級", "專屬特惠費率"],
    },
    {
      id: "compassionate-death",
      label: "恩恤身故數日內即時應急撫恤現金",
      keywords: ["恩恤身故", "即時援助", "身故體恤", "恩恤保障", "撫恤金", "應急現金", "恩恤撫恤金", "身亡撫恤金"],
    },
    {
      id: "guaranteed-renewable",
      label: "保證續保至 80/85/100 歲無須重驗",
      keywords: ["保證續保", "續保至80歲", "續保至85歲", "續保至100歲", "可續保至", "終身續保", "保證可續保", "85歲", "100歲", "保證續保權益", "80歲"],
    },
    {
      id: "suicide-clause",
      label: "保單生效滿 1 年後自殺受保全額賠償",
      keywords: ["自殺", "自殺條款", "一年後自殺", "首年不保自殺", "13個月", "一年內自殺", "滿1年後自殺", "自殺受保", "首年後自殺涵蓋條款"],
    },
    {
      id: "split-policy-option",
      label: "保單分拆權益 (自設不同受保人或世代傳承)",
      keywords: ["保單分拆", "分拆權益", "更改受保人", "傳承分拆", "世代傳承", "轉移受保人", "分拆保單", "保單傳承"],
    },
    {
      id: "currency-options",
      label: "多種貨幣轉換選擇 (美元/港元/人民幣/英鎊)",
      keywords: ["多幣種", "貨幣轉換", "貨幣選擇", "美元", "人民幣", "英鎊", "外幣保單", "轉換保單貨幣", "雙幣切換"],
    },
    {
      id: "unemployment-premium-holiday",
      label: "非自願性失業暫緩繳付保費保障 (保費假期)",
      keywords: ["失業延期", "暫緩繳費", "保費假期", "非自願失業", "延遲繳付保費", "供款寬限期", "失業保障", "暫緩供款"],
    },
    {
      id: "funeral-service-support",
      label: "身故專業殯儀喪葬安排諮詢與家屬哀傷輔導",
      keywords: ["殯儀安排", "喪葬諮詢", "身故輔導", "喪葬服務", "哀傷輔導", "後事安排", "身故支援", "後事諮詢"],
    },
  ],

  // 9. 汽車保險 (motor - 14 tags)
  motor: [
    {
      id: "comp-insurance",
      label: "綜合全保 (Comprehensive)",
      keywords: ["綜合全保", "綜合保險", "綜合汽車", "全保", "Comprehensive", "私家車綜合", "自身汽車損毀", "車身損毀", "自身車輛碰撞"],
    },
    {
      id: "third-party-only",
      label: "第三者責任保險 (Third Party Only)",
      keywords: ["第三者責任", "第三者保險", "三保", "Third Party", "第三者人身傷亡", "第三者財物損毀", "第三者責任保險", "第三者死亡"],
    },
    {
      id: "ncd-protection",
      label: "無索償折扣 (NCD) 守護保障",
      keywords: ["NCD", "無索償折扣", "無索償保證", "NCD保護", "維持折扣", "No Claim Discount", "無賠償折扣", "NCD 守護", "NCD 折扣保護"],
    },
    {
      id: "windscreen-cover",
      label: "擋風玻璃獨立免自負額賠償",
      keywords: ["擋風玻璃", "車窗玻璃", "天窗", "玻璃維修", "免自負額", "免墊底", "車窗破損", "擋風玻璃保障", "擋風玻璃獨立免墊底"],
    },
    {
      id: "towing-service",
      label: "24小時免費路面緊急拖車及路邊救援",
      keywords: ["拖車", "道路救援", "緊急拖車", "路邊支援", "24小時免費拖車", "搭橋搭電", "爆胎換軚", "路面緊急", "中途急修", "24小時免費路邊救援"],
    },
    {
      id: "new-car-replacement",
      label: "新車首年全損以新換舊保障",
      keywords: ["新車換新", "新車全損", "以新代舊", "車輛替換", "新車賠償", "同廠全新", "全新車", "新車替換", "以新換舊", "同款新車"],
    },
    {
      id: "zero-depreciation",
      label: "零件更換維修零折舊率修理",
      keywords: ["零折舊", "不設折舊", "折舊率豁免", "全新零件", "無折舊", "「零」折舊率修理", "豁免折舊", "維修零件折舊"],
    },
    {
      id: "courtesy-car",
      label: "維修期間代步車 / 租車代步津貼",
      keywords: ["代用車輛", "代步車", "租車 / 代用車輛", "租用代用車輛", "7天租車", "代步", "臨時代用汽車", "車輛維修期間代步車津貼"],
    },
    {
      id: "ev-protection",
      label: "電動車 (EV) 電池及專屬充電配件保障",
      keywords: ["電動車", "EV", "充電器", "充電纜", "電池損壞", "家用充電設備", "充電樁", "電動車電池", "電動車 (EV) 充電配件專項保障"],
    },
    {
      id: "cross-border-gba",
      label: "港車北上 / 港粵通跨境車險附加保障",
      keywords: ["港粵通", "等效先認", "廣東省", "跨境", "港車北上", "港粵通汽車險"],
    },
    {
      id: "personal-accident-driver",
      label: "司機及乘客個人意外傷亡保障",
      keywords: ["個人意外", "司機意外", "司機及乘客", "受保駕駛者", "人身意外保障", "交通意外身故", "駕駛者個人意外", "司機個人意外傷亡保障"],
    },
    {
      id: "medical-expenses",
      label: "司機及乘客醫療費用保障",
      keywords: ["醫療費用", "乘客意外醫療", "駕駛者及乘客醫療", "受保駕駛者及乘客醫療費用", "醫療費用保障"],
    },
    {
      id: "claims-recovery",
      label: "第三者責任無過失法律索償追討服務",
      keywords: ["追討服務", "第三者責任追討", "索償追討", "第三者責任追討服務", "索償追討服務"],
    },
    {
      id: "named-driver-discount",
      label: "指定駕駛者專屬保費折扣及低自負額",
      keywords: ["指定駕駛者", "記名司機", "指定司機", "記名駕駛者", "非指定駕駛者自負額", "非記名司機", "指定駕駛人", "指定駕駛者專屬保費折扣"],
    },
    {
      id: "key-remote-loss",
      label: "車匙及智能遙控器遺失更換與重配鎖匙費用",
      keywords: ["車匙遺失", "更換車匙", "遙控器", "智能車匙", "晶片鑰匙", "配匙費用", "更換門鎖", "鎖匙重配"],
    },
    {
      id: "tyre-rim-protection",
      label: "輪胎爆胎及輪圈獨立破損免扣自負額更換",
      keywords: ["輪胎破損", "爆胎", "輪圈損毀", "車軨", "輪胎更換", "輪胎意外", "爆胎保障", "輪圈破損"],
    },
    {
      id: "misfuelling-cover",
      label: "加錯燃油或水箱加錯冷卻液清洗引擎保障",
      keywords: ["加錯油", "燃油錯誤", "混入錯誤燃油", "柴油汽油加錯", "沖洗油缸", "引擎清油", "誤加燃油", "加錯燃油"],
    },
    {
      id: "flood-typhoon-waterlogging",
      label: "極端暴雨水浸、颱風冧樹砸車全額免折舊賠償",
      keywords: ["水浸", "暴雨浸車", "颱風冧樹", "樹木倒塌", "天災水浸", "黑雨積水", "水浸賠償", "冧樹砸車"],
    },
  ],

  // 10. 家傭保險 (domestic-helper - 14 tags)
  "domestic-helper": [
    {
      id: "statutory-ec",
      label: "法定僱員補償 1 億責任保障 (勞保標配)",
      keywords: ["僱員補償", "100,000,000", "1億", "僱主法定責任", "勞工保險", "勞保", "僱主責任", "僱主法律責任", "法定僱員補償責任"],
    },
    {
      id: "medical-surgery",
      label: "外傭外科手術及住院醫療開支全包",
      keywords: ["住院及手術", "外科手術", "住院費用", "嚴重疾病住院", "手術及住院", "住院醫療", "大手術", "外科手術及住院", "入住醫院費用", "住院及外科手術"],
    },
    {
      id: "clinical-outpatient",
      label: "網絡西醫及臨床門診診治費用",
      keywords: ["門診費用", "門診臨床", "網絡西醫", "西醫網絡", "診症費", "門診保障", "門診醫療", "家傭門診", "西醫臨床", "診所診症"],
    },
    {
      id: "dental-care",
      label: "牙科急症止痛 / 補牙拔牙專項護理",
      keywords: ["牙科費用", "牙科", "牙醫費用", "牙科保障", "牙科醫療", "牙齒護理", "牙科保健", "牙科重大意外", "緊急牙科", "拔牙或補牙", "口腔手術"],
    },
    {
      id: "clinical-bonesetter",
      label: "中醫跌打骨傷及針灸專項門診",
      keywords: ["中醫", "跌打", "針灸", "骨傷", "中醫骨傷", "中醫跌打", "中醫骨傷跌打針灸門診"],
    },
    {
      id: "helper-fraud-theft",
      label: "外傭誠信盜竊 / 擅自挪用僱主金錢財物",
      keywords: ["誠信保障", "忠誠保障", "誠實保障", "欺詐", "盜竊", "挪用財物", "擅自挪用", "金錢損失", "家傭誠信", "不誠實行為", "不誠實挪用", "誠信盜竊", "家傭忠誠", "珠寶失竊"],
    },
    {
      id: "re-hiring-expenses",
      label: "外傭失蹤 / 中途不辭而別補聘津貼",
      keywords: ["補聘", "重新招聘", "重聘費用", "更換家傭", "補聘新家傭", "重新聘用", "補聘家傭費用", "補聘費用", "更換新外傭", "不辭而別", "簽證費", "招聘及簽證費"],
    },
    {
      id: "anti-loan-locksmith",
      label: "僱主防借貸追債 / 更換大門門鎖急修保障",
      keywords: ["借貸", "借款", "更換及安裝大門門鎖", "大門門鎖", "換鎖", "未經授權款項", "財務公司", "僱主借貸保障", "門鎖或鐵閘鎖"],
    },
    {
      id: "critical-illness-helper",
      label: "外傭癌症 / 嚴重疾病一次性心意金",
      keywords: ["癌症", "心臟病", "心意金", "嚴重疾病", "危疾保障", "重大疾病", "癌症及心臟病", "嚴重疾病保障", "外傭癌症", "慰問金"],
    },
    {
      id: "repatriation-service",
      label: "外傭重傷重病或身故遣送原居地保障",
      keywords: ["送返", "遣返", "遺體送返", "遺體運返", "遺體運送", "醫療遣返", "醫療送返", "遣返原居地", "送返原居地", "運送（遣返）", "遣送費用", "醫療專機", "重病或受傷遣返"],
    },
    {
      id: "service-interruption",
      label: "服務中斷 / 聘請本地臨時家務替工津貼",
      keywords: ["服務中斷", "中斷服務", "臨時工津貼", "病假津貼", "住院津貼", "臨時替工津貼", "臨時本地家務", "臨時家務替代", "替換外傭臨時家務", "家務助理津貼", "替代津貼"],
    },
    {
      id: "rest-day-accident",
      label: "外傭休假 / 休息日個人非因工意外保障",
      keywords: ["休假期間", "休息日", "個人意外", "休假", "非因工意外", "個人意外保障", "個人意外賠償"],
    },
    {
      id: "family-abuse-protection",
      label: "幼兒及長者家庭成員受虐醫療及創傷輔導",
      keywords: ["受虐", "蓄意傷害", "惡意行為", "故意/惡意", "家庭成員醫療費用", "家庭成員受虐", "創傷輔導", "故意傷害"],
    },
    {
      id: "free-replacement-name",
      label: "合約期內免費更換外傭手續登記一次",
      keywords: ["免費更換", "更換外傭", "免費更改受保家傭", "免費更換外傭保單", "免費更換外傭一次", "更換外傭免費登記", "免費轉換受保家傭", "更換受保"],
    },
    {
      id: "helper-cardiac-stroke",
      label: "外傭心臟病發及急性中風專案高額醫療手術補助",
      keywords: ["心臟病", "急性中風", "通波仔", "腦血管意外", "專科手術", "心臟手術", "血管介入", "嚴重手術", "外傭中風"],
    },
    {
      id: "overstay-legal-expenses",
      label: "外傭非法拒絕離港或勞資爭議僱主法律費用支援",
      keywords: ["勞資審裁處", "法律費用", "勞工處調解", "追討合約", "拒絕離港", "逾期居留", "法律訴訟", "僱主法律支援"],
    },
    {
      id: "infectious-disease-isolation",
      label: "外傭法定傳染病隔離及家居深度消毒清潔津貼",
      keywords: ["傳染病", "隔離津貼", "消毒清潔", "家居消毒", "深度消毒", "檢疫隔離", "傳染病補償", "家傭隔離"],
    },
    {
      id: "helper-personal-belongings",
      label: "外傭居所意外火災或水浸個人衣物行李損毀補貼",
      keywords: ["外傭衣物", "個人物品損壞", "外傭行李", "居所火災", "房間水浸", "私人物品賠償", "衣物損毀", "家傭財物"],
    },
  ],

  // 11. 寵物保險 (pet - 14 tags)
  pet: [
    {
      id: "vet-consultation",
      label: "註冊獸醫門診及處方藥物實報實銷",
      keywords: ["門診", "獸醫診金", "診症費", "處方藥物", "診斷測試", "診所診症", "X光及超聲波", "普通科及專科診金", "門診費用", "獸醫診治", "門診西醫"],
    },
    {
      id: "surgery-anesthesia",
      label: "外科手術、全身麻醉及過夜住院開支",
      keywords: ["手術", "麻醉", "手術室", "過夜住院", "住院開支", "手術後住房", "外科手術", "手術保障", "住院費用", "留醫住院"],
    },
    {
      id: "third-party-dog",
      label: "寵物襲擊/咬傷第三者公眾法律責任",
      keywords: ["第三者責任", "公眾責任", "法律責任", "咬傷", "寵物襲擊", "第三者身體傷亡", "第三者法律責任", "第三者財物損毀", "第三者公眾責任"],
    },
    {
      id: "cancer-chemo",
      label: "寵物癌症化療、放射治療及標靶專項",
      keywords: ["癌症", "化療", "放療", "放射治療", "癌症化療", "標靶", "癌症一次性現金", "腫瘤"],
    },
    {
      id: "chronic-care",
      label: "慢性疾病持續護理 / 終生慢性病保障",
      keywords: ["慢性病", "慢性疾病", "持續護理", "終生慢性", "腎衰竭", "附加腎衰竭"],
    },
    {
      id: "dental-cover",
      label: "牙科治療及非例行牙科創傷/感染手術",
      keywords: ["牙科", "洗牙", "牙齒治療", "非例行洗牙", "牙齦", "口腔手術", "牙科費用", "牙科意外", "非例行牙科"],
    },
    {
      id: "hereditary-disease",
      label: "特定品種遺傳性疾病受保 (脫臼/青光眼/IVDD)",
      keywords: ["遺傳", "先天性", "品種遺傳", "特定品種", "髖關節", "髕骨", "膝蓋骨", "青光眼", "IVDD", "櫻桃眼"],
    },
    {
      id: "microchip-free",
      label: "全品種貓狗免植晶片投保 / 疫苗紀錄即可",
      keywords: ["免植晶片", "無須晶片", "毋須晶片", "免晶片", "無須植入晶片", "疫苗注射紀錄卡辨識", "免植晶片貓狗通保", "免植晶片全品種投保"],
    },
    {
      id: "advanced-imaging",
      label: "先進造影診斷 (CT / MRI) 專項保障",
      keywords: ["CT", "MRI", "先進影像", "先進造影", "造影診斷", "先進造影診斷"],
    },
    {
      id: "lost-pet-advertising",
      label: "走失尋寵廣告宣傳費及尋寵賞金",
      keywords: ["走失", "尋寵", "廣告", "酬金", "賞金", "尋寵廣告", "走失尋寵宣傳"],
    },
    {
      id: "emergency-boarding",
      label: "主人患病住院期間緊急寄宿/寄養津貼",
      keywords: ["寄宿", "寄養", "緊急寄宿", "緊急寄養", "主人患病", "留醫住院", "住院連續4日"],
    },
    {
      id: "bereavement-funeral",
      label: "寵物離世善終、火化及悼念禮儀津貼",
      keywords: ["善終", "火化", "殮葬", "寵物喪葬", "人道毀滅", "身故費用", "寵物火化", "身故 / 殮葬服務", "悼念禮儀", "身故服務"],
    },
    {
      id: "overseas-travel-cover",
      label: "寵物外遊同行意外醫療或外遊取消護理",
      keywords: ["海外保障", "海外旅程", "外遊取消", "因寵物急病取消海外旅程", "外遊取消行程寵物護理費", "海外緊急醫療"],
    },
    {
      id: "freedom-vet-choice",
      label: "全港註冊獸醫診所自由選擇（不限指定網絡）",
      keywords: ["自由選擇", "全港持牌", "自由選", "全港註冊獸醫", "全港持牌獸醫診所自由選"],
    },
    {
      id: "lifetime-renewable-senior",
      label: "年老無上限保證續保 (高齡不拒保不減額)",
      keywords: ["保證續保", "終身續保", "無年齡上限", "年老續保", "高齡續保", "續保至終身", "不限續保年齡", "終身保證續保"],
    },
    {
      id: "skin-allergy-cover",
      label: "常見貓狗皮膚過敏、真菌感染及外耳炎專項門診藥費",
      keywords: ["皮膚過敏", "異位性皮膚炎", "真菌感染", "濕疹", "外耳炎", "皮膚病", "止痕藥", "皮膚治療", "皮膚炎症"],
    },
    {
      id: "ingestion-foreign-body",
      label: "吞食異物 (骨頭/玩具/毛線) 緊急內窺鏡或開腹手術",
      keywords: ["吞食異物", "誤吞異物", "內窺鏡取出", "腸道阻塞", "異物手術", "催吐急症", "吞骨手術", "開腹手術取出"],
    },
    {
      id: "behavioural-training",
      label: "寵物行為失常/創傷後心理輔導與合格訓練師課程津貼",
      keywords: ["行為訓練", "行為失常", "心理輔導", "創傷輔導", "合格訓犬師", "行為矯治", "訓練課程", "行為偏差"],
    },
  ],
};

/** 11 大類別熱門投保人場景預設 (Persona Profiles / Scenario Presets) */
export const CATEGORY_PERSONA_PRESETS: Record<string, PersonaPreset[]> = {
  // 1. 旅遊保險 (6 Presets)
  travel: [
    {
      id: "self-drive",
      label: "🚗 自駕遊達人",
      icon: "🚗",
      description: "海外自駕遊必備！重點鎖定租車自負額、海外緊急救援與個人法律責任",
      tagIds: ["rental-car", "emergency-evac", "personal-liability"],
      featureIds: ["rental-car", "emergency-evac", "personal-liability"],
    },
    {
      id: "sports-adventure",
      label: "⛷️ 滑雪 / 水上運動愛好者",
      icon: "⛷️",
      description: "業餘消閒運動全包（滑雪、潛水、行山等），配備無上限緊急運送及回港中醫覆診",
      tagIds: ["sports-cover", "emergency-evac", "revisit-chinese-med"],
      featureIds: ["sports-cover", "emergency-evac", "revisit-chinese-med"],
    },
    {
      id: "digital-gadgets",
      label: "📱 數碼器材控 / 攝影旅人",
      icon: "📱",
      description: "隨身攜帶手機、MacBook 與相機，注重數碼設備損壞被盜、信用卡盜簽及航班延誤",
      tagIds: ["mobile-laptop", "credit-card-theft", "flight-delay"],
      featureIds: ["mobile-laptop", "credit-card-theft", "flight-delay"],
    },
    {
      id: "family-trip",
      label: "👨‍👩‍👧 親子家庭 / 三代同堂遊",
      icon: "👨‍👩‍👧",
      description: "帶長者與小朋友出遊，重視長者保額不縮水、隨行兒童專屬保障、航班延誤及回港覆診",
      tagIds: ["family-bundle", "senior-friendly", "flight-delay", "revisit-chinese-med"],
      featureIds: ["family-bundle", "senior-friendly", "flight-delay", "revisit-chinese-med"],
    },
    {
      id: "cruise-lover",
      label: "🚢 郵輪假期深度遊",
      icon: "🚢",
      description: "郵輪假期專屬保障，涵蓋泊岸延誤、岸上觀光取消、取消行程及海外緊急救援",
      tagIds: ["cruise-cover", "emergency-evac", "revisit-chinese-med"],
      featureIds: ["cruise-cover", "emergency-evac", "revisit-chinese-med"],
    },
    {
      id: "flexible-cancel",
      label: "✈️ 航班延誤 / 靈活取消行程",
      icon: "✈️",
      description: "重視任何原因取消 (CFAR)、航班延誤現金賠償及行李延誤緊急應急津貼",
      tagIds: ["trip-cancel-cfar", "flight-delay", "baggage-delay"],
      featureIds: ["trip-cancel-cfar", "flight-delay", "baggage-delay"],
    },
  ],

  // 2. 自願醫保 (4 Presets)
  medical: [
    {
      id: "tax-saver-entry",
      label: "💰 稅務扣減 / 高性價比入門",
      icon: "💰",
      description: "每年享受高達 HK$8,000 稅務扣減，以極平保費獲取住院、手術及投保前未知已有病症基本保障",
      tagIds: ["tax-deduction", "day-surgery", "guaranteed-renewal", "unknown-pre-existing"],
      featureIds: ["tax-deduction", "day-surgery", "guaranteed-renewal", "unknown-pre-existing"],
    },
    {
      id: "hospital-full-cover",
      label: "🏥 住院手術全額保障",
      icon: "🏥",
      description: "私家醫院住院手術費 100% 實報實銷無分項上限，配合出院免找數及深切治療全包",
      tagIds: ["full-cover", "cashless", "advanced-imaging", "icu-care"],
      featureIds: ["full-cover", "cashless", "advanced-imaging", "icu-care"],
    },
    {
      id: "cancer-precision-care",
      label: "🔬 癌症門診精準治療",
      icon: "🔬",
      description: "專注非手術癌症放化療、標靶藥物、免疫治療及先進 CT/MRI 造影，涵蓋門診洗腎與術後物理治療",
      tagIds: ["cancer-therapy", "advanced-imaging", "kidney-dialysis", "pre-post-outpatient"],
      featureIds: ["cancer-therapy", "advanced-imaging", "kidney-dialysis", "pre-post-outpatient"],
    },
    {
      id: "senior-peace-of-mind",
      label: "👵 銀髮長者保證續保",
      icon: "👵",
      description: "為長輩投保首選，保證終身或續保至 100 歲，兼顧投保前未知病症及親屬陪床津貼",
      tagIds: ["guaranteed-renewal", "unknown-pre-existing", "companion-bed", "deductible-options"],
      featureIds: ["guaranteed-renewal", "unknown-pre-existing", "companion-bed", "deductible-options"],
    },
  ],

  // 3. 高端醫療 (4 Presets)
  "high-end-medical": [
    {
      id: "private-room-zero-deductible",
      label: "👑 頂級私家房零自付尊尚方案",
      icon: "👑",
      description: "入住私家單人房尊貴病房，主要醫療費用 100% 全數報銷零自付，兼享全球名院出院直付免找數",
      tagIds: ["private-room", "full-cover-all", "cashless-global", "icu-no-limit"],
      featureIds: ["private-room", "full-cover-all", "cashless-global", "icu-no-limit"],
    },
    {
      id: "global-cashless-concierge",
      label: "🌐 亞洲 / 環球出院免找數與名醫禮賓",
      icon: "🌐",
      description: "覆蓋亞洲或全球頂級私家醫院網絡，出院簽名免找數，配備專屬健康管家及全球第二醫療意見",
      tagIds: ["cashless-global", "second-opinion-concierge", "high-annual-limit", "full-cover-all"],
      featureIds: ["cashless-global", "second-opinion-concierge", "high-annual-limit", "full-cover-all"],
    },
    {
      id: "cancer-proton-full-cover",
      label: "⚡ 癌症質子重離子全包精準治療",
      icon: "⚡",
      description: "突破性納入昂貴質子重離子治療、高端自費標靶免疫藥物及 CT/MRI 先進造影零自付全額賠償",
      tagIds: ["advanced-cancer-proton", "advanced-imaging-zero-copay", "full-cover-all", "post-hosp-rehab"],
      featureIds: ["advanced-cancer-proton", "advanced-imaging-zero-copay", "full-cover-all", "post-hosp-rehab"],
    },
    {
      id: "family-deductible-value",
      label: "🛡️ 中產家庭自負額高 CP 組合",
      icon: "🛡️",
      description: "善用公司醫保作為第一層防線，自選墊底費以親民保費撬動每年高達二至三千萬的超高額終身防護網",
      tagIds: ["deductible-options", "high-annual-limit", "unlimited-lifetime", "full-cover-all"],
      featureIds: ["deductible-options", "high-annual-limit", "unlimited-lifetime", "full-cover-all"],
    },
  ],

  // 4. Top-up 差額醫療 (4 Presets)
  "top-up-medical": [
    {
      id: "corporate-shortfall-gap",
      label: "💼 打工仔填補公司醫保差額",
      icon: "💼",
      description: "無縫銜接公司僱主醫療團體保單，填補住院手術「打爆 cap」超額開支，80%–90% SMM 差額賠償",
      tagIds: ["shortfall-cover", "smm-excess", "surgery-shortfall", "room-upgrade"],
      featureIds: ["shortfall-cover", "smm-excess", "surgery-shortfall", "room-upgrade"],
    },
    {
      id: "career-transition-seamless",
      label: "🔄 離職退休無縫銜接轉保",
      icon: "🔄",
      description: "離職、跳槽空檔或退休時，享免驗身、免重新核保保證轉入個人自願醫保或獨立尊尚醫療計劃",
      tagIds: ["guaranteed-conversion", "simplified-underwriting", "guaranteed-renewal-80", "shortfall-cover"],
      featureIds: ["guaranteed-conversion", "simplified-underwriting", "guaranteed-renewal-80", "shortfall-cover"],
    },
    {
      id: "zero-out-of-pocket-offset",
      label: "💳 零自付墊底費抵銷方案",
      icon: "💳",
      description: "僱主公司醫保賠償金額直接 100% 抵扣本計劃墊底費，無需自掏腰包即可享受百萬級補充額度",
      tagIds: ["deductible-offset", "smm-excess", "surgery-shortfall", "cancer-supplement"],
      featureIds: ["deductible-offset", "smm-excess", "surgery-shortfall", "cancer-supplement"],
    },
    {
      id: "day-surgery-imaging-boost",
      label: "🩺 門診小手術與先進造影加強",
      icon: "🩺",
      description: "加強日間門診微創手術（如照胃鏡腸鏡）及 CT/MRI 高端造影差額實報實銷，出院後專科覆診物理治療兼備",
      tagIds: ["day-surgery-extra", "imaging-supplement", "post-hosp-physio", "shortfall-cover"],
      featureIds: ["day-surgery-extra", "imaging-supplement", "post-hosp-physio", "shortfall-cover"],
    },
  ],

  // 5. 家居保險 (5 Presets)
  home: [
    {
      id: "smart-tenant",
      label: "🏢 租客無憂首選",
      icon: "🏢",
      description: "租樓必備！保障個人家居財物、筆電數碼、租客責任及爆水喉損害",
      tagIds: ["tenant-plan", "gadget-electronics", "water-leakage", "frozen-food"],
      featureIds: ["tenant-plan", "gadget-electronics", "water-leakage", "frozen-food"],
    },
    {
      id: "owner-comprehensive",
      label: "🏡 自住業主全包旗艦",
      icon: "🏡",
      description: "私樓自住業主全方位守護，涵蓋財物全險、外牆公用責任分攤及裝修保障",
      tagIds: ["owner-occupier", "building-third-party", "renovation-cover", "temp-accommodation"],
      featureIds: ["owner-occupier", "building-third-party", "renovation-cover", "temp-accommodation"],
    },
    {
      id: "landlord-guard",
      label: "💰 收租業主防坑收息",
      icon: "💰",
      description: "買樓收租最怕遇上租霸！重點對準租金欠繳、租客惡意破壞及凶宅責任",
      tagIds: ["landlord-protection", "building-third-party", "owner-occupier"],
      featureIds: ["landlord-protection", "building-third-party", "owner-occupier"],
    },
    {
      id: "old-building-repair",
      label: "🛠️ 舊樓防漏急修達人",
      icon: "🛠️",
      description: "針對高樓齡水管老化，鎖定爆水管滲水探測、24小時急修開鎖及颱風換窗",
      tagIds: ["water-leakage", "locksmith-emergency", "window-storm"],
      featureIds: ["water-leakage", "locksmith-emergency", "window-storm"],
    },
    {
      id: "pet-helper-home",
      label: "🐶 毛孩家傭幸福家庭",
      icon: "🐶",
      description: "家有毛孩與工人姐姐必備！涵蓋外傭財物及僱主責任，並保障寵物公眾責任",
      tagIds: ["helper-belongings", "pet-liability-damage", "owner-occupier"],
      featureIds: ["helper-belongings", "pet-liability-damage", "owner-occupier"],
    },
  ],

  // 6. 危疾保險 (4 Presets)
  "critical-illness": [
    {
      id: "young-budget-pure-protection",
      label: "🚀 年輕人高性價比純保障首選",
      icon: "🚀",
      description: "超低保費享受百萬級一筆過危疾賠償，免體檢極速線上出單，涵蓋早期原位癌及心血管重症",
      tagIds: ["simplified-exam-free", "early-stage-cis", "premium-waiver", "stroke-cardio-extra"],
      featureIds: ["simplified-exam-free", "early-stage-cis", "premium-waiver", "stroke-cardio-extra"],
    },
    {
      id: "major-illness-multi-claim",
      label: "❤️ 癌症中風多次多重守護",
      icon: "❤️",
      description: "全方位擊退復發風險，癌症/心臟病/中風多次賠償，享持續生活津貼及縮短等候期",
      tagIds: ["multi-claim-major", "cancer-continuous-income", "short-waiting-period", "stroke-cardio-extra"],
      featureIds: ["multi-claim-major", "cancer-continuous-income", "short-waiting-period", "stroke-cardio-extra"],
    },
    {
      id: "parents-child-early-care",
      label: "👶 準父母 / 兒童早期危疾守護",
      icon: "👶",
      description: "懷孕期即可投保守護初生胎兒，全額承保自閉症、ADHD 等特有發育疾患及直系親屬豁免保費",
      tagIds: ["prenatal-baby-cover", "child-development-disorder", "family-care-protection", "early-stage-cis"],
      featureIds: ["prenatal-baby-cover", "child-development-disorder", "family-care-protection", "early-stage-cis"],
    },
    {
      id: "lifetime-dividend-savings",
      label: "💎 儲蓄分紅終身全包與良性病變預防",
      icon: "💎",
      description: "終身儲蓄分紅滾存財富，兼享良性腫瘤切除手術賠償、多重重大危疾及深切治療 (ICU) 全包",
      tagIds: ["savings-cash-value", "benign-tumor-surgery", "multi-claim-major", "icu-protection"],
      featureIds: ["savings-cash-value", "benign-tumor-surgery", "multi-claim-major", "icu-protection"],
    },
  ],

  // 7. 個人意外保險 (5 Presets)
  accident: [
    {
      id: "outdoor-sports",
      label: "⛷️ 戶外運動達人",
      icon: "⛷️",
      description: "熱愛滑雪、潛水、馬拉松及水上運動，配備骨折脫臼專項津貼、物理治療及全球緊急救援",
      tagIds: ["amateur-sports", "bone-fracture", "physio-chiropractor", "worldwide-emergency"],
      featureIds: ["amateur-sports", "bone-fracture", "physio-chiropractor", "worldwide-emergency"],
    },
    {
      id: "urban-commuter",
      label: "🚇 通勤族 / 白領防傷",
      icon: "🚇",
      description: "日常搭巴士搭地鐵，享公共交通雙倍賠償，跌倒扭傷睇中醫跌打及意外醫療門診全包",
      tagIds: ["double-indemnity", "chinese-bonesetter", "medical-reimburse", "burn-scar-cosmetic"],
      featureIds: ["double-indemnity", "chinese-bonesetter", "medical-reimburse", "burn-scar-cosmetic"],
    },
    {
      id: "senior-fall-care",
      label: "👴 長者跌倒骨傷防護",
      icon: "👴",
      description: "預防雨天滑倒骨折，涵蓋關節脫臼、家中看護輔助、輪椅助行器材及中醫骨傷針灸",
      tagIds: ["bone-fracture", "mobility-appliances", "family-extension", "chinese-bonesetter"],
      featureIds: ["bone-fracture", "mobility-appliances", "family-extension", "chinese-bonesetter"],
    },
    {
      id: "freelancer-income-shield",
      label: "💼 自由工作者日常保障",
      icon: "💼",
      description: "手停口停必備！重視每週暫時傷殘入息津貼、每日住院現金及意外醫療實報實銷",
      tagIds: ["weekly-income-benefit", "daily-hospital-cash", "medical-reimburse", "no-medical-exam"],
      featureIds: ["weekly-income-benefit", "daily-hospital-cash", "medical-reimburse", "no-medical-exam"],
    },
    {
      id: "trauma-reconstructive",
      label: "🩹 創傷修復與深度看護",
      icon: "🩹",
      description: "遭遇嚴重燒傷、面部創傷整容修復或永久傷殘分級賠償，提供復康輔助器材高額補助",
      tagIds: ["burn-scar-cosmetic", "accidental-disability", "medical-reimburse", "mobility-appliances"],
      featureIds: ["burn-scar-cosmetic", "accidental-disability", "medical-reimburse", "mobility-appliances"],
    },
  ],

  // 8. 人壽保險 (5 Presets)
  life: [
    {
      id: "young-family-pillar",
      label: "👨‍👩‍👧 家庭經濟支柱 (高額純定期)",
      icon: "👨‍👩‍👧",
      description: "以最低保費撬動千萬定期身故保障，包含末期疾病提前給付、意外雙倍賠償及非吸煙者特惠",
      tagIds: ["term-life", "terminal-illness", "double-accidental-death", "premium-waiver", "smoker-friendly"],
      featureIds: ["term-life", "terminal-illness", "double-accidental-death", "premium-waiver", "smoker-friendly"],
    },
    {
      id: "instant-no-exam",
      label: "⚡ 簡易免體檢極速投保",
      icon: "⚡",
      description: "全網上投保，幾分鐘免驗身極速出單，兼備保證續保及滿一年後自殺受保條款",
      tagIds: ["no-medical-exam", "term-life", "guaranteed-renewable", "suicide-clause"],
      featureIds: ["no-medical-exam", "term-life", "guaranteed-renewable", "suicide-clause"],
    },
    {
      id: "mortgage-shield",
      label: "🏢 房貸抵押保障 (供樓無憂)",
      icon: "🏢",
      description: "抵禦按揭供樓負債風險，人生買樓里程碑免體檢加保，並設末期疾病提前給付",
      tagIds: ["mortgage-protection", "term-life", "life-milestone-increase", "terminal-illness"],
      featureIds: ["mortgage-protection", "term-life", "life-milestone-increase", "terminal-illness"],
    },
    {
      id: "wealth-legacy",
      label: "💎 終身傳承與儲蓄分紅",
      icon: "💎",
      description: "累積保單現金價值與紅利，享保證免核保轉換終身壽險權益及即時恩恤應急撫恤金",
      tagIds: ["whole-life-savings", "conversion-privilege", "guaranteed-renewable", "compassionate-death"],
      featureIds: ["whole-life-savings", "conversion-privilege", "guaranteed-renewable", "compassionate-death"],
    },
    {
      id: "crisis-double-guard",
      label: "🛡️ 雙倍意外及末期重疾防線",
      icon: "🛡️",
      description: "意外身故雙倍賠償 (200%)，配合末期絕症預先給付與傷殘重疾每月入息生活補貼",
      tagIds: ["double-accidental-death", "terminal-illness", "income-support-benefit", "smoker-friendly"],
      featureIds: ["double-accidental-death", "terminal-illness", "income-support-benefit", "smoker-friendly"],
    },
  ],

  // 9. 汽車保險 (5 Presets)
  motor: [
    {
      id: "ev-pioneer",
      label: "⚡ 電動車 EV 先鋒",
      icon: "⚡",
      description: "Tesla 及電動車車主首選！專屬賠償電池損壞、充電樁/充電纜及24小時免費拖車",
      tagIds: ["ev-protection", "towing-service", "comp-insurance"],
      featureIds: ["ev-protection", "towing-service", "comp-insurance"],
    },
    {
      id: "luxury-zero-deprec",
      label: "🚘 靚車全保 / 原廠折舊豁免",
      icon: "🚘",
      description: "新車或歐洲高檔車，重視首年全損以新換舊 (New for Old)、維修零折舊及代步車",
      tagIds: ["new-car-replacement", "zero-depreciation", "courtesy-car", "comp-insurance"],
      featureIds: ["new-car-replacement", "zero-depreciation", "courtesy-car", "comp-insurance"],
    },
    {
      id: "budget-weekend",
      label: "🛡️ 假日司機 / 三保性價比之王",
      icon: "🛡️",
      description: "假日遊車河精明車主，鎖定最高 1 億第三者人身傷亡、財物損毀與免費拖車",
      tagIds: ["third-party-only", "towing-service", "windscreen-cover"],
      featureIds: ["third-party-only", "towing-service", "windscreen-cover"],
    },
    {
      id: "family-commuter",
      label: "👨‍👩‍👧 家庭代步車 / 司機乘客全保",
      icon: "👨‍👩‍👧",
      description: "接送小朋友與家人，特設司機及乘客個人意外傷亡、醫療費用及 NCD 守護",
      tagIds: ["personal-accident-driver", "medical-expenses", "ncd-protection"],
      featureIds: ["personal-accident-driver", "medical-expenses", "ncd-protection"],
    },
    {
      id: "cross-border-drive",
      label: "🛣️ 港車北上 / 粵港跨境自駕",
      icon: "🛣️",
      description: "自駕前往大灣區必備，涵蓋「等效先認」港粵通跨境車險、無過失追討及全保",
      tagIds: ["cross-border-gba", "claims-recovery", "comp-insurance"],
      featureIds: ["cross-border-gba", "claims-recovery", "comp-insurance"],
    },
  ],

  // 10. 家傭保險 (5 Presets)
  "domestic-helper": [
    {
      id: "new-helper-full",
      label: "✈️ 新聘菲印傭全方位保障",
      icon: "✈️",
      description: "初到港適應期必備！防外傭失蹤、補聘津貼、免費更換外傭手續登記、臨床門診及送返原居地",
      tagIds: ["statutory-ec", "re-hiring-expenses", "free-replacement-name", "clinical-outpatient", "repatriation-service"],
      featureIds: ["statutory-ec", "re-hiring-expenses", "free-replacement-name", "clinical-outpatient", "repatriation-service"],
    },
    {
      id: "anti-fraud-loan",
      label: "🛡️ 防詐騙 / 借貸誠信保障",
      icon: "🛡️",
      description: "防外傭偷竊挪用、財務公司借貸追債更換大門門鎖、補聘及免費更改保單",
      tagIds: ["helper-fraud-theft", "anti-loan-locksmith", "re-hiring-expenses", "free-replacement-name"],
      featureIds: ["helper-fraud-theft", "anti-loan-locksmith", "re-hiring-expenses", "free-replacement-name"],
    },
    {
      id: "critical-illness-surgery",
      label: "🏥 外傭大病住院手術無憂",
      icon: "🏥",
      description: "防範外傭患癌、盲腸炎手術巨額私家醫療費，含外科手術全包、癌症心意金、遣送及替工津貼",
      tagIds: ["medical-surgery", "critical-illness-helper", "repatriation-service", "service-interruption"],
      featureIds: ["medical-surgery", "critical-illness-helper", "repatriation-service", "service-interruption"],
    },
    {
      id: "practical-basic",
      label: "💰 性價比實用基礎方案",
      icon: "💰",
      description: "滿足法定僱員補償 1 億要求，兼備外傭休假意外、牙科急症護理及中醫跌打骨傷門診",
      tagIds: ["statutory-ec", "rest-day-accident", "dental-care", "clinical-bonesetter"],
      featureIds: ["statutory-ec", "rest-day-accident", "dental-care", "clinical-bonesetter"],
    },
    {
      id: "family-guard-infant-elderly",
      label: "👶 幼兒與長者家庭守護",
      icon: "👶",
      description: "照顧初生嬰兒或患病老人家，防虐待與疏忽、包含家庭成員受虐創傷輔導及臨床門診",
      tagIds: ["family-abuse-protection", "helper-fraud-theft", "clinical-outpatient", "service-interruption"],
      featureIds: ["family-abuse-protection", "helper-fraud-theft", "clinical-outpatient", "service-interruption"],
    },
  ],

  // 11. 寵物保險 (5 Presets)
  pet: [
    {
      id: "active-dog",
      label: "🐕 活潑狗狗社交王 (第三者責任+免晶片)",
      icon: "🐕",
      description: "針對出街活潑熱情的狗狗，重點對準第三者咬傷公眾責任，支援免晶片投保",
      tagIds: ["third-party-dog", "microchip-free", "vet-consultation"],
      featureIds: ["third-party-dog", "microchip-free", "vet-consultation"],
    },
    {
      id: "indoor-cat",
      label: "🐈 室內貓咪健康守護 (慢性病+門診)",
      icon: "🐈",
      description: "專為純室內貓咪設計，重視門診診金、處方藥物、慢性病護理及免晶片",
      tagIds: ["vet-consultation", "chronic-care", "microchip-free"],
      featureIds: ["vet-consultation", "chronic-care", "microchip-free"],
    },
    {
      id: "surgery-all-in",
      label: "🏥 純醫療全包手術狂 (手術+造影+癌症)",
      icon: "🏥",
      description: "醫療開支最怕開刀！鎖定外科手術麻醉、CT/MRI 先進造影及癌症化療",
      tagIds: ["surgery-anesthesia", "advanced-imaging", "cancer-chemo"],
      featureIds: ["surgery-anesthesia", "advanced-imaging", "cancer-chemo"],
    },
    {
      id: "senior-pet-farewell",
      label: "👴 樂齡毛孩尊嚴守護 (遺傳病+癌症+善終)",
      icon: "👴",
      description: "守護高齡老狗老貓，重視癌症化療專項、品種遺傳病及尊嚴善終火化津貼",
      tagIds: ["cancer-chemo", "hereditary-disease", "bereavement-funeral"],
      featureIds: ["cancer-chemo", "hereditary-disease", "bereavement-funeral"],
    },
    {
      id: "lost-pet-care",
      label: "🔍 走失尋寵安心防護 (尋寵廣告+寄宿)",
      icon: "🔍",
      description: "常去戶外怕驚慌逃逸？提供走失尋寵宣傳廣告賞金及主人住院時寵物寄宿",
      tagIds: ["lost-pet-advertising", "emergency-boarding", "third-party-dog"],
      featureIds: ["lost-pet-advertising", "emergency-boarding", "third-party-dog"],
    },
  ],
};

/** 相容舊版 Scenario Presets 常數名稱 */
export const CATEGORY_SCENARIO_PRESETS: Record<string, ScenarioPreset[]> = CATEGORY_PERSONA_PRESETS;

/** 獲取指定類別的專屬特點標籤清單 */
export function getCategoryFeatureTags(categoryId: string): FeatureFilterTag[] {
  return CATEGORY_FEATURE_TAGS[categoryId] || [];
}

/** 獲取指定類別的熱門投保人 Persona 預設 (Persona Presets) */
export function getCategoryPersonaPresets(categoryId: string): PersonaPreset[] {
  return CATEGORY_PERSONA_PRESETS[categoryId] || [];
}

/** 獲取指定類別的專屬情境快捷 Preset（相容舊版別名） */
export function getCategoryScenarioPresets(categoryId: string): ScenarioPreset[] {
  return getCategoryPersonaPresets(categoryId);
}

/** 檢測單一產品是否命中指定特點標籤 */
export function matchSingleFeature(product: Product, tag: FeatureFilterTag): { matched: boolean; matchedKeyword?: string } {
  const coverages = product.coverage ?? [];
  const keyTerms = product.key_terms ?? [];
  const planTiers = product.plan_tiers ?? [];

  for (const kw of tag.keywords) {
    const kwLower = kw.toLowerCase();

    // 1. 比對 coverage
    for (const c of coverages) {
      if (
        c.item.toLowerCase().includes(kwLower) ||
        (c.limit && c.limit.toLowerCase().includes(kwLower))
      ) {
        return { matched: true, matchedKeyword: kw };
      }
    }

    // 2. 比對 key_terms
    for (const term of keyTerms) {
      if (term.toLowerCase().includes(kwLower)) {
        return { matched: true, matchedKeyword: kw };
      }
    }

    // 3. 比對 plan_tiers
    for (const tier of planTiers) {
      if (tier.toLowerCase().includes(kwLower)) {
        return { matched: true, matchedKeyword: kw };
      }
    }
  }

  return { matched: false };
}

/** 計算產品對於一組選定特點標籤的契合度評分 (Match Score) */
export function checkProductMatch(
  product: Product,
  selectedTagIds: string[],
  categoryId: string
): FeatureMatchResult {
  const allTags = getCategoryFeatureTags(categoryId);
  const relevantTags = allTags.filter((t) => selectedTagIds.includes(t.id));

  if (relevantTags.length === 0) {
    return {
      score: 100,
      matchedCount: 0,
      totalSelected: 0,
      matchedTags: [],
      missingTags: [],
      matchRatio: 1,
      matchedKeywords: [],
    };
  }

  const matchedTags: FeatureFilterTag[] = [];
  const missingTags: FeatureFilterTag[] = [];
  const matchedKeywords: string[] = [];

  for (const tag of relevantTags) {
    const res = matchSingleFeature(product, tag);
    if (res.matched) {
      matchedTags.push(tag);
      if (res.matchedKeyword) matchedKeywords.push(res.matchedKeyword);
    } else {
      missingTags.push(tag);
    }
  }

  const matchedCount = matchedTags.length;
  const totalSelected = relevantTags.length;
  const matchRatio = matchedCount / totalSelected;
  const score = Math.round(matchRatio * 100);

  return {
    score,
    matchedCount,
    totalSelected,
    matchedTags,
    missingTags,
    matchRatio,
    matchedKeywords,
  };
}

export type FeatureMatchMode = "smart" | "strict";

export interface RankedProductResult {
  product: Product;
  match: FeatureMatchResult;
}

/**
 * 核心篩選與智能排序引擎：
 * 1. smart 模式（預設）：
 *    - 命中 >= 1 項即入圍！
 *    - 依命中項目數量降序排列（3/3 > 2/3 > 1/3），最符合用戶心水的保險永遠排最前。
 *    - 若市場上完全無任何產品中任何一項（極端情況），則安全返回所有產品並標記 fallback。
 * 2. strict 模式：
 *    - 要求 100% 滿足全部選中條件。
 *    - 若 100% 滿足的結果為 0，則自動激活 fallbackTriggered，並退回到命中數最多的產品推薦，絕不讓用戶面對空白屏！
 */
export function filterAndRankProductsByFeatures(
  products: Product[],
  selectedTagIds: string[],
  categoryId: string,
  mode: FeatureMatchMode = "smart"
): {
  results: RankedProductResult[];
  exactMatchCount: number;
  fallbackTriggered: boolean;
  totalSelected: number;
} {
  const allTags = getCategoryFeatureTags(categoryId);
  const validTagIds = selectedTagIds.filter((id) => allTags.some((t) => t.id === id));

  if (validTagIds.length === 0) {
    return {
      results: products.map((product) => ({
        product,
        match: {
          score: 100,
          matchedCount: 0,
          totalSelected: 0,
          matchedTags: [],
          missingTags: [],
          matchRatio: 1,
          matchedKeywords: [],
        },
      })),
      exactMatchCount: products.length,
      fallbackTriggered: false,
      totalSelected: 0,
    };
  }

  const scoredList: RankedProductResult[] = products.map((product) => ({
    product,
    match: checkProductMatch(product, validTagIds, categoryId),
  }));

  const exactMatches = scoredList.filter(
    (item) => item.match.matchedCount === validTagIds.length
  );
  const exactMatchCount = exactMatches.length;

  if (mode === "strict") {
    if (exactMatchCount > 0) {
      return {
        results: exactMatches,
        exactMatchCount,
        fallbackTriggered: false,
        totalSelected: validTagIds.length,
      };
    }

    // 嚴格模式下若 0 結果：自動啟動智能 Fallback（展示至少命中 1 項的產品，依命中數排序）
    const partialMatches = scoredList
      .filter((item) => item.match.matchedCount > 0)
      .sort((a, b) => b.match.matchedCount - a.match.matchedCount || b.match.score - a.match.score);

    return {
      results: partialMatches.length > 0 ? partialMatches : scoredList,
      exactMatchCount: 0,
      fallbackTriggered: true,
      totalSelected: validTagIds.length,
    };
  }

  // Smart 模式：入選所有 matchedCount > 0 的產品，並按 matchedCount DESC 排序
  const smartMatches = scoredList
    .filter((item) => item.match.matchedCount > 0)
    .sort((a, b) => {
      // 1. 命中數量多優先
      if (b.match.matchedCount !== a.match.matchedCount) {
        return b.match.matchedCount - a.match.matchedCount;
      }
      // 2. 有公開保費優先
      const aPrem = a.product.premium_available ? 1 : 0;
      const bPrem = b.product.premium_available ? 1 : 0;
      if (bPrem !== aPrem) {
        return bPrem - aPrem;
      }
      return 0;
    });

  if (smartMatches.length === 0) {
    // 極端情況：無一命中，返回全部
    return {
      results: scoredList,
      exactMatchCount: 0,
      fallbackTriggered: true,
      totalSelected: validTagIds.length,
    };
  }

  return {
    results: smartMatches,
    exactMatchCount,
    fallbackTriggered: false,
    totalSelected: validTagIds.length,
  };
}
