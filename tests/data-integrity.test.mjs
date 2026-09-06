import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseInsuranceData, safeFragment } from '../src/lib/data-integrity.ts';
const dataset=()=>JSON.parse(readFileSync('public/data/insurance-data.json','utf8'));
test('all actual products survive validation; category counts come from actual rows',()=>{
 const raw=dataset();raw.categories[0].count=9999;const data=parseInsuranceData(raw);
 assert.equal(data.products.length,158);for(const c of data.categories)assert.equal(c.count,data.products.filter(p=>p.category===c.id).length);
});
test('bad shapes, duplicate IDs and orphan categories fail before rendering',()=>{
 assert.throws(()=>parseInsuranceData({products:[]}));
 const raw=dataset();raw.products.push(raw.products[0]);assert.throws(()=>parseInsuranceData(raw),/重複/);
 const orphan=dataset();orphan.products[0].category='invented';assert.throws(()=>parseInsuranceData(orphan),/類別/);
});
test('a missing snapshot date is not silently replaced by a fabricated recent date',()=>{
 const raw=dataset();delete raw.generated_at;assert.equal(parseInsuranceData(raw).generated_at,'未提供');
 assert.equal(safeFragment('#%ZZ'),'');assert.equal(safeFragment('#AXA'),'AXA');
});
