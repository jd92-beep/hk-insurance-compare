import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const data = JSON.parse(await readFile('public/data/insurance-data.json', 'utf8'));
const out = 'chart-evidence'; await mkdir(out, { recursive: true });
const browser = await chromium.launch(); const results = [];
const frameAt = async locator => {
  await locator.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }));
  await locator.page().evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};
try {
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    for (const category of new Set(data.products.map(product => product.category))) {
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      try {
        await page.goto(`http://127.0.0.1:4173/category/${category}`);
        const panel = page.locator('[data-evidence-chart]');
        await panel.waitFor({ timeout: 20000 });
        const select = panel.getByRole('combobox', { name: '選擇保障項目' });
        const values = await select.locator('option').evaluateAll(options => options.map(option => option.value));
        assert.ok(values.length, 'No actual benefit options');
        const total = data.products.filter(product => product.category === category).length;
        const rows = viewport.width < 768 ? panel.locator('[data-evidence-card]') : panel.locator('tbody tr');
        assert.equal(await rows.count(), Math.min(6, total), 'Overview is not bounded');
        assert.ok(await rows.first().isVisible(), 'Wrong responsive presentation');
        if (viewport.width < 768) {
          const first = rows.first();
          await first.getByText('比較狀態', { exact: true }).waitFor();
          const link = first.getByRole('link', { name: /^核對/ });
          assert.ok((await link.getAttribute('href')).startsWith('/documents?'));
          assert.ok(await first.evaluate(el => el.scrollWidth <= el.clientWidth + 1), 'Card requires horizontal reading');
        }
        if (total > 6) {
          await panel.getByRole('button', { name: `顯示全部 ${total} 款`, exact: true }).click();
          assert.equal(await rows.count(), total, 'Expanded view lost product records');
          await panel.getByRole('button', { name: '收起至六款概覽', exact: true }).click();
          assert.equal(await rows.count(), 6);
          await panel.getByRole('button', { name: `顯示全部 ${total} 款`, exact: true }).click();
        }
        await select.selectOption(values.at(-1));
        assert.equal(await select.inputValue(), values.at(-1));
        if (values.length > 1) assert.equal(await rows.count(), Math.min(6, total), 'Changing metric retained stale expanded state');
        const source = await panel.getByRole('link', { name: /^核對/ }).first().getAttribute('href');
        assert.ok(source?.startsWith('/documents?'), 'Missing evidence-center link');
        await select.selectOption(values[0]);
        const scopes = await panel.locator('[data-limit-scope]').evaluateAll(nodes => nodes.map(node => node.dataset.limitScope));
        assert.ok(scopes.every(scope => scope !== 'event' && scope !== 'unspecified'));
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, 'Visualization caused page-level overflow');
        if (['travel', 'medical', 'pet'].includes(category)) {
          await frameAt(panel.getByRole('heading', { name: '數字背後，要有同一把尺。', exact: true }));
          await page.screenshot({ path: `${out}/${viewport.width}-${category}-overview.png` });
          await frameAt(panel.locator('[data-evidence-preview]'));
          await page.screenshot({ path: `${out}/${viewport.width}-${category}-evidence.png` });
        }
        results.push({ category, viewport, options: values.length, scopes, totalProducts: total, previewAndExpand: 'pass', metricReset: 'pass', responsiveEvidence: 'pass', sourceLink: 'pass', overflow, errors });
      } catch (error) {
        results.push({ category, viewport, failed: true, errors: [...errors, String(error)] });
        await page.screenshot({ path: `${out}/${viewport.width}-${category}-failure.png` }).catch(() => {});
      } finally { await page.close(); }
    }
    await context.close();
  }
} finally {
  await browser.close(); await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
}
const failures = results.filter(result => result.failed || result.errors.length);
console.log(JSON.stringify({ checks: results.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
