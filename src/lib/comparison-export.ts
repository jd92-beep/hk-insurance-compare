import type { Product } from "../types/insurance";
import { evidenceEntries, evidenceHref, sourceTarget } from "./pdf-evidence.ts";

interface BriefOptions { origin:string; snapshotDate:string; exportedAt:string; version:string }
/** One table cell/heading, never executable HTML, a new Markdown block or a forged link. */
export function briefText(value: unknown): string {
  if(typeof value!=="string"||!value.trim())return "未提供";
  return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replace(/\r\n|[\r\n]/g," ⏎ ")
    .split("").filter(ch=>ch.charCodeAt(0)>=32||ch==="\t").join("")
    .replace(/\t/g," ").replace(/[\\`*_[\]{}()#!|~]/g,"\\$&");
}
function safeLink(value: unknown, origin:string): string | null {
  if(typeof value!=="string"||!sourceTarget(value))return null;
  try {
    const url=new URL(value,origin);
    return url.href.replace(/[()<>"'`]/g,ch=>`%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
  }catch{return null;}
}
function pageLabel(row: Product["coverage"][number]): string {
  const direct=typeof row.page==="number"&&Number.isSafeInteger(row.page)&&row.page>0&&row.page<=100000?row.page:null;
  const raw=typeof row.source_url==="string"?new URLSearchParams(row.source_url.split("#")[1]??"").get("page"):null;
  const fragment=raw&&/^[1-9]\d*$/.test(raw)&&Number(raw)<=100000?Number(raw):null;
  if(direct&&fragment&&direct!==fragment)return `頁碼不一致：欄位${direct}／連結${fragment}，需覆核`;
  return direct?`PDF實體頁 ${direct}`:fragment?`連結標示頁 ${fragment}（欄位未提供）`:"頁碼未提供，未推定第1頁";
}

/** A portable public-data review brief, not an equivalent-benefit ranking or policy copy. */
export function comparisonBrief(products: Product[], options: BriefOptions): {filename:string;content:string} {
  const origin=new URL(options.origin);
  if(!["https:","http:"].includes(origin.protocol)||origin.username||origin.password)throw Error("Invalid export origin");
  if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(options.exportedAt)||!Number.isFinite(Date.parse(options.exportedAt))||new Date(options.exportedAt).toISOString()!==options.exportedAt)throw Error("Invalid export timestamp");
  if(!products.length||products.length>3||new Set(products.map(p=>p.id)).size!==products.length||products.some(p=>typeof p.id!=="string"||!/^[A-Za-z0-9][A-Za-z0-9_-]{0,159}$/.test(p.id)))throw Error("Choose 1–3 distinct products");
  const base=origin.origin;
  const compare=new URL("/compare",base);compare.searchParams.set("ids",products.map(p=>p.id).join(","));
  const lines=["# 保險比較核對摘要","",`資料快照：${briefText(options.snapshotDate)}`,`匯出時間（UTC）：${options.exportedAt}`,`網站版本：${briefText(options.version)}`,"",
    "**本檔不是報價、投保建議、核保結果或保單原文。未核實官方最新適用版本。**",
    "以下是網站摘要及來源入口；來源存在、文字吻合或文件雜湊一致，均不等於保障主張或版本已獲確認。病房、地區、計劃級別、自負額、期間及例外必須分開核對。優惠有效期並未由此匯出功能驗證。",
    "",`[重新開啟目前產品比較](${compare.href})`,""];
  if(new Set(products.map(p=>p.category)).size>1)lines.push("**注意：所選產品屬不同保險類別，不可按同一保額或保費直接排名。**","");
  for(const [index,p] of products.entries()){
    const entries=new Map(evidenceEntries(p).filter(e=>e.kind==="coverage").map(e=>[e.index,e]));
    lines.push(`## ${index+1}. ${briefText(p.product_name_zh||p.product_name)}`,"",`公司：${briefText(p.insurer_zh)} / ${briefText(p.insurer)}`,`產品ID：${briefText(p.id)}`,`類別：${briefText(p.category)}`,`計劃層級（網站列示）：${briefText((p.plan_tiers??[]).join(" / "))}`,"",
      `[產品頁](${new URL(`/product/${encodeURIComponent(p.id)}`,base).href}) · [產品PDF中心](${new URL(`/documents?product=${encodeURIComponent(p.id)}`,base).href})`,"",
      `網站保費參考文字（非即時同條件報價）：${briefText(p.premium_range)}`,`保費備註：${briefText(p.premium_notes)}`,"",
      "### 保障資料（網站摘要）","","| 項目 | 列示限額／條件 | 引用頁碼 | 核對入口 |","|---|---|---|---|");
    if(!p.coverage.length)lines.push("| 未提供保障摘要 | 未提供 | 頁碼未提供 | 未提供安全可用來源 |");
    for(const [i,row] of p.coverage.entries()){
      const entry=entries.get(i);const raw=safeLink(row.source_url,base);
      const link=entry&&raw?`[PDF中心／來源核對](${new URL(evidenceHref(p.id,entry),base).href}) · [原來源](${raw})`:"未提供安全可用來源";
      lines.push(`| ${briefText(row.item)} | ${briefText(row.limit)} | ${briefText(pageLabel(row))} | ${link} |`);
    }
    lines.push("","### 重要條款（網站摘要）","");
    lines.push(...(p.key_terms?.length?p.key_terms.map(t=>`- ${briefText(t)}`):["未提供；不代表沒有條件。"]));
    lines.push("","### 不保事項（網站摘要，非完整保單）","");
    lines.push(...(p.exclusions?.length?p.exclusions.map(t=>`- ${briefText(t)}`):["未提供；不代表全部受保。"]));
    lines.push("","### 其他來源入口","");
    const sources=[...new Set((p.source_urls??[]).map(url=>safeLink(url,base)).filter((url):url is string=>!!url))];
    lines.push(...(sources.length?sources.map((url,i)=>`- [來源 ${i+1}（權威及適用版本待核對）](${url})`):["未提供安全可用來源。"]),"");
  }
  lines.push("## 投保前仍需覆核","","- 核對同一產品、計劃級別及適用地區；不要把不同來源文件的限額拼成一份保障。","- 打開來源頁及相關不保事項；缺頁碼或前後不一致時不可當成已定位。","- 向保險公司取得適用條件及當前報價；此檔案不更新、沒有報價有效期承諾。","");
  const content=lines.join("\n");if(content.length>1000000)throw Error("Comparison brief exceeds export size limit");
  return {filename:`insurance-comparison-${options.exportedAt.slice(0,10)}.md`,content};
}
