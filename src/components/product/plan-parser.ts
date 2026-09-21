import type { Product } from "@/types/insurance";

/**
 * 產品子計劃標準介面（Standardized Plan Tier Item）
 * 適用於自願醫保（VHIS）及各類多層級保險產品（如旅遊、家傭、寵物等）。
 */
export interface PlanTierItem {
  /** 唯一標識符（小寫，供 URL 參數與 tab key，例如 "s00013", "f00074", "standard", "gold"） */
  id: string;
  /** 簡潔清晰的計劃名稱（例如 "標準計劃", "尊耀計劃", "睿選計劃", "靈活計劃"） */
  name: string;
  /** 原始或完整名稱（例如 "自願醫保靈活計劃（尊耀計劃，高端）"） */
  fullName: string;
  /** 政府認可編號（自願醫保專用，例如 "S00013", "F00074"） */
  code?: string;
  /** 是否為自願醫保（VHIS）產品 */
  isVhis: boolean;
  /** 是否為標準計劃（Standard Plan） */
  isStandard?: boolean;
  /** 房型定義（例如 "標準私家房", "半私家房", "普通房／半私家房／標準私家房"） */
  roomType?: string;
  /** 專屬亮點標籤（例如 ["高端", "標準私家房"], ["網絡醫院", "半私家房"]） */
  badges?: string[];
  /** 匹配條款 limit 時使用的關鍵詞列表 */
  keywords: string[];
  /** 是否只供現有保單續保 */
  renewalOnly?: boolean;
  /** 原始出現索引 */
  index: number;
}

/** 認可編號格式（S = 標準計劃，F = 靈活計劃），例如 S00013 / F00074 */
export const VHIS_CODE_REGEX = /[SF]\d{5}/g;

/**
 * 判斷一行 plan_tier 是否為「純總結行」或「政府認可產品全覽」
 * 總結行例如：「自願醫保認可產品全覽（vhis.gov.hk認可產品名單）：標準計劃認可編號 S00013；...」
 */
export function isSummaryTierLine(line: string): boolean {
  if (!line) return false;
  const trimmed = line.trim();
  if (trimmed.includes("認可產品全覽")) return true;
  if (trimmed.includes("vhis.gov.hk認可產品名單")) return true;
  // 若一行內列出 3 個或以上認可編號且包含「認可編號」，通常為匯總說明行
  const codeMatches = trimmed.match(VHIS_CODE_REGEX);
  if (codeMatches && codeMatches.length >= 3 && trimmed.includes("認可編號")) {
    return true;
  }
  return false;
}

/**
 * 從產品標題解析出認可編號與具體計劃名稱的對照表
 * 例如 "AIA自願醫保標準計劃（S00013）／AIA自願醫保靈活計劃（F00022）／AIA自願醫保尊耀計劃（F00074）／AIA自願醫保睿選計劃（F00081）"
 */
function deriveTitleCodeMap(product: Product): Map<string, string> {
  const map = new Map<string, string>();
  const title = `${product.product_name_zh || ""} ${product.product_name || ""}`;
  const parts = title.split(/[／/]/);

  for (const part of parts) {
    const codes = part.match(VHIS_CODE_REGEX);
    if (!codes || codes.length === 0) continue;
    const code = codes[0];

    // 清理出核心計劃名
    const clean = part
      .replace(/^[A-Za-z\s]+/, "")
      .replace(/自願醫保/, "")
      .replace(/醫療計劃/, "")
      .replace(/[（(].*?[）)]/g, "")
      .trim();

    if (clean) {
      map.set(clean, code);
    }

    // 提取常見具體旗艦子計劃名稱
    const KNOWN_SPECIFIC_NAMES = [
      "尊耀",
      "睿選",
      "更衛您",
      "尊衛您",
      "Pink",
      "Hero",
      "非凡",
      "晉悅",
      "全護航",
      "尚賓",
      "港卓越",
      "港無憂",
      "港稱心",
      "智選守護",
      "智選無憂+",
      "立安心",
      "適健保",
      "優健保",
      "摯稱心",
      "靈活自主",
    ];

    for (const kw of KNOWN_SPECIFIC_NAMES) {
      if (part.includes(kw)) {
        map.set(kw, code);
      }
    }
  }

  return map;
}

/**
 * 智能解析產品的子計劃清單（Plan Tiers Parser）
 * - 自動過濾總結行（如「自願醫保認可產品全覽」）
 * - 精確匹配對應的認可編號（S00013, F00074 等）
 * - 提取房型（普通房/半私家房/私家房）與亮點標籤
 * - 生成匹配條款限額的 keywords
 */
export function parseProductPlanTiers(product: Product): PlanTierItem[] {
  const rawTiers = product.plan_tiers ?? [];
  if (rawTiers.length === 0) return [];

  const isVhis =
    product.category === "medical" ||
    rawTiers.some((t) => VHIS_CODE_REGEX.test(t) || t.includes("自願醫保"));

  const titleCodeMap = deriveTitleCodeMap(product);

  // 1. 過濾純總結行
  const cleanLines = rawTiers.filter((line) => !isSummaryTierLine(line));

  const results: PlanTierItem[] = [];

  for (let i = 0; i < cleanLines.length; i++) {
    const raw = cleanLines[i].trim();
    if (!raw) continue;

    let code: string | undefined = undefined;
    let roomType: string | undefined = undefined;
    const badges: string[] = [];

    // 檢查行內是否有獨立認可編號
    const lineCodes = raw.match(VHIS_CODE_REGEX);
    if (lineCodes && lineCodes.length === 1) {
      code = lineCodes[0];
    } else {
      // 1. 若括號內有專有名詞，優先查括號內
      const parenMatch = raw.match(/[（(]([^）)]+)[）)]/);
      if (parenMatch) {
        const inside = parenMatch[1];
        for (const [kw, c] of titleCodeMap.entries()) {
          if (inside.includes(kw)) {
            code = c;
            break;
          }
        }
      }

      // 2. 具體專有名稱優先（排除「靈活計劃」、「自願醫保」等泛稱）
      if (!code) {
        for (const [kw, c] of titleCodeMap.entries()) {
          if (!kw.includes("靈活") && !kw.includes("自願") && raw.includes(kw)) {
            code = c;
            break;
          }
        }
      }

      // 3. 泛稱匹配（如普通靈活計劃）
      if (!code) {
        for (const [kw, c] of titleCodeMap.entries()) {
          if (raw.includes(kw)) {
            code = c;
            break;
          }
        }
      }

      // 4. 標準計劃 fallback
      if (!code && raw.includes("標準計劃")) {
        for (const [, c] of titleCodeMap.entries()) {
          if (c.startsWith("S")) {
            code = c;
            break;
          }
        }
      }
    }

    // 房型提取（先從文字自身提取）
    if (
      raw.includes("普通房／半私家房／標準私家房") ||
      raw.includes("普通房/半私家房/標準私家房") ||
      raw.includes("普通房/半私家/私家")
    ) {
      roomType = "普通房/半私家/私家";
    } else if (raw.includes("標準私家房") || raw.includes("私家房")) {
      roomType = "標準私家房";
    } else if (raw.includes("半私家房")) {
      roomType = "半私家房";
    } else if (raw.includes("普通房")) {
      roomType = "普通房";
    }

    // 若未提取到房型，可從 coverage 文本輔助確認（例如 AIA 尊耀標準私家房、睿選半私家房）
    if (!roomType && product.coverage) {
      const roomCoverage = product.coverage.find(
        (c) => c.item.includes("病房") || c.item.includes("房及膳食")
      );
      if (roomCoverage) {
        if (raw.includes("尊耀") && roomCoverage.limit.includes("尊耀計劃標準私家房")) {
          roomType = "標準私家房";
        } else if (raw.includes("睿選") && roomCoverage.limit.includes("睿選計劃半私家房")) {
          roomType = "半私家房";
        } else if (raw.includes("標準計劃")) {
          roomType = "普通房";
        }
      }
    }

    // 標籤提取
    if (raw.includes("高端")) badges.push("高端");
    if (raw.includes("網絡醫院")) badges.push("網絡醫院");
    if (roomType) badges.push(roomType);
    if (raw.includes("只供現有保單續保")) badges.push("只供現有保單續保");

    // 精簡命名提取
    let cleanName = raw.replace(/^自願醫保/, "").trim();

    if (cleanName.includes("Bowtie Pink")) {
      cleanName = "Bowtie Pink";
    } else if (cleanName.includes("尊耀")) {
      cleanName = "尊耀計劃";
    } else if (cleanName.includes("睿選")) {
      cleanName = "睿選計劃";
    } else if (cleanName.includes("更衛您")) {
      cleanName = "更衛您計劃";
    } else if (cleanName.includes("尊衛您")) {
      cleanName = "尊衛您計劃";
    } else if (cleanName.includes("Hero") || cleanName.includes("非凡")) {
      cleanName = "Bupa Hero 非凡";
    } else if (cleanName.includes("：")) {
      cleanName = cleanName.split("：")[0].trim();
    } else {
      const subVariantMatch = cleanName.match(/靈活計劃[（(](基本|升級|優越|尊尚|智選)[）)]/);
      if (subVariantMatch) {
        cleanName = `靈活計劃（${subVariantMatch[1]}）`;
      } else {
        const parenMatch = cleanName.match(/[（(]([^）)]+)[）)]/);
        if (parenMatch) {
          const inside = parenMatch[1];
          if (inside.includes("普通房") && inside.includes("私家")) {
            cleanName = "靈活計劃";
          }
        }
      }
    }

    // 標準化精簡名稱
    if (cleanName === "自願醫保標準計劃" || cleanName === "標準計劃" || cleanName.startsWith("標準計劃")) {
      cleanName = "標準計劃";
    }

    // 構建 keywords（條款匹配用）
    const keywords: string[] = [];
    if (code) keywords.push(code);
    if (cleanName) keywords.push(cleanName);

    // 針對常見計劃注入關鍵詞
    if (cleanName.includes("尊耀")) keywords.push("尊耀", "尊耀計劃");
    if (cleanName.includes("睿選")) keywords.push("睿選", "睿選計劃");
    if (cleanName.includes("標準")) keywords.push("標準", "標準計劃");
    if (cleanName.includes("靈活")) keywords.push("靈活", "靈活計劃", "至尊靈活");
    if (cleanName.includes("Pink")) keywords.push("Pink", "Bowtie Pink");
    if (cleanName.includes("更衛您")) keywords.push("更衛您");
    if (cleanName.includes("尊衛您")) keywords.push("尊衛您");
    if (cleanName.includes("Hero")) keywords.push("Hero", "Bupa Hero");
    if (cleanName.includes("非凡")) keywords.push("非凡");

    // 非自願醫保常規關鍵詞（如旅遊保險、家傭保險等）
    const matchSimplePlan = cleanName.match(/(計劃[A-Z0-9一二三四]|Plan [A-Z0-9]|Lite|Plus|Gold|Silver|Platinum|青銅|白銀|黃金|精選|全面|標準|綜合|優尚|簡易)/i);
    if (matchSimplePlan) {
      keywords.push(matchSimplePlan[1]);
    }

    // 唯一 ID：優先使用認可編號小寫，其次使用 slug
    const id = code
      ? code.toLowerCase()
      : `tier-${cleanName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")}-${i + 1}`;

    results.push({
      id,
      name: cleanName,
      fullName: raw,
      code,
      isVhis,
      isStandard: cleanName.includes("標準") || (code ? code.startsWith("S") : false),
      roomType,
      badges: Array.from(new Set(badges)),
      keywords: Array.from(new Set(keywords)),
      renewalOnly: raw.includes("只供現有保單續保"),
      index: i,
    });
  }

  return results;
}

/**
 * 乾淨剝離 segment 開頭的計劃名稱前綴
 * 例如：
 * - `標準計劃 HK$420,000` -> `HK$420,000`
 * - `睿選/尊耀計劃每保單年度 HK$12,000,000` -> `每保單年度 HK$12,000,000`
 * - `尊耀/睿選全數賠償，手術費、巡房費及雜費無分項上限` -> `全數賠償，手術費、巡房費及雜費無分項上限`
 * - `標準每日 HK$750（最多180日）` -> `每日 HK$750（最多180日）`
 * - `尊耀計劃標準私家房全數賠償` -> `標準私家房全數賠償`
 * - `睿選計劃半私家房全數賠償` -> `半私家房全數賠償`
 * - `標準及尊衛您均不設終身保障限額（無上限賠償）` -> `不設終身保障限額（無上限賠償）`
 */
function cleanSegmentPlanPrefix(segment: string, tier: PlanTierItem): string {
  const s = segment.trim();

  // 若出現「...均不設終身保障限額...」或「與...均不設終身保障限額」模式，乾淨提取終身保障核心說明
  if (/^(?:與\s*)?.+均(不設終身保障限額.*)$/.test(s)) {
    return s.replace(/^(?:與\s*)?.+均(不設終身保障限額.*)$/, "$1");
  }

  const kwList = Array.from(new Set([...(tier.keywords || []), tier.name].filter(Boolean)));
  const escapedKws = kwList.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const corePlans =
    "(?:標準(?!私家房)|靈活|至尊靈活|尊耀|睿選|更衛您|尊衛您|Bowtie Pink|Pink|智選|精選|優選|卓越|優尚|簡易|青銅|白銀|黃金|計劃[A-Z0-9一二三四]|Plan [A-Z0-9]|Lite|Plus|Gold|Silver|Platinum|基本|普通房|半私家房|標準私家房|私家房" +
    (escapedKws.length > 0 ? "|" + escapedKws.join("|") : "") +
    ")";

  const prefixRegex = new RegExp(
    "^(" +
      corePlans +
      "(?:[／/、及和與\\s]+" +
      corePlans +
      ")*" +
      "(?:[（(][^）)]*[）)])?" +
      "(?:計劃|系列|級別|旗艦)?" +
      "(?:均|等)?" +
      "[:：\\s]*)" +
      "(.+)$"
  );

  const m = s.match(prefixRegex);
  if (m && m[2] && m[2].trim().length > 0) {
    const candidate = m[2].trim();
    // 確保候選文字不為純標點符號
    if (!/^[:：；;，,]+$/.test(candidate)) {
      return candidate;
    }
  }

  return s;
}

/**
 * 檢查某個 segment 是否明確符合當前計劃（避免「標準私家房」被誤判為「標準計劃」）
 */
function isSegmentMatchingTier(segment: string, tier: PlanTierItem): boolean {
  for (const kw of tier.keywords) {
    if (!kw) continue;
    if (kw === "標準") {
      // 避開「標準私家房」誤配
      // 只有當出現「標準計劃」、「標準：」、「標準 」、「標準每日」、「標準按」、「標準小型」、「標準外科」等情況時才視為標準計劃
      const standardHit = segment.includes("標準") && !segment.match(/標準私家房(?!.*標準(?!私家房))/);
      if (standardHit) return true;
    } else {
      if (segment.includes(kw)) return true;
    }
  }
  return false;
}

/**
 * 核心限額提取函數（Extract Tier Coverage Limit）
 *
 * 針對混合條款文本（如 `標準計劃 HK$420,000；睿選/尊耀計劃每保單年度 HK$12,000,000；至尊靈活不設限額`）：
 * - 當用戶選中了某個計劃（如「尊耀計劃」），精準提取該計劃對應的限額條款（如 `每保單年度 HK$12,000,000`）。
 * - 若用戶選中了「標準計劃」，提取為 `HK$420,000`。
 * - 若條款為各計劃通用（例如 `保證續保至 100 歲`），保留原文。
 * - 若當前計劃未單獨分段提及，保留原文，確保條款真實不遺漏。
 */
export function extractTierCoverageLimit(
  fullLimitText: string,
  tier: PlanTierItem | null | undefined
): string {
  if (!fullLimitText) return "";
  if (!tier) return fullLimitText;

  // 按照中英文分號拆分成獨立 segment
  const segments = fullLimitText
    .split(/[；;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  // 1. 如果只有一段
  if (segments.length <= 1) {
    const isMatched = isSegmentMatchingTier(fullLimitText, tier);
    if (isMatched) {
      return cleanSegmentPlanPrefix(fullLimitText, tier);
    }
    // 檢查是否包含其他計劃名稱；若不包含，則為通用條款
    return fullLimitText;
  }

  // 2. 多段分割：尋找匹配當前計劃的 segments
  const matchedSegments: string[] = [];
  for (const seg of segments) {
    if (isSegmentMatchingTier(seg, tier)) {
      matchedSegments.push(cleanSegmentPlanPrefix(seg, tier));
    }
  }

  if (matchedSegments.length > 0) {
    return matchedSegments.join("；");
  }

  // 3. 若沒有任何一段直接命中當前 tier：
  // 檢查此條款是否為各計劃通用條款（即所有段落都不包含任何特定計劃名稱）
  const knownPlanKeywords = [
    "標準",
    "尊耀",
    "睿選",
    "靈活",
    "至尊靈活",
    "更衛您",
    "尊衛您",
    "Pink",
    "Hero",
    "非凡",
    "晉悅",
    "全護航",
    "計劃A",
    "計劃B",
    "計劃C",
    "Plan A",
    "Plan B",
    "Plan C",
    "精選",
    "全面",
  ];

  const hasAnyPlanDistinction = segments.some((seg) =>
    knownPlanKeywords.some((kw) => {
      if (kw === "標準") {
        return seg.includes("標準") && !seg.includes("標準私家房");
      }
      return seg.includes(kw);
    })
  );

  // 若全無計劃區分，說明全部計劃通用，保留原文
  if (!hasAnyPlanDistinction) {
    return fullLimitText;
  }

  // 若其他計劃有分段但當前計劃未提及，保留原文避免捏造信息
  return fullLimitText;
}

/**
 * 根據 id 或 code 獲取特定的 PlanTierItem
 */
export function getPlanTierById(
  tiers: PlanTierItem[],
  tierIdOrCode: string | null | undefined
): PlanTierItem | undefined {
  if (!tierIdOrCode) return undefined;
  const normalized = tierIdOrCode.trim().toLowerCase();
  return tiers.find(
    (t) =>
      t.id.toLowerCase() === normalized ||
      t.code?.toLowerCase() === normalized ||
      t.name.toLowerCase() === normalized
  );
}
