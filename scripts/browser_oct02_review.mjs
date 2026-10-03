import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { verifyProductIdentity } from './product_identity.mjs';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.REVIEW_URL || 'http://127.0.0.1:5192';
const out = 'artifacts/review-20261002/browser';
await mkdir(out, { recursive: true });
const data = JSON.parse(await readFile('public/data/insurance-data.json', 'utf8'));
const browser = await chromium.launch();
const results = [];
const routes = ['/', '/categories', '/insurers', '/compare', '/favorites', '/vhis', '/documents', '/guides', '/about', '/data-quality', ...data.categories.map(c=>'/category/'+c.id), ...[...new Set(data.products.map(p=>p.insurer))].map(key=>'/insurers/'+encodeURIComponent(key))];
try {
 for (const width of [1440, 390]) {
  const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});
  const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
  for (const route of routes) {
   errors=[];
   try {
    await page.goto(base+route);await page.locator('h1').first().waitFor({timeout:20000});await page.waitForTimeout(150);
    assert.ok(!(await page.locator('main').innerText()).includes('頁面暫時未能開啟'));
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    assert.equal(overflow,false,'horizontal overflow');assert.deepEqual(errors,[]);
    await page.screenshot({path:out+'/'+width+'-'+(route.replaceAll('/','-')||'home')+'.png'});
    results.push({width,route,pass:true});
   }catch(e){results.push({width,route,pass:false,error:String(e),errors});}
  }
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'});const page=await context.newPage();
 for (const product of data.products) {
  try {
   await page.goto(base+'/product/'+product.id);await page.locator('h1').first().waitFor({timeout:15000});
   assert.deepEqual(verifyProductIdentity(product, data.categories.find(c=>c.id===product.category).name_zh, {url:page.url(),heading:await page.locator('h1').first().innerText(),text:await page.locator('main').innerText()}),[]);
   assert.ok(!(await page.locator('main').innerText()).includes('頁面暫時未能開啟'));
   results.push({product:product.id,pass:true});
  }catch(e){results.push({product:product.id,pass:false,error:String(e)});}
 }
 await context.close();
 for(const invalid of [false,true]) {
  const ctx=await browser.newContext(); const p=await ctx.newPage();let calls=0;
  await p.route('**/data/insurance-data.json',route=>{calls++;return calls===1?route.fulfill({status:invalid?200:503,contentType:'application/json',body:invalid?'{}':'unavailable'}):route.continue();});
  try {await p.goto(base+'/categories');await p.getByRole('button',{name:'重新載入資料',exact:true}).click();await p.locator('h1').first().waitFor();assert.ok(calls>=2);assert.equal(await p.getByRole('button',{name:'重新載入資料',exact:true}).count(),0);results.push({retry:invalid?'invalid-schema':'503',pass:true});}
  catch(e){results.push({retry:invalid?'invalid-schema':'503',pass:false,error:String(e)});}
  await ctx.close();
 }
} finally {await browser.close();await writeFile(out+'/results.json',JSON.stringify(results,null,2));}
console.log(JSON.stringify({checked:results.length,failures:results.filter(r=>!r.pass)},null,2));if(results.some(r=>!r.pass))process.exitCode=1;
