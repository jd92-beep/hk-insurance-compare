import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const base = process.env.QA_BASE || 'http://127.0.0.1:4174';
const label = process.env.QA_LABEL || 'fixed2';
const outDir = `foldable-qa-evidence/${label}`;
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);

const viewports = [
  { width: 360, height: 800 },
  { width: 573, height: 900 },
  { width: 673, height: 840 },
  { width: 843, height: 900 },
  { width: 904, height: 900 },
  { width: 1024, height: 800 },
];
const routes = [
  ['home', '/'],
  ['categories', '/categories'],
  ['category-travel', '/category/travel'],
  ['insurers', '/insurers'],
  ['insurer-axa', '/insurers/%E5%AE%89%E7%9B%9B'],
  ['compare', '/compare?ids=travel-axa,travel-blue-cross'],
  ['guides', '/guides'],
  ['product', '/product/travel-axa'],
];

/** Only score primary content surfaces, not decorative/internal chip grids. */
function score(m) {
  const vw = m.vw;
  const mainUtil = m.mainW ? (m.mainW / vw) * 100 : null;
  const cardGrids = m.grids.filter((g) =>
    /grid-cards-foldable|fold:grid-cols|grid-cols-1 items-start gap-6|grid grid-cols-1 gap-6 fold/.test(g.cls) ||
    (g.cols.includes('minmax(0px, 1fr)') && g.width > vw * 0.7),
  );
  const primaryGrid = cardGrids.sort((a, b) => b.width - a.width)[0] || null;
  const primaryUtil = primaryGrid ? (primaryGrid.width / vw) * 100 : null;
  const overflow = m.docScroll - vw;
  const bad =
    overflow > 4 ||
    (mainUtil !== null && mainUtil < 92) ||
    (primaryUtil !== null && primaryUtil < 88);
  return { mainUtil, primaryUtil, primaryGrid, overflow, bad };
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const results = [];
let flags = 0;
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: vp });
  for (const [id, path] of routes) {
    try {
      await page.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 });
      await page.waitForTimeout(450);
      const m = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const main = document.querySelector('main');
        const mainR = main?.getBoundingClientRect();
        const grids = [...document.querySelectorAll('[class*="grid"]')]
          .map((el) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {
              cls: (el.className || '').toString().slice(0, 100),
              cols: cs.gridTemplateColumns,
              width: Math.round(r.width),
              left: Math.round(r.left),
              right: Math.round(r.right),
            };
          })
          .filter((g) => g.width > 40);
        return {
          vw,
          docScroll: document.documentElement.scrollWidth,
          mainW: mainR ? Math.round(mainR.width) : null,
          mainRight: mainR ? Math.round(mainR.right) : null,
          grids,
        };
      });
      const s = score(m);
      const shot = `${outDir}/${vp.width}-${id}.png`;
      await page.screenshot({ path: shot, fullPage: false });
      if (s.bad) flags += 1;
      console.log(
        s.bad ? 'FLAG' : 'ok  ',
        String(vp.width).padStart(4),
        id.padEnd(16),
        'main',
        s.mainUtil?.toFixed(1),
        'cards',
        s.primaryUtil?.toFixed(1),
        String(s.primaryGrid?.cols || '').slice(0, 42),
        'ox',
        s.overflow,
      );
      results.push({ vp: vp.width, id, path, ...s, shot, primaryCls: s.primaryGrid?.cls });
    } catch (e) {
      flags += 1;
      console.log('ERR ', vp.width, id, e.message);
      results.push({ vp: vp.width, id, path, error: String(e), bad: true });
    }
  }
  await page.close();
}
await browser.close();
await writeFile(`${outDir}/report.json`, JSON.stringify({ label, base, flags, results }, null, 2));
console.log(`wrote ${outDir}/report.json flags=${flags}`);
