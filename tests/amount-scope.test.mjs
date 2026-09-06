import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparableAmount, comparableBest } from '../src/lib/comparable-amount.ts';
import { limitRows, limitGroups } from '../src/lib/evidence-chart.ts';
const product = (id, limit) => ({ id, product_name:id, product_name_zh:id, insurer:'test', insurer_zh:'Test', coverage:[{item:'醫療',limit}] });

test('malformed numbers and unparsed qualifications must not become scalar amounts', () => {
  for (const input of ['每年 HK$1,,000', '每年 HK$12,34', '每年 HK$0001', '每年 HK$500 僅限指定醫院', '每年 HK$500 (另加附加保障)', '每年 HK$500 或全數賠償', '每年 HK$500 另設分項上限', '每年 HK$500 EUR', '每年 HK$500，最多20次']) {
    assert.equal(comparableAmount(input), null, input);
  }
});
test('fullwidth punctuation is normalized before safety checks', () => {
  assert.equal(comparableAmount('每年 ＨＫ＄１，０００').value, 1000);
  assert.equal(comparableAmount('每年 ＨＫ＄１００～５００'), null);
  assert.equal(comparableAmount('每年 HK$100或US$200'), null);
});
test('per-person and per-family values cannot win against each other', () => {
  assert.deepEqual([...comparableBest(['每年每人 HK$1,000','每年每家庭 HK$2,000'])], []);
  assert.deepEqual([...comparableBest(['每年 HK$1,000','每年每人 HK$2,000'])], []);
  assert.deepEqual([...comparableBest(['每年每人 HK$1,000','每人每年 HK$2,000'])], [1]);
});
test('claim, admission and incident are distinct bases; generic per-time cannot win', () => {
  assert.deepEqual([...comparableBest(['每次索償 HK$1,000','每次住院 HK$2,000'])], []);
  assert.deepEqual([...comparableBest(['每次 HK$1,000','每次 HK$2,000'])], []);
  assert.deepEqual([...comparableBest(['每次事故 HK$0','每次事故 HK$500'],'自負額')], [0]);
});
test('a shared chart panel requires identical time and beneficiary scope', () => {
  const rows=limitRows([product('p1','每年每人 HK$100'),product('f1','每年每家庭 HK$200'),product('p2','每年每人 HK$300'),product('f2','每年每家庭 HK$400')],'醫療');
  const groups=limitGroups(rows);
  assert.equal(groups.length,2);
  assert.deepEqual(groups.map(g=>g.rows.map(r=>r.productId)),[['p1','p2'],['f1','f2']]);
  assert.equal(new Set(groups.map(g=>g.scopeKey)).size,2);
  assert.ok(groups[0].scopeLabel.includes('每人'));
});
test('safe amounts retain Chinese magnitudes and explicit zero deductibles', () => {
  assert.equal(comparableAmount('每年最高 HK$500萬').value,5_000_000);
  assert.equal(comparableAmount('終身 HK$1.5億').value,150_000_000);
  assert.equal(comparableAmount('每次事故 HK$0').value,0);
  assert.equal(comparableAmount('每年/每日 HK$500'),null);
});
