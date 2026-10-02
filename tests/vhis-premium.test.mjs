import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStandardPremium, standardPlanPremium } from '../src/lib/vhis-premium.ts';

test('parses explicit yearly standard-plan figures into a range', () => {
  const r = parseStandardPremium('標準計劃年繳保費（30歲）：男性約 HK$1,993／女性約 HK$2,576（自願醫保官方標準保費一覽表）');
  assert.deepEqual(r, { min: 1993, max: 2576, per: '年', basis: '30歲 · 男／女' });
});

test('parses explicit monthly standard-plan figures', () => {
  const r = parseStandardPremium('標準計劃：30歲非吸煙男性約HK$138/月、女性約HK$175/月；靈活計劃（升級）：30歲非吸煙男性HK$453/月');
  assert.deepEqual(r, { min: 138, max: 175, per: '月', basis: '30歲 · 男／女' });
});

test('refuses market quotes, flexi-only and promotional text', () => {
  assert.equal(parseStandardPremium('30歲男性標準計劃保費換算約HK$147/月等值（市場公開資料引述）'), null);
  assert.equal(parseStandardPremium('尊耀計劃（亞洲版，月繳）：30歲自付費HK$0約HK$1,504/月'), null);
  assert.equal(parseStandardPremium('智尊守慧每日保費HKD 9/日起'), null);
});

test('only uses a product that cites the exact certification number', () => {
  const p = (id, extra) => ({ id, category: 'medical', premium_available: true, premium_range: '標準計劃年繳保費（30歲）：男性約 HK$2,000／女性約 HK$3,000', ...extra });
  const products = [p('a', { citations: [{ quote: 'S00099' }] }), p('b', { premium_available: false, citations: [{ quote: 'S00012' }] })];
  assert.equal(standardPlanPremium('S00012', products), null);
  assert.deepEqual(standardPlanPremium('S00099', products), { min: 2000, max: 3000, per: '年', basis: '30歲 · 男／女', productId: 'a' });
  assert.equal(standardPlanPremium('S00100', products), null);
});
