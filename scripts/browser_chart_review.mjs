import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const data = JSON.parse(await readFile('public/data/insurance-data.json', 'utf8'));
const out = 'chart-evidence'; await mkdir(out, { recursive: true });
const browser = await chromium.launch(); const results = [];
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
        if (!values.length) throw Error('No actual benefit options');
        await select.selectOption(values.at(-1));
        if (await select.inputValue() !== values.at(-1)) throw Error('Metric selection did not update');
        if (!await panel.locator('tbody tr').count()) throw Error('Raw-data alternative is missing');
        const source = await panel.getByRole('link', { name: '核對' }).first().getAttribute('href');
        if (!source?.startsWith('/documents?')) throw Error('Missing evidence-center link');
        await select.selectOption(values[0]);
        const scopes = await panel.locator('[data-limit-scope]').evaluateAll(nodes => nodes.map(node => node.dataset.limitScope));
        if (scopes.some(scope => scope === 'event' || scope === 'unspecified')) throw Error('Unaligned event/unknown scope was plotted');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        if (overflow) throw Error('Visualization caused page-level horizontal overflow');
        if (['travel', 'medical', 'pet'].includes(category)) {
          await panel.scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${out}/${viewport.width}-${category}.png` });
        }
        results.push({ category, viewport, options: values.length, scopes, metricSelection: 'pass', sourceLink: 'pass', overflow, errors });
      } catch (error) {
        results.push({ category, viewport, failed: true, errors: [...errors, String(error)] });
        await page.screenshot({ path: `${out}/${viewport.width}-${category}-failure.png` }).catch(() => {});
      } finally { await page.close(); }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(`${out}/results.json`, JSON.stringify(results, null, 2));
}
const failures = results.filter(result => result.failed || result.errors.length);
console.log(JSON.stringify({ checks: results.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
