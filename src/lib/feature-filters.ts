import type { Product } from "../types/insurance";

export interface FeatureFilterTag {
  id: string;
  label: string;
  keywords: string[];
}

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
  // 1. 旅遊保險：專注旅遊專項保障
  travel: [
    {
      id: "full-cover",
      label: "零自負額 / 全數賠償",
      keywords: ["全數賠償", "全額賠償", "不設自負額", "無自負額", "零自負額", "0自負額", "全額支付", "不設分項", "實報實銷"],
    },
    {
      id: "emergency-evac",
      label: "緊急醫療運送無上限",
      keywords: ["緊急醫療運送", "緊急運送", "救援及運送", "遺體送返", "遺體運返", "專機運送", "救援網絡", "海外緊急援助"],
    },
    {
      id: "sports-cover",
      label: "滑雪 / 潛水等業餘運動",
      keywords: ["業餘運動", "滑雪", "潛水", "業餘消閒運動", "消閒運動", "水上運動", "冬季運動", "高空彈跳", "熱氣球", "運動保障"],
    },
    {
      id: "rental-car",
      label: "租車自負額保障",
      keywords: ["租車", "自駕遊", "自負額", "Rental Vehicle Excess", "海外租車", "私家車或露營車"],
    },
    {
      id: "mobile-laptop",
      label: "手提電話 / 電腦設備",
      keywords: ["手提電話", "流動設備", "平板電腦", "電腦", "手機", "手提電腦", "被盜"],
    },
    {
      id: "trip-cancel-cfar",
      label: "取消行程 / 任何原因取消",
      keywords: ["取消旅程", "取消行程", "CFUR", "CFAR", "取消或縮短", "旅程取消", "不可預見私事取消", "行程更改"],
    },
    {
      id: "flight-delay",
      label: "航班延誤現金津貼",
      keywords: ["旅程延誤", "航班延誤", "延誤現金", "延誤津貼", "行程延誤", "每滿6小時", "延誤6小時"],
    },
    {
      id: "senior-friendly",
      label: "長者受保額不縮水",
      keywords: ["不設年齡上限", "受保年齡", "長者", "70歲以上", "75歲", "80歲", "85歲", "不縮水", "年長受保人"],
    },
    {
      id: "revisit-chinese-med",
      label: "回港覆診含中醫跌打",
      keywords: ["覆診", "回港後", "中醫", "跌打", "針灸", "回港覆診"],
    },
    {
      id: "personal-liability",
      label: "個人第三者責任",
      keywords: ["個人責任", "第三者責任", "第三者法律責任", "法律責任", "訴訟費用"],
    },
    {
      id: "cruise-cover",
      label: "郵輪假期保障",
      keywords: ["郵輪", "郵輪假期", "遊輪", "岸上觀光", "泊岸延誤"],
    },
  ],

  // 2. 自願醫保（常規醫療）：保留全數賠償、出院免找數、洗腎、癌症等
  medical: [
    {
      id: "full-cover",
      label: "全數賠償",
      keywords: ["全數賠償", "全額賠償", "全額支付", "100%實報實銷", "不設細項", "實報實銷"],
    },
    {
      id: "cashless",
      label: "出院免找數",
      keywords: ["免找數", "直付", "醫療網絡直付", "預先批核免找數", "全球出院免找數"],
    },
    {
      id: "renewal",
      label: "保證續保至100歲",
      keywords: ["保證續保", "續保至 100", "保證續保至", "終身續保"],
    },
    {
      id: "no-sublimit",
      label: "無細項分項上限",
      keywords: ["不設細項", "無細項", "全額賠償", "全數賠償", "不設分項"],
    },
    {
      id: "day-surgery",
      label: "日間手術保障",
      keywords: ["日間手術", "門診手術", "日間醫療", "日間手術現金保障"],
    },
    {
      id: "advanced-imaging",
      label: "先進造影 (CT/MRI)",
      keywords: ["CT", "MRI", "PET", "診斷成像", "訂明診斷成像", "先進診斷"],
    },
    {
      id: "cancer-treatment",
      label: "癌症標靶 / 非手術化療",
      keywords: ["標靶", "化療", "非手術癌症", "癌症藥物", "免疫治療", "質子治療"],
    },
    {
      id: "dialysis",
      label: "門診洗腎",
      keywords: ["洗腎", "透析", "血液透析", "腹膜透析", "門診透析"],
    },
    {
      id: "psychiatric",
      label: "精神科治療",
      keywords: ["精神科", "精神科治療", "精神科住院"],
    },
    {
      id: "companion-bed",
      label: "親屬陪床費",
      keywords: ["陪床", "親屬陪床", "家長陪床"],
    },
    {
      id: "shortfall",
      label: "公司醫保銜接 (SMM)",
      keywords: ["Shortfall", "差額補償", "差額填補", "SMM", "附加醫療", "差額"],
    },
    {
      id: "conversion",
      label: "免核保轉保權",
      keywords: ["保證轉保", "免核保轉保", "免核保", "轉保權", "離職轉保"],
    },
    {
      id: "bonesetter-chiro",
      label: "中醫跌打骨傷",
      keywords: ["跌打", "中醫", "骨傷", "針灸", "物理治療"],
    },
    {
      id: "compassionate-death",
      label: "恩恤身故賠償",
      keywords: ["恩恤身故", "身故賠償", "恩恤賠償", "身故津貼"],
    },
  ],

  // 3. 高端醫療：全數賠償、全球直付、私家病房、千萬保額
  "high-end-medical": [
    {
      id: "full-cover",
      label: "主要醫療全數賠償",
      keywords: ["全數賠償", "全額賠償", "全額支付", "100%實報實銷", "不設細項"],
    },
    {
      id: "cashless",
      label: "全球出院免找數",
      keywords: ["免找數", "直付", "醫療網絡直付", "預先批核免找數", "全球出院免找數"],
    },
    {
      id: "private-room",
      label: "標準私家房保障",
      keywords: ["標準私家房", "私家房", "單人房", "尊貴病房"],
    },
    {
      id: "no-sublimit",
      label: "不設細項上限",
      keywords: ["不設細項", "無細項", "全額賠償", "全數賠償", "無分項限額"],
    },
    {
      id: "cancer-treatment",
      label: "頂級癌症標靶/免疫治療",
      keywords: ["標靶", "化療", "非手術癌症", "癌症藥物", "免疫治療", "質子治療", "臨床試驗"],
    },
    {
      id: "dialysis",
      label: "門診透析洗腎全數賠償",
      keywords: ["洗腎", "透析", "血液透析", "腹膜透析", "門診透析"],
    },
    {
      id: "advanced-imaging",
      label: "先進造影零共同保險",
      keywords: ["CT", "MRI", "PET", "診斷成像", "訂明診斷成像", "0%共同保險", "免自負"],
    },
    {
      id: "organ-transplant",
      label: "器官移植全數賠償",
      keywords: ["器官移植", "活體器官", "移植手術"],
    },
    {
      id: "companion-bed",
      label: "親屬陪床費全額",
      keywords: ["陪床", "親屬陪床", "家長陪床"],
    },
    {
      id: "post-hosp-rehab",
      label: "出院後復康護理",
      keywords: ["康復護理", "居家護士", "出院後護理", "物理治療"],
    },
  ],

  // 4. Top-up 差額醫療：打工仔公司醫保銜接
  "top-up-medical": [
    {
      id: "full-cover",
      label: "超額開支全額填補",
      keywords: ["全數賠償", "全額賠償", "差額填補", "超額賠償", "100%實報實銷"],
    },
    {
      id: "shortfall",
      label: "銜接團體醫保 (SMM)",
      keywords: ["Shortfall", "差額補償", "差額填補", "SMM", "附加醫療", "差額"],
    },
    {
      id: "conversion",
      label: "退休/離職免核保轉保權",
      keywords: ["保證轉保", "免核保轉保", "免核保", "轉保權", "離職轉保", "保證轉換"],
    },
    {
      id: "deductible-flex",
      label: "自負額彈性選擇",
      keywords: ["自負額", "免賠額", "自付額", "自付費"],
    },
    {
      id: "cashless",
      label: "網絡出院免找數",
      keywords: ["免找數", "直付", "醫療網絡直付", "預先批核"],
    },
    {
      id: "day-surgery",
      label: "日間手術全數保障",
      keywords: ["日間手術", "門診手術", "日間醫療"],
    },
  ],

  // 5. 家居保險
  home: [
    {
      id: "tenant-plan",
      label: "租客專屬財物保障",
      keywords: ["租客", "租戶", "租住", "Tenant", "租客責任", "租客專用", "租客法例責任", "室內裝修租客", "承租人"],
    },
    {
      id: "owner-occupier",
      label: "自住業主全包方案",
      keywords: ["自住", "自住業主", "業主自住", "家居財物", "家庭財產", "室內傢俬", "室內電器", "全包方案"],
    },
    {
      id: "landlord-protection",
      label: "放租業主租金追討及凶宅責任",
      keywords: ["放租", "業主放租", "放租業主", "未付租金", "租金損失", "租金追討", "凶宅", "租客拖欠", "租金保障", "出租物業"],
    },
    {
      id: "building-third-party",
      label: "大廈外牆及公眾第三者責任",
      keywords: ["大廈外牆", "公共地方", "第三者責任", "業主責任", "公眾責任", "公眾法律責任", "大廈公用地方", "法團責任", "冷氣機滴水"],
    },
    {
      id: "locksmith-emergency",
      label: "24小時緊急開鎖換鎖及水喉急修",
      keywords: ["換鎖", "開鎖", "鎖匠", "水喉急修", "爆水喉急修", "緊急門鎖", "緊急家居支援", "24小時急修", "電工急修", "緊急維修"],
    },
    {
      id: "temp-accommodation",
      label: "不能居住時酒店住宿津貼",
      keywords: ["臨時住宿", "不能居住", "另覓居所", "酒店住宿津貼", "另覓住所", "臨時居所", "庇護住宿", "租金及住宿津貼"],
    },
    {
      id: "home-contents-high",
      label: "貴重珠寶/藝術品獨立高額限額",
      keywords: ["貴重物品", "貴重財物", "珠寶", "首飾", "金飾", "手錶", "藝術品", "收藏品", "單件上限", "貴重物品高額"],
    },
    {
      id: "water-leakage",
      label: "室內爆水喉及滲水財物損害",
      keywords: ["滲水", "爆水喉", "漏水", "水浸", "水管爆裂", "水損", "颱風雨水滲漏", "內部水管", "水浸及滲水", "水喉爆裂"],
    },
    {
      id: "helper-belongings",
      label: "外籍家傭個人財物受保",
      keywords: ["外傭財物", "家傭財物", "家庭傭工財物", "家傭個人物品", "外傭意外"],
    },
    {
      id: "new-for-old",
      label: "以新代舊全額重置賠償",
      keywords: ["以新代舊", "全數重置", "重新購置", "重置賠償", "以新換舊", "重置價值", "全新重置"],
    },
  ],

  // 6. 危疾保險
  "critical-illness": [
    {
      id: "multi-claim",
      label: "癌症/心臟/中風多重賠償",
      keywords: ["多重賠償", "多次賠償", "多重保障", "多次索償", "癌症多重", "多重心血管", "延伸保障", "持續賠償", "多達10次", "多達5次", "多達6次", "多達4次", "多達3次", "多次危疾"],
    },
    {
      id: "early-stage",
      label: "早期及非嚴重疾病涵蓋",
      keywords: ["早期", "早期危疾", "原位癌", "非嚴重", "早期甲狀腺", "早期前列腺", "微創手術", "通波仔", "早期疾病", "早期病況"],
    },
    {
      id: "premium-waiver",
      label: "確診後豁免後續保費",
      keywords: ["豁免保費", "保費豁免", "免繳保費", "保費免繳", "豁免後續", "毋須再繳付保費", "豁免繳交", "保費豁免保障"],
    },
    {
      id: "benign-tumor",
      label: "未確立為惡性之良性腫瘤切除",
      keywords: ["良性腫瘤", "良性病變", "未確立為惡性", "預防性切除", "良性情況", "切除手術", "腫瘤切除", "良性乳房", "良性結節"],
    },
    {
      id: "special-disease",
      label: "兒童嚴重疾病/精神疾病保障",
      keywords: ["兒童", "兒童疾病", "自閉症", "注意力不足", "妥瑞症", "抑鬱症", "精神疾病", "深切治療", "ICU", "嚴重兒童疾病", "智力受損", "發展障礙"],
    },
    {
      id: "full-cover-reimburse",
      label: "100% 筆筆賠 / 額外津貼",
      keywords: ["100%", "一筆過", "筆筆賠", "額外津貼", "特別津貼", "全數", "獨立保額", "每次100%", "入息津貼", "生活津貼", "額外保障"],
    },
    {
      id: "no-waiting-period",
      label: "癌症持續/擴散復發無縫銜接",
      keywords: ["等候期", "癌症等候期", "3年等候期", "1年等候期", "持續", "擴散", "復發", "癌症持續", "癌症復發", "新發癌症", "縮短等候期"],
    },
    {
      id: "family-care",
      label: "直系親屬額外恩恤保障",
      keywords: ["恩恤", "直系親屬", "父母", "子女", "家屬", "親屬", "額外恩恤", "身故賠償", "親情保障", "配偶身故", "父母身故", "恩恤保障"],
    },
  ],

  // 7. 個人意外保險
  accident: [
    {
      id: "amateur-sports",
      label: "滑雪/潛水/業餘運動受保",
      keywords: ["業餘運動", "滑雪", "潛水", "業餘消閒", "高空彈跳", "馬拉松", "消閒運動", "水上運動", "危險運動", "休閒運動", "冬季運動", "無休閒運動除外"],
    },
    {
      id: "medical-reimburse",
      label: "意外醫療開支實報實銷",
      keywords: ["意外醫療", "醫療費用", "實報實銷", "急症", "門診醫療", "醫療保障", "門診及手術"],
    },
    {
      id: "bone-fracture",
      label: "骨折/脫臼專項津貼",
      keywords: ["骨折", "脫臼", "斷骨", "完全骨折", "不完全骨折", "骨裂", "重大燒傷", "燒傷", "嚴重燒傷"],
    },
    {
      id: "accidental-disability",
      label: "永久傷殘最高 100-150% 賠償",
      keywords: ["永久傷殘", "完全殘廢", "永久完全傷殘", "喪失肢體", "失明", "雙目失明", "100%", "150%", "斷肢", "完全及永久"],
    },
    {
      id: "chinese-bonesetter",
      label: "中醫跌打針灸覆診保障",
      keywords: ["跌打", "中醫", "針灸", "中醫治療", "骨傷", "草藥", "中醫師", "骨傷科"],
    },
    {
      id: "worldwide-cover",
      label: "全球 24 小時個人意外保障",
      keywords: ["全球", "24小時", "世界各地", "任何地方", "環球", "全球保障", "24 小時"],
    },
    {
      id: "daily-hospital-cash",
      label: "意外住院每日現金津貼",
      keywords: ["住院現金", "每日津貼", "每日現金", "住院入息", "每日住院", "住院入息保障", "每日HK$"],
    },
    {
      id: "physio-chiropractor",
      label: "物理治療/脊醫專項保障",
      keywords: ["物理治療", "脊醫", "脊椎治療", "物理治療師", "職業治療", "專職醫療"],
    },
  ],

  // 8. 人壽保險
  life: [
    {
      id: "term-life",
      label: "定期壽險 (Term Life)",
      keywords: ["定期壽險", "定期保險", "定期人壽", "Term Life", "自主保", "純人壽", "一年定期", "五年定期", "每年續保", "5年期", "10年期", "20年期", "純保障"],
    },
    {
      id: "whole-life",
      label: "終身壽險 / 儲蓄人壽",
      keywords: ["終身壽險", "終身保險計劃", "終身人壽", "Whole Life", "終身壽險保障"],
    },
    {
      id: "no-medical-exam",
      label: "免驗身 / 簡易核保",
      keywords: ["免驗身", "免體檢", "免核保", "簡易核保", "毋須體檢", "免身體檢查", "網上核保", "簡易健康申報", "毋須健康申報", "不需體檢"],
    },
    {
      id: "terminal-illness",
      label: "末期疾病提前給付",
      keywords: ["末期疾病", "提前給付", "預先給付", "末期絕症", "末期保障", "預支身故賠償", "預先支付", "提前支付"],
    },
    {
      id: "guaranteed-renewable",
      label: "保證續保至85/100歲",
      keywords: ["保證續保", "續保至", "可續保至", "終身續保", "保證可續保", "100歲", "85歲", "99歲", "續保年齡"],
    },
    {
      id: "smoker-friendly",
      label: "非吸煙者保費特惠",
      keywords: ["非吸煙", "非吸煙者", "優越非吸煙", "標準非吸煙", "吸煙與非吸煙", "健康折扣", "非吸煙特惠", "Non-smoker", "優待費率"],
    },
    {
      id: "accidental-death",
      label: "雙倍 / 額外意外身故賠償",
      keywords: ["意外身故", "雙倍賠償", "額外賠償", "意外保障", "交通意外身故", "公共交通意外身故", "額外身故", "雙倍身故"],
    },
    {
      id: "conversion-privilege",
      label: "保證免核保轉換終身權",
      keywords: ["轉換權益", "轉換權", "免核保轉換", "保證轉換", "轉為終身", "轉換為終身", "可轉換", "Conversion", "轉換為終身保險"],
    },
    {
      id: "cash-value",
      label: "保單現金價值 / 紅利",
      keywords: ["保證現金價值", "現金價值累積", "派發紅利", "儲蓄分紅", "退保價值", "期滿利益", "週年紅利", "終期紅利"],
    },
    {
      id: "suicide-clause",
      label: "首年後自殺涵蓋條款",
      keywords: ["自殺", "自殺條款", "一年後自殺", "首年不保自殺", "13個月", "一年內自殺", "滿1年後自殺", "自殺受保"],
    },
  ],

  // 9. 汽車保險
  motor: [
    {
      id: "comp-insurance",
      label: "綜合全保 (Comprehensive)",
      keywords: ["綜合全保", "綜合保險", "綜合汽車", "全保", "Comprehensive", "私家車綜合", "自身汽車損毀", "車身損毀", "碰撞損毀", "自身汽車損失"],
    },
    {
      id: "third-party-only",
      label: "第三者責任保險 (TP Only)",
      keywords: ["第三者責任", "第三者保險", "三保", "Third Party", "第三者人身傷亡", "第三者財產損毀", "第三者責任保險", "第三者死亡"],
    },
    {
      id: "ncd-protection",
      label: "無索償折扣 (NCD) 保護",
      keywords: ["NCD", "無索償折扣", "無索償保證", "NCD保護", "維持折扣", "No Claim Discount", "無賠償折扣", "NCD 守護"],
    },
    {
      id: "windscreen-cover",
      label: "擋風玻璃獨立免自負額賠償",
      keywords: ["擋風玻璃", "車窗玻璃", "玻璃維修", "免自負額", "免墊底", "車窗破損", "擋風玻璃保障", "擋風玻璃免墊底", "玻璃修理"],
    },
    {
      id: "towing-service",
      label: "24小時免費路面緊急拖車支援",
      keywords: ["拖車", "道路救援", "緊急拖車", "路邊支援", "24小時免費拖車", "搭橋搭電", "爆胎換軚", "路面緊急", "免費拖車", "緊急路邊支援"],
    },
    {
      id: "new-car-replacement",
      label: "新車首年全損換新車保障",
      keywords: ["新車換新", "新車全損", "以新代舊", "車輛替換", "新車賠償", "同廠全新", "全新車", "新車替換", "以新換舊", "新車首12個月"],
    },
    {
      id: "personal-accident-driver",
      label: "司機及乘客個人意外保障",
      keywords: ["個人意外", "司機意外", "司機及乘客", "受保駕駛者", "人身意外保障", "交通意外身故", "駕駛者個人意外", "駕駛者及乘客醫療", "司機意外傷殘"],
    },
    {
      id: "named-driver-discount",
      label: "指定駕駛者保費折扣及自負額優惠",
      keywords: ["指定駕駛者", "記名司機", "指定司機", "記名駕駛者", "非指定駕駛者自負額", "非記名司機", "指定駕駛人", "駕駛者自負額", "名列司機"],
    },
    {
      id: "ev-protection",
      label: "電動車電池及充電器專屬保障",
      keywords: ["電動車", "EV", "充電器", "充電纜", "電池損壞", "家用充電設備", "充電樁", "電動車電池"],
    },
    {
      id: "zero-depreciation",
      label: "零件更換零折舊率修理",
      keywords: ["零折舊", "不設折舊", "折舊率豁免", "全新零件", "無折舊", "「零」折舊率修理", "豁免折舊"],
    },
  ],

  // 10. 家傭保險
  "domestic-helper": [
    {
      id: "medical-surgery",
      label: "外傭住院及手術醫療費用全包",
      keywords: ["住院及手術", "外科手術", "住院費用", "嚴重疾病住院", "手術及住院", "住院醫療", "大手術", "外科手術及住院"],
    },
    {
      id: "outpatient-dental",
      label: "門診網絡及牙科保健津貼",
      keywords: ["門診費用", "牙科費用", "牙醫費用", "門診網絡", "診症費", "牙科", "西醫網絡", "牙齒護理", "診療費用", "拔牙"],
    },
    {
      id: "helper-fraud",
      label: "外傭欺詐/擅自挪用財物誠實保障",
      keywords: ["誠信保障", "誠實保障", "忠誠保障", "欺詐", "盜竊", "挪用財物", "擅自挪用", "金錢損失", "家傭誠信", "不誠實行為", "家傭借貸"],
    },
    {
      id: "re-hiring-expenses",
      label: "外傭失蹤/中途解約補聘津貼",
      keywords: ["補聘", "重新招聘", "重聘費用", "更換家傭", "遣送後補聘", "失蹤補聘", "不辭而別", "補聘家傭費用", "提早解約補聘", "補聘津貼"],
    },
    {
      id: "critical-illness-helper",
      label: "外傭嚴重疾病癌症一次性心意金",
      keywords: ["癌症", "心臟病", "心意金", "嚴重疾病", "危疾保障", "重大疾病", "癌症及心臟病", "外傭癌症", "心臟病保障", "嚴重疾病住院"],
    },
    {
      id: "repatriation-service",
      label: "外傭身故遺體送返原居地保障",
      keywords: ["送返", "遣返", "遺體送返", "遺體運返", "遺體運送", "醫療遣返", "醫療送返", "遣返 / 送返費用", "運送遺體"],
    },
    {
      id: "personal-liability-helper",
      label: "外傭疏忽致第三者傷亡責任",
      keywords: ["第三者責任", "家傭責任", "個人責任", "外傭疏忽", "外傭第三者", "家傭法律責任", "家傭公眾責任"],
    },
    {
      id: "statutory-ec",
      label: "法定僱員補償 1 億責任保障",
      keywords: ["僱員補償", "100,000,000", "1億", "僱主法定責任", "勞工保險", "勞保", "僱主責任", "僱主法律責任"],
    },
    {
      id: "clinical-bonesetter",
      label: "跌打中醫及物理治療保障",
      keywords: ["中醫", "跌打", "針灸", "骨傷", "物理治療", "中醫跌打"],
    },
    {
      id: "service-interruption",
      label: "服務中斷每日現金津貼",
      keywords: ["服務中斷", "中斷服務", "臨時工津貼", "病假津貼", "住院津貼", "中斷服務現金津貼", "中斷服務津貼"],
    },
  ],

  // 11. 寵物保險
  pet: [
    {
      id: "vet-consultation",
      label: "註冊獸醫門診及處方藥物實報實銷",
      keywords: ["門診", "獸醫診金", "診症費", "處方藥物", "診斷測試", "診所診症", "X光及超聲波", "普通科及專科診金", "門診費用", "獸醫診治"],
    },
    {
      id: "surgery-anesthesia",
      label: "手術、全身麻醉及住院開支",
      keywords: ["手術", "麻醉", "手術室", "過夜住院", "住院開支", "手術後住房", "外科手術", "手術保障", "住院費用"],
    },
    {
      id: "third-party-dog",
      label: "寵物襲擊/咬傷第三者公眾責任",
      keywords: ["第三者責任", "公眾責任", "法律責任", "咬傷", "寵物襲擊", "第三者身體傷亡", "第三者法律責任", "第三者財物損毀"],
    },
    {
      id: "cancer-chronic",
      label: "寵物癌症化療及慢性病持續護理",
      keywords: ["癌症", "化療", "慢性病", "慢性疾病", "放療", "腎衰竭", "持續護理", "免疫治療", "化療保障", "終生慢性疾病"],
    },
    {
      id: "dental-cover",
      label: "牙科治療及非例行洗牙保障",
      keywords: ["牙科", "洗牙", "牙齒治療", "非例行洗牙", "牙齦", "口腔手術", "牙科費用", "牙科護理", "牙科治療"],
    },
    {
      id: "hereditary-disease",
      label: "特定品種遺傳性疾病受保",
      keywords: ["遺傳", "先天性", "品種遺傳", "髖關節發育不良", "髕骨脫臼", "膝蓋骨", "青光眼", "遺傳及先天性疾病", "特定遺傳病"],
    },
    {
      id: "microchip-free",
      label: "全品種狗隻/貓隻免植晶片投保",
      keywords: ["免植晶片", "無須晶片", "毋須晶片", "免晶片", "無須植入晶片", "晶片", "微型晶片", "免體檢投保"],
    },
    {
      id: "bereavement-funeral",
      label: "寵物離世善終火化津貼",
      keywords: ["善終", "火化", "殮葬", "寵物喪葬", "人道毀滅", "身故費用", "寵物火化", "身故 / 殮葬服務", "身故服務"],
    },
  ],
};

/** 獲取指定類別的專屬特點標籤清單 */
export function getCategoryFeatureTags(categoryId: string): FeatureFilterTag[] {
  return CATEGORY_FEATURE_TAGS[categoryId] || [];
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
