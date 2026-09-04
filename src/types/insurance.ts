export interface CoverageItem {
  item: string;
  limit: string;
  source_url?: string;
  document_name?: string;
  page?: number | null;
  quote?: string;
}

/** 單條資料引文：claim 嚟自邊份官方文件、邊頁、邊句原文 */
export interface Citation {
  /** 對應產品欄位：premium_range | premium_notes | coverage | key_terms | exclusions | ... */
  claim_field: string;
  /** 本站展示嘅資料摘要（用嚟對應頁面 section） */
  claim_summary: string;
  /** 官方文件名稱 */
  document: string;
  /** 文件頁碼；null = 嚟自官方網頁（無頁碼） */
  page: number | null;
  /** 官方文件原文句子 */
  quote: string;
  /** 官方文件／網頁 URL */
  url: string;
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
  /** 逐條資料出處引文（頁尾「資料出處」section） */
  citations?: Citation[];
  /** 旅遊保險：旅程類型（單次 / 全年多次 / 兩者皆有） */
  trip_type?: "single" | "annual" | "both";
  /** 旅遊保險：覆蓋範圍（亞洲短途 / 全球通用 / 大灣區） */
  destination_scope?: ("asia" | "worldwide" | "gba")[];
  /** 產品推廣折扣優惠與優惠碼 */
  promo?: ProductPromo;
  /** 官方標準原價（數值，例如 145） */
  original_price?: number;
  /** 官方即時折後實付價（數值，例如 109） */
  discounted_price?: number;
  /** 官方即時投保／選購頁面直達網址 */
  official_buy_url?: string;
}

export interface ProductPromo {
  tag: string;
  code?: string | null;
  discount?: string;
  note?: string;
  original_price?: number;
  discounted_price?: number;
  buy_url?: string;
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
