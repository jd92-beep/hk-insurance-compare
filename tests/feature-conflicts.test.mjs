import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessFeature } from '../src/lib/feature-evidence.ts';
import { CATEGORY_FEATURE_TAGS, matchSingleFeature } from '../src/lib/feature-filters.ts';
const p = (extra={}) => ({id:'test',category:'travel',coverage:[],key_terms:[],exclusions:[],plan_tiers:[],...extra});
const ski = [{item:'滑雪',limit:'每次事故 HK$500'}];
const travelTag = id => CATEGORY_FEATURE_TAGS.travel.find(t=>t.id===id);

test('negative key terms override a positive coverage row, not only the reverse',()=>{
  assert.equal(assessFeature(p({coverage:ski,key_terms:['不保障滑雪']}),['滑雪']).matched,false);
  assert.equal(assessFeature(p({coverage:[{item:'滑雪',limit:'不保障'}],key_terms:['滑雪保障 HK$500']}),['滑雪']).matched,false);
});
test('matching cannot depend on the ordering of contradictory rows',()=>{
  const rows=[...ski,{item:'滑雪',limit:'不適用'}];
  for(const coverage of [rows,[...rows].reverse()])assert.equal(assessFeature(p({coverage}),['滑雪']).matched,false);
});
test('an explicit unresolved relevant term blocks a confident match',()=>{
  const r=assessFeature(p({coverage:ski,key_terms:['滑雪是否受保待確認']}),['滑雪']);
  assert.equal(r.matched,false);assert.equal(r.status,'unknown');
});
test('English negative and normalized fullwidth negative text cannot match',()=>{
  for(const text of ['Skiing is not insured','Policy does not cover skiing','No coverage for skiing','Ｓｋｉｉｎｇ ｉｓ ｎｏｔ ｃｏｖｅｒｅｄ']) {
    assert.equal(assessFeature(p({key_terms:[text]}),['skiing']).matched,false,text);
  }
});
test('ordinary cancellation and CFUR alone cannot establish the CFAR-labelled filter',()=>{
  for(const item of ['取消旅程','取消行程','因不可預見私事取消 (CFUR)','non-CFAR cancellation']) {
    assert.equal(matchSingleFeature(p({coverage:[{item,limit:'每程HK$5,000'}]}),travelTag('trip-cancel-cfar')).matched,false,item);
  }
  assert.equal(matchSingleFeature(p({coverage:[{item:'因任何原因取消 (CFAR)',limit:'每程HK$5,000'}]}),travelTag('trip-cancel-cfar')).matched,true);
});
test('reimbursement by itself does not establish zero deductible or full cover',()=>{
  assert.equal(matchSingleFeature(p({coverage:[{item:'海外醫療',limit:'實報實銷，每次HK$5,000'}]}),travelTag('full-cover')).matched,false);
  assert.equal(matchSingleFeature(p({coverage:[{item:'零自負額',limit:'HK$0'}]}),travelTag('full-cover')).matched,true);
});
test('zero coverage rows cannot be rescued by generic marketing terms',()=>{
  assert.equal(assessFeature(p({coverage:[{item:'滑雪',limit:'HK$0'}],key_terms:['滑雪保障']}),['滑雪']).matched,false);
  assert.equal(assessFeature(p({coverage:[],plan_tiers:['滑雪計劃']}),['滑雪']).status,'unknown');
});
test('unrelated exclusions do not erase an otherwise explicit positive summary',()=>{
  assert.equal(assessFeature(p({coverage:ski,exclusions:['不保障職業賽車']}),['滑雪']).matched,true);
  assert.equal(assessFeature(p({coverage:ski,exclusions:['滑雪比賽不受保']}),['滑雪']).matched,false);
});
test('broad cancellation restrictions still apply when the positive evidence requires CFAR',()=>{
  assert.equal(matchSingleFeature(p({coverage:[{item:'任何原因取消 CFAR',limit:'每程HK$5,000'}],key_terms:['取消旅程不適用']}),travelTag('trip-cancel-cfar')).matched,false);
});
test('standalone reimbursement remains searchable and embedded acronym text is not evidence',()=>{
  assert.equal(assessFeature(p({coverage:[{item:'門診',limit:'實報實銷HK$500'}]}),['實報實銷']).matched,true);
  assert.equal(matchSingleFeature(p({coverage:[{item:'notcfar plan',limit:'HK$500'}]}),travelTag('trip-cancel-cfar')).matched,false);
});
