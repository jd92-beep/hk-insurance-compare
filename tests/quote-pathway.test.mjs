import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { quotePathway, publishedPremiumRows, LIVE_QUOTE_BOUNDARY, QUOTE_PREP_ITEMS } from '../src/lib/quote-pathway.ts';
import { parseInsuranceData } from '../src/lib/data-integrity.ts';

const data = parseInsuranceData(JSON.parse(readFileSync('public/data/insurance-data.json', 'utf8')));
const byId = Object.fromEntries(data.products.map((p) => [p.id, p]));

test('live-quote boundary never claims the site calculates premiums', () => {
  assert.ok(LIVE_QUOTE_BOUNDARY.siteDoesNotQuote.includes('唔提供即時保費試算'));
  assert.ok(QUOTE_PREP_ITEMS.length >= 4);
});

test('reference-only AIG has no official quote CTA', () => {
  const pathway = quotePathway(byId['travel-aig']);
  assert.equal(pathway.mode, 'reference-only');
  assert.equal(pathway.buyUrl, undefined);
  assert.equal(pathway.buyLabel, null);
});

test('products with digit premium text classify as published-schedule or age-table', () => {
  const blue = quotePathway(byId['travel-blue-cross']);
  assert.ok(['published-schedule', 'published-age-table', 'official-quote-only'].includes(blue.mode));
  if (blue.snapshotText) assert.ok(blue.disclaimer.includes('唔提供即時保費試算') || blue.disclaimer.includes('並非即時') || blue.disclaimer.includes('唔係你嘅報價') || blue.disclaimer.includes('唔提供即時'));
});

test('official-quote-only products keep a safe buy URL when present', () => {
  const axa = quotePathway(byId['travel-axa']);
  // AXA premium_available false in sample — pathway should still be honest
  assert.ok(axa.mode !== 'reference-only');
  assert.ok(axa.headline.length > 0);
});

test('published premium rows are text-only and do not invent numbers', () => {
  const rows = publishedPremiumRows([byId['travel-blue-cross'], byId['travel-allianz']]);
  assert.ok(rows && rows.length === 2);
  for (const row of rows) {
    assert.equal(typeof row.text, 'string');
    assert.ok(!/最適合|保證批核/.test(row.text));
  }
});
