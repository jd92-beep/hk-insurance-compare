import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSavedStore, makeSavedSet, readSavedSets, reviewSavedSet} from '../src/lib/saved-comparisons.ts';
const products=[{id:'a',product_name:'Alpha',product_name_zh:'甲',insurer:'TEST',category:'travel',coverage:[],key_terms:[],exclusions:[],citations:[],source_urls:[]},{id:'b',product_name:'Beta',product_name_zh:'乙',insurer:'TEST',category:'travel',coverage:[],key_terms:[],exclusions:[],citations:[],source_urls:[]}];
const make=(name='旅遊',id='saved-a')=>makeSavedSet({id,name,products,snapshotDate:'2026-09-01',now:'2026-09-08T00:00:00.000Z'});
function port(raw=null) {let listener;const writes=[];return {writes,raw:()=>raw,external(value){raw=value;listener?.();},read:()=>raw,write(value){raw=value;writes.push(value);},listen(f){listener=f;return()=>{listener=undefined;};}};}
test('saved sets keep current IDs and public identity, not editable policy or quote copies',()=>{
 const set=make();assert.deepEqual(set.products.map(p=>p.id),['a','b']);assert.equal(set.name,'旅遊');
 assert.ok(set.products.every(p=>/^[a-f0-9]{16}$/.test(p.revision)));assert.equal(set.products[0].coverage,undefined);
});
test('save validation rejects bad names, duplicate/too many IDs and invalid timestamps',()=>{
 for(const change of [{name:''},{name:'x'.repeat(61)},{products:[]},{products:[products[0],products[0]]},{products:[...products,...products]},{now:'bad-date'}])assert.throws(()=>makeSavedSet({id:'saved-a',name:'test',products,snapshotDate:'unknown',now:'2026-09-08T00:00:00.000Z',...change}));
});
test('read rejects corrupt and unknown schemas without silently adopting partial data',()=>{
 assert.equal(readSavedSets(null).issue,null);
 for(const raw of ['{bad','[]',JSON.stringify({version:2,sets:[]}),JSON.stringify({version:1,sets:[{id:42}]}),'x'.repeat(100001)])assert.ok(readSavedSets(raw).issue);
 const set=make();assert.deepEqual(readSavedSets(JSON.stringify({version:1,sets:[set]})).sets,[set]);
});
test('revision flags changed summary and preserves missing records without substitutions',()=>{
 const set=make();assert.deepEqual(reviewSavedSet(set,products).changed,[]);
 const next=structuredClone(products);next[0].coverage=[{item:'醫療',limit:'changed'}];
 assert.deepEqual(reviewSavedSet(set,next).changed.map(p=>p.id),['a']);
 assert.deepEqual(reviewSavedSet(set,[next[0]]).missing.map(p=>p.id),['b']);
 assert.deepEqual(reviewSavedSet(set,[]).availableIds,[]);
});
test('store explicitly saves and deletes; it never rewrites storage simply on mount',()=>{
 const p=port();const store=createSavedStore(p);const stop=store.subscribe(()=>{});
 assert.equal(p.writes.length,0);assert.equal(store.save(make()),true);assert.equal(store.getSnapshot().sets.length,1);
 assert.equal(store.remove('saved-a'),true);assert.equal(store.getSnapshot().sets.length,0);stop();
});
test('store rereads before mutation, deduplicates names and caps sets without eviction',()=>{
 const p=port();const store=createSavedStore(p);store.save(make('one','s1'));
 assert.equal(store.save(make(' one ','s2')),false);assert.equal(store.getSnapshot().sets.length,1);
 for(let i=2;i<=10;i++)assert.equal(store.save(make(`name${i}`,`s${i}`)),true);
 assert.equal(store.save(make('eleven','s11')),false);assert.equal(store.getSnapshot().sets.length,10);
});
test('cross-tab sync never echoes writes; current raw is checked before local mutation',()=>{
 const p=port();const s=createSavedStore(p);const stop=s.subscribe(()=>{});
 p.external(JSON.stringify({version:1,sets:[make('remote','remote')]}));assert.equal(s.getSnapshot().sets[0].id,'remote');assert.equal(p.writes.length,0);
 assert.equal(s.save(make('local','local')),true);assert.equal(s.getSnapshot().sets.length,2);stop();
});
test('denied writes and unsupported storage do not claim success or destroy existing bytes',()=>{
 const p=port();const blocked=createSavedStore({...p,write(){throw Error('quota');}});
 assert.equal(blocked.save(make()),false);assert.equal(blocked.getSnapshot().sets.length,0);assert.ok(blocked.getSnapshot().issue);
 const q=port('{corrupt');const s=createSavedStore(q);assert.equal(s.save(make()),false);assert.equal(s.remove('saved-a'),false);assert.equal(q.raw(),'{corrupt');assert.equal(q.writes.length,0);
});
