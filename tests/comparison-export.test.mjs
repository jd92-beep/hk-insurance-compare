import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {comparisonBrief} from '../src/lib/comparison-export.ts';
import {parseInsuranceData} from '../src/lib/data-integrity.ts';
const fixture={id:'sample',category:'travel',insurer:'TEST',insurer_zh:'測試',product_name:'Sample',product_name_zh:'示例',plan_tiers:['PlanA'],coverage:[{item:'醫療',limit:'每人每年 HK$1,000',source_url:'/docs/brochures/sample.pdf',quote:'Sample claim to be reviewed',page:2}],premium_range:'參考文字',premium_notes:'另需報價',key_terms:['按條款'],exclusions:['特定限制'],source_urls:['https://example.test/policy'],citations:[]};
const options={origin:'https://site.example/compare?campaign=private',snapshotDate:'2026-09-01',exportedAt:'2026-09-08T02:00:00.000Z',version:'v1.7.1 (Build test)'};
test('review brief separates snapshot/export dates, includes identity and source links, and is not a quote',()=>{
 const result=comparisonBrief([fixture],options);assert.equal(result.filename,'insurance-comparison-2026-09-08.md');
 for(const text of ['2026-09-01','2026-09-08T02:00:00.000Z','示例','網站摘要','不是報價','https://site.example/documents?','https://example.test/policy'])assert.ok(result.content.includes(text),text);
 assert.ok(!result.content.includes('campaign=private'));
});
test('missing source and missing page remain explicit; no default page1 is invented',()=>{
 const p=structuredClone(fixture);p.coverage=[{item:'Missing source',limit:'未列明'},{item:'Page missing',limit:'HK$100',source_url:'/docs/brochures/sample.pdf'}];
 const out=comparisonBrief([p],options).content;assert.ok(out.includes('未提供安全可用來源'));assert.ok(out.includes('頁碼未提供'));assert.ok(!out.includes('#page=1'));
});
test('untrusted Markdown and HTML remain text and unsafe URL schemes are never linked',()=>{
 const p=structuredClone(fixture);p.product_name_zh='<script>alert(1)</script>\n# forged';p.coverage[0].item='[click](javascript:alert(1)) | split';p.coverage[0].source_url='javascript:alert(1)';p.source_urls=['javascript:alert(1)','https://example.test/with(parentheses)?a=<b>'];
 const out=comparisonBrief([p],options).content;assert.ok(!out.includes('<script>'));assert.ok(!out.includes('\n# forged'));assert.ok(!out.includes('[click](javascript:'));assert.ok(!out.includes('](javascript:'));
 assert.ok(out.includes('%28parentheses%29'));
});
test('different categories and contradictory explicit pages are flagged, not harmonized',()=>{
 const p=structuredClone(fixture);p.id='second';p.category='home';p.coverage[0].source_url='/docs/brochures/sample.pdf#page=8';
 const out=comparisonBrief([fixture,p],options).content;assert.ok(out.includes('不同保險類別'));assert.ok(out.includes('頁碼不一致'));
});
test('empty, duplicate, excessive selection and unsafe origin are rejected',()=>{
 assert.throws(()=>comparisonBrief([],options));assert.throws(()=>comparisonBrief([fixture,fixture],options));
 assert.throws(()=>comparisonBrief(Array.from({length:4},(_,i)=>({...fixture,id:`item-${i}`})),options));
 for(const id of [undefined,42])assert.throws(()=>comparisonBrief([{...fixture,id}],options));
 assert.throws(()=>comparisonBrief([fixture],{...options,origin:'javascript:alert(1)'}));assert.throws(()=>comparisonBrief([fixture],{...options,exportedAt:'not a date'}));
});
test('actual selected products retain all coverage rows and input bytes are untouched',()=>{
 const data=parseInsuranceData(JSON.parse(readFileSync('public/data/insurance-data.json','utf8')));const products=data.products.filter(p=>['travel-axa','travel-msig'].includes(p.id));const before=JSON.stringify(products);
 const out=comparisonBrief(products,{...options,snapshotDate:data.generated_at}).content;
 assert.equal(JSON.stringify(products),before);for(const p of products)for(const row of p.coverage)assert.ok(out.includes(row.item.replace(/[\\`*_[\]{}()#!|>~]/g,'\\$&').replaceAll('<','&lt;')),row.item);
 assert.ok(out.includes('未核實官方最新適用版本'));
});
