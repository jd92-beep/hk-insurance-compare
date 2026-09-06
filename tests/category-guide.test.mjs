import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORY_DECISIONS, preparedCount } from '../src/lib/category-decisions.ts';
test('every actual insurance category has its own complete decision model',()=>{
 const data=JSON.parse(readFileSync('public/data/insurance-data.json','utf8'));
 for(const category of new Set(data.products.map(p=>p.category))){const guide=CATEGORY_DECISIONS[category]; assert.ok(guide,category);assert.equal(guide.prepare.length,3);assert.equal(guide.compare.length,3);assert.equal(guide.verify.length,3);}
 assert.equal(Object.keys(CATEGORY_DECISIONS).length,11);
});
test('preparation is a bounded checklist count, not a suitability probability',()=>{
 assert.equal(preparedCount([0,0,1,99,-1]),2);assert.equal(preparedCount([]),0);
});
