import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceDisplay, promoDisplay } from '../src/lib/premium-display.ts';
import { purchaseUrl } from '../src/lib/product-availability.ts';
import { productLifecycle } from '../src/lib/product-lifecycle.ts';
import { parseInsuranceData } from '../src/lib/data-integrity.ts';
const p = (extra = {}) => ({ id: 'test', category: 'travel', insurer: 'Test', insurer_zh: '測試', product_name: 'Test', product_name_zh: '測試', plan_tiers: [], coverage: [], premium_range: '未提供', premium_available: false, premium_notes: '', key_terms: [], exclusions: [], source_urls: [], documents_found: [], ...extra });
const snapshot = (product, generated_at = '2026-09-02') => ({ generated_at, products: [product], categories: [{ id: 'travel', name_zh: '旅遊' }] });
const now = new Date('2026-09-18T10:00:00Z');

test('undated snapshot discounts and coupon codes are not promoted as available offers', () => {
  const product = p({ original_price: 160, discounted_price: 88, promo: { tag: '限時優惠', code: 'OLD', discount: '45% OFF' } });
  assert.equal(priceDisplay(product, now).hasDiscount, false);
  assert.equal(priceDisplay(product, now).discountedPrice, undefined);
  assert.equal(promoDisplay(product, now).present, false);
  assert.equal(promoDisplay(product, now).code, undefined);
});
test('archived and discontinued records cannot regain a sales link via promo fallback', () => {
  for (const record_status of ['archived', 'discontinued']) {
    assert.equal(purchaseUrl(p({ record_status, official_buy_url: 'https://example.com/buy', promo: { tag: 'x', buy_url: 'https://example.com/buy' } })), undefined);
  }
});
test('future, impossible and malformed review dates stay unknown', () => {
  for (const last_verified_at of ['2027-01-01', '2026-02-30', '2026-13-01', 'yesterday', '2026-09-18Tgarbage']) {
    assert.equal(productLifecycle(p({ last_verified_at }), '2026-09-02', now).lastVerifiedAt, null);
  }
  assert.equal(productLifecycle(p({ last_verified_at: '2026-09-17' }), '2026-09-02', now).lastVerifiedAt, '2026-09-17');
});
test('impossible snapshot dates are not displayed as provenance', () => {
  assert.equal(parseInsuranceData(snapshot(p(), '2026-02-30')).generated_at, '未提供');
  assert.equal(parseInsuranceData(snapshot(p(), '2026-13-01Tanything')).generated_at, '未提供');
});
test('malformed promo objects are rejected before components consume them', () => {
  for (const promo of ['sale', 19, [], { tag: ['sale'] }, { tag: 'sale', code: 20 }]) {
    assert.throws(() => parseInsuranceData(snapshot(p({ promo }))), /優惠|promo/);
  }
});
test('verified campaign uses Hong Kong end-of-day boundaries, without inventing a monetary quote', () => {
  const product = p({ original_price: 160, discounted_price: 88, promo: { tag: '單次旅程 55 折', code: 'MSIG10', discount: '45% OFF', valid_from: '2026-09-01', valid_until: '2026-09-30', reviewed_at: '2026-09-18', source_url: 'https://insure.msig.hk/direct/en/promotion/tc_20260901', conditions: '網上單次旅程；不可與亞洲萬里通或會員折扣同時使用。' } });
  assert.equal(promoDisplay(product, now).present, true);
  assert.equal(promoDisplay(product, new Date('2026-09-30T15:59:59Z')).present, true);
  assert.equal(promoDisplay(product, new Date('2026-09-30T16:00:00Z')).present, false);
  assert.equal(promoDisplay(product, new Date('2026-08-31T12:00:00Z')).present, false);
  assert.equal(priceDisplay(product, now).hasDiscount, false);
});
