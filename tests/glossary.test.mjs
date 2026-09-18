import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GLOSSARY_ENTRIES,
  GLOSSARY_MORE_HREF,
  findGlossaryMatches,
  getGlossaryEntry,
  glossaryTitle,
  splitByGlossary,
} from '../src/lib/glossary.ts';
import { CLAIM_RESOURCES } from '../src/components/guides/guides-data.ts';

const REQUIRED_TERMS = [
  '自負額',
  '墊底費',
  '等候期',
  '不保事項',
  '共同保險',
  '合理及慣常',
  '全數賠償',
  'CFAR',
  '保證續保',
  'VHIS',
  '實報實銷',
  '住院現金',
  '每年保障限額',
  '終身保障限額',
];

const FORBIDDEN_DEFINITION_MARKERS = [
  '保證賠',
  '一定賠到',
  '保證必賠',
  '必然賠償',
  '成功率',
  '安盛',
  '蘇黎世',
  '富衛',
  'AXA',
  'Zurich',
  'FWD',
  '保誠',
  '友邦',
  'AIA',
];

test('glossary ships 12–20 educational zh-HK terms with match keys and definitions', () => {
  assert.ok(GLOSSARY_ENTRIES.length >= 12 && GLOSSARY_ENTRIES.length <= 20, `got ${GLOSSARY_ENTRIES.length}`);
  const ids = new Set();
  for (const entry of GLOSSARY_ENTRIES) {
    assert.ok(entry.id && entry.term && entry.definition && entry.en);
    assert.ok(Array.isArray(entry.matchKeys) && entry.matchKeys.length > 0, entry.id);
    assert.ok(!ids.has(entry.id), `duplicate id ${entry.id}`);
    ids.add(entry.id);
  }
});

test('required plain-language terms are represented in match keys or display terms', () => {
  const blob = GLOSSARY_ENTRIES.flatMap((e) => [e.term, e.en, ...e.matchKeys]).join('\n');
  for (const needle of REQUIRED_TERMS) {
    assert.ok(blob.includes(needle), `missing glossary coverage for ${needle}`);
  }
});

test('definitions stay product-neutral and never invent claim success', () => {
  for (const entry of GLOSSARY_ENTRIES) {
    for (const marker of FORBIDDEN_DEFINITION_MARKERS) {
      assert.ok(
        !entry.definition.includes(marker),
        `${entry.id} definition must not mention ${marker}`,
      );
    }
  }
});

test('more-terms link points at /guides', () => {
  assert.equal(GLOSSARY_MORE_HREF, '/guides');
});

test('longest match wins so annual/lifetime limits are not eaten by shorter keys', () => {
  const text = '每年保障限額 HK$1,000,000；終身保障限額另計。';
  const matches = findGlossaryMatches(text);
  assert.equal(matches[0]?.entry.id, 'annual-limit');
  assert.equal(text.slice(matches[0].start, matches[0].end), '每年保障限額');
  assert.ok(matches.some((m) => m.entry.id === 'lifetime-limit'));
  // 每年限額 alone still maps when longer key is absent
  const shortOnly = findGlossaryMatches('留意每年限額同重置');
  assert.equal(shortOnly[0]?.entry.id, 'annual-limit');
  assert.equal(text.slice(matches[0].start, matches[0].end).length > 0, true);
});

test('in-context matcher highlights deductible, waiting period and exclusions without policy claims', () => {
  const text = '條款寫明等候期 90 日，自負額 HK$5,000，不保事項包括先天疾病。';
  const matches = findGlossaryMatches(text);
  const ids = matches.map((m) => m.entry.id);
  assert.ok(ids.includes('waiting-period'));
  assert.ok(ids.includes('deductible'));
  assert.ok(ids.includes('exclusions'));
  const segments = splitByGlossary(text);
  assert.ok(segments.some((s) => s.type === 'term'));
  assert.ok(segments.some((s) => s.type === 'text'));
  const joined = segments.map((s) => s.value).join('');
  assert.equal(joined, text);
});

test('English acronyms match case-insensitively and restore original surface form', () => {
  const text = 'CFAR 係附加選項；NCD 折扣另計。';
  const matches = findGlossaryMatches(text);
  assert.equal(matches[0]?.entry.id, 'cfar');
  assert.equal(text.slice(matches[0].start, matches[0].end), 'CFAR');
  assert.ok(matches.some((m) => m.entry.id === 'ncd'));
});

test('glossary title helper is educational and lookup by id works', () => {
  const entry = getGlossaryEntry('waiting-period');
  assert.ok(entry);
  const title = glossaryTitle(entry);
  assert.ok(title.includes(entry.term));
  assert.ok(title.includes(entry.definition));
  assert.equal(getGlossaryEntry('does-not-exist'), undefined);
});

test('claim resources cover before-buying, claim prep, official education links and non-advice boundary', () => {
  const blockIds = CLAIM_RESOURCES.blocks.map((b) => b.id);
  assert.deepEqual(blockIds, ['before-buying', 'claim-prep']);

  const before = CLAIM_RESOURCES.blocks.find((b) => b.id === 'before-buying');
  const beforeBlob = before.points.join('\n');
  for (const needle of ['不保事項', '等候期', '自負額', '計劃層級', '官方文件']) {
    assert.ok(beforeBlob.includes(needle), `before-buying missing ${needle}`);
  }

  const claim = CLAIM_RESOURCES.blocks.find((b) => b.id === 'claim-prep');
  const claimBlob = claim.points.join('\n');
  for (const needle of ['收據', '報告', '通知時限', '保單', '唔保證賠償']) {
    assert.ok(claimBlob.includes(needle), `claim-prep missing ${needle}`);
  }

  assert.ok(CLAIM_RESOURCES.notAdvisor.includes('唔係中介人'));
  assert.ok(CLAIM_RESOURCES.notAdvisor.includes('唔提供投保建議'));
  assert.ok(CLAIM_RESOURCES.disclaimer.includes('唔保證賠償'));

  const hrefs = CLAIM_RESOURCES.officialLinks.map((l) => l.href);
  assert.ok(hrefs.includes('https://education.ia.org.hk'));
  assert.ok(hrefs.includes('https://www.icb.org.hk'));
  assert.ok(hrefs.includes('https://www.vhis.gov.hk'));
  assert.ok(hrefs.some((h) => h.includes('ifec.org.hk')));
  for (const link of CLAIM_RESOURCES.officialLinks) {
    assert.ok(link.org && link.label && link.href);
  }
});

test('claim resources never invent success rates or push a specific product', () => {
  const blob = [
    CLAIM_RESOURCES.intro,
    CLAIM_RESOURCES.notAdvisor,
    CLAIM_RESOURCES.disclaimer,
    ...CLAIM_RESOURCES.blocks.flatMap((b) => b.points),
    ...CLAIM_RESOURCES.officialLinks.map((l) => l.label),
  ].join('\n');
  for (const marker of ['成功率', '保證賠償成功', '一定賠到', '必賺']) {
    assert.ok(!blob.includes(marker), `claim resources must not contain ${marker}`);
  }
  assert.ok(!/\d+\s*%/.test(blob), 'claim resources must not invent numeric success rates');
  // 唔保證賠償 is required boundary language, not a success claim
  assert.ok(blob.includes('唔保證賠償'));
});
