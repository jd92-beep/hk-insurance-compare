import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparableAmount, comparableBest } from '../src/lib/comparable-amount.ts';
import { limitGroups, limitRows } from '../src/lib/evidence-chart.ts';
const product=(id,limit)=>({id,insurer:'TEST',insurer_zh:'測試',product_name:id,product_name_zh:id,coverage:[{item:'醫療',limit}]});
test('conditional or negative prose cannot become an unconditional cap',()=>{
 for(const raw of ['不保：每年 HK$500','每年 HK$100（只限指定醫院）','每年 HK$100 或全數賠償','每年 HK$100 subject to approval','每年 HK$100 (except US)','每年HK$100 − 自負額']) assert.equal(comparableAmount(raw),null,raw);
});
test('invalid money grouping, minus signs and normalized foreign currencies are refused',()=>{
 for(const raw of ['每年 HK$1,00','每年 HK$10,,000','每年 HK$-100','每年HK$100／ＵＳＤ200','每年HK$100萬至200萬','每年 HK$100 + 其他費用']) assert.equal(comparableAmount(raw),null,raw);
 assert.equal(comparableAmount('每年 ＨＫ＄１，０００').value,1000);
 assert.equal(comparableAmount('每年 HK$1.5萬').value,15000);
});
test('per-person and per-policy amounts never receive a common best highlight',()=>{
 assert.deepEqual([...comparableBest(['每人每年 HK$100','每保單每年 HK$200'])],[]);
 assert.deepEqual([...comparableBest(['每人每年 HK$100','每年 HK$200'])],[]);
 assert.deepEqual([...comparableBest(['每人每年 HK$100','每人每年 HK$200'])],[1]);
});
test('claim, admission, visit and incident are distinct and generic per-event is unknown',()=>{
 assert.deepEqual([...comparableBest(['每次住院 HK$100','每次索償 HK$200'])],[]);
 assert.deepEqual([...comparableBest(['每次門診 HK$100','每次事故 HK$200'])],[]);
 assert.deepEqual([...comparableBest(['每次 HK$100','每次 HK$200'])],[]);
 assert.deepEqual([...comparableBest(['每次索償 HK$0','每次索償 HK$500'],'自負額')],[0]);
});
test('calendar and policy year are not silently equated',()=>{
 assert.deepEqual([...comparableBest(['每曆年 HK$100','每保單年度 HK$200'])],[]);
 assert.deepEqual([...comparableBest(['每年 HK$100','每保單年度 HK$200'])],[]);
});
test('chart grouping preserves recipient boundaries as well as period',()=>{
 const rows=limitRows([product('p1','每人每年 HK$100'),product('s1','每保單每年 HK$500'),product('p2','每人每年 HK$200'),product('s2','每保單每年 HK$600')],'醫療');
 const groups=limitGroups(rows);
 assert.equal(groups.length,2);
 assert.ok(groups.some(g=>g.rows.map(r=>r.productId).join(',')==='p1,p2'));
 assert.ok(groups.some(g=>g.rows.map(r=>r.productId).join(',')==='s1,s2'));
});
test('negative unlimited mentions are not presented as unlimited protection',()=>{
 assert.equal(limitRows([product('no','並非無上限')],'醫療')[0].status,'unsupported');
 assert.equal(limitRows([product('mixed','每年HK$100萬，終身無上限')],'醫療')[0].status,'unsupported');
 assert.equal(limitRows([product('yes','無上限（受條款限制）')],'醫療')[0].status,'unlimited');
});
