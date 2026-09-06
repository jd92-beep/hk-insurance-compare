/** CI browser audit. Browser dependencies live in RUNNER_TEMP, not production. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const out = 'browser-evidence';
await mkdir(out, { recursive: true });
const data = JSON.parse(await readFile('public/data/insurance-data.json', 'utf8'));
const paths = ['/', '/categories', ...data.categories.map(c => `/category/${c.id}`), '/product/travel-aig', '/compare?ids=travel-axa,travel-msig', '/insurers', '/guides', '/vhis', '/about', '/not-a-real-route'];
const results = [];
const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    for (const [index, route] of paths.entries()) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      const started = performance.now();
      try {
        await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        await page.locator('h1').first().waitFor({ state: 'visible', timeout: 20000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1200); // Only for settling entrance animation in screenshots.
        const text = await page.locator('body').innerText();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        results.push({ route, viewport, title: await page.title(), h1: await page.locator('h1').allTextContents(), bodyCharacters: text.length, overflow, errors, observedLoadMs: Math.round(performance.now() - started) });
        await page.screenshot({ path: `${out}/${viewport.width}-${index}.png`, fullPage: false });
        // Verify the lower page remains reachable: catches old pinned-section overlays.
        if (route === '/') {
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${out}/${viewport.width}-footer.png` });
        }
      } catch (error) {
        results.push({ route, viewport, errors: [...errors, String(error)], failed: true });
        await page.screenshot({ path: `${out}/${viewport.width}-${index}-error.png` }).catch(() => {});
      } finally { await page.close(); }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
}
const failures = results.filter(r => r.failed || r.errors.length || r.overflow || r.bodyCharacters < 50);
console.log(JSON.stringify({ routes: paths.length, viewportRuns: results.length, failures }, null, 2));
if (process.env.AUDIT_STRICT === 'true' && failures.length) process.exitCode = 1;
