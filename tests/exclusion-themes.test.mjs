import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AGE_REDUCTION_LEXICAL_PATTERN,
  AGE_REDUCTION_NOTICE,
  EXCLUSION_THEME_LABELS,
  EXCLUSION_THEMES_NOTE,
  deriveAgeReductionExcerpts,
  deriveExclusionThemes,
} from '../src/lib/exclusion-themes.ts';

const themeById = (themes, id) => themes.find((t) => t.themeId === id);

test('lexical themes map summary excerpts without claiming exclusion proof', () => {
  const themes = deriveExclusionThemes({
    exclusions: ['受保前已存在的狀況', '參與專業運動或帶有金錢報酬的比賽'],
    key_terms: ['精神科治療只限香港境內住院', '等候期：住院前 30 日'],
    coverage: [{ item: '產前檢查', limit: '每年 HK$2,000' }],
  });

  assert.ok(themeById(themes, 'pre-existing'));
  assert.equal(themeById(themes, 'pre-existing').label, EXCLUSION_THEME_LABELS['pre-existing']);
  assert.ok(themeById(themes, 'pre-existing').excerpts.includes('受保前已存在的狀況'));

  assert.ok(themeById(themes, 'high-risk-sports'));
  assert.ok(
    themeById(themes, 'high-risk-sports').excerpts.includes(
      '參與專業運動或帶有金錢報酬的比賽',
    ),
  );

  assert.ok(themeById(themes, 'psychiatric'));
  assert.ok(
    themeById(themes, 'psychiatric').excerpts.includes('精神科治療只限香港境內住院'),
  );

  assert.ok(themeById(themes, 'waiting-period'));
  assert.ok(themeById(themes, 'waiting-period').excerpts.includes('等候期：住院前 30 日'));

  assert.ok(themeById(themes, 'maternity'));
  assert.ok(themeById(themes, 'maternity').excerpts.some((e) => e.includes('產前檢查')));

  // Result shape is theme/label/excerpts only — no suitability score or ranking.
  for (const theme of themes) {
    assert.deepEqual(Object.keys(theme).sort(), ['excerpts', 'label', 'themeId']);
    assert.ok(Array.isArray(theme.excerpts));
    assert.ok(theme.excerpts.every((e) => typeof e === 'string' && e.length > 0));
  }
});

test('age, region and known-event themes stay lexical buckets', () => {
  const themes = deriveExclusionThemes({
    exclusions: [
      '冬季運動保障不適用於70歲以上受保人',
      '與古巴、敘利亞、蘇丹、北韓等地區有關之旅程',
      '任何已知的事件及狀況',
    ],
  });
  assert.ok(themeById(themes, 'age-limit'));
  assert.ok(
    themeById(themes, 'age-limit').excerpts.includes(
      '冬季運動保障不適用於70歲以上受保人',
    ),
  );
  assert.ok(themeById(themes, 'region-overseas'));
  assert.ok(
    themeById(themes, 'region-overseas').excerpts.some((e) => e.includes('地區')),
  );
  assert.ok(themeById(themes, 'known-event'));
  assert.ok(
    themeById(themes, 'known-event').excerpts.includes('任何已知的事件及狀況'),
  );
});

test('unmatched exclusions fall into 其他 while still showing original strings', () => {
  const original = '未妥善看管下遺失或被盜之隨身物品';
  const themes = deriveExclusionThemes({ exclusions: [original] });
  assert.equal(themes.length, 1);
  assert.equal(themes[0].themeId, 'other');
  assert.equal(themes[0].label, EXCLUSION_THEME_LABELS.other);
  assert.deepEqual(themes[0].excerpts, [original]);
});

test('no theme hit is empty retrieval, not a coverage certificate', () => {
  assert.deepEqual(deriveExclusionThemes({}), []);
  assert.deepEqual(deriveExclusionThemes({ exclusions: [], key_terms: [], coverage: [] }), []);
  // Unknown non-string rows must not crash or invent themes.
  assert.deepEqual(deriveExclusionThemes({ exclusions: [null, undefined, ''], coverage: [{ item: '', limit: '' }] }), []);
});

test('honesty copy states hit ≠ 不保已證實 and miss ≠ 受保', () => {
  assert.match(EXCLUSION_THEMES_NOTE, /唔代表已證實不保/);
  assert.match(EXCLUSION_THEMES_NOTE, /唔等於受保/);
  assert.match(EXCLUSION_THEMES_NOTE, /原文/);
});

test('age-reduction notice is lexical warning with original excerpts only', () => {
  const senior = '未滿17歲或年滿70歲受保人個人意外保障為計劃最高限額之50%';
  const child = '成人可免費携同一位隨行兒童（保障為成人50%）';
  const taxOnly = '每名受保人每課稅年度最高 HK$8,000 稅務扣減';
  const plain = '自付費以下之合資格費用不獲賠償';

  const excerpts = deriveAgeReductionExcerpts({
    key_terms: [senior],
    exclusions: [child, taxOnly, plain],
  });
  assert.ok(excerpts.includes(senior));
  assert.ok(excerpts.includes(child));
  assert.ok(!excerpts.includes(taxOnly), 'tax deduction alone is not age reduction');
  assert.ok(!excerpts.includes(plain));

  assert.equal(deriveAgeReductionExcerpts({ exclusions: [plain] }).length, 0);
  assert.match(AGE_REDUCTION_NOTICE, /唔代表已證實扣減幅度/);
  assert.ok(AGE_REDUCTION_LEXICAL_PATTERN.test('長者'));
  assert.ok(AGE_REDUCTION_LEXICAL_PATTERN.test('兒童'));
  assert.ok(AGE_REDUCTION_LEXICAL_PATTERN.test('年齡扣減'));
  assert.ok(AGE_REDUCTION_LEXICAL_PATTERN.test('60歲'));
  assert.ok(AGE_REDUCTION_LEXICAL_PATTERN.test('65歲'));
  assert.ok(AGE_REDUCTION_LEXICAL_PATTERN.test('70歲'));
  assert.ok(!AGE_REDUCTION_LEXICAL_PATTERN.test('稅務扣減'));
});

test('coverage rows can surface age wording without inventing reduction percentages', () => {
  const limit = '海外醫療及相關費用（18-70歲）：70歲以上半額；18歲以下 HK$125,000';
  const excerpts = deriveAgeReductionExcerpts({
    coverage: [{ item: '海外醫療', limit }],
  });
  assert.equal(excerpts.length, 1);
  assert.ok(excerpts[0].includes(limit.split('：')[0]) || excerpts[0].includes('70歲'));
  // Notice copy must not embed an invented site-side % formula.
  assert.ok(!AGE_REDUCTION_NOTICE.includes('%'));
});
