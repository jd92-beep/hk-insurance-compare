import { verifyProductIdentity } from './product_identity.mjs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium }=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const data=JSON.parse(await readFile('public/data/insurance-data.json','utf8'));
const out='complete-evidence';await mkdir(out,{recursive:true});const base='http://127.0.0.1:4173';
const browser=await chromium.launch();const results=[];
const overflow=()=>document.documentElement.scrollWidth>innerWidth+1;
try{
 const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'});
 const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const product of data.products){
  errors=[];
  try{
   await page.goto(`${base}/product/${product.id}`);
   await page.getByRole('heading',{level:1}).first().waitFor({timeout:15000});
   if((await page.locator('main').innerText()).includes('頁面暫時未能開啟'))throw Error('Error boundary shown');
   const text=await page.locator('main').innerText();
   const heading=await page.getByRole('heading',{level:1}).first().innerText();
   const category=data.categories.find(item=>item.id===product.category)?.name_zh??product.category;
   const identityProblems=verifyProductIdentity(product,category,{url:page.url(),heading,text});
   if(identityProblems.length)throw Error(identityProblems.join('; '));
   results.push({kind:'product',id:product.id,title:await page.title(),overflow:await page.evaluate(overflow),errors:[...errors]});
  }catch(e){results.push({kind:'product',id:product.id,failed:true,errors:[...errors,String(e)]});await page.screenshot({path:`${out}/product-${product.id}-failed.png`}).catch(()=>{});}
 }
 await context.close();
 for(const viewport of [{width:1440,height:960},{width:390,height:844}]){
  const c=await browser.newContext({viewport});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
  try{
   await p.goto(base+'/');await p.locator('[data-hero-stat]').last().waitFor();await p.waitForTimeout(1800);
   await p.mouse.move(viewport.width*.75,viewport.height*.45);await p.waitForTimeout(500);
   await p.screenshot({path:`${out}/${viewport.width}-landing.png`});
   const timing=await p.evaluate(()=>new Promise(resolve=>{let last=0;const gaps=[];function step(t){if(last)gaps.push(t-last);last=t;if(gaps.length<90)requestAnimationFrame(step);else{gaps.sort((a,b)=>a-b);resolve({median:gaps[45],p95:gaps[85],samples:gaps.length});}}requestAnimationFrame(step);}));
   await p.locator('footer').scrollIntoViewIfNeeded();await p.waitForTimeout(500);await p.screenshot({path:`${out}/${viewport.width}-footer.png`});
   await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(250);
   if(await p.evaluate(()=>document.documentElement.classList.contains('lenis')))throw Error('Reduced motion did not disable Lenis');
   await p.goto(base+'/insurers#%ZZ');await p.getByRole('heading',{level:1}).waitFor();await p.waitForTimeout(500);
   const wide=await p.evaluate(overflow);if(wide)throw Error('Insurers still overflows');
   await p.locator('article').first().scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${viewport.width}-insurers.png`});
   await p.goto(base+'/data-quality?product=travel-aig');await p.getByRole('heading',{level:1}).waitFor();await p.locator('details[open] table').waitFor();
   await p.screenshot({path:`${out}/${viewport.width}-audit.png`});
   results.push({kind:'site',viewport,headlessFrameTimingMs:timing,insurersOverflow:wide,reducedMotion:'pass',audit:'pass',errors:errs});
  }catch(e){results.push({kind:'site',viewport,failed:true,errors:[...errs,String(e)]});await p.screenshot({path:`${out}/${viewport.width}-failure.png`});}
  await c.close();
 }
 // A failed data request must be recoverable, not a permanent empty screen.
 const retryPage=await browser.newPage();let first=true;
 await retryPage.route('**/data/insurance-data.json',route=>{if(first){first=false;return route.fulfill({status:503,body:'temporarily unavailable'});}return route.continue();});
 try{await retryPage.goto(base+'/categories');await retryPage.getByRole('button',{name:'重新載入資料',exact:true}).click();await retryPage.getByRole('heading',{level:1}).waitFor();if(await retryPage.getByRole('button',{name:'重新載入資料',exact:true}).count())throw Error('Retry error remained');results.push({kind:'network-retry',result:'pass',errors:[]});}
 catch(e){results.push({kind:'network-retry',failed:true,errors:[String(e)]});}
 await retryPage.close();
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
const failures=results.filter(r=>r.failed||r.overflow||r.errors?.length);console.log(JSON.stringify({checked:results.length,failures},null,2));if(failures.length)process.exitCode=1;
