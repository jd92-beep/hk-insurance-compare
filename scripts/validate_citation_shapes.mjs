#!/usr/bin/env node
/**
 * Curation guard: reject coverage quotes that are merely item+limit concatenations
 * or empty "page=1 only" citations without text. Does not invent or rewrite data.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = JSON.parse(readFileSync(join(root, "public/data/insurance-data.json"), "utf8"));

function normalize(s) {
  return String(s ?? "").normalize("NFKC").replace(/\s+/gu, "");
}

const fabricated = [];
const emptyPageDefault = [];

for (const product of raw.products ?? []) {
  for (const [index, row] of (product.coverage ?? []).entries()) {
    const quote = normalize(row.quote);
    if (!quote) continue;
    const item = normalize(row.item);
    const limit = normalize(row.limit);
    const combos = new Set([
      item + limit,
      item + ":" + limit,
      item + "：" + limit,
      item + "-" + limit,
      item + "－" + limit,
    ]);
    if (combos.has(quote)) {
      fabricated.push({ product: product.id, index, item: row.item, limit: row.limit, quote: row.quote });
    }
    if (row.page === 1 && quote.length < 8 && row.source_url) {
      emptyPageDefault.push({ product: product.id, index, quote: row.quote });
    }
  }
}

if (fabricated.length) {
  console.error("FAIL: coverage quotes that only restate item+limit (likely generated):");
  for (const row of fabricated.slice(0, 20)) console.error(`  ${row.product} coverage[${row.index}] ${row.quote}`);
  process.exitCode = 1;
}

if (emptyPageDefault.length) {
  console.error("FAIL: coverage quotes shorter than 8 chars pinned to page 1:");
  for (const row of emptyPageDefault.slice(0, 20)) console.error(`  ${row.product} coverage[${row.index}] ${JSON.stringify(row.quote)}`);
  process.exitCode = 1;
}

if (!process.exitCode) {
  console.log(`OK: ${(raw.products ?? []).length} products; no item+limit fabricated quotes; no tiny page-1 quotes.`);
}
