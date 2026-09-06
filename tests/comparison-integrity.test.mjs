import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchSingleFeature, filterAndRankProductsByFeatures } from '../src/lib/feature-filters.ts';
import { bestValueColumnsFromLimits, parseLimitValue } from '../src/components/compare/coverage.ts';
const tag = { id: 'ski', label: '滑雪', keywords: ['滑雪'] };
const product = (limit, extra = {}) => ({ id: 'example', category: 'travel', coverage: [{ item: '滑雪', limit }], key_terms: [], plan_tiers: [], exclusions: [], ...extra });
test('negative, unknown and zero benefit statements are not supported coverage', () => {
  for (const text of ['不保障滑雪', '滑雪不適用', '待確認', 'HK$0', 'not covered']) assert.equal(matchSingleFeature(product(text), tag).matched, false, text);
  assert.equal(matchSingleFeature(product('每次 HK$1,000'), tag).matched, true);
  assert.equal(matchSingleFeature(product('每次 HK$1,000', { exclusions: ['不保滑雪'] }), tag).matched, false);
  assert.equal(matchSingleFeature(product('', { plan_tiers: ['滑雪尊尚計劃'] }), tag).matched, false);
});
test('repeated feature ids do not make a complete match impossible', () => {
  const p = product('租車自負額每次 HK$5,000');
  const one = filterAndRankProductsByFeatures([p], ['rental-car'], 'travel', 'strict');
  const twice = filterAndRankProductsByFeatures([p], ['rental-car', 'rental-car'], 'travel', 'strict');
  assert.equal(twice.totalSelected, 1); assert.equal(twice.exactMatchCount, one.exactMatchCount);
});
test('ambiguous currencies, ranges and incidental numbers cannot win comparison', () => {
  for (const text of ['HK$600,000–1,500,000', 'HK$1,000 或 US$2,000', '無上限', 'HK$2,000；電話 99999999', 'HK$500 每人／共4人']) assert.equal(parseLimitValue(text), null, text);
  assert.equal(parseLimitValue('每年 HK$100萬'), 1_000_000);
});
test('best highlight requires consistent explicit basis and respects deductibles', () => {
  assert.deepEqual([...bestValueColumnsFromLimits(['每年 HK$500','每日 HK$1,000'])], []);
  assert.deepEqual([...bestValueColumnsFromLimits(['每年 HK$500', undefined])], []);
  assert.deepEqual([...bestValueColumnsFromLimits(['HK$500','HK$1,000'])], []);
  assert.deepEqual([...bestValueColumnsFromLimits(['每年 HK$500','每年 HK$1,000'])], [1]);
  assert.deepEqual([...bestValueColumnsFromLimits(['每次事故 HK$0','每次事故 HK$500'], '自負額')], [0]);
});
