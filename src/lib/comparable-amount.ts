export interface ComparableAmount { value: number; basis: "year" | "lifetime" | "day" | "trip" | "event" | "unspecified" }
/** Only a single explicit HKD amount with an unambiguous scope is numeric evidence. */
export function comparableAmount(raw?: string): ComparableAmount | null {
  if (!raw || /US\$|USD|CNY|RMB|人民幣|無上限|不設上限|unlimited|[–—~]|\d\s*-\s*\d|\d\s*(?:至|to)\s*\d|待確認|另議|視乎|可選/i.test(raw)) return null;
  const text = raw.normalize("NFKC");
  const matches = [...text.matchAll(/(?:HK\$|HKD)\s*([\d,]+(?:\.\d+)?)\s*(萬|億)?/gi)];
  if (matches.length !== 1) return null;
  const m = matches[0], rest = text.replace(m[0], "");
  if (/\d|%/.test(rest)) return null;
  const value = Number(m[1].replace(/,/g, "")) * (m[2] === "萬" ? 10000 : m[2] === "億" ? 100000000 : 1);
  if (!Number.isFinite(value) || value < 0) return null;
  const bases = [
    ["year", /每年|全年|年度|annual|per year/i], ["lifetime", /終身|lifetime/i],
    ["day", /每日|每天|per day|daily/i], ["trip", /每程|每次旅程|per trip/i],
    ["event", /每次(?!旅程)|每宗|每事故|per (?:event|claim|occurrence)/i],
  ] as const;
  const hit = bases.filter(([, re]) => re.test(rest));
  if (hit.length > 1) return null;
  return { value, basis: hit[0]?.[0] ?? "unspecified" };
}
export function comparableBest(limits: (string | undefined)[], label = ""): Set<number> {
  const parsed = limits.map(value => comparableAmount(value));
  if (parsed.length < 2 || parsed.some(p => !p || p.basis === "unspecified")) return new Set();
  const rows = parsed as ComparableAmount[];
  if (new Set(rows.map(p => p.basis)).size !== 1) return new Set();
  const values = rows.map(p => p.value);
  if (Math.min(...values) === Math.max(...values)) return new Set();
  const best = /自負額|墊底費|deductible|excess/i.test(label) ? Math.min(...values) : Math.max(...values);
  return new Set(values.flatMap((value, index) => value === best ? [index] : []));
}
