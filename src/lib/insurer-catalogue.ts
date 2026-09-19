import type { Insurer, Product } from "../types/insurance";
import { CATEGORY_ORDER } from "./categories.ts";

export interface InsurerCategoryCount {
  categoryId: string;
  count: number;
}

export interface InsurerCardModel {
  insurer: Insurer;
  /** 有產品嘅類別，CATEGORY_ORDER 序；空類別已省略 */
  categoryCounts: InsurerCategoryCount[];
  totalProducts: number;
  premiumCount: number;
}

export interface InsurerProductSection {
  categoryId: string;
  products: Product[];
}

/** 預設排序：產品數／覆蓋；唔係質素、適合度或推薦排名 */
export const INSURER_SORT_NOTE =
  "按產品數同類別覆蓋排序，唔係質素、適合度或推薦排名。";

/** 公司詳情頁路徑（insurer key 需編碼，支援空格／括號） */
export function insurerDetailPath(insurerKey: string): string {
  return `/insurers/${encodeURIComponent(insurerKey)}`;
}

/** 類別頁路徑（完整類別目錄，唔限定單一公司） */
export function categoryPath(categoryId: string): string {
  return `/category/${encodeURIComponent(categoryId)}`;
}

/**
 * 將某保險公司喺快照入面嘅產品按保險類別分組。
 * 只會分組既有產品；空類別省略；未知類別排喺 CATEGORY_ORDER 之後。
 */
export function groupInsurerProductsByCategory(
  products: Product[],
  insurerKey: string,
): InsurerProductSection[] {
  const owned = products.filter((p) => p.insurer === insurerKey);
  const byCat = new Map<string, Product[]>();
  for (const p of owned) {
    const list = byCat.get(p.category);
    if (list) list.push(p);
    else byCat.set(p.category, [p]);
  }
  const known = new Set<string>(CATEGORY_ORDER);
  const sections: InsurerProductSection[] = [];
  for (const categoryId of CATEGORY_ORDER) {
    const list = byCat.get(categoryId);
    if (list && list.length > 0) sections.push({ categoryId, products: list });
  }
  for (const [categoryId, list] of byCat) {
    if (!known.has(categoryId) && list.length > 0) {
      sections.push({ categoryId, products: list });
    }
  }
  return sections;
}

/** 由快照衍生公司卡模型：類別 chips 計數、產品數、公開保費數 */
export function buildInsurerCardModels(
  products: Product[],
  insurers: Insurer[],
): InsurerCardModel[] {
  return insurers.map((insurer) => {
    const sections = groupInsurerProductsByCategory(products, insurer.name);
    let premiumCount = 0;
    for (const p of products) {
      if (p.insurer === insurer.name && p.premium_available) premiumCount += 1;
    }
    return {
      insurer,
      categoryCounts: sections.map((s) => ({
        categoryId: s.categoryId,
        count: s.products.length,
      })),
      totalProducts: sections.reduce((n, s) => n + s.products.length, 0),
      premiumCount,
    };
  });
}

/**
 * 站內覆蓋排序：先覆蓋類別數，再產品數，再公司拉丁名。
 * 唔係質素排名；UI 必須連同 INSURER_SORT_NOTE 顯示。
 */
export function sortInsurerCardModels(models: InsurerCardModel[]): InsurerCardModel[] {
  return [...models].sort((a, b) => {
    const byCats = b.categoryCounts.length - a.categoryCounts.length;
    if (byCats !== 0) return byCats;
    const byProducts = b.totalProducts - a.totalProducts;
    if (byProducts !== 0) return byProducts;
    return a.insurer.name.localeCompare(b.insurer.name);
  });
}

/** 按公司中英文名搜尋（大小寫不敏感） */
export function filterInsurerCardModels(
  models: InsurerCardModel[],
  query: string,
): InsurerCardModel[] {
  const q = query.trim().toLowerCase();
  if (!q) return models;
  return models.filter(
    (m) =>
      m.insurer.name.toLowerCase().includes(q) ||
      m.insurer.name_zh.toLowerCase().includes(q),
  );
}

/** 只保留覆蓋指定類別嘅公司 */
export function filterInsurerCardModelsByCategory(
  models: InsurerCardModel[],
  categoryId: string,
): InsurerCardModel[] {
  if (!categoryId || categoryId === "all") return models;
  return models.filter((m) => m.categoryCounts.some((c) => c.categoryId === categoryId));
}
