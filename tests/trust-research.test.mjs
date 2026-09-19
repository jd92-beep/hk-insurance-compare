import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  HOW_WE_RANK,
  HOW_WE_RANK_POINTS,
  SORT_METHODOLOGY,
  OFFICIAL_EDU_LINKS,
  TRUST_PANEL,
  VHIS_FRAUD_WARNING,
  COMPLAINT_DATA_NOTE,
  MEDICAL_PATH_COLUMNS,
  MEDICAL_PATH_COMPARE,
  MEDICAL_PATH_DIMENSIONS,
  isOfficialEduHref,
  isTrustedVhisHost,
} from '../src/lib/trust-methodology.ts';
import {
  RESEARCH_INTENTS,
  MEDICAL_PATH_CHIPS,
  MEDICAL_FAMILY_CATEGORY_IDS,
  educationNavItems,
  emptyStateIntentChips,
  EDUCATION_GROUP_HEADING,
  isMedicalFamilyCategory,
} from '../src/lib/research-intents.ts';

const ALLOWED_OFFICIAL_HOSTS = [
  'vhis.gov.hk',
  'education.ia.org.hk',
  'icb.org.hk',
  'ifec.org.hk',
  'consumer.org.hk',
];

const readSrc = (relative) => readFileSync(relative, 'utf8');

test('how-we-rank defaults to summary-hit sort and bans sponsored / lead / suitability claims', () => {
  assert.equal(HOW_WE_RANK.defaultSortId, 'default');
  assert.equal(HOW_WE_RANK.defaultSortLabel, '摘要命中排序');
  assert.ok(HOW_WE_RANK.defaultSortShort.includes('摘要命中'));
  assert.ok(HOW_WE_RANK.defaultSortShort.includes('非贊助'));
  assert.equal(HOW_WE_RANK.isSponsored, false);
  assert.equal(HOW_WE_RANK.hasLeadForms, false);
  assert.equal(HOW_WE_RANK.sellsData, false);
  assert.equal(HOW_WE_RANK.hasSuitabilityScores, false);
  assert.ok(HOW_WE_RANK.alwaysVisibleLead.includes('摘要命中排序'));
  assert.ok(HOW_WE_RANK.alwaysVisibleLead.includes('唔係贊助'));
  for (const option of SORT_METHODOLOGY) {
    assert.equal(option.sponsored, false);
    assert.ok(!/最適合|保證批核|保證必賠/.test(option.label + option.explanation));
  }
  assert.ok(HOW_WE_RANK_POINTS.length >= 4);
  const joined = HOW_WE_RANK_POINTS.map((p) => p.title + p.body).join('\n');
  assert.ok(joined.includes('唔賣資料') || joined.includes('唔會將'));
  assert.ok(joined.includes('適合度') || joined.includes('最適合'));
  assert.ok(joined.includes('摘要命中'));
});

test('trust panel promises no accounts, no phone capture, official links only', () => {
  const promiseText = TRUST_PANEL.promises.map((p) => p.title + p.body).join('\n');
  assert.ok(promiseText.includes('唔使開戶口'));
  assert.ok(/唔收電話|lead form|電話/.test(promiseText));
  assert.ok(promiseText.includes('唔賣資料') || promiseText.includes('唔銷售'));
  for (const link of OFFICIAL_EDU_LINKS) {
    assert.ok(isOfficialEduHref(link.href), `${link.href} must be official`);
    const host = new URL(link.href).hostname;
    assert.ok(
      ALLOWED_OFFICIAL_HOSTS.some((allowed) => host === allowed || host.endsWith(allowed) || allowed.endsWith(host)),
      `unexpected official host ${host}`,
    );
    assert.ok(link.href.startsWith('https://'));
  }
  const required = ['vhis.gov.hk', 'education.ia.org.hk', 'icb.org.hk', 'ifec.org.hk', 'consumer.org.hk'];
  for (const needle of required) {
    assert.ok(OFFICIAL_EDU_LINKS.some((l) => l.href.includes(needle)), `missing official link ${needle}`);
  }
});

test('VHIS fraud warning trusts only official vhis.gov.hk / IA domains', () => {
  assert.ok(VHIS_FRAUD_WARNING.body.includes('www.vhis.gov.hk'));
  assert.ok(VHIS_FRAUD_WARNING.trustedHostLabels.some((label) => label.includes('vhis.gov.hk')));
  assert.ok(VHIS_FRAUD_WARNING.trustedHostLabels.some((label) => label.includes('ia.org.hk') || label.includes('保監局')));
  assert.ok(isTrustedVhisHost('www.vhis.gov.hk'));
  assert.ok(isTrustedVhisHost('education.ia.org.hk'));
  assert.equal(isTrustedVhisHost('vhis-gov.hk.example.com'), false);
  assert.equal(isTrustedVhisHost('notvhis.gov.hk'), false);
  assert.ok(!/保證批核|保證扣税成功/.test(VHIS_FRAUD_WARNING.body));
});

test('complaint note links official stats and states complaints ≠ denial rate', () => {
  assert.ok(COMPLAINT_DATA_NOTE.body.includes('投訴宗數唔等於拒賠率') || COMPLAINT_DATA_NOTE.limitLine.includes('≠ 拒賠率'));
  assert.ok(COMPLAINT_DATA_NOTE.limitLine.includes('投訴宗數'));
  assert.ok(COMPLAINT_DATA_NOTE.limitLine.includes('拒賠率'));
  assert.ok(isOfficialEduHref(COMPLAINT_DATA_NOTE.officialLink.href));
  assert.ok(COMPLAINT_DATA_NOTE.officialLink.href.includes('icb.org.hk'));
  assert.ok(!/\d+\s*(宗|件)\s*投訴/.test(COMPLAINT_DATA_NOTE.body + COMPLAINT_DATA_NOTE.limitLine), 'must not invent complaint counts');
});

test('medical path compare is dimensions-only with navigation links and no “better” ranking', () => {
  assert.ok(MEDICAL_PATH_COLUMNS.length >= 4);
  const columnIds = MEDICAL_PATH_COLUMNS.map((c) => c.id);
  assert.ok(columnIds.includes('vhis-standard-flexi'));
  assert.ok(columnIds.includes('group-employer'));
  assert.ok(columnIds.includes('top-up-smm'));
  assert.ok(columnIds.includes('high-end'));
  assert.ok(MEDICAL_PATH_DIMENSIONS.length >= 4);
  for (const dimension of MEDICAL_PATH_DIMENSIONS) {
    for (const id of columnIds) {
      assert.equal(typeof dimension.values[id], 'string');
      assert.ok(dimension.values[id].length > 0);
    }
    const text = Object.values(dimension.values).join('\n');
    assert.ok(!/比較好|最好|最適合你|冠軍|勝出/.test(text), dimension.id);
  }
  assert.ok(MEDICAL_PATH_COMPARE.notBetterNote.includes('冇冠軍') || MEDICAL_PATH_COMPARE.notBetterNote.includes('唔係'));
  assert.equal(MEDICAL_PATH_COMPARE.links.vhisList.to, '/vhis');
  assert.equal(MEDICAL_PATH_COMPARE.links.medicalCategory.to, '/category/medical');
  assert.equal(MEDICAL_PATH_COMPARE.links.topUpCategory.to, '/category/top-up-medical');
  assert.equal(MEDICAL_PATH_COMPARE.links.guidesVhis.to, '/guides#vhis');
});

test('research intents cover curated pain-point chips and valid navigation routes', () => {
  const labels = RESEARCH_INTENTS.map((intent) => intent.label);
  for (const required of ['旅遊不保事項', 'VHIS vs 公司醫保', '自負額', '等候期', '單次 vs 全年']) {
    assert.ok(labels.includes(required), `missing intent ${required}`);
  }
  const allowedPrefixes = ['/guides', '/category/', '/vhis', '/about'];
  for (const intent of RESEARCH_INTENTS) {
    assert.ok(allowedPrefixes.some((prefix) => intent.to.startsWith(prefix)), `${intent.id} → ${intent.to}`);
    assert.ok(!/最適合|推薦購買/.test(intent.label + intent.hint));
  }
  const byLabel = Object.fromEntries(RESEARCH_INTENTS.map((i) => [i.label, i]));
  assert.ok(byLabel['旅遊不保事項'].to.startsWith('/guides'));
  assert.ok(byLabel['VHIS vs 公司醫保'].to.includes('vhis'));
  assert.ok(byLabel['自負額'].to.startsWith('/guides'));
  assert.ok(byLabel['等候期'].to.startsWith('/guides'));
  assert.ok(byLabel['單次 vs 全年'].to.startsWith('/category/'));
});

test('education search group and empty-state chips stay navigational', () => {
  assert.equal(EDUCATION_GROUP_HEADING, '教育／導航');
  const emptyQuery = educationNavItems('');
  assert.ok(emptyQuery.length >= 5);
  for (const item of emptyQuery) {
    assert.ok(item.to.startsWith('/'));
    assert.equal(item.groupLabel, EDUCATION_GROUP_HEADING);
  }
  const deductible = educationNavItems('自負額');
  assert.ok(deductible.length >= 1);
  assert.ok(deductible.some((item) => item.to.startsWith('/guides') || item.to.startsWith('/category/')));
  const vhisVs = educationNavItems('VHIS vs 公司醫保');
  assert.ok(vhisVs.length >= 1);
  assert.ok(vhisVs.some((item) => item.to.includes('guides') || item.to.includes('vhis')));
  const chips = emptyStateIntentChips(8);
  assert.ok(chips.length >= 5);
  for (const chip of chips) {
    assert.ok(chip.to.startsWith('/'));
  }
});

test('medical family path chips are navigation-only', () => {
  assert.ok(isMedicalFamilyCategory('medical'));
  assert.ok(isMedicalFamilyCategory('high-end-medical'));
  assert.ok(isMedicalFamilyCategory('top-up-medical'));
  assert.equal(isMedicalFamilyCategory('travel'), false);
  assert.equal(MEDICAL_FAMILY_CATEGORY_IDS.has('pet'), false);
  const labels = MEDICAL_PATH_CHIPS.map((chip) => chip.label);
  for (const required of ['自願醫保', '高端', 'Top-up', '官方名單', '指南']) {
    assert.ok(labels.includes(required), `missing chip ${required}`);
  }
  const tos = MEDICAL_PATH_CHIPS.map((chip) => chip.to);
  assert.ok(tos.includes('/category/medical'));
  assert.ok(tos.includes('/category/high-end-medical'));
  assert.ok(tos.includes('/category/top-up-medical'));
  assert.ok(tos.includes('/vhis'));
  assert.ok(tos.some((to) => to.startsWith('/guides')));
  for (const chip of MEDICAL_PATH_CHIPS) {
    assert.ok(!/最適合|推薦|排名/.test(chip.label));
  }
});

test('source modules keep honesty language and education group label', () => {
  const trust = readSrc('src/lib/trust-methodology.ts');
  const intents = readSrc('src/lib/research-intents.ts');
  const palette = readSrc('src/components/SearchPalette.tsx');
  const howWeRank = readSrc('src/components/trust/HowWeRankCard.tsx');
  const trustPanel = readSrc('src/components/trust/TrustPanel.tsx');
  const medicalPath = readSrc('src/components/research/MedicalPathCompare.tsx');
  const categoryDetail = readSrc('src/pages/CategoryDetail.tsx');
  const guides = readSrc('src/pages/Guides.tsx');

  assert.ok(palette.includes('EDUCATION_GROUP_HEADING') || palette.includes('教育／導航'));
  assert.ok(palette.includes('educationNavItems'));
  assert.ok(palette.includes('emptyStateIntentChips') || palette.includes('search-empty-education'));
  assert.ok(palette.includes('舊資料／暫不作新投保參考'));
  assert.ok(howWeRank.includes('摘要命中'));
  assert.ok(howWeRank.includes('MOTION'));
  assert.ok(trust.includes('vhis.gov.hk') || trust.includes('https://www.vhis.gov.hk'));
  assert.ok(trustPanel.includes('VHIS_FRAUD_WARNING') || trustPanel.includes('vhis-fraud-warning'));
  assert.ok(trustPanel.includes('OFFICIAL_EDU_LINKS') || trustPanel.includes('official-link-'));
  assert.ok(trustPanel.includes('TRUST_PANEL') || trustPanel.includes('唔賣資料') || trustPanel.includes('唔銷售'));
  assert.ok(medicalPath.includes('MOTION'));
  assert.ok(medicalPath.includes('MEDICAL_PATH_COMPARE') || medicalPath.includes('medical-path'));
  assert.ok(trust.includes('/category/medical') && trust.includes('/category/top-up-medical') && trust.includes('/vhis') && trust.includes('/guides#vhis'));
  assert.ok(categoryDetail.includes('HowWeRankCard'));
  assert.ok(categoryDetail.includes('MEDICAL_PATH_CHIPS'));
  assert.ok(guides.includes('TrustPanel'));
  assert.ok(guides.includes('MedicalPathCompare'));
  assert.ok(intents.includes('旅遊不保事項'));
  assert.ok(trust.includes('摘要命中排序'));
  assert.ok(!/get_quote|lead_form|phoneNumber|phone_capture/i.test(trust + trustPanel + howWeRank));
});
