export interface ComparableAmount {
  value: number;
  basis: "year" | "lifetime" | "day" | "trip" | "event" | "unspecified";
  scopeKey: string;
  scopeLabel: string;
  comparable: boolean;
}
const PERIODS: [string, ComparableAmount["basis"], string, RegExp][] = [
  ["policy-year", "year", "每保單年度", /每(?:個)?保單年度|\bper policy year\b|\beach policy year\b/gi],
  ["calendar-year", "year", "每曆年", /每曆年|\bper calendar year\b/gi],
  ["year", "year", "每年（年度定義未註明）", /每年|全年|年度|\bper year\b|\bannual(?:ly)?\b|\byearly\b/gi],
  ["lifetime", "lifetime", "終身", /終身|\blifetime\b/gi],
  ["day", "day", "每日", /每日|每天|\bper day\b|\bdaily\b/gi],
  ["trip", "trip", "每次旅程", /每次旅程|每旅程|每程|\bper (?:trip|journey)\b/gi],
  ["admission", "event", "每次住院", /每次住院|\bper (?:admission|hospitalisation|hospitalization)\b/gi],
  ["claim", "event", "每次索償", /每次索償|每宗索償|\bper claim\b/gi],
  ["visit", "event", "每次診症", /每次(?:診症|門診)|\bper (?:visit|consultation)\b/gi],
  ["incident", "event", "每次事故", /每次事故|每宗事故|每事故|\bper (?:incident|occurrence)\b/gi],
  ["generic-event", "event", "每次（事故／索償等定義未註明）", /每次|每宗|\bper event\b/gi],
];
const RECIPIENTS: [string, string, RegExp][] = [
  ["person", "每人", /每位受保人|每名受保人|每受保人|每人|\bper (?:insured person|person)\b/gi],
  ["policy", "每保單", /每份保單|每保單|\bper policy\b/gi],
];

/** A bounded grammar, not 'extract the largest number from arbitrary insurance prose'. */
export function comparableAmount(raw?: string): ComparableAmount | null {
  if (!raw || raw.length > 2000) return null;
  const text = raw.normalize("NFKC").trim();
  const amounts = [...text.matchAll(/(?:HK\$|\bHKD(?![A-Za-z])|港幣|港元)\s*((?:0|[1-9]\d{0,2}(?:,\d{3})+|[1-9]\d*)(?:\.\d+)?)\s*(萬|億)?/gi)];
  if (amounts.length !== 1) return null;
  const match = amounts[0];
  let rest = text.slice(0, match.index) + text.slice(match.index! + match[0].length);
  const value = Number(match[1].replaceAll(",", "")) * (match[2] === "億" ? 100_000_000 : match[2] === "萬" ? 10_000 : 1);
  if (!Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) return null;
  const periods: (typeof PERIODS)[number][] = [];
  for (const period of PERIODS) rest = rest.replace(period[3], () => { periods.push(period); return " "; });
  const recipients: (typeof RECIPIENTS)[number][] = [];
  for (const recipient of RECIPIENTS) rest = rest.replace(recipient[2], () => { recipients.push(recipient); return " "; });
  // Multiple scope mentions may describe layered limits; do not choose one.
  if (periods.length > 1 || recipients.length > 1) return null;
  rest = rest.replace(/最高賠償額|賠償限額|保障上限|最高|上限|限額|\bmaximum\b|\bmax\b|\blimit\b|\bup to\b/gi, "");
  if (rest.replace(/[\s()（）:：/／]/g, "")) return null;
  const period = periods[0], recipient = recipients[0];
  const basis = period?.[1] ?? "unspecified";
  return {
    value, basis,
    scopeKey: `${period?.[0] ?? "unspecified"}:${recipient?.[0] ?? "unspecified"}`,
    scopeLabel: `${period?.[2] ?? "期間未明示"} · ${recipient?.[1] ?? "每人／每保單未註明"}`,
    comparable: Boolean(period && period[0] !== "generic-event"),
  };
}
export function comparableBest(limits: (string | undefined)[], label = ""): Set<number> {
  const parsed = limits.map(value => comparableAmount(value));
  if (parsed.length < 2 || parsed.some(row => !row?.comparable)) return new Set();
  const rows = parsed as ComparableAmount[];
  if (new Set(rows.map(row => row.scopeKey)).size !== 1) return new Set();
  const values = rows.map(row => row.value);
  if (Math.min(...values) === Math.max(...values)) return new Set();
  const best = /自負額|墊底費|deductible|excess/i.test(label) ? Math.min(...values) : Math.max(...values);
  return new Set(values.flatMap((value, index) => value === best ? [index] : []));
}
