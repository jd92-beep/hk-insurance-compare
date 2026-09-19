import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCoverage, canonicalBenefitsFor } from '../src/components/compare/canonical-benefits.ts';
import { VHIS_SCHEME_FACTS, FAMILY_RESEARCH_CHECKLIST, DEFAULT_FAMILY_PROFILES } from '../src/lib/vhis-facts.ts';

const p = (extra = {}) => ({
  id: 'x', category: 'travel', insurer: 'X', insurer_zh: 'X',
  product_name: 'X', product_name_zh: 'X', plan_tiers: ['A'],
  coverage: [], premium_range: '—', premium_available: true, premium_notes: '',
  key_terms: [], exclusions: [], source_urls: [], documents_found: [],
  ...extra,
});

test('travel CFAR vs ordinary cancellation remain separate canonical rows', () => {
  const resolved = resolveCoverage([
    p({ id: 'a', coverage: [{ item: '因任何原因取消 CFAR', limit: 'HK$1' }] }),
    p({ id: 'b', coverage: [{ item: '取消旅程', limit: 'HK$2' }] }),
  ]);
  const keys = resolved.matched.map(r => r.key);
  assert.ok(keys.includes('cancellation-cfar'));
  assert.ok(keys.includes('cancellation'));
});

test('medical cash-like rows do not silently merge deductible with hospital cash labels', () => {
  const medical = canonicalBenefitsFor('medical');
  const cash = medical.find(b => b.id === 'cash');
  const deductible = medical.find(b => b.id === 'deductible');
  assert.ok(cash && deductible);
  assert.notEqual(cash.label, deductible.label);
});

test('VHIS scheme facts stay educational and do not promise coverage or advice', () => {
  assert.ok(VHIS_SCHEME_FACTS.disclaimer.includes('唔係投保建議'));
  assert.ok(VHIS_SCHEME_FACTS.sourceUrl.includes('vhis.gov.hk'));
  for (const item of VHIS_SCHEME_FACTS.standardVsFlexi) {
    assert.ok(!/最適合|保證必賠|推薦購買/.test(item.body));
  }
});

test('family research checklist is preparation-only and bans suitability claims', () => {
  assert.ok(FAMILY_RESEARCH_CHECKLIST.length >= 4);
  for (const item of FAMILY_RESEARCH_CHECKLIST) {
    assert.ok(!/最適合|精算|保證批核/.test(item.title + item.body));
  }
  assert.ok(DEFAULT_FAMILY_PROFILES.length >= 3);
});
