import type { Product } from "@/types/insurance";
import { isReferenceOnlyProduct } from "./product-availability.ts";

/**
 * Starter comparisons for /compare: for each category, ready-made sets of up to three products from
 * different insurers. The site has no sales or popularity data, so sets are either
 *  - "editorial": the combinations the site already features as 熱門組合 on the category index, or
 *  - "evidence": products with the most complete public evidence (published premium, coverage rows,
 *    official documents), one per insurer.
 * Neither is a recommendation or a sales ranking, and the UI says so.
 */
export const POPULAR_COMBOS: { label: string; categoryId: string; ids: string[] }[] = [
  // AIG travel is discontinued in the snapshot, so it is no longer featured
  { label: "旅遊保險：Blue Cross · AXA · MSIG", categoryId: "travel", ids: ["travel-blue-cross", "travel-axa", "travel-msig"] },
  { label: "自願醫保：Bowtie · 保柏 · AIA", categoryId: "medical", ids: ["medical-bowtie", "medical-bupa", "medical-aia"] },
  { label: "高端醫療：保柏環球 · 友邦 · 信諾", categoryId: "high-end-medical", ids: ["high-end-bupa-elite", "high-end-aia-ceo", "high-end-cigna-global"] },
  { label: "Top-up 醫保：保柏 · 信諾 · 友邦", categoryId: "top-up-medical", ids: ["topup-bupa-carepro", "topup-cigna-plus", "topup-aia-extra-medic"] },
  { label: "家居保險：AXA · Avo · 蘇黎世", categoryId: "home", ids: ["home-axa", "home-avo", "home-zurich"] },
];

export type PresetBasis = "editorial" | "evidence";

export interface ComparePreset {
  categoryId: string;
  ids: string[];
  basis: PresetBasis;
}

/** public-evidence completeness, not quality */
export function evidenceScore(p: Product): number {
  return (
    (p.premium_available ? 3 : 0) +
    Math.min(p.coverage?.length ?? 0, 12) / 4 +
    Math.min(p.documents_found?.length ?? 0, 6) / 3 +
    Math.min(p.citations?.length ?? 0, 10) / 10
  );
}

function eligible(p: Product): boolean {
  return !isReferenceOnlyProduct(p) && p.record_status !== "archived";
}

/** Up to `maxSets` sets of ≤3 products (≥2), each set from distinct insurers; products never repeat across sets. */
export function presetsFor(categoryId: string, products: Product[], maxSets = 3): ComparePreset[] {
  const pool = products.filter((p) => p.category === categoryId && eligible(p));
  const byId = new Map(pool.map((p) => [p.id, p]));
  const used = new Set<string>();
  const sets: ComparePreset[] = [];

  const editorial = POPULAR_COMBOS.find((c) => c.categoryId === categoryId);
  if (editorial && editorial.ids.every((id) => byId.has(id))) {
    sets.push({ categoryId, ids: [...editorial.ids], basis: "editorial" });
    editorial.ids.forEach((id) => used.add(id));
  }

  const ranked = [...pool].sort((a, b) => evidenceScore(b) - evidenceScore(a) || a.id.localeCompare(b.id));
  while (sets.length < maxSets) {
    const insurers = new Set<string>();
    const ids: string[] = [];
    for (const p of ranked) {
      if (used.has(p.id) || insurers.has(p.insurer)) continue;
      ids.push(p.id);
      insurers.add(p.insurer);
      if (ids.length === 3) break;
    }
    if (ids.length < 2) break;
    ids.forEach((id) => used.add(id));
    sets.push({ categoryId, ids, basis: "evidence" });
  }
  return sets;
}
