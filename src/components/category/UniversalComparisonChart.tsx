import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Info,
  PieChart,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  METRIC_GROUP_LABELS,
  getCategoryMetrics,
  getDefaultMetric,
  prepareChartData,
} from "@/lib/chart-metrics";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/insurance";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export interface UniversalComparisonChartProps {
  /** 當前分類下的產品列表 */
  products: Product[];
  /** 類別 ID（例如 'medical', 'high-end-medical', 'travel' 等） */
  categoryId: string;
  /** 類別中文名 */
  categoryName: string;
  /** 類別主題色 */
  color?: string;
  /** 額外外層樣式 */
  className?: string;
}

/** 常用特點多選過濾標籤定義 */
interface FeatureFilterTag {
  id: string;
  label: string;
  keywords: string[];
}

/** 常用特點多選過濾標籤定義 */
interface FeatureFilterTag {
  id: string;
  label: string;
  keywords: string[];
}

/** 產品保單整體封頂限額（每年／終身／海外醫療） */
interface ProductCapInfo {
  annualCap: string;
  lifetimeCap: string;
  shortBadge: string;
  isFullCover: boolean;
}

/** 11 大類別專屬特點篩選標籤體系（Category-Specific Feature Tags） */
const CATEGORY_FEATURE_TAGS: Record<string, FeatureFilterTag[]> = {
  // 1. 旅遊保險：移除洗腎、精神科、癌症標靶等無關項目，專注旅遊專項保障
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
      id: "home-contents",
      label: "家居財物高額保障",
      keywords: ["家居財物", "家庭財產", "室內傢俬", "電器", "財物保障"],
    },
    {
      id: "building-third-party",
      label: "大廈外牆及第三者責任",
      keywords: ["第三者責任", "大廈外牆", "業主責任", "租客責任", "公眾責任"],
    },
    {
      id: "locksmith-emergency",
      label: "24小時換鎖開鎖急修",
      keywords: ["換鎖", "開鎖", "緊急家居支援", "水喉急修", "鎖匠"],
    },
    {
      id: "temp-accommodation",
      label: "臨時住宿津貼",
      keywords: ["臨時住宿", "不能居住", "另覓住宿", "酒店住宿津貼"],
    },
    {
      id: "leakage-renovation",
      label: "水浸滲水及裝修責任",
      keywords: ["滲水", "漏水", "水浸", "裝修", "爆水喉"],
    },
    {
      id: "valuables-limit",
      label: "貴重物品單件高上限",
      keywords: ["貴重物品", "貴重財物", "珠寶", "手錶", "金飾"],
    },
    {
      id: "domestic-helper-prop",
      label: "外傭財物保障",
      keywords: ["家傭財物", "外傭財物", "家庭傭工財物"],
    },
    {
      id: "full-cover",
      label: "以新代舊全數重置",
      keywords: ["以新代舊", "全數重置", "重新購置", "實報實銷"],
    },
  ],

  // 6. 危疾保險
  "critical-illness": [
    {
      id: "multiple-cancer",
      label: "癌症多次 / 持續賠償",
      keywords: ["多重癌症", "多次癌症", "多重賠償", "持續賠償", "癌症多重", "癌症等候期"],
    },
    {
      id: "heart-stroke-multiple",
      label: "中風及心臟病多重保障",
      keywords: ["中風", "心臟病", "心血管", "多重心血管"],
    },
    {
      id: "icu-carveout",
      label: "深切治療 ICU 專項賠償",
      keywords: ["深切治療", "ICU", "重症監護", "加護病房"],
    },
    {
      id: "early-stage",
      label: "早期危疾及原位癌",
      keywords: ["早期危疾", "原位癌", "非嚴重", "早期病況"],
    },
    {
      id: "benign-tumor",
      label: "良性腫瘤切除保障",
      keywords: ["良性腫瘤", "良性病變", "預防切除"],
    },
    {
      id: "waiver-of-premium",
      label: "確診豁免後續保費",
      keywords: ["豁免保費", "保費豁免", "免繳保費"],
    },
    {
      id: "childhood-illness",
      label: "兒童專屬嚴重疾病",
      keywords: ["兒童疾病", "自閉症", "ADHD", "先天性疾病", "兒童專屬"],
    },
  ],

  // 7. 個人意外保險
  accident: [
    {
      id: "accident-medical",
      label: "意外醫療實報實銷",
      keywords: ["意外醫療", "醫療費用", "實報實銷", "意外急症"],
    },
    {
      id: "bonesetter-physio",
      label: "中醫跌打物理治療",
      keywords: ["跌打", "中醫", "物理治療", "脊醫", "骨傷"],
    },
    {
      id: "double-indemnity",
      label: "公共交通雙倍賠償",
      keywords: ["公共交通", "雙倍賠償", "雙倍", "多倍賠償", "交通工具意外"],
    },
    {
      id: "fracture-burn",
      label: "骨折及嚴重燒傷專項",
      keywords: ["骨折", "脫臼", "燒傷", "斷骨", "內臟受傷"],
    },
    {
      id: "total-disability",
      label: "永久完全傷殘高額賠償",
      keywords: ["永久完全傷殘", "傷殘津貼", "喪失工作能力", "完全殘廢"],
    },
    {
      id: "emergency-evac",
      label: "全球緊急醫療運送",
      keywords: ["緊急醫療運送", "緊急運送", "全球救援", "遺體運返"],
    },
  ],

  // 8. 人壽保險
  life: [
    {
      id: "guaranteed-renew",
      label: "保證可續保條款",
      keywords: ["保證續保", "保證可續保", "續保年齡", "不需再次核保"],
    },
    {
      id: "terminal-illness-advance",
      label: "末期疾病提前給付",
      keywords: ["末期疾病", "預先給付", "提前給付", "末期絕症"],
    },
    {
      id: "unemployment-grace",
      label: "非自願失業保費延緩",
      keywords: ["非自願失業", "失業保障", "延緩繳交", "保費寬限期"],
    },
    {
      id: "non-medical-limit",
      label: "高額免體檢投保",
      keywords: ["免體檢", "免核保", "毋須體檢", "簡易核保"],
    },
    {
      id: "accidental-death-double",
      label: "意外身故雙倍賠償",
      keywords: ["意外身故", "額外賠償", "公共交通身故", "雙倍身故"],
    },
  ],

  // 9. 汽車保險
  motor: [
    {
      id: "low-deductible",
      label: "特低 / 零自負額",
      keywords: ["自負額", "墊底費", "零墊底", "低墊底", "自負額低至"],
    },
    {
      id: "roadside-assistance",
      label: "24小時道路緊急救援拖車",
      keywords: ["道路救援", "拖車", "緊急路邊支援", "爆胎換軚", "搭橋搭電"],
    },
    {
      id: "windscreen-cover",
      label: "擋風玻璃免墊底賠償",
      keywords: ["擋風玻璃", "車窗玻璃", "免自負額", "玻璃維修"],
    },
    {
      id: "new-car-replacement",
      label: "新車首年全損換新車",
      keywords: ["新車換新", "新車全損", "以新代舊", "車輛替換"],
    },
    {
      id: "ncd-protection",
      label: "無索償折扣 (NCD) 保障",
      keywords: ["NCD", "無索償折扣", "NCD保護", "維持折扣"],
    },
    {
      id: "third-party-liability",
      label: "高額第三者責任保障",
      keywords: ["第三者責任", "第三者人身傷亡", "第三者財產損毀", "1億", "一億"],
    },
  ],

  // 10. 家傭保險
  "domestic-helper": [
    {
      id: "helper-clinical",
      label: "門診醫療含中醫跌打",
      keywords: ["門診", "中醫", "跌打", "西醫網絡", "診症費"],
    },
    {
      id: "helper-hospital",
      label: "大手術及住院保障",
      keywords: ["住院及手術", "外科手術", "住院費用", "嚴重疾病住院"],
    },
    {
      id: "fidelity-guarantee",
      label: "外傭誠信保障 / 欺詐盜竊",
      keywords: ["誠信保障", "欺詐", "盜竊", "金錢損失", "外傭借貸"],
    },
    {
      id: "replacement-repatriation",
      label: "補聘及遣返費用",
      keywords: ["遣返", "送返", "補聘", "重新招聘", "重聘費用"],
    },
    {
      id: "helper-liability",
      label: "僱主法律責任保障",
      keywords: ["僱主責任", "僱員補償", "勞保", "法定責任"],
    },
  ],

  // 11. 寵物保險
  pet: [
    {
      id: "mixed-breed",
      label: "純種及唐狗唐貓混種劃一",
      keywords: ["唐狗", "唐貓", "混種", "不限品種", "劃一保費"],
    },
    {
      id: "vet-consultation",
      label: "門診及手術實報實銷",
      keywords: ["獸醫", "門診", "手術", "處方藥物", "診症費", "X光"],
    },
    {
      id: "pet-third-party",
      label: "寵物第三者法律責任",
      keywords: ["第三者責任", "法律責任", "咬傷", "財物損毀"],
    },
    {
      id: "pet-funeral",
      label: "寵物善終及火化津貼",
      keywords: ["善終", "火化", "寵物喪葬", "安樂死"],
    },
    {
      id: "pet-search-advertising",
      label: "走失尋寵廣告津貼",
      keywords: ["走失", "尋寵", "廣告費", "酬金", "尋找寵物"],
    },
    {
      id: "pet-zero-deductible",
      label: "零自負額方案",
      keywords: ["0自負額", "零自負額", "無自負額", "不設自負額"],
    },
  ],
};

/** 通用備用標籤 */
const DEFAULT_FEATURE_TAGS: FeatureFilterTag[] = [
  {
    id: "full-cover",
    label: "全數賠償 / 實報實銷",
    keywords: ["全數賠償", "全額賠償", "實報實銷", "100%"],
  },
  {
    id: "emergency-support",
    label: "24小時緊急支援",
    keywords: ["緊急支援", "救援", "24小時", "專線"],
  },
  {
    id: "cashless",
    label: "免找數直付",
    keywords: ["免找數", "直付", "網絡直付"],
  },
];

/** 取得該類別專屬的特點篩選 Tags */
function getCategoryFeatureTags(categoryId: string): FeatureFilterTag[] {
  return CATEGORY_FEATURE_TAGS[categoryId] ?? DEFAULT_FEATURE_TAGS;
}

/** 智能提取產品的保單整體封頂上限（每年總額、終身限額、海外醫療等） */
function extractProductCapInfo(product: Product, categoryId: string): ProductCapInfo {
  const coverages = product.coverage ?? [];
  let annualLimitRaw = "";
  let lifetimeLimitRaw = "";
  let overseasMedicalRaw = "";

  for (const c of coverages) {
    const item = c.item || "";
    const limit = c.limit || "";
    if (/每年保障限額|年度保額|每年限額|每年最高|最高保障/i.test(item)) {
      if (!annualLimitRaw) annualLimitRaw = limit;
    }
    if (/終身保障限額|終身保額|終身最高|終身限額/i.test(item)) {
      if (!lifetimeLimitRaw) lifetimeLimitRaw = limit;
    }
    if (/海外醫療|緊急醫療費用|醫療費用及支援/i.test(item)) {
      if (!overseasMedicalRaw) overseasMedicalRaw = limit;
    }
  }

  // 1. 旅遊保險專項
  if (categoryId === "travel") {
    let medShort = "";
    if (overseasMedicalRaw) {
      const match = overseasMedicalRaw.match(/(?:HK\$|HKD|\$)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/);
      if (match) {
        medShort = `海外醫療上限 HK$${match[1]}${match[2] || ""}`;
      }
    }
    return {
      annualCap: overseasMedicalRaw || "按計劃等級賠償",
      lifetimeCap: "不設終身保障限額（以每次旅程為單位）",
      shortBadge: medShort || "受制於海外醫療總額",
      isFullCover: true,
    };
  }

  // 2. 醫療 / 高端醫療 / Top-up 醫療：提取最高方案額度
  let topAnnual = "";
  if (annualLimitRaw) {
    if (/無上限|不設上限/i.test(annualLimitRaw) && !/終身/i.test(annualLimitRaw)) {
      topAnnual = "每年無上限";
    } else {
      const matches = Array.from(
        annualLimitRaw.matchAll(/(?:HK\$|HKD|\$)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/g)
      );
      let maxVal = 0;
      let maxStr = "";
      for (const m of matches) {
        const num = parseFloat(m[1].replace(/,/g, ""));
        const unit = m[2];
        const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
        const total = num * mult;
        if (total > maxVal) {
          maxVal = total;
          maxStr = unit ? `每年高達 HK$${num}${unit}` : `每年高達 HK$${num.toLocaleString()}`;
        }
      }
      topAnnual = maxStr;
    }
  }

  let topLifetime = "";
  if (lifetimeLimitRaw) {
    if (/無上限|不設終身保障限額|不設上限/i.test(lifetimeLimitRaw)) {
      topLifetime = "終身無上限";
    } else {
      const matches = Array.from(
        lifetimeLimitRaw.matchAll(/(?:HK\$|HKD|\$)?\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/g)
      );
      let maxVal = 0;
      let maxStr = "";
      for (const m of matches) {
        const num = parseFloat(m[1].replace(/,/g, ""));
        const unit = m[2];
        const mult = unit === "億" ? 100_000_000 : unit === "萬" ? 10_000 : 1;
        const total = num * mult;
        if (total > maxVal) {
          maxVal = total;
          maxStr = unit ? `終身高達 HK$${num}${unit}` : `終身高達 HK$${num.toLocaleString()}`;
        }
      }
      topLifetime = maxStr;
    }
  }

  const shortBadge = topAnnual
    ? `年度上限：${topAnnual.replace("每年高達 ", "HK$")}`
    : topLifetime
      ? `終身限額：${topLifetime.replace("終身高達 ", "HK$")}`
      : "受制於年度總額";

  return {
    annualCap: annualLimitRaw || topAnnual || "按保單每保單年度最高總額",
    lifetimeCap: lifetimeLimitRaw || topLifetime || "不設終身保障限額",
    shortBadge,
    isFullCover: true,
  };
}

export default function UniversalComparisonChart({
  products,
  categoryId,
  categoryName,
  color = "#181D2E",
  className,
}: UniversalComparisonChartProps) {
  const navigate = useNavigate();

  // 1. 取得該類別定義的所有量化指標（15 至 20+ 個）
  const availableMetrics = useMemo(
    () => getCategoryMetrics(categoryId),
    [categoryId]
  );
  const defaultMetric = useMemo(
    () => getDefaultMetric(categoryId),
    [categoryId]
  );

  // 2. 當前選中之指標
  const [selectedMetricId, setSelectedMetricId] = useState<string>(
    defaultMetric?.id ?? availableMetrics[0]?.id ?? ""
  );

  const currentMetric = useMemo(() => {
    return (
      availableMetrics.find((m) => m.id === selectedMetricId) ??
      defaultMetric ??
      availableMetrics[0]
    );
  }, [availableMetrics, selectedMetricId, defaultMetric]);

  // 3. 分組標籤頁：全部 + 核心/住院/門診/專項/責任/生活
  const [activeGroup, setActiveGroup] = useState<string>("all");

  // 計算每個分組包含多少指標
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: availableMetrics.length };
    for (const m of availableMetrics) {
      const g = m.group ?? "core";
      counts[g] = (counts[g] ?? 0) + 1;
    }
    return counts;
  }, [availableMetrics]);

  // 4. 指標關鍵字即時搜尋
  const [metricSearch, setMetricSearch] = useState<string>("");

  // 根據 activeGroup 與 metricSearch 過濾後的指標列表
  const displayedMetrics = useMemo(() => {
    return availableMetrics.filter((m) => {
      const matchGroup = activeGroup === "all" || (m.group ?? "core") === activeGroup;
      if (!matchGroup) return false;
      if (!metricSearch.trim()) return true;
      const q = metricSearch.toLowerCase();
      return (
        m.label.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [availableMetrics, activeGroup, metricSearch]);

  // 5. 圖表視圖切換：長條圖排行榜 (bar) 或 梯隊分佈圖 (pie)
  const [viewMode, setViewMode] = useState<"bar" | "pie">("bar");

  // 6. 排序方向：'desc'（最高保障優先）或 'asc'
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  // 7. 取得當前類別專屬特點 Tags
  const currentFeatureTags = useMemo(
    () => getCategoryFeatureTags(categoryId),
    [categoryId]
  );

  // 7. 特點多選過濾 Tags（當類別切換時自動過濾掉不屬於當前類別的標籤 ID）
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const validSelectedFeatures = useMemo(() => {
    const validIds = new Set(currentFeatureTags.map((t) => t.id));
    return selectedFeatures.filter((id) => validIds.has(id));
  }, [currentFeatureTags, selectedFeatures]);

  // 8. 保險公司過濾
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>([]);

  // 9. 圖表展開 / 折疊開關
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // 10. 全數賠償（Full Cover）說明展開狀態與卡片 Tooltip 懸浮狀態
  const [showFullCoverGuide, setShowFullCoverGuide] = useState<boolean>(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // 11. 預計算每份產品之整體保障封頂限額（每年／終身／海外醫療上限）
  const productCapsMap = useMemo(() => {
    const map = new Map<string, ProductCapInfo>();
    for (const p of products) {
      map.set(p.id, extractProductCapInfo(p, categoryId));
    }
    return map;
  }, [products, categoryId]);

  // 該類別所有保險公司清單
  const insurerList = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      if (!map.has(p.insurer)) {
        map.set(p.insurer, p.insurer_zh);
      }
    }
    return Array.from(map.entries()).map(([insurer, insurerZh]) => ({
      insurer,
      insurerZh,
    }));
  }, [products]);

  // 12. 套用特點過濾與保險公司過濾後的產品列表（高靈敏度比對 coverage、key_terms 及 plan_tiers）
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 公司篩選
      if (selectedInsurers.length > 0 && !selectedInsurers.includes(p.insurer)) {
        return false;
      }
      // 特點多選篩選
      if (validSelectedFeatures.length > 0) {
        const coverages = p.coverage ?? [];
        const keyTerms = p.key_terms ?? [];
        const planTiers = p.plan_tiers ?? [];

        const hasAllFeatures = validSelectedFeatures.every((fId) => {
          const tag = currentFeatureTags.find((t) => t.id === fId);
          if (!tag) return true;

          const matchCoverage = coverages.some((c) =>
            tag.keywords.some(
              (kw) =>
                c.item.toLowerCase().includes(kw.toLowerCase()) ||
                (c.limit && c.limit.toLowerCase().includes(kw.toLowerCase()))
            )
          );
          if (matchCoverage) return true;

          const matchKeyTerms = keyTerms.some((term) =>
            tag.keywords.some((kw) => term.toLowerCase().includes(kw.toLowerCase()))
          );
          if (matchKeyTerms) return true;

          const matchPlanTiers = planTiers.some((tier) =>
            tag.keywords.some((kw) => tier.toLowerCase().includes(kw.toLowerCase()))
          );
          return matchPlanTiers;
        });

        if (!hasAllFeatures) return false;
      }
      return true;
    });
  }, [products, selectedInsurers, validSelectedFeatures, currentFeatureTags]);

  // 11. 使用 chart-metrics 引擎準備圖表數據點
  const chartPoints = useMemo(() => {
    if (!currentMetric) return [];
    return prepareChartData(filteredProducts, currentMetric, {
      sortOrder: sortDirection,
      filterEmpty: true,
    });
  }, [filteredProducts, currentMetric, sortDirection]);

  // 12. 計算市場平均值與圖表最大值
  const { maxVisualValue, benchmarkAverage, benchmarkDisplay } = useMemo(() => {
    if (chartPoints.length === 0) {
      return { maxVisualValue: 1, benchmarkAverage: null, benchmarkDisplay: null };
    }

    const maxVisual = Math.max(...chartPoints.map((p) => p.visualValue), 1);

    const validNumeric = chartPoints
      .filter((p) => !p.isFlagship && p.numericValue > 0 && p.numericValue < 900_000_000)
      .map((p) => p.numericValue);

    if (validNumeric.length === 0) {
      return { maxVisualValue: maxVisual, benchmarkAverage: null, benchmarkDisplay: null };
    }

    const avg = validNumeric.reduce((a, b) => a + b, 0) / validNumeric.length;
    let disp = "";
    if (currentMetric?.unitType === "currency") {
      disp = `HK$${Math.round(avg).toLocaleString()}`;
    } else if (currentMetric?.unitType === "percentage") {
      disp = `${Math.round(avg)}%`;
    } else if (currentMetric?.unitType === "age") {
      disp = `${Math.round(avg)} 歲`;
    } else {
      disp = `${Math.round(avg)} ${currentMetric?.unitSuffix ?? ""}`;
    }

    return {
      maxVisualValue: maxVisual,
      benchmarkAverage: avg,
      benchmarkDisplay: disp,
    };
  }, [chartPoints, currentMetric]);

  // 平均值在進度條中的百分比位置
  const benchmarkPercent = useMemo(() => {
    if (!benchmarkAverage || !maxVisualValue) return null;
    const pct = (benchmarkAverage / maxVisualValue) * 100;
    return Math.min(Math.max(pct, 5), 95);
  }, [benchmarkAverage, maxVisualValue]);

  // 13. 是否屬於醫療類別或圖表數據包含「全數賠償」
  const isMedicalCategory = ["medical", "high-end-medical", "top-up-medical"].includes(categoryId);
  const hasFullCoverPoints = useMemo(() => {
    return chartPoints.some(
      (p) =>
        p.isFlagship ||
        p.displayValue.includes("全數賠償") ||
        p.displayValue.includes("全額") ||
        p.badge?.includes("全數賠償")
    );
  }, [chartPoints]);

  // 14. 梯隊分佈數據（Pie Chart Breakdown）
  const distributionTiers = useMemo(() => {
    if (chartPoints.length === 0) return [];
    const flagship = chartPoints.filter((p) => p.isFlagship);
    const tierHigh = chartPoints.filter(
      (p) => !p.isFlagship && p.numericValue >= 5_000_000
    );
    const tierMid = chartPoints.filter(
      (p) => !p.isFlagship && p.numericValue >= 500_000 && p.numericValue < 5_000_000
    );
    const tierBase = chartPoints.filter(
      (p) => !p.isFlagship && p.numericValue < 500_000
    );

    const tiers = [
      {
        name: "頂級旗艦（全數賠償 / 無細項上限）",
        subNote: "不設分項上限，受制於保單年度總額",
        count: flagship.length,
        color: "#D97706",
        items: flagship,
      },
      {
        name: "高額保障（HK$500萬以上）",
        subNote: "高額分項限額或高保額常規方案",
        count: tierHigh.length,
        color: "#2563EB",
        items: tierHigh,
      },
      {
        name: "中級保障（HK$50萬 - HK$500萬）",
        subNote: "中產或標準以上進階保障",
        count: tierMid.length,
        color: "#059669",
        items: tierMid,
      },
      {
        name: "入門/常規（HK$50萬以下）",
        subNote: "標準自願醫保或入門基層限額",
        count: tierBase.length,
        color: "#64748B",
        items: tierBase,
      },
    ].filter((t) => t.count > 0);

    return tiers;
  }, [chartPoints]);

  // 切換特點選中狀態
  const toggleFeature = (tagId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // 切換保險公司選中狀態
  const toggleInsurer = (insurer: string) => {
    setSelectedInsurers((prev) =>
      prev.includes(insurer) ? prev.filter((i) => i !== insurer) : [...prev, insurer]
    );
  };

  // 重設所有篩選
  const resetFilters = () => {
    setSelectedFeatures([]);
    setSelectedInsurers([]);
    setSortDirection("desc");
    setMetricSearch("");
  };

  const hasAnyFilterActive =
    selectedFeatures.length > 0 || selectedInsurers.length > 0;

  if (!currentMetric || availableMetrics.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-line bg-paper shadow-card transition-all duration-300",
        className
      )}
      style={{
        boxShadow:
          "0 4px 20px -2px rgba(24, 29, 46, 0.05), 0 1px 3px 0 rgba(24, 29, 46, 0.03)",
      }}
    >
      {/* ── 頂部抬頭與折疊控制 ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-paper shadow-sm"
            style={{ backgroundColor: color }}
          >
            {viewMode === "bar" ? <BarChart3 size={20} /> : <PieChart size={20} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-sans text-[17px] font-bold text-ink sm:text-[18px]">
                {categoryName}保障限額分析
              </h3>
              <span className="rounded-full bg-paper-2 px-2.5 py-0.5 font-grotesk text-[11px] font-semibold text-ink-soft">
                共 {availableMetrics.length} 項指標比較
              </span>
              <span className="rounded-full bg-jade/10 px-2.5 py-0.5 font-grotesk text-[11px] font-semibold text-jade">
                {chartPoints.length} 份計劃參照
              </span>
            </div>
            <p className="mt-0.5 text-small text-ink-soft">
              {currentMetric.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          {/* 圖表類型切換 */}
          <div className="flex items-center rounded-lg border border-line bg-paper-2/60 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("bar")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all",
                viewMode === "bar"
                  ? "bg-paper text-ink shadow-xs"
                  : "text-ink-soft hover:text-ink"
              )}
              title="長條圖排名視圖"
            >
              <BarChart3 size={13} />
              <span>排行榜</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pie")}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium transition-all",
                viewMode === "pie"
                  ? "bg-paper text-ink shadow-xs"
                  : "text-ink-soft hover:text-ink"
              )}
              title="梯隊分佈視圖"
            >
              <PieChart size={13} />
              <span>梯隊分佈</span>
            </button>
          </div>

          {hasAnyFilterActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-paper-2 hover:text-ink"
            >
              <RotateCcw size={14} />
              <span>重設</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-small font-medium text-ink-soft shadow-xs transition-colors hover:bg-paper-2 hover:text-ink"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? "收起圖表" : "展開圖表"}</span>
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* ── 展開內容區 ────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className="overflow-hidden"
          >
            {/* 控制面板：指標分組 Tab + 快速搜尋 + 指標膠囊選取 */}
            <div className="border-b border-line/60 bg-paper-2/40 px-5 py-4 sm:px-6">
              {/* 1. 分組標籤頁與即時搜尋欄 */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* 分組 Tabs */}
                <div className="flex flex-wrap items-center gap-1">
                  {(
                    ["all", "core", "hospital", "outpatient", "special", "protection", "lifestyle"] as const
                  )
                    .filter((g) => (groupCounts[g] ?? 0) > 0)
                    .map((g) => {
                      const isActive = activeGroup === g;
                      const label = METRIC_GROUP_LABELS[g] ?? g;
                      const count = groupCounts[g] ?? 0;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setActiveGroup(g)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[12px] font-medium transition-all",
                            isActive
                              ? "bg-ink font-bold text-paper shadow-xs"
                              : "bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink border border-line/60"
                          )}
                        >
                          <span>{label}</span>
                          <span
                            className={cn(
                              "font-grotesk text-[10px]",
                              isActive ? "text-paper/80" : "text-ink-faint"
                            )}
                          >
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                </div>

                {/* 右側：指標搜尋欄 + 排序切換 */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
                    />
                    <input
                      type="text"
                      value={metricSearch}
                      onChange={(e) => setMetricSearch(e.target.value)}
                      placeholder="快速搜尋 15-20 項指標..."
                      className="w-full rounded-lg border border-line bg-paper py-1 pl-7 pr-7 text-[12px] text-ink placeholder:text-ink-faint focus:border-ink focus:outline-hidden"
                    />
                    {metricSearch && (
                      <button
                        type="button"
                        onClick={() => setMetricSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {viewMode === "bar" && (
                    <button
                      type="button"
                      onClick={() =>
                        setSortDirection((d) => (d === "desc" ? "asc" : "desc"))
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-paper px-2.5 py-1 text-[12px] font-medium text-ink shadow-xs transition-colors hover:bg-paper-2"
                    >
                      <ArrowUpDown size={12} className="text-ink-soft" />
                      <span>{sortDirection === "desc" ? "高至低 ▾" : "低至高 ▴"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 2. 指標選取 Pills 清單（支援 15–20 個細分指標） */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 flex items-center gap-1 text-[12px] font-semibold text-ink-soft">
                  <Filter size={12} />
                  <span>比較指標：</span>
                </span>
                {displayedMetrics.map((metric) => {
                  const isActive = metric.id === currentMetric.id;
                  return (
                    <button
                      key={metric.id}
                      type="button"
                      onClick={() => setSelectedMetricId(metric.id)}
                      className={cn(
                        "relative rounded-full px-3 py-1 text-[12px] font-medium transition-all",
                        isActive
                          ? "text-paper shadow-xs font-bold"
                          : "bg-paper text-ink-soft hover:bg-paper-2 hover:text-ink border border-line/80"
                      )}
                      style={{
                        backgroundColor: isActive ? color : undefined,
                      }}
                    >
                      <span>{metric.label}</span>
                      {metric.isDefault && !isActive && (
                        <span className="ml-1 text-[10px] text-amber">★</span>
                      )}
                    </button>
                  );
                })}
                {displayedMetrics.length === 0 && (
                  <span className="text-[12px] text-ink-faint">
                    未有符合「{metricSearch}」的指標項目。
                  </span>
                )}
              </div>

              {/* 3. 特點多選過濾 Chips（類別專屬特點篩選） */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-line/40">
                <span className="mr-1 text-[12px] font-semibold text-ink-soft">
                  {categoryName}條款特點多選過濾：
                </span>
                {currentFeatureTags.map((tag) => {
                  const isSelected = validSelectedFeatures.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleFeature(tag.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all",
                        isSelected
                          ? "bg-jade text-paper font-bold shadow-xs"
                          : "bg-paper text-ink-soft border border-line/60 hover:border-jade/50 hover:text-jade"
                      )}
                    >
                      {isSelected && <Check size={11} />}
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
                {validSelectedFeatures.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedFeatures([])}
                    className="ml-1 text-[11px] font-semibold text-red hover:underline"
                  >
                    清除特點過濾 ({validSelectedFeatures.length})
                  </button>
                )}
              </div>

              {/* 4. 保險公司過濾 Chips */}
              {insurerList.length > 1 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-line/40">
                  <span className="text-[12px] text-ink-faint mr-1">公司篩選：</span>
                  {insurerList.map(({ insurer, insurerZh }) => {
                    const isSelected = selectedInsurers.includes(insurer);
                    return (
                      <button
                        key={insurer}
                        type="button"
                        onClick={() => toggleInsurer(insurer)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-all",
                          isSelected
                            ? "bg-ink font-bold text-paper"
                            : "bg-paper text-ink-soft border border-line/60 hover:border-ink-soft/40"
                        )}
                      >
                        {isSelected && <Check size={11} />}
                        <span>{insurerZh}</span>
                      </button>
                    );
                  })}
                  {selectedInsurers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedInsurers([])}
                      className="ml-1 text-[11px] text-red hover:underline"
                    >
                      清除公司篩選
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── 圖表主體展示區 ────────────────────────────────────── */}
            <div className="p-5 sm:p-6">
              {/* ── 全數賠償（Full Cover）權威定義提示卡片 ── */}
              {(hasFullCoverPoints || isMedicalCategory) && (
                <div className="mb-4 rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-paper p-3.5 sm:p-4 text-ink shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-paper font-bold text-[12px] shadow-xs">
                        <Sparkles size={13} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-sans text-[13px] font-bold text-amber-950">
                            指標若顯示「全數賠償」代表什麼？有冇金額上限？
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-grotesk text-[10px] font-bold text-amber-800">
                            全數賠償 ≠ 無上限
                          </span>
                        </div>
                        <p className="text-[12px] text-ink-soft leading-relaxed">
                          <strong>「全數賠償」（Full Cover）</strong>代表該保障細項（如外科手術、病房膳食或癌症標靶藥物）<strong>不設個別細項獨立分項上限</strong>，由保險公司 100% 實報實銷合資格開支。
                          <strong>但請注意：賠償額並非毫無封頂</strong>，每次索償仍受制於整份保單的<strong>「每保單年度保障總額」</strong>（靈活/高端醫保每年最高可達 HK$1,000萬至 HK$4,000萬）或<strong>「終身限額」</strong>。下方長條圖中已在各「全數賠償」計劃旁標明其對應之年度封頂上限。
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowFullCoverGuide(!showFullCoverGuide)}
                      className="shrink-0 text-[11px] font-semibold text-amber-800 hover:text-amber-950 hover:underline pt-0.5"
                    >
                      {showFullCoverGuide ? "收起條款對照 ▴" : "了解更多對照 ▾"}
                    </button>
                  </div>

                  {showFullCoverGuide && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-ink-soft">
                      <div className="rounded-lg bg-paper/80 p-2.5 border border-amber-200/50">
                        <span className="font-bold text-ink">1. 無分項細項限制</span>
                        <p className="mt-1">
                          傳統標準自願醫保就各細項設嚴格上限（如手術費最多 HK$50,000、雜費 HK$14,000）；全數賠償計劃撤銷此等分項限制。
                        </p>
                      </div>
                      <div className="rounded-lg bg-paper/80 p-2.5 border border-amber-200/50">
                        <span className="font-bold text-ink">2. 受制於每年總額封頂</span>
                        <p className="mt-1">
                          全數賠償之各項累計索償總額，必須在該保單每年最高限額之內（例如每年最高 HK$1,200萬），超出年度限額的部分須自行承擔。
                        </p>
                      </div>
                      <div className="rounded-lg bg-paper/80 p-2.5 border border-amber-200/50">
                        <span className="font-bold text-ink">3. 自負額（Deductible）扣除</span>
                        <p className="mt-1">
                          若選購設有自負額（如 HK$16,000 或 HK$50,000）之方案，須先扣除自負額後，其餘合資格醫療費用方可享 100% 全數賠償。
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 市場基準線提示卡 */}
              {benchmarkDisplay && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-paper-2/70 px-4 py-2 text-small text-ink-soft">
                  <div className="flex items-center gap-1.5">
                    <Info size={14} className="text-jade" />
                    <span>
                      已匹配計劃之市場平均水平：
                      <strong className="ml-1 font-grotesk text-ink">
                        {benchmarkDisplay}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[12px] text-ink-faint">
                    已依「{currentMetric.label}」量化排序，點擊計劃卡片跳轉詳情頁
                  </span>
                </div>
              )}

              {chartPoints.length === 0 ? (
                <div className="py-12 text-center text-ink-soft">
                  <p className="text-small">
                    此篩選條件下未有匹配到「{currentMetric.label}」的合資格計劃。
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-3 text-small font-bold text-jade hover:underline"
                  >
                    重設過濾條件
                  </button>
                </div>
              ) : viewMode === "bar" ? (
                /* ── 長條圖視圖 ─────────────────────────────────── */
                <div className="relative flex flex-col gap-3">
                  {/* 市場平均虛線 */}
                  {benchmarkPercent !== null && (
                    <div
                      className="pointer-events-none absolute bottom-0 top-0 hidden w-px border-r-2 border-dashed border-jade/50 md:block z-10"
                      style={{
                        left: `calc(230px + (100% - 380px) * ${
                          benchmarkPercent / 100
                        })`,
                      }}
                    >
                      <span className="absolute -top-3 -translate-x-1/2 whitespace-nowrap rounded bg-jade px-1.5 py-0.5 font-grotesk text-[10px] font-bold text-paper shadow-xs">
                        均值 {benchmarkDisplay}
                      </span>
                    </div>
                  )}

                  {chartPoints.map((item, index) => {
                    const barPercent = Math.max(
                      4,
                      Math.min(100, (item.visualValue / maxVisualValue) * 100)
                    );

                    const rank = index + 1;
                    const isTop1 = rank === 1;
                    const isTop2 = rank === 2;
                    const isTop3 = rank === 3;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: EASE_OUT_EXPO,
                          delay: index < 10 ? index * 0.03 : 0,
                        }}
                        onClick={() => navigate(item.url)}
                        className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 rounded-xl border border-line/60 bg-paper p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-line hover:bg-paper-2/40 hover:shadow-xs cursor-pointer"
                      >
                        {/* 左側：名次 + 保險公司 + 產品名稱 */}
                        <div className="flex items-center gap-3 sm:w-[230px] lg:w-[270px] shrink-0">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-grotesk font-bold transition-transform group-hover:scale-105",
                              isTop1
                                ? "bg-amber-100 text-amber-900 ring-1 ring-amber-400/60 font-black shadow-xs"
                                : isTop2
                                  ? "bg-slate-100 text-slate-800 ring-1 ring-slate-300"
                                  : isTop3
                                    ? "bg-orange-100 text-orange-900 ring-1 ring-orange-300"
                                    : "bg-paper-2 text-ink-faint"
                            )}
                          >
                            {isTop1 ? "🥇" : isTop2 ? "🥈" : isTop3 ? "🥉" : rank}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-semibold text-ink-faint">
                              {item.insurerZh}
                            </p>
                            <h4 className="truncate font-sans text-[14px] font-bold text-ink transition-colors group-hover:text-jade">
                              {item.name}
                            </h4>
                          </div>
                        </div>

                        {/* 中間：進度柱 */}
                        <div className="relative flex-1 py-1">
                          <div className="h-5 w-full overflow-hidden rounded-full bg-paper-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${barPercent}%` }}
                              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                              className="h-full rounded-full relative flex items-center justify-end pr-2"
                              style={{
                                background: item.isFlagship
                                  ? `linear-gradient(90deg, ${color} 0%, #D97706 100%)`
                                  : `linear-gradient(90deg, ${color}CC 0%, ${color} 100%)`,
                              }}
                            >
                              {item.isFlagship && (
                                <Sparkles
                                  size={12}
                                  className="text-amber-200 animate-pulse"
                                />
                              )}
                            </motion.div>
                          </div>
                        </div>

                        {/* 右側：金額標籤 + 全數賠償年度上限提示 + 徽章 + 跳轉箭頭 */}
                        {(() => {
                          const isFullCoverItem =
                            item.isFlagship ||
                            item.displayValue.includes("全數賠償") ||
                            item.displayValue.includes("全額") ||
                            Boolean(item.badge?.includes("全數賠償"));
                          const capInfo = productCapsMap.get(item.id);
                          const isTooltipOpen = activeTooltipId === item.id;

                          return (
                            <div className="relative flex items-center justify-end gap-2.5 shrink-0 sm:min-w-[170px] text-right">
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      "font-grotesk font-black text-[15px] sm:text-[16px]",
                                      item.isFlagship
                                        ? "text-amber-700 dark:text-amber-400"
                                        : "text-ink"
                                    )}
                                  >
                                    {item.displayValue}
                                  </span>

                                  {isFullCoverItem && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTooltipId(isTooltipOpen ? null : item.id);
                                      }}
                                      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                                      title="點擊查看全數賠償定義與年度限額"
                                    >
                                      <Info size={11} />
                                    </button>
                                  )}
                                </div>

                                {/* 若為全數賠償，清楚顯示其受制之每年保障總額 */}
                                {isFullCoverItem && capInfo && (
                                  <span className="mt-0.5 inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-200/60">
                                    <span>{capInfo.shortBadge}</span>
                                  </span>
                                )}

                                {/* 常規既有徽章 */}
                                {!isFullCoverItem && item.badge && (
                                  <span className="mt-0.5 rounded px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-paper-2 text-ink-soft">
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              {/* 全數賠償專屬 Tooltip Popover */}
                              <AnimatePresence>
                                {isTooltipOpen && capInfo && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-2 z-40 w-72 sm:w-80 rounded-xl border border-amber-300 bg-paper p-3.5 shadow-xl text-left"
                                  >
                                    <div className="flex items-center justify-between border-b border-line/60 pb-2 mb-2">
                                      <div className="flex items-center gap-1.5 font-sans text-[12px] font-bold text-amber-900">
                                        <Sparkles size={13} className="text-amber-600" />
                                        <span>「全數賠償」定義與封頂限制</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setActiveTooltipId(null)}
                                        className="rounded p-0.5 text-ink-faint hover:bg-paper-2 hover:text-ink"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>

                                    <p className="text-[11px] text-ink leading-relaxed">
                                      此保障細項<strong>不設各項獨立分項上限</strong>，由保險公司 100% 實報實銷合資格醫療開支。
                                    </p>

                                    <div className="mt-2 rounded-lg bg-amber-50/90 p-2 border border-amber-200/60 space-y-1 text-[11px]">
                                      <div>
                                        <span className="font-semibold text-amber-950">每保單年度上限：</span>
                                        <span className="text-amber-900 font-grotesk font-bold ml-1">
                                          {capInfo.annualCap}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-semibold text-amber-950">終身保障總額：</span>
                                        <span className="text-amber-900 font-grotesk font-bold ml-1">
                                          {capInfo.lifetimeCap}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="mt-2 text-[10px] text-ink-faint leading-normal">
                                      * 索償總額受制於保單整體每年度保障額或終身限額，並非毫無封頂。如自選自負額（Deductible），須扣除自負額後方獲 100% 實報實銷。
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-2 text-ink-faint transition-all group-hover:bg-ink group-hover:text-paper group-hover:translate-x-0.5">
                                <ArrowRight size={13} />
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* ── 梯隊分佈視圖（Pie/Distribution View） ───────────── */
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {distributionTiers.map((tier) => {
                    const pct = ((tier.count / chartPoints.length) * 100).toFixed(1);
                    return (
                      <div
                        key={tier.name}
                        className="rounded-xl border border-line/70 bg-paper p-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-line/50 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3.5 w-3.5 rounded-full"
                              style={{ backgroundColor: tier.color }}
                            />
                            <div>
                              <h4 className="font-sans text-[14px] font-bold text-ink">
                                {tier.name}
                              </h4>
                              {tier.subNote && (
                                <p className="text-[11px] text-ink-faint">
                                  {tier.subNote}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-grotesk text-[13px] font-black text-ink">
                            {tier.count} 份 ({pct}%)
                          </span>
                        </div>
                        <div className="mt-3 flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {tier.items.map((p) => {
                            const pCap = productCapsMap.get(p.id);
                            const isPFullCover =
                              p.isFlagship ||
                              p.displayValue.includes("全數賠償") ||
                              p.displayValue.includes("全額");

                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => navigate(p.url)}
                                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-small text-ink transition-colors hover:bg-paper-2"
                              >
                                <span className="truncate pr-2 font-medium">
                                  <span className="font-bold text-ink-soft mr-1">
                                    [{p.insurerZh}]
                                  </span>
                                  {p.name}
                                </span>
                                <div className="flex flex-col items-end shrink-0 text-right">
                                  <span className="font-grotesk font-bold text-ink">
                                    {p.displayValue}
                                  </span>
                                  {isPFullCover && pCap && (
                                    <span className="text-[10px] font-semibold text-amber-700">
                                      {pCap.shortBadge}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
