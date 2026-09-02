/** 認可產品狀態：active 在售｜renewal-only 只供現有保單續保｜withdrawn 保險公司終止註冊 */
export type VhisStatus = "active" | "renewal-only" | "withdrawn";

/** 自願醫保標準計劃（政府劃一條款固定設計） */
export interface VhisStandardPlan {
  /** 完整認可編號，例如 S00013-01-000-02 */
  cert_no: string;
  /** 認可編號前綴，例如 S00013 */
  cert_base: string;
  name_zh: string;
  name_en: string;
  company_zh: string;
  company_en: string;
  /** 生效日期（中文格式，例如 2026年7月15日） */
  effective_date_zh: string;
  /** 條款及保障文件 URL */
  plan_doc_url: string;
  /** 標準保費表 URL */
  premium_doc_url: string;
  remarks_zh: string;
  status: VhisStatus;
}

/** 靈活計劃嘅單一級別（每個級別有自己嘅認可編號同文件） */
export interface VhisFlexiLevel {
  cert_no: string;
  level_zh: string;
  level_en: string;
  plan_doc_url: string;
  premium_doc_url: string;
}

/** 自願醫保靈活計劃（喺標準保障之上提供更高／更廣保障，可分多個級別） */
export interface VhisFlexiProduct {
  cert_base: string;
  name_zh: string;
  name_en: string;
  company_zh: string;
  company_en: string;
  effective_date_zh: string;
  remarks_zh: string;
  status: VhisStatus;
  levels: VhisFlexiLevel[];
}

export interface VhisSummary {
  standard_plan_count: number;
  flexi_product_count: number;
  flexi_level_count: number;
  total_cert_bases: number;
}

/** vhis.gov.hk 官方公開數據快照（public/data/vhis-plans.json，由 scripts/build_vhis.py 生成） */
export interface VhisRegistry {
  /** 快照日期 YYYY-MM-DD */
  fetched_at: string;
  /** 數據來源（key = 檔名，value = vhis.gov.hk URL） */
  source_urls: Record<string, string>;
  standard_plans: VhisStandardPlan[];
  flexi_products: VhisFlexiProduct[];
  summary: VhisSummary;
}
