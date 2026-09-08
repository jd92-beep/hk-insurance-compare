import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const data = JSON.parse(await readFile('public/data/insurance-data.json', 'utf8'));
const out = 'boundary-evidence'; await mkdir(out, { recursive: true });
const browser = await chromium.launch(); const results = [];
try {
  for (const viewport of [{width:1440,height:960},{width:390,height:844}]) {
    const page = await browser.newPage({ viewport, reducedMotion:'reduce' });
    const errors = []; page.on('pageerror', error => errors.push(String(error)));
    try {
      let broken = true;
      await page.route('**/data/insurance-data.json', route => {
        const response = structuredClone(data);
        if (broken) response.products[0].coverage[0].source_url = 42;
        return route.fulfill({json:response});
      });
      await page.goto('http://127.0.0.1:4173/product/' + data.products[0].id);
      await page.getByRole('alert').filter({hasText:'coverage[0].source_url'}).waitFor();
      assert.equal(await page.locator('[data-pdf-highlight]').count(),0);
      await page.screenshot({path:`${out}/${viewport.width}-invalid-source.png`});
      broken = false;
      await page.getByRole('button',{name:'重新載入資料',exact:true}).click();
      await page.getByRole('heading',{level:1}).first().waitFor();
      assert.ok((await page.locator('main').innerText()).includes(data.products[0].product_name_zh));
      assert.equal(await page.getByRole('button',{name:'重新載入資料',exact:true}).count(),0);
      assert.deepEqual(errors,[]);
      results.push({viewport,invalidSource:'rejected',validRetry:'pass',errors});
    } catch (error) {
      results.push({viewport,failed:true,error:String(error),errors});
      await page.screenshot({path:`${out}/${viewport.width}-failed.png`}).catch(()=>{});
    } finally {await page.close();}
  }
} finally {await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));
if(results.some(row=>row.failed)) process.exitCode=1;
