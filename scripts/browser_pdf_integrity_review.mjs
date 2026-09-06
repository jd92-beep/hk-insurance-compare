import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const out = 'browser-evidence'; await mkdir(out, { recursive: true });
const browser = await chromium.launch(); const results = [];
try {
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    const errors = []; page.on('pageerror', error => errors.push(String(error)));
    try {
      const route = '**/docs/brochures/*.pdf';
      await page.route(route, async intercepted => {
        const response = await intercepted.fetch();
        const original = await response.body();
        // Still a syntactically plausible PDF, but not the bytes in this build's manifest.
        const replacement = Buffer.concat([original, Buffer.from('\n% changed mirror fixture\n')]);
        await intercepted.fulfill({ response, body: replacement, headers: { ...response.headers(), 'content-length': String(replacement.length) } });
      });
      await page.goto(`${base}/documents?product=travel-aig`);
      const alert = page.getByRole('alert').filter({ hasText: 'PDF 文件版本不符' });
      await alert.waitFor({ timeout: 45000 });
      assert.equal(await page.locator('[data-pdf-highlight]').count(), 0, 'Changed PDF must never highlight');
      assert.equal(await page.locator('canvas[aria-label^="PDF 第"]').count(), 0, 'Changed bytes reached renderer');
      await alert.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 150, behavior: 'instant' }));
      await page.screenshot({ path: `${out}/${viewport.width}-pdf-version-blocked.png` });
      await page.unroute(route);
      await page.reload();
      await page.locator('[data-pdf-highlight]').first().waitFor({ timeout: 45000 });
      const verified = await page.locator('[data-pdf-highlight]').count();
      assert.ok(verified > 0, 'Original mirrored bytes should remain readable');
      await page.locator('[data-pdf-match-status]').evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 150, behavior: 'instant' }));
      await page.screenshot({ path: `${out}/${viewport.width}-pdf-version-verified.png` });
      assert.equal(errors.length, 0, errors.join('\n'));
      results.push({ viewport, byteReplacement: 'blocked', originalRestored: 'pass', verifiedMarks: verified, errors });
    } catch (error) {
      results.push({ viewport, failed: true, errors: [...errors, String(error)] });
      await page.screenshot({ path: `${out}/${viewport.width}-pdf-integrity-failed.png` }).catch(() => {});
    } finally { await page.close(); }
  }
} finally {
  await browser.close(); await writeFile(`${out}/pdf-integrity-results.json`, JSON.stringify(results, null, 2));
}
console.log(JSON.stringify(results, null, 2));
if (results.some(row => row.failed || row.errors.length)) process.exitCode = 1;
