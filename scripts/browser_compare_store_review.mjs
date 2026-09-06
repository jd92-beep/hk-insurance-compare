import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
await mkdir('browser-evidence', { recursive: true });
const browser = await chromium.launch(); const results = [];
try {
  const context = await browser.newContext();
  const first = await context.newPage(), second = await context.newPage();
  const errors = []; for (const page of [first, second]) page.on('pageerror', error => errors.push(String(error)));
  await first.goto(`${base}/categories`);
  await first.evaluate(() => localStorage.setItem('ic-compare-tray', JSON.stringify(['travel-aig', 'travel-aig', 'ghost-id', 'travel-axa'])));
  await first.reload();
  await first.getByRole('button', { name: '開始比較（2/3）', exact: true }).waitFor();
  await second.goto(`${base}/categories`);
  await second.getByRole('button', { name: '開始比較（2/3）', exact: true }).waitFor();
  const removeAll = first.getByRole('button', { name: '清空比較', exact: true });
  await removeAll.click();
  await second.getByRole('button', { name: '清空比較', exact: true }).waitFor({ state: 'hidden' });
  assert.deepEqual(await second.evaluate(() => JSON.parse(localStorage.getItem('ic-compare-tray'))), []);
  assert.equal(errors.length, 0, errors.join('\n'));
  results.push({ normalization: 'pass', unknownProductCleanup: 'pass', crossTabClear: 'pass', errors });
  await second.screenshot({ path: 'browser-evidence/compare-storage.png' });
  await context.close();
} catch (error) { results.push({ failed: true, error: String(error) }); process.exitCode = 1; }
finally { await browser.close(); await writeFile('browser-evidence/compare-storage-results.json', JSON.stringify(results, null, 2)); }
console.log(JSON.stringify(results, null, 2));
