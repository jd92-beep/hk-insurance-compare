export interface CoverageItem {
  item: string;
  limit: string;
}

export interface Product {
  id: string;
  category: string;
  insurer: string;
  insurer_zh: string;
  product_name: string;
  product_name_zh: string;
  plan_tiers: string[];
  coverage: CoverageItem[];
  premium_range: string;
  premium_available: boolean;
  premium_notes: string;
  key_terms: string[];
  exclusions: string[];
  source_urls: string[];
  documents_found: string[];
}

export interface Category {
  id: string;
  name_zh: string;
  count: number;
  insurers_with_premium: number;
}

/** 由產品資料衍生嘅保險公司條目 */
export interface Insurer {
  /** 拉丁名（用作錨點 id，例如 "AXA"） */
  name: string;
  name_zh: string;
  productCount: number;
  /** 有公開保費嘅產品數 */
  premiumCount: number;
  categories: string[];
}

export interface InsuranceData {
  generated_at: string;
  categories: Category[];
  products: Product[];
}
