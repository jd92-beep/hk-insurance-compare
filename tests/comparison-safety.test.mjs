import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseComparableLimit, assessFeature, rankByNeeds } from '../src/lib/comparison-safety.ts';
import { bestValueColumnsFromLimits, parseLimitValue } from '../src/components/compare/coverage.ts';
const product = overrides => ({ id: 'p', coverage: [], key_terms: [], exclusions: [], plan_tiers: [], ...overrides });
const rental = { id: 'rental-car', label: '租車', keywords: ['租車', '自負額'] };
const cfar = { id: 'trip-cancel-cfar', label: 'CFAR', keywords: ['任何原因取消', '取消旅程'] };
test('currency parser refuses mixed tiers, currencies and unrelated numbers', () => {
  for (const s of ['HK$500–1,000', 'HK$100 每日，最多 30 日', 'USD500 / HK$3,900', 'HK$500，自負額20%', '每年HK$3,000,000，終身無上限', 'HK$-100']) assert.equal(parseComparableLimit(s), null, s);
  assert.equal(parseComparableLimit('每年 HK$500萬').value, 5_000_000);
  assert.equal(parseLimitValue('HK$5,000，最多365日'), null);
});
test('winner highlighting never mixes periods or guesses missing scope', () => {
  assert.equal(bestValueColumnsFromLimits(['每日 HK$1,000', '每年 HK$50,000']).size, 0);
  assert.equal(bestValueColumnsFromLimits(['HK$1,000', 'HK$50,000']).size, 0);
  assert.deepEqual([...bestValueColumnsFromLimits(['每日 HK$1,000', '每日 HK$2,000'])], [1]);
  assert.equal(bestValueColumnsFromLimits(['每日 HK$1,000', undefined, '每日 HK$2,000']).size, 0);
});
test('ordinary deductible is not rental cover; ordinary cancellation is not CFAR', () => {
  assert.equal(assessFeature(product({ coverage: [{ item: '醫療自負額', limit: 'HK$500' }] }), rental).status, 'unknown');
  assert.equal(assessFeature(product({ coverage: [{ item: '取消旅程', limit: '指定事故' }] }), cfar).status, 'unknown');
});
test('negated and conflicting evidence is not counted as a match', () => {
  assert.equal(assessFeature(product({ coverage: [{ item: '租車', limit: '不受保' }] }), rental).status, 'excluded');
  assert.equal(assessFeature(product({ coverage: [{ item: '租車', limit: 'HK$5,000' }], exclusions: ['租車不包括豪華汽車'] }), rental).status, 'conditional');
  assert.equal(assessFeature(product({ plan_tiers: ['租車豪華版'] }), rental).status, 'unknown');
});
test('ranking deduplicates choices and makes strict fallback explicit', () => {
  const p = product({ coverage: [{ item: '租車', limit: 'HK$5,000' }] });
  const result = rankByNeeds([p], [rental], ['rental-car', 'rental-car'], 'strict');
  assert.equal(result.totalSelected, 1); assert.equal(result.exactMatchCount, 1);
  const missing = rankByNeeds([product({})], [rental], ['rental-car'], 'strict');
  assert.equal(missing.fallbackTriggered, true); assert.equal(missing.results[0].match.score, 0);
});
test('contradictory coverage rows stay conditional regardless of order', () => {
  const rows = [{ item: '租車', limit: 'HK$5,000' }, { item: '租車', limit: '不受保' }];
  for (const coverage of [rows, [...rows].reverse()]) assert.equal(assessFeature(product({ coverage }), rental).status, 'conditional');
});
