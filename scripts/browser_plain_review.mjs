/** Strict interaction review for the new plain-language route and bounded optical depth. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const out = 'plain-evidence', base = 'http://127.0.0.1:4173';
await mkdir(out, {recursive:true});
const browser = await chromium.launch(), results=[];
try {
 for (const width of [1440, 390, 320]) {
  const context = await browser.newContext({ viewport:{width,height:960}, reducedMotion:'reduce', isMobile:width<768, hasTouch:width<768 });
  const page = await context.newPage(), errors=[];
  page.on('pageerror', e=>errors.push(String(e)));
  try {
   await page.goto(base+'/category/travel');
   const search = page.getByRole('searchbox', {name:'搵保險公司或產品名稱'});
   await search.waitFor();
   const cards = page.locator('section[aria-label="產品搜尋結果"] article');
   await cards.first().waitFor();
   const total = await cards.count(); assert.ok(total>2);
   assert.equal(await page.locator('details[open]').count(),0,'Advanced filters unexpectedly start open');
   await search.fill('ＡＸＡ'); await page.waitForFunction(()=>document.querySelectorAll('section[aria-label="產品搜尋結果"] article').length===1);
   assert.ok((await cards.first().innerText()).includes('AXA'));
   await search.fill('impossible-product-zzzz');
   await page.getByText('暫時搵唔到符合條件嘅資料',{exact:true}).waitFor();
   await search.fill(''); await cards.nth(1).waitFor();
   assert.equal(await cards.count(),total);
   for(let i=0;i<2;i++) await cards.nth(i).getByRole('button',{name:'加入比較',exact:true}).click();
   assert.equal(await page.getByRole('button',{name:'已加入比較',exact:true}).count(),2);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Category overflow');
   await cards.first().scrollIntoViewIfNeeded();
   await page.screenshot({path:`${out}/${width}-cards.png`});
   if(width===1440){
    await page.emulateMedia({reducedMotion:'no-preference'});
    await cards.first().getByRole('link').first().focus();
    assert.equal(await cards.first().evaluate(el=>el.closest('[data-tilt-enabled]').dataset.tiltEnabled),'false','Keyboard focus must stop card tilt');
    await page.emulateMedia({reducedMotion:'reduce'});
   }
   await page.getByRole('link',{name:'開啟比較清單',exact:true}).click();
   if(width<768) await page.getByRole('heading',{name:'咩情況唔保？',exact:true}).waitFor();
   else {
    const table = page.locator('main table');
    assert.equal(await table.locator('caption').count(),1,'Missing semantic comparison caption');
    await page.getByRole('checkbox',{name:'保障項目只睇文字差異',exact:true}).check();
    assert.ok(await page.getByText('咩情況唔保？',{exact:true}).isVisible());
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Compare overflow');
   await page.screenshot({path:`${out}/${width}-compare.png`});
   assert.equal(await page.locator('button button, a button, button a').count(),0,'Nested interactive controls');
   await page.goto(base+'/product/travel-manulife');
   await page.getByRole('heading',{level:1}).first().waitFor();
   await page.getByText('回報資料問題（GitHub 公開留言）',{exact:true}).waitFor();
   assert.equal(await page.getByRole('link',{name:'往官方網站核對',exact:true}).count(),0,'Quarantined product has purchase CTA');
   await page.goto(base+'/');await page.locator('canvas[data-gem-geometry]').first().waitFor();
   await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(500);
   const gem = page.locator('canvas[data-gem-geometry]').first();
   const before=await gem.evaluate(c=>c.toDataURL()); await page.waitForTimeout(200);
   assert.equal(await gem.evaluate(c=>c.toDataURL()),before,'Reduced-motion gems changed while idle');
   assert.ok(await gem.evaluate(c=>c.width*c.height<=2_005_000),'Canvas exceeds pixel budget');
   await page.screenshot({path:`${out}/${width}-landing.png`});
   assert.equal(errors.length,0,errors.join('\n'));
   results.push({width,search:'pass',compare:'pass',motion:'pass',errors});
  } catch(e) {results.push({width,failed:true,errors:[...errors,String(e)]}); await page.screenshot({path:`${out}/${width}-failure.png`}).catch(()=>{});}
  await context.close();
 }
} finally { await browser.close(); await writeFile(`${out}/results.json`,JSON.stringify(results,null,2)); }
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.failed||r.errors.length))process.exitCode=1;
