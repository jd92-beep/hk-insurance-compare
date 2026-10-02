/**
 * VHIS premiums by age, from public/data/vhis-premiums.json:
 *  - standard: government "Standard Plan Premium Summary" (male / female, attained age 0–99)
 *    built by scripts/build_vhis_premiums.py;
 *  - flexi: annual premiums extracted from each certified level's official premium schedule PDF
 *    by scripts/build_vhis_flexi_premiums.py (levels that could not be read reliably are absent).
 */

/** a number = premium for a new application at that age; [min, max] = renewal-only age whose premium depends on entry age */
export type AgeCell = number | [number, number] | null;

export interface StandardPremiums {
  provider: string;
  new_application_ages: [number, number] | null;
  renewal_only_ages: [number, number] | null;
  male: AgeCell[];
  female: AgeCell[];
}

export interface FlexiPremiums {
  basis: "attained" | "next_birthday" | "nearest_birthday";
  currency: "HKD" | "USD";
  source: string;
  /** schedule age of annual[0] */
  start: number;
  /** annual premium per consecutive schedule age: a number, or [min, max] across the schedule's columns */
  annual: (number | [number, number])[];
}

export interface VhisPremiumData {
  source: { document: string; as_of: string | null; fetched_at: string; note: string; flexi_note?: string };
  standard: Record<string, StandardPremiums>;
  flexi: Record<string, FlexiPremiums>;
}

export const MIN_AGE = 0;
export const MAX_AGE = 99;
export const DEFAULT_AGE = 30;

export function clampAge(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_AGE;
  return Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(n)));
}

export interface StandardAt {
  male: AgeCell;
  female: AgeCell;
  /** age is outside the provider's new-application range (renewal only) */
  renewalOnly: boolean;
}

export function standardAt(data: VhisPremiumData | null, certBase: string, age: number): StandardAt | null {
  const p = data?.standard[certBase];
  if (!p) return null;
  const male = p.male[age] ?? null;
  const female = p.female[age] ?? null;
  if (male == null && female == null) return null;
  const nr = p.new_application_ages;
  return { male, female, renewalOnly: nr ? age > nr[1] : false };
}

/** the schedule row that applies to someone whose attained age is `age` */
export function scheduleAge(basis: FlexiPremiums["basis"], age: number): number {
  return basis === "next_birthday" ? age + 1 : age;
}

export interface FlexiAt {
  min: number;
  max: number;
  currency: "HKD" | "USD";
}

export function flexiAt(data: VhisPremiumData | null, certNo: string, age: number): FlexiAt | null {
  const p = data?.flexi[certNo];
  if (!p) return null;
  const row = p.annual[scheduleAge(p.basis, age) - p.start];
  if (row == null) return null;
  const [min, max] = typeof row === "number" ? [row, row] : row;
  return { min, max, currency: p.currency };
}

/** range across all of a flexi product's levels, per currency */
export function flexiProductAt(data: VhisPremiumData | null, certNos: string[], age: number): FlexiAt[] {
  const by: Record<string, FlexiAt> = {};
  for (const c of certNos) {
    const r = flexiAt(data, c, age);
    if (!r) continue;
    const cur = by[r.currency];
    by[r.currency] = cur ? { ...cur, min: Math.min(cur.min, r.min), max: Math.max(cur.max, r.max) } : r;
  }
  return Object.values(by).sort((a, b) => (a.currency === b.currency ? 0 : a.currency === "HKD" ? -1 : 1));
}

export function money(n: number, currency: "HKD" | "USD" = "HKD"): string {
  const s = n.toLocaleString("en-US", n % 1 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 });
  return `${currency === "USD" ? "US$" : "HK$"}${s}`;
}

export function cellText(cell: AgeCell): string | null {
  if (cell == null) return null;
  if (typeof cell === "number") return money(cell);
  return cell[0] === cell[1] ? money(cell[0]) : `${money(cell[0])}–${money(cell[1]).replace("HK$", "")}`;
}
