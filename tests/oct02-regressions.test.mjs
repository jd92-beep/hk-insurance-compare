import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deriveCardSellingPoints, deriveCompactPremium } from '../src/lib/product-card-data.ts';
import { getInsurerColor } from '../src/lib/insurer-colors.ts';
import { purchaseUrl } from '../src/lib/product-availability.ts';
import { ACTIVITIES, HERO_SLIDES } from '../src/lib/landing-photos.ts';
const data=JSON.parse(readFileSync('public/data/insurance-data.json','utf8'));
const get=id=>data.products.find(p=>p.id===id);
test('unknown and excluded claims never become positive card selling points',()=>{
 const p={...get('pet-msig'),coverage:[{item:'第三者責任',limit:'不涵蓋'},{item:'醫療費用',limit:'未核實：不能當作保障'}],key_terms:['不保先天病，即使其他疾病全數賠償']};
 assert.deepEqual(deriveCardSellingPoints(p),[]);
});
test('compact premium never invents an annual unit for a trip or a bare amount',()=>{
 for(const [category,premium_range] of [['travel','單次旅程HK$95起'],['pet','HK$500']]){
  const result=deriveCompactPremium({...get('pet-msig'),category,premium_range,premium_available:true});
  assert.doesNotMatch(result.text,/每年/);
 }
 assert.match(deriveCompactPremium({...get('pet-msig'),premium_range:'年費HK$500起',premium_available:true}).text,/每年.*500/);
});
test('insurer colors are stable and distinct identities do not substring-match',()=>{
 assert.equal(getInsurerColor('AXA'),getInsurerColor('安盛'));
 assert.equal(getInsurerColor('BOC Life'),getInsurerColor('中銀人壽'));
 assert.notEqual(getInsurerColor('BOC Life'),getInsurerColor('BOC Group Insurance'));
 assert.notEqual(getInsurerColor('Blue'),getInsurerColor('Blue Cross'));
 assert.equal(getInsurerColor('New Insurer'),getInsurerColor(' New Insurer '));
});
test('all category carousel scenes and hero links use their matching local artwork',()=>{
 assert.deepEqual(new Set(ACTIVITIES.map(a=>a.category)),new Set(data.categories.map(c=>c.id)));
 for(const a of [...ACTIVITIES,...HERO_SLIDES]){
  assert.equal(a.photo,`/illustrations/${a.category}.webp`);
  assert.ok(readFileSync(`public${a.photo}`).byteLength>10000);
 }
});
test('wrong-identity records retain IDs but cannot be purchased or priced',()=>{
 for(const id of ['pet-bowtie','motor-bowtie','topup-bowtie-combat']){
  const p=get(id);assert.equal(p.record_status,'archived');assert.equal(purchaseUrl(p),undefined);assert.equal(p.premium_available,false);
  assert.ok(p.coverage.every(r=>r.limit.startsWith('未核實')));
 }
});
test('reviewed changes retain age/tier qualifications and source versions',()=>{
 for(const id of ['travel-fwd','travel-bolttech']){
  const p=get(id);assert.equal(p.source_document_version,'TMT.B.2026.003');assert.match(p.coverage[0].limit,/71至80歲.*750,000/);
  assert.match(p.coverage[10].limit,/30天/);assert.ok(p.coverage.every(r=>r.source_url.includes('reviewed-20261002.pdf')));
 }
 const p=get('pet-dah-sing');assert.equal(p.source_document_version,'PET042026');assert.match(p.coverage[0].limit,/40,000.*90,000/);assert.match(p.coverage[8].limit,/3,000,000.*自負額/);
});
test('selling-point summaries retain all tier and age qualifications',()=>{
 const p=get('travel-fwd');const points=deriveCardSellingPoints(p);
 const medical=points.find(p=>p.label==='醫療保障');assert.ok(medical);
 assert.equal(medical.text,p.coverage[0].limit);
});
test('confirmed dead purchase links remain disabled unless a reviewed replacement exists',()=>{
 const changes=JSON.parse(readFileSync('docs/review/2026-10-02-purchase-links.json','utf8'));
 for(const row of changes){assert.equal(purchaseUrl(get(row.id)),row.new || undefined);}
});
