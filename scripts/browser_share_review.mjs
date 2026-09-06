import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
await mkdir('browser-evidence', { recursive: true });
const results = [], browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    for (const mode of ['denied', 'modern-success', 'legacy-success']) {
      const page = await browser.newPage({ viewport });
      const errors = []; page.on('pageerror', error => errors.push(String(error)));
      try {
        await page.addInitScript(mode => {
          window.__shareWrites = [];
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
            writeText: async text => {
              if (mode !== 'modern-success') throw new DOMException('Denied for regression test', 'NotAllowedError');
              window.__shareWrites.push(text);
            },
          } });
          document.execCommand = () => mode === 'legacy-success';
        }, mode);
        await page.goto(`${base}/compare?ids=travel-axa,travel-msig&campaign=private`);
        const copy = page.getByRole('button', { name: '複製比較連結', exact: true }).first();
        await copy.click();
        if (mode === 'denied') {
          const dialog = page.getByRole('dialog', { name: '手動複製比較連結' });
          await dialog.waitFor();
          const input = dialog.getByLabel('比較分享網址', { exact: true });
          const url = new URL(await input.inputValue());
          assert.equal(url.searchParams.get('ids'), 'travel-axa,travel-msig');
          assert.equal(url.searchParams.has('campaign'), false);
          assert.equal(await page.getByRole('button', { name: '連結已複製', exact: true }).count(), 0);
          assert.ok(await input.evaluate(el => document.activeElement === el && el.selectionEnd === el.value.length && el.selectionStart === 0));
          await page.screenshot({ path: `browser-evidence/${viewport.width}-manual-share.png` });
          await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
          await page.waitForFunction(() => document.activeElement?.textContent?.includes('複製比較連結'), null, { timeout: 5000 });
        } else {
          await page.getByRole('button', { name: '連結已複製', exact: true }).waitFor();
          if (mode === 'modern-success') assert.equal(new URL((await page.evaluate(() => window.__shareWrites))[0]).searchParams.get('ids'), 'travel-axa,travel-msig');
          assert.equal(await page.locator('textarea').count(), 0, 'Temporary copy field leaked');
        }
        assert.equal(errors.length, 0, errors.join('\n'));
        results.push({ viewport, mode, result: 'pass', errors });
      } catch (error) {
        results.push({ viewport, mode, failed: true, errors: [...errors, String(error)] });
        await page.screenshot({ path: `browser-evidence/${viewport.width}-${mode}-share-failed.png` }).catch(() => {});
      } finally { await page.close(); }
    }
  }
} finally { await browser.close(); await writeFile('browser-evidence/share-results.json', JSON.stringify(results, null, 2)); }
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.failed)) process.exitCode = 1;
