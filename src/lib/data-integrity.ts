import type { InsuranceData, Product, CoverageItem, Citation } from "../types/insurance";
const record=(v: unknown): v is Record<string,unknown> => !!v && typeof v === "object" && !Array.isArray(v);
/** Missing evidence stays missing; present malformed evidence is an input error. */
function evidenceText(value: unknown, path: string): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value !== "string") throw Error(`來源欄位 ${path} 必須是文字。`);
  return value;
}
function evidencePage(value: unknown, path: string): number | null {
  if (value === null || value === undefined) return null;
  const page = typeof value === "string" && /^[1-9]\d*$/.test(value) ? Number(value) : value;
  if (typeof page !== "number" || !Number.isSafeInteger(page) || page < 1 || page > 100000) {
    throw Error(`來源欄位 ${path} 必須是正整數頁碼，未提供時請用 null。`);
  }
  return page;
}
/** Validate the public snapshot before any component consumes it; never invent coverage. */
export function parseInsuranceData(value: unknown): InsuranceData {
  if(!record(value)||!Array.isArray(value.products)||!Array.isArray(value.categories))throw Error("資料格式不正確，未能顯示保險產品。");
  const ids=new Set<string>(), categories=new Set<string>();
  for(const c of value.categories){
    if(!record(c)||typeof c.id!=="string"||typeof c.name_zh!=="string"||!c.id||categories.has(c.id))throw Error("類別資料缺失或重複。");
    categories.add(c.id);
  }
  const products: Product[]=value.products.map((p: unknown)=>{
    if(!record(p))throw Error("產品資料格式不正確。");
    for(const key of ["id","category","insurer","insurer_zh","product_name","product_name_zh","premium_range","premium_notes"])
      if(typeof p[key]!=="string")throw Error(`產品欄位 ${key} 格式不正確。`);
    if(!p.id||ids.has(p.id as string))throw Error("產品 ID 缺失或重複。");ids.add(p.id as string);
    if(!categories.has(p.category as string))throw Error("產品指向不存在的類別。");
    for(const key of ["plan_tiers","key_terms","exclusions","source_urls","documents_found"])
      if(!Array.isArray(p[key])||!(p[key] as unknown[]).every(v=>typeof v==="string"))throw Error(`產品欄位 ${key} 格式不正確。`);
    if(!Array.isArray(p.coverage)||!p.coverage.every(c=>record(c)&&typeof c.item==="string"&&typeof c.limit==="string"))throw Error("保障項目格式不正確。");
    if(p.citations!==undefined&&(!Array.isArray(p.citations)||!p.citations.every(record)))throw Error("引用資料格式不正確。");
    const coverage: CoverageItem[] = (p.coverage as Record<string, unknown>[]).map((c, index) => {
      const path = `${p.id}.coverage[${index}]`;
      return {
        ...c, item: c.item as string, limit: c.limit as string,
        source_url: evidenceText(c.source_url, `${path}.source_url`),
        document_name: evidenceText(c.document_name, `${path}.document_name`),
        quote: evidenceText(c.quote, `${path}.quote`),
        page: evidencePage(c.page, `${path}.page`),
      };
    });
    const citations: Citation[] | undefined = (p.citations as Record<string,unknown>[] | undefined)?.map((c, index) => {
      const path = `${p.id}.citations[${index}]`;
      return {
        ...c,
        claim_field: evidenceText(c.claim_field, `${path}.claim_field`) ?? "",
        claim_summary: evidenceText(c.claim_summary, `${path}.claim_summary`) ?? "",
        document: evidenceText(c.document, `${path}.document`) ?? "",
        quote: evidenceText(c.quote, `${path}.quote`) ?? "",
        url: evidenceText(c.url, `${path}.url`) ?? "",
        page: evidencePage(c.page, `${path}.page`),
      };
    });
    return {...p,coverage,citations,premium_available:p.premium_available===true} as unknown as Product;
  });
  return {
    generated_at: typeof value.generated_at==="string"&&/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value.generated_at)?value.generated_at:"未提供",
    products,
    categories: value.categories.map(c=>({id:c.id,name_zh:c.name_zh,count:products.filter(p=>p.category===c.id).length,
      insurers_with_premium:new Set(products.filter(p=>p.category===c.id&&p.premium_available).map(p=>p.insurer)).size})),
  };
}
export function safeFragment(hash: string): string { try{return decodeURIComponent(hash.replace(/^#/,""));}catch{return "";} }
