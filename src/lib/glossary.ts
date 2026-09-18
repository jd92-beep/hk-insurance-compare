/**
 * 教育向保險詞彙（product-neutral）。
 * 定義只解釋術語本身，唔暗示任何特定保單一定有／賠到某項保障。
 */

export interface GlossaryEntry {
  /** 穩定 id，方便測試同 React key */
  id: string;
  /** 主顯示詞（zh-HK） */
  term: string;
  /** 英文／同義標示 */
  en: string;
  /** 原文匹配鍵（含同義詞；匹配時長鍵優先） */
  matchKeys: string[];
  /** 大白話教育定義，唔針對個別產品 */
  definition: string;
}

/** 「更多詞彙」固定去向 */
export const GLOSSARY_MORE_HREF = "/guides" as const;

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: "deductible",
    term: "自負額／墊底費",
    en: "Deductible / Excess",
    matchKeys: ["自負額", "墊底費", "自付費"],
    definition:
      "索償時你要先自己承擔嘅金額。墊底費越高，保費一般越平；點計（每年／每次／每宗）以保單條款為準。",
  },
  {
    id: "waiting-period",
    term: "等候期",
    en: "Waiting Period",
    matchKeys: ["等候期"],
    definition:
      "保單生效後一段時間內，指定保障通常唔會賠。常見於危疾同醫療保險；日數因產品而異。",
  },
  {
    id: "exclusions",
    term: "不保事項",
    en: "Exclusions",
    matchKeys: ["不保事項", "不保條款"],
    definition:
      "保單列明唔賠嘅情況。投保前要逐項睇清楚；具體內容以你份保單條款為準。",
  },
  {
    id: "coinsurance",
    term: "共同保險",
    en: "Coinsurance",
    matchKeys: ["共同保險", "共保比例"],
    definition:
      "索償時你按比例分擔嘅部分（例如賠八成、你自付兩成）。比例同計算方式因計劃而異。",
  },
  {
    id: "reasonable-customary",
    term: "合理及慣常費用",
    en: "Reasonable and Customary Charges",
    matchKeys: ["合理及慣常費用", "合理及慣常", "合理慣常"],
    definition:
      "醫療保險常見口徑：只按市場上合理同慣常收費水平處理合資格開支，超出部分可能要自己負責。定義以保單為準。",
  },
  {
    id: "full-benefit",
    term: "全數賠償",
    en: "Full Reimbursement",
    matchKeys: ["全數賠償"],
    definition:
      "喺合資格開支範圍內、按保單條件處理賠償，唔再設個別細項上限。仍然可能受地域、醫院、病房級別等條件約束。",
  },
  {
    id: "cfar",
    term: "CFAR",
    en: "Cancel For Any Reason",
    matchKeys: ["CFAR", "任何原因取消"],
    definition:
      "旅遊保險常見附加選項名稱：合資格情況下，即使唔係保單列明嘅指定原因，都可能申請取消旅程賠償。通常設投保時限、賠償比例同次數限制。",
  },
  {
    id: "guaranteed-renewal",
    term: "保證續保",
    en: "Guaranteed Renewable",
    matchKeys: ["保證續保"],
    definition:
      "保單條款可能列明：喺指定條件下，期滿後毋須重新核保都可以續保。有冇呢項、邊啲情況適用，要睇條款，唔可以假定。",
  },
  {
    id: "vhis-standard",
    term: "VHIS 標準計劃",
    en: "VHIS Standard Plan",
    matchKeys: ["VHIS標準計劃", "VHIS 標準計劃", "標準計劃"],
    definition:
      "自願醫保認可產品嘅計劃類別之一，核心保障項目同條款設統一標準，方便比較。唔代表所有產品保費或售後服務一樣。",
  },
  {
    id: "vhis-flexi",
    term: "VHIS 靈活計劃",
    en: "VHIS Flexi Plan",
    matchKeys: ["VHIS靈活計劃", "VHIS 靈活計劃", "靈活計劃"],
    definition:
      "自願醫保認可產品嘅另一計劃類別：可以喺標準之上加保障，但加碼部分條款因公司而異，要逐項對照。",
  },
  {
    id: "reimbursement",
    term: "實報實銷",
    en: "Reimbursement",
    matchKeys: ["實報實銷"],
    definition:
      "按實際合資格開支處理賠償（喺保單條件內），唔係一筆過定額現金。通常要保留收據同相關文件。",
  },
  {
    id: "hospital-cash",
    term: "住院現金",
    en: "Hospital Cash",
    matchKeys: ["住院現金", "住院津貼"],
    definition:
      "住院期間按日（或按次）定額發放嘅現金給付，通常唔使對數實際醫療費。同實報實銷係唔同模式。",
  },
  {
    id: "annual-limit",
    term: "每年保障限額",
    en: "Annual Benefit Limit",
    matchKeys: ["每年保障限額", "每年限額", "年度上限", "年度限額"],
    definition:
      "保單年度內某項或整體保障嘅最高賠償額。用完未必即刻有新額度，要睇保單重置條款。",
  },
  {
    id: "lifetime-limit",
    term: "終身保障限額",
    en: "Lifetime Benefit Limit",
    matchKeys: ["終身保障限額", "終身上限", "終身限額"],
    definition:
      "保單期間累積可賠嘅最高總額。同每年限額分開計；到咗終身上限後，相關保障可能終止。",
  },
  {
    id: "premium",
    term: "保費",
    en: "Premium",
    matchKeys: ["保費"],
    definition: "你畀保險公司嘅費用，可以年繳、月繳等。繳費期同金額以保單為準。",
  },
  {
    id: "sum-insured",
    term: "保額／賠償上限",
    en: "Sum Insured / Benefit Limit",
    matchKeys: ["保額", "賠償上限"],
    definition:
      "出事時保險公司最多賠幾多。可能分總額同分項上限；貴重物品等成日有獨立上限。",
  },
  {
    id: "cooling-off",
    term: "冷靜期",
    en: "Cooling-off Period",
    matchKeys: ["冷靜期"],
    definition:
      "長期保單簽發後一段特定期間內取消，可能按條款退回保費（或有市值調整）。日數以保單及適用規定為準。",
  },
  {
    id: "third-party",
    term: "第三者責任",
    en: "Third-Party Liability",
    matchKeys: ["第三者責任", "第三方責任"],
    definition:
      "你令他人受傷或財物損失時嘅法律賠償責任保障。家居、汽車、寵物等保險都可能見到。",
  },
  {
    id: "ncd",
    term: "NCD 無索償折扣",
    en: "No-Claim Discount",
    matchKeys: ["無索償折扣", "無賠償折扣", "NCD"],
    definition:
      "汽車保險常見：連續沒有索償，續保保費可能有折扣。折扣可唔可以轉公司、點計，要問清楚。",
  },
  {
    id: "plan-tier",
    term: "計劃層級",
    en: "Plan Tier",
    matchKeys: ["計劃層級", "計劃級別", "保障級別"],
    definition:
      "同一產品下唔同保障級別。保額、不保事項同保費可以差好遠，格價要同一層級先公平。",
  },
];

export interface GlossaryMatch {
  start: number;
  end: number;
  entry: GlossaryEntry;
}

export type GlossarySegment =
  | { type: "text"; value: string }
  | { type: "term"; value: string; entry: GlossaryEntry };

/** ASCII（英文縮寫）鍵用唔區分大小寫比較 */
function keyMatches(text: string, index: number, key: string): boolean {
  if (key.length === 0) return false;
  if (text.length < index + key.length) return false;
  const slice = text.slice(index, index + key.length);
  if (/^[\x20-\x7E]+$/.test(key)) {
    return slice.toLowerCase() === key.toLowerCase();
  }
  return slice === key;
}

/** 所有匹配鍵，長鍵優先，避免「每年限額」食走「每年保障限額」 */
const ORDERED_KEYS: Array<{ key: string; entry: GlossaryEntry }> = GLOSSARY_ENTRIES.flatMap(
  (entry) => entry.matchKeys.map((key) => ({ key, entry })),
).sort((a, b) => b.key.length - a.key.length || a.key.localeCompare(b.key));

/**
 * 掃描文字，回傳詞彙命中（左至右、每個位置取最長鍵）。
 * 命中只表示「文中出現術語」，唔代表該保單一定提供呢項保障。
 */
export function findGlossaryMatches(text: string): GlossaryMatch[] {
  if (!text) return [];
  const matches: GlossaryMatch[] = [];
  let i = 0;
  while (i < text.length) {
    let hit: { key: string; entry: GlossaryEntry } | null = null;
    for (const item of ORDERED_KEYS) {
      if (keyMatches(text, i, item.key)) {
        hit = item;
        break;
      }
    }
    if (hit) {
      matches.push({ start: i, end: i + hit.key.length, entry: hit.entry });
      i += hit.key.length;
    } else {
      i += 1;
    }
  }
  return matches;
}

/** 將文字拆成純文字 + 詞彙片段，方便 UI 包裝 */
export function splitByGlossary(text: string): GlossarySegment[] {
  if (!text) return [];
  const matches = findGlossaryMatches(text);
  if (matches.length === 0) return [{ type: "text", value: text }];
  const parts: GlossarySegment[] = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) {
      parts.push({ type: "text", value: text.slice(cursor, m.start) });
    }
    parts.push({
      type: "term",
      value: text.slice(m.start, m.end),
      entry: m.entry,
    });
    cursor = m.end;
  }
  if (cursor < text.length) {
    parts.push({ type: "text", value: text.slice(cursor) });
  }
  return parts;
}

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY_ENTRIES.find((entry) => entry.id === id);
}

export function glossaryTitle(entry: GlossaryEntry): string {
  const en = entry.en ? `（${entry.en}）` : "";
  return `${entry.term}${en}：${entry.definition}`;
}
