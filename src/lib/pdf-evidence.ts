import { PDF_DOCUMENT_HASHES } from "./generated/pdf-manifest.ts";
import { mirroredPdfHash } from "./pdf-integrity.ts";
import type { Product } from "@/types/insurance";

export function sourceTarget(value?: unknown, explicitPage?: number | null): { url: string; page: number; local: boolean } | null {
  if (typeof value !== "string" || !value || value.includes("\\") || [...value].some(char => char.charCodeAt(0) < 32)) return null;
  const [base, hash = ""] = value.split("#");
  let local = false;
  if (base.startsWith("/")) {
    if (!/^\/docs\/brochures\/[^/?#]+\.pdf$/i.test(base)) return null;
    try { const name = decodeURIComponent(base.slice(16)); if (name.includes("/") || name.includes("\\") || name.startsWith(".")) return null; } catch { return null; }
    local = true;
  } else {
    try { const u = new URL(base); if (u.protocol !== "https:" || u.username || u.password) return null; } catch { return null; }
  }
  const fromHash = new URLSearchParams(hash).get("page");
  const candidate = explicitPage ?? (fromHash && /^\d+$/.test(fromHash) ? Number(fromHash) : 1);
  const page = Number.isSafeInteger(candidate) && Number(candidate) > 0 && Number(candidate) <= 100000 ? Number(candidate) : 1;
  return { url: base, page, local };
}

export type QuoteResult = { status: "matched" | "ambiguous" | "not-found" | "no-text" | "no-quote"; start?: { run: number; offset: number }; end?: { run: number; offset: number } };
const normalize = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[\s\u00ad]/gu, "");
/** Literal matching only. Preserve an offset map through NFKC, ligatures and line breaks. */
export function findQuote(runs: string[], quote: string): QuoteResult {
  const target = normalize(quote);
  if (target.length < 8) return { status: "no-quote" };
  let text = "";
  const offsets: { run: number; offset: number; end: number }[] = [];
  runs.forEach((run, runIndex) => {
    let offset = 0;
    for (const char of run) {
      const n = normalize(char);
      for (let i = 0; i < n.length; i++) offsets.push({ run: runIndex, offset, end: offset + char.length });
      text += n; offset += char.length;
    }
  });
  if (!text) return { status: "no-text" };
  const start = text.indexOf(target);
  if (start < 0) return { status: "not-found" };
  if (text.indexOf(target, start + 1) >= 0) return { status: "ambiguous" };
  const first = offsets[start], last = offsets[start + target.length - 1];
  return { status: "matched", start: { run: first.run, offset: first.offset }, end: { run: last.run, offset: last.end } };
}

export interface EvidenceEntry {
  kind: "coverage" | "citation" | "source";
  index: number;
  url: string;
  page: number | null;
  quote: string;
  item: string;
  limit: string;
  document: string;
  fingerprint: string;
}
function fingerprint(entry: Omit<EvidenceEntry, "fingerprint">, documentHash?: string): string {
  let hash = 14695981039346656037n;
  for (const char of JSON.stringify(["pdf-version-v1", entry, documentHash ?? null])) hash = BigInt.asUintN(64, (hash ^ BigInt(char.codePointAt(0)!)) * 1099511628211n);
  return hash.toString(16);
}
export function evidenceEntries(product: Product, versions: Readonly<Record<string, string>> = PDF_DOCUMENT_HASHES): EvidenceEntry[] {
  const rows: Omit<EvidenceEntry, "fingerprint">[] = [
    ...(product.coverage ?? []).map((row, index) => ({ kind: "coverage" as const, index, url: row.source_url ?? "", page: row.page ?? null, quote: row.quote ?? "", item: row.item, limit: row.limit, document: row.document_name ?? "來源文件" })),
    ...(product.citations ?? []).map((row, index) => ({ kind: "citation" as const, index, url: row.url, page: row.page, quote: row.quote, item: row.claim_summary, limit: "", document: row.document })),
    ...(product.source_urls ?? []).map((url, index) => ({ kind: "source" as const, index, url, page: null, quote: "", item: "產品來源", limit: "", document: "來源網站／文件" })),
  ];
  return rows.filter(row => sourceTarget(row.url)).map(row => ({ ...row, fingerprint: fingerprint(row, mirroredPdfHash(row.url, versions)) }));
}
export function evidenceHref(productId: string, entry: EvidenceEntry): string {
  return `/documents?${new URLSearchParams({ product: productId, kind: entry.kind, entry: String(entry.index), ref: entry.fingerprint })}`;
}
export function resolveEvidence(product: Product, params: URLSearchParams): { status: "matched" | "changed" | "missing"; entry?: EvidenceEntry } {
  const index = params.get("entry");
  if (!index || !/^\d+$/.test(index)) return { status: "missing" };
  const entry = evidenceEntries(product).find(row => row.kind === params.get("kind") && row.index === Number(index));
  if (!entry) return { status: "missing" };
  if (entry.fingerprint !== params.get("ref")) return { status: "changed" };
  return { status: "matched", entry };
}
