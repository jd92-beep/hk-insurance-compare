import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { metricChoices, limitRows, limitGroups, limitBarPercent } from '../src/lib/evidence-chart.ts';
const product = (id, limit, other = {}) => ({ id, product_name: id, product_name_zh: id, insurer: 'example', insurer_zh: 'Example', coverage: [{ item: '醫療保障', limit }], ...other });

test('unlimited, absent and unspecified limits never become invented comparable numbers', () => {
  const rows = limitRows([product('a', '無上限'), product('b', 'HK$500'), product('c', '', { coverage: [] }), product('d', '待確認')], '醫療保障');
  assert.deepEqual(rows.map(r => r.status), ['unlimited', 'unscoped', 'missing', 'unsupported']);
  assert.ok(rows.every(r => r.amount === null));
  assert.equal(limitGroups(rows).length, 0);
});
test('annual and daily panels cannot share a scale or invent missing zero values', () => {
  const rows = limitRows([product('y2', '每年 HK$200'), product('d1', '每日 HK$10'), product('y1', '每年 HK$100'), product('d2', '每日 HK$20'), product('unknown', 'HK$100–500')], '醫療保障');
  const groups = limitGroups(rows);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.find(g => g.basis === 'year').rows.map(r => r.productId), ['y2', 'y1']);
  assert.equal(groups.find(g => g.basis === 'day').maximum, 20);
  assert.ok(groups.every(g => g.rows.every(r => r.amount.basis === g.basis)));
});
test('multiple same-name entries remain ambiguous instead of selecting a favourable tier', () => {
  const p = product('multi', '每年 HK$100'); p.coverage.push({ item: '醫療保障', limit: '每年 HK$900' });
  const [row] = limitRows([p], '醫療保障');
  assert.equal(row.status, 'ambiguous'); assert.equal(row.amount, null); assert.equal(row.coverageIndex, null);
  assert.equal(metricChoices([p])[0].productCount, 1);
});
test('generic per-event summaries are not assumed to share a claim or admission basis', () => {
  const rows = limitRows([product('a', '每次 HK$100'), product('b', '每次 HK$200')], '醫療保障');
  assert.ok(rows.every(r => r.status === 'unscoped'));
  assert.equal(limitGroups(rows).length, 0);
});
test('bar widths remain finite for zero, missing and out-of-range values', () => {
  assert.equal(limitBarPercent(0, 0), 0); assert.equal(limitBarPercent(Infinity, 10), 0);
  assert.equal(limitBarPercent(-1, 10), 0); assert.equal(limitBarPercent(30, 20), 100);
  assert.equal(limitBarPercent(5, 20), 25);
});
test('the actual category route imports the evidence-aware visualization', () => {
  const source = readFileSync('src/pages/CategoryDetail.tsx', 'utf8');
  assert.ok(source.includes('@/components/category/UniversalComparisonChart'));
  const entry = readFileSync('src/components/category/UniversalComparisonChart.tsx', 'utf8');
  assert.ok(entry.includes('./EvidenceComparisonPanel'), 'Category chart is not connected to the evidence panel');
  assert.ok(!entry.includes('1000000000'), 'Legacy unlimited sentinel remains in the route component');
});
