import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const out = 'browser-evidence'; await mkdir(out, { recursive: true });
const browser = await chromium.launch(); const results = [];
try {
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = []; page.on('pageerror', error => errors.push(String(error)));
    try {
      await page.goto(`${base}/documents?product=travel-aig`, { waitUntil: 'domcontentloaded' });
      await page.locator('[data-pdf-highlight]').first().waitFor({ timeout: 45000 });
      const initialMarks = await page.locator('[data-pdf-highlight]').count();
      await page.getByRole('button', { name: '放大 PDF', exact: true }).click();
      await page.locator('[data-pdf-highlight]').first().waitFor({ timeout: 15000 });
      await page.screenshot({ path: `${out}/${viewport.width}-pdf-highlight.png` });
      await page.getByRole('button', { name: '下一頁', exact: true }).click();
      await page.locator('[data-pdf-match-status]').filter({ hasText: '未有足夠長度' }).waitFor();
      if (await page.locator('[data-pdf-highlight]').count()) throw new Error('Unrelated page inherited highlight');
      await page.getByRole('button', { name: '返回引用頁', exact: true }).click();
      await page.locator('[data-pdf-highlight]').first().waitFor({ timeout: 15000 });
      await page.goto(`${base}/documents?product=travel-aig&kind=coverage&entry=0&ref=changed`);
      await page.getByRole('alert').filter({ hasText: '引用內容已經改變' }).waitFor();
      if (await page.locator('[data-pdf-highlight]').count()) throw new Error('Stale claim was highlighted');
      results.push({ viewport, initialMarks, navigation: 'pass', zoom: 'pass', staleLink: 'pass', errors });
    } catch (error) {
      results.push({ viewport, failed: true, errors: [...errors, String(error)] });
      await page.screenshot({ path: `${out}/${viewport.width}-pdf-failure.png` });
    } finally { await page.close(); }
  }
} finally {
  await browser.close(); await writeFile(`${out}/pdf-interactions.json`, JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results, null, 2));
if (results.some(r => r.failed || r.errors.length)) process.exitCode = 1;
