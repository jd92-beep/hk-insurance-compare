export interface ComparableAmount {
  value: number;
  basis: "year" | "lifetime" | "day" | "trip" | "event" | "unspecified";
  /** Includes the exact period and beneficiary; empty means not safe to compare. */
  scopeKey: string;
  scopeLabel: string;
}
const PERIODS: { key: string; basis: ComparableAmount["basis"]; label: string; pattern: RegExp }[] = [
  { key: "year", basis: "year", label: "每年", pattern: /每(?:個)?保單年度|每保單年|每年度|每年|全年|年度|per\s+(?:policy\s+)?year|annually|annual/gi },
  { key: "lifetime", basis: "lifetime", label: "終身", pattern: /終身|lifetime/gi },
  { key: "day", basis: "day", label: "每日", pattern: /每日|每天|per\s+day|daily/gi },
  { key: "trip", basis: "trip", label: "每次旅程", pattern: /每次旅程|每旅程|每程|per\s+(?:trip|journey)/gi },
  { key: "claim", basis: "event", label: "每次索償", pattern: /每次索償|每宗索償|per\s+claim/gi },
  { key: "admission", basis: "event", label: "每次住院", pattern: /每次住院|per\s+(?:admission|hospitalisation|hospitalization)/gi },
  { key: "visit", basis: "event", label: "每次診症", pattern: /每次診症|每次門診|per\s+visit/gi },
  { key: "incident", basis: "event", label: "每次事故", pattern: /每次事故|每宗事故|每事故|per\s+(?:incident|occurrence)/gi },
  { key: "unknown-event", basis: "event", label: "每次（口徑未明）", pattern: /每次|每宗|per\s+event/gi },
];
const SUBJECTS = [
  { key: "person", label: "每人", pattern: /每(?:名|位|一)?受保人|每人|per\s+(?:insured\s+)?person/gi },
  { key: "family", label: "每家庭", pattern: /每(?:個)?家庭|per\s+family/gi },
  { key: "policy", label: "每保單", pattern: /每(?:份)?保單|per\s+policy/gi },
];

/** Fail closed: parse the whole summary, not the largest number inside free-form prose. */
export function comparableAmount(raw?: string): ComparableAmount | null {
  if (typeof raw !== "string" || !raw.trim() || raw.length > 1000) return null;
  const text = raw.normalize("NFKC").trim();
  const amounts = [...text.matchAll(/(?:HK\$|HKD)\s*([\d,.]+)\s*(萬|億)?/gi)];
  if (amounts.length !== 1) return null;
  const match = amounts[0];
  if (!/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(match[1])) return null;
  const value = Number(match[1].replaceAll(",", "")) * (match[2] === "萬" ? 10_000 : match[2] === "億" ? 100_000_000 : 1);
  if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) return null;
  let rest = text.replace(match[0], " ");
  const periods = PERIODS.filter(period => {
    let found = false;
    rest = rest.replace(period.pattern, () => { found = true; return " "; });
    return found;
  });
  const subjects = SUBJECTS.filter(subject => {
    let found = false;
    rest = rest.replace(subject.pattern, () => { found = true; return " "; });
    return found;
  });
  if (periods.length > 1 || subjects.length > 1) return null;
  // Any remaining qualifier/currency/number could change the promise. Do not discard it.
  rest = rest.replace(/賠償限額|保障限額|保障額|賠償額|限額|上限|最高|maximum|limit|up\s+to/gi, "")
    .replace(/[\s()[\]:,。/]/g, "");
  if (rest) return null;
  const period = periods[0];
  const subject = subjects[0];
  return {
    value, basis: period?.basis ?? "unspecified",
    scopeKey: period && period.key !== "unknown-event" ? `${period.key}:${subject?.key ?? "unstated"}` : "",
    scopeLabel: `${period?.label ?? "期間未明示"} · ${subject?.label ?? "對象未明示"}`,
  };
}

export function comparableBest(limits: (string | undefined)[], label = ""): Set<number> {
  const rows = limits.map(comparableAmount);
  if (rows.length < 2 || rows.some(row => !row?.scopeKey)) return new Set();
  if (new Set(rows.map(row => row!.scopeKey)).size !== 1) return new Set();
  const values = rows.map(row => row!.value);
  if (Math.min(...values) === Math.max(...values)) return new Set();
  const best = /自負額|墊底費|deductible|excess/i.test(label) ? Math.min(...values) : Math.max(...values);
  return new Set(values.flatMap((value, index) => value === best ? [index] : []));
}
