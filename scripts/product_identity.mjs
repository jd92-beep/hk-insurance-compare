/** Assert the existing ProductHeader presentation without weakening product identity. */
const normalize = value => String(value ?? '').normalize('NFKC').replace(/\s+/gu, '');

/** Canonical insurer key list protecting against accidental key invention or renaming. */
export const CANONICAL_INSURER_KEYS = Object.freeze([
  'AIA',
  'AIG',
  'AXA',
  'Allianz',
  'Asia Insurance',
  'Avo',
  'BOC Group Insurance',
  'BOC Life',
  'Blue',
  'Blue Cross',
  'Bowtie',
  'Bupa',
  'China Life (Overseas)',
  'China Taiping',
  'China Taiping Life',
  'Chow Tai Fook Life',
  'Chubb',
  'Chubb Life',
  'Cigna',
  'Dah Sing',
  'DirectAsia',
  'FWD',
  'Generali',
  'HSBC',
  'HSBC Life',
  'Hang Seng',
  'Hong Kong Life',
  'Liberty',
  'MSIG',
  'Manulife',
  'OneDegree',
  'Prudential',
  'QBE',
  'Starr',
  'Sun Life',
  'Well Link Life',
  'YF Life',
  'ZA Insure',
  'Zurich',
  'bolttech'
]);

export const CANONICAL_INSURERS = new Set(CANONICAL_INSURER_KEYS);

export function isCanonicalInsurer(insurer) {
  return typeof insurer === 'string' && CANONICAL_INSURERS.has(insurer);
}

export function verifyProductIdentity(product, categoryName, observed) {
  const problems = [];
  try {
    if (new URL(observed.url).pathname !== `/product/${encodeURIComponent(product.id)}`) problems.push(`Wrong product route: ${observed.url}`);
  } catch { problems.push('Invalid observed product URL'); }
  const name = product.product_name_zh || product.product_name;
  if (!name) return [...problems, 'Expected product name is missing'];
  const isSeries = name.length > 40;
  const seriesName = product.category === 'medical' ? '自願醫保系列' : `${categoryName.replace(/（.*?）/g, '')}系列`;
  const expectedHeading = isSeries ? `${product.insurer_zh} ${product.insurer} ${seriesName}`.trim() : name;
  if (normalize(observed.heading) !== normalize(expectedHeading)) problems.push(`Wrong product heading: expected ${expectedHeading}; observed ${observed.heading}`);
  const text = normalize(observed.text);
  for (const insurer of [product.insurer, product.insurer_zh]) {
    if (!insurer || !text.includes(normalize(insurer))) problems.push(`Missing insurer identity: ${insurer}`);
  }
  const names = isSeries ? name.split('／').map(value => value.trim()).filter(Boolean) : [name];
  for (const plan of names) if (!text.includes(normalize(plan))) problems.push(`Missing plan name: ${plan}`);
  for (const code of new Set(name.match(/[SF]\d{5}/g) ?? [])) if (!text.includes(code)) problems.push(`Missing certification code: ${code}`);
  return problems;
}
