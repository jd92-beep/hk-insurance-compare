import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
await mkdir('browser-evidence', { recursive: true });
const results = [], browser = await chromium.launch();
try {
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = []; page.on('pageerror', error => errors.push(String(error)));
    try {
      await page.goto(`${base}/categories`);
      const opener = page.getByRole('button', { name: '全域搜尋（⌘K）', exact: true });
      await opener.click();
      const dialog = page.getByRole('dialog', { name: '搜尋保險產品、公司與類別' });
      await dialog.waitFor();
      const input = dialog.getByRole('combobox');
      await input.fill('ＡＸＡ');
      await dialog.locator('[cmdk-item]').first().waitFor();
      assert.ok((await dialog.locator('[cmdk-item]').allTextContents()).every(text => /axa|安盛/i.test(text)));
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Focus escaped modal');
      }
      await page.screenshot({ path: `browser-evidence/${viewport.width}-search.png` });
      await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
      assert.ok(await opener.evaluate(el => el === document.activeElement), 'Focus not restored');
      await page.keyboard.press('Control+k'); await dialog.waitFor();
      await input.fill('no-such-insurer-zzzz');
      await dialog.getByRole('button', { name: '清除搜尋', exact: true }).click();
      assert.equal(await input.inputValue(), '');
      await dialog.getByRole('button', { name: '瀏覽所有類別', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(errors.length, 0, errors.join('\n'));
      results.push({ viewport, keyboard: 'pass', focus: 'pass', matching: 'pass', errors });
    } catch (error) {
      results.push({ viewport, failed: true, errors: [...errors, String(error)] });
      await page.screenshot({ path: `browser-evidence/${viewport.width}-search-failed.png` }).catch(() => {});
    } finally { await page.close(); }
  }
} finally { await browser.close(); await writeFile('browser-evidence/search-results.json', JSON.stringify(results, null, 2)); }
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.failed)) process.exitCode = 1;
