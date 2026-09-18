import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceDisplay, promoDisplay, PREMIUM_SNAPSHOT_DISCLAIMER, PROMO_REFERENCE_LABEL } from '../src/lib/premium-display.ts';
import { productLifecycle } from '../src/lib/product-lifecycle.ts';
import { coverageEvidenceStatus, productEvidenceSummary } from '../src/lib/evidence-status.ts';
import { resolveCoverage, canonicalBenefitsFor } from '../src/components/compare/canonical-benefits.ts';
import { CATEGORY_FEATURE_TAGS } from '../src/lib/feature-filters.ts';

const product = (extra = {}) => ({
  id: 'x', category: 'travel', insurer: 'X', insurer_zh: 'X',
  product_name: 'X', product_name_zh: 'X', plan_tiers: [],
  coverage: [], premium_range: '—', premium_available: true, premium_notes: '',
  key_terms: [], exclusions: [], source_urls: [], documents_found: [],
  ...extra,
});

test('promo prices are labelled as reference material, not a guaranteed live quote', () => {
  const p = product({
    promo: { tag: '限時', discount: '7折', code: 'X' },
    original_price: 100,
    discounted_price: 70,
    official_buy_url: 'https://example.com/buy',
  });
  const price = priceDisplay(p);
  const promo = promoDisplay(p);
  assert.equal(price.hasDiscount, true);
  assert.equal(price.isReferencePrice, true);
  assert.equal(price.disclaimer, PREMIUM_SNAPSHOT_DISCLAIMER);
  assert.equal(promo.isReference, true);
  assert.ok(promo.disclaimer.includes('官網'));
  assert.equal(price.buyLabel, '官網投保');
});

test('missing promo does not invent a discount badge', () => {
  const promo = promoDisplay(product());
  assert.equal(promo.present, false);
  assert.equal(promo.badgeLabel, '');
});

test('undated promo fallback label does not claim current buyability', () => {
  const p = product({ promo: { tag: '', discount: '9折' } });
  const promo = promoDisplay(p);
  assert.equal(promo.badgeLabel, PROMO_REFERENCE_LABEL);
  assert.ok(!promo.badgeLabel.includes('實付'));
});

test('lifecycle stays unverified when the snapshot has no verification fields', () => {
  const life = productLifecycle(product(), '2026-09-02');
  assert.equal(life.status, 'unverified');
  assert.equal(life.lastVerifiedAt, null);
  assert.ok(life.snapshotNote.includes('2026-09-02'));
  assert.ok(life.snapshotNote.includes('唔係'));
});

test('explicit discontinued status is preserved without inventing a verification date', () => {
  const life = productLifecycle(product({ record_status: 'discontinued' }), '2026-09-02');
  assert.equal(life.status, 'discontinued');
  assert.equal(life.lastVerifiedAt, null);
});

test('evidence status distinguishes complete fields from missing source/quote', () => {
  assert.equal(coverageEvidenceStatus({ item: 'a', limit: 'b' }), 'missing');
  assert.equal(coverageEvidenceStatus({ item: 'a', limit: 'b', source_url: '/docs/x.pdf', quote: 'q'.repeat(10), page: 3 }), 'complete');
  assert.equal(coverageEvidenceStatus({ item: 'a', limit: 'b', quote: 'q'.repeat(10), page: 3 }), 'missing-source');
  assert.equal(coverageEvidenceStatus({ item: 'a', limit: 'b', source_url: '/docs/x.pdf', page: 3 }), 'missing-quote');
  const summary = productEvidenceSummary(product({
    coverage: [
      { item: 'a', limit: 'b', source_url: '/docs/x.pdf', quote: 'qqqqqqqq', page: 1 },
      { item: 'c', limit: 'd' },
    ],
  }));
  assert.equal(summary.total, 2);
  assert.equal(summary.complete, 1);
  assert.equal(summary.missing, 1);
  assert.equal(summary.completeRatio, 0.5);
  assert.ok(summary.freshnessLabel.includes('未核實'));
});

test('travel CFAR and ordinary cancellation are not the same canonical row', () => {
  const benefits = canonicalBenefitsFor('travel');
  const cfar = benefits.find(b => b.id === 'cancellation-cfar');
  const ordinary = benefits.find(b => b.id === 'cancellation');
  assert.ok(cfar && ordinary);
  assert.notEqual(cfar.label, ordinary.label);
  const resolved = resolveCoverage([
    product({ category: 'travel', coverage: [{ item: '因任何原因取消 (CFAR)', limit: 'HK$10,000' }] }),
    product({ category: 'travel', coverage: [{ item: '取消旅程', limit: 'HK$5,000' }] }),
  ]);
  const keys = resolved.matched.map(r => r.key);
  assert.ok(keys.includes('cancellation-cfar'));
  assert.ok(keys.includes('cancellation'));
  const cfarRow = resolved.matched.find(r => r.key === 'cancellation-cfar');
  const ordinaryRow = resolved.matched.find(r => r.key === 'cancellation');
  assert.equal(cfarRow.limits[0], 'HK$10,000');
  assert.equal(cfarRow.limits[1], undefined);
  assert.equal(ordinaryRow.limits[0], undefined);
  assert.equal(ordinaryRow.limits[1], 'HK$5,000');
});

test('travel hospital cash and admission deposit are separate rows', () => {
  const resolved = resolveCoverage([
    product({ category: 'travel', coverage: [{ item: '住院現金津貼', limit: '每日HK$500' }] }),
    product({ category: 'travel', coverage: [{ item: '入院保證金', limit: 'HK$10,000' }] }),
  ]);
  const cash = resolved.matched.find(r => r.key === 'hospital-cash');
  const deposit = resolved.matched.find(r => r.key === 'admission-deposit');
  assert.ok(cash && deposit);
  assert.equal(cash.limits[0], '每日HK$500');
  assert.equal(cash.limits[1], undefined);
  assert.equal(deposit.limits[1], 'HK$10,000');
});

test('strong feature labels do not promise unlimited / no-shrink guarantees as filter titles', () => {
  const banned = /無上限|不縮水|不拒保不減額|保證續保至/;
  for (const tags of Object.values(CATEGORY_FEATURE_TAGS)) {
    for (const tag of tags) {
      assert.ok(!banned.test(tag.label), `label promises a guarantee: ${tag.label}`);
    }
  }
});
