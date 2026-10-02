import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { annualRangeFromText, categorySpectrum, spectrumPos } from '../src/lib/premium-spectrum.ts';

const { products } = JSON.parse(readFileSync('public/data/insurance-data.json', 'utf8'));

test('reads annual and monthly (×12) premiums, keeps both ends of a range', () => {
  assert.deepEqual(annualRangeFromText('HK$336–2,980/年'), { min: 336, max: 2980, monthly: false });
  assert.deepEqual(annualRangeFromText('每年 HK$1,200 – 4,800'), { min: 1200, max: 4800, monthly: false });
  assert.deepEqual(annualRangeFromText('每月 HK$68 – 138（每年約 HK$816 – 1,656）'), { min: 816, max: 1656, monthly: true });
});

test('ignores sums insured, deductibles, per-day / per-trip prices, add-ons and multi-year terms', () => {
  assert.deepEqual(annualRangeFromText('3-in-1 Protector 每日低至HK$4.3（保額HK$1,000,000，月繳HK$130）'), { min: 1560, max: 1560, monthly: true });
  assert.equal(annualRangeFromText('單次旅程保費低至 HK$40 起；單次最長182日'), null);
  assert.deepEqual(annualRangeFromText('30歲自付費HK$0約HK$1,504/月、HK$16,000約HK$648/月'), { min: 7776, max: 18048, monthly: true });
  assert.deepEqual(annualRangeFromText('全年：綜合 HK$2,580 / 優越 HK$3,180（額外隨行兒童 HK$730-900）'), { min: 2580, max: 3180, monthly: false });
  assert.deepEqual(annualRangeFromText('HK$946（1年）– HK$1,798（2年）'), { min: 946, max: 946, monthly: false });
  assert.equal(annualRangeFromText('HK$350–HK$2,034（1年/2年，視乎計劃）'), null);
  assert.equal(annualRangeFromText('需向保險公司查詢'), null);
});

test('every category spectrum is built from stated amounts only and spans its entries', () => {
  for (const c of new Set(products.map((p) => p.category))) {
    const s = categorySpectrum(c, products);
    if (!s) continue;
    for (const e of s.entries) {
      assert.ok(e.range.min <= e.range.max && e.range.min >= s.min && e.range.max <= s.max, e.product.id);
      assert.match(e.product.premium_range, /\d/, e.product.id);
    }
  }
  const travel = categorySpectrum('travel', products);
  assert.ok(!travel.entries.some((e) => e.product.id === 'travel-aig'), 'single-trip-only prices stay off the annual spectrum');
  assert.equal(spectrumPos(100, 100, 10000), 0);
  assert.ok(Math.abs(spectrumPos(1000, 100, 10000) - 0.5) < 1e-9);
});
