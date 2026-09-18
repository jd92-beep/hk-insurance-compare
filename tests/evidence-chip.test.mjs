import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  COMPARE_GLOSSARY_NOTE,
  CROSS_CATEGORY_COMPARE_NOTICE,
  MULTI_TIER_COMPARE_NOTICE,
  coverageEvidenceStatus,
  evidenceChipLabel,
  hasMultiplePlanTiers,
  productEvidenceSummary,
  spansMultipleCategories,
} from '../src/lib/evidence-status.ts';
import { productLifecycle } from '../src/lib/product-lifecycle.ts';
import { priceDisplay } from '../src/lib/premium-display.ts';

const product = (extra = {}) => ({
  id: 'x',
  category: 'travel',
  insurer: 'X',
  insurer_zh: 'X',
  product_name: 'X',
  product_name_zh: 'X',
  plan_tiers: [],
  coverage: [],
  premium_range: '—',
  premium_available: true,
  premium_notes: '',
  key_terms: [],
  exclusions: [],
  source_urls: [],
  documents_found: [],
  ...extra,
});

test('evidence chip label reports field presence and never verification or suitability', () => {
  assert.equal(evidenceChipLabel({ complete: 0, total: 0 }), '來源欄位：未提供 · 最新性未核實');
  assert.equal(evidenceChipLabel({ complete: 1, total: 2 }), '來源欄位：1/2 較齊 · 最新性未核實');
  assert.equal(evidenceChipLabel({ complete: 3, total: 3 }), '來源欄位：3/3 較齊 · 最新性未核實');
  const label = evidenceChipLabel(productEvidenceSummary(product({
    coverage: [
      { item: 'a', limit: 'b', source_url: '/docs/x.pdf', quote: 'qqqqqqqq', page: 1 },
      { item: 'c', limit: 'd' },
    ],
  })));
  assert.equal(label, '來源欄位：1/2 較齊 · 最新性未核實');
  for (const banned of ['已核實', '已驗證', '適合', '推薦', 'verified', 'suitable', 'approved']) {
    assert.ok(!label.includes(banned), `chip must not claim ${banned}`);
  }
});

test('chip copy stays honest when lifecycle fields are absent or discontinued', () => {
  const bare = productLifecycle(product(), '2026-09-02');
  assert.equal(bare.status, 'unverified');
  assert.ok(bare.statusLabel.includes('未核實'));
  assert.ok(bare.snapshotNote.includes('唔係'));
  const discontinued = productLifecycle(product({ record_status: 'discontinued' }), '2026-09-02');
  assert.ok(discontinued.statusLabel.includes('停售') || discontinued.statusLabel.includes('覆核'));
  assert.ok(!discontinued.statusLabel.includes('已核實'));
});

test('compare guardrails fire on distinct categories and multi-tier products', () => {
  const travel = product({ id: 't1', category: 'travel', plan_tiers: ['Basic'] });
  const home = product({ id: 'h1', category: 'home', plan_tiers: ['Standard'] });
  const multiTier = product({ id: 'm1', category: 'travel', plan_tiers: ['Basic', 'Plus', 'Premier'] });

  assert.equal(spansMultipleCategories([travel, travel]), false);
  assert.equal(spansMultipleCategories([travel]), false);
  assert.equal(spansMultipleCategories([travel, home]), true);
  assert.equal(spansMultipleCategories([travel, multiTier]), false);

  assert.equal(hasMultiplePlanTiers([travel, home]), false);
  assert.equal(hasMultiplePlanTiers([travel, multiTier]), true);
  assert.equal(hasMultiplePlanTiers([]), false);
});

test('guardrail notices match comparison-export honesty and invent no ranking or price', () => {
  assert.ok(CROSS_CATEGORY_COMPARE_NOTICE.includes('不同保險類別'));
  assert.ok(CROSS_CATEGORY_COMPARE_NOTICE.includes('不可按同一保額或保費直接排名'));
  assert.ok(MULTI_TIER_COMPARE_NOTICE.includes('多個計劃層級'));
  assert.ok(MULTI_TIER_COMPARE_NOTICE.includes('請核對原文'));
  assert.ok(COMPARE_GLOSSARY_NOTE.includes('唔等於保單內容已核實'));
  for (const notice of [CROSS_CATEGORY_COMPARE_NOTICE, MULTI_TIER_COMPARE_NOTICE, COMPARE_GLOSSARY_NOTE]) {
    for (const banned of ['最平', '最好', '推薦', '已核實保費', '保證', 'rank #', 'suitable']) {
      assert.ok(!notice.includes(banned), `notice must not invent ${banned}`);
    }
  }
});

test('compare page keeps honesty chips and drops dead strike-through discount UI', async () => {
  const compareSource = readFileSync('src/pages/Compare.tsx', 'utf8');
  assert.ok(compareSource.includes('EvidenceChip'));
  assert.ok(compareSource.includes('CROSS_CATEGORY_COMPARE_NOTICE'));
  assert.ok(compareSource.includes('MULTI_TIER_COMPARE_NOTICE'));
  assert.ok(compareSource.includes('spansMultipleCategories'));
  assert.ok(compareSource.includes('hasMultiplePlanTiers'));
  assert.ok(compareSource.includes('MOTION'));
  assert.ok(!compareSource.includes('hasDiscount'));
  assert.ok(!compareSource.includes('line-through'));
  assert.ok(!compareSource.includes('discountedPrice'));

  const chipSource = readFileSync('src/components/EvidenceChip.tsx', 'utf8');
  assert.ok(chipSource.includes('/data-quality?product='));
  assert.ok(chipSource.includes('/documents?product='));
  assert.ok(chipSource.includes('productEvidenceSummary'));
  assert.ok(chipSource.includes('productLifecycle'));
  assert.ok(chipSource.includes('evidenceChipLabel'));

  // priceDisplay still fails closed: hasDiscount is always false
  assert.equal(priceDisplay(product({ original_price: 100, discounted_price: 70 })).hasDiscount, false);
});

test('coverage evidence status remains mechanical field presence only', () => {
  assert.equal(coverageEvidenceStatus({ item: 'a', limit: 'b' }), 'missing');
  assert.equal(
    coverageEvidenceStatus({ item: 'a', limit: 'b', source_url: '/docs/x.pdf', quote: 'qqqqqqqq', page: 3 }),
    'complete',
  );
  const summary = productEvidenceSummary(product({
    coverage: [
      { item: 'a', limit: 'b', source_url: '/docs/x.pdf', quote: 'qqqqqqqq', page: 1 },
      { item: 'c', limit: 'd' },
    ],
  }));
  assert.equal(summary.complete, 1);
  assert.equal(summary.total, 2);
  assert.ok(summary.freshnessLabel.includes('未核實'));
});
