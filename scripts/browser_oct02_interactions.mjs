import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {ACTIVITIES,HERO_SLIDES} from '../src/lib/landing-photos.ts';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base=process.env.REVIEW_URL||'http://127.0.0.1:5192',out='artifacts/review-20261002/interactions';
await mkdir(out,{recursive:true});const browser=await chromium.launch();const results=[];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(base);await page.locator('h1').waitFor();const hero=page.locator('section[aria-labelledby="hero-title"]');
   for(const slide of HERO_SLIDES){
    await hero.getByRole('button',{name:slide.tab+'保險',exact:true}).click();
    await hero.getByRole('link',{name:slide.cta,exact:true}).waitFor();
    await page.waitForFunction(alt=>document.querySelector('section[aria-labelledby="hero-title"] canvas')?.getAttribute('aria-label')?.startsWith(alt)||document.querySelector(`section[aria-labelledby="hero-title"] img[alt="${alt}"]`),slide.alt);
    await pause(1800);await hero.screenshot({path:`${out}/${width}-hero-${slide.id}.png`});
   }
   const ring=page.locator('#categories-grid');await ring.scrollIntoViewIfNeeded();
   for(const a of ACTIVITIES){
    await ring.getByRole('button',{name:a.title,exact:true}).click();
    await ring.getByRole('heading',{name:a.title,exact:true}).waitFor();
    const link=ring.locator(`[aria-live="polite"] a[href="/category/${a.category}"]`);await link.waitFor();
    await pause(400);assert.equal(await ring.locator('canvas').getAttribute('aria-label'),a.alt);
    if(['travel','pet','medical'].includes(a.id))await ring.screenshot({path:`${out}/${width}-carousel-${a.id}.png`});
   }
   assert.equal(await ring.getByRole('button',{name:'下一個場景',exact:true}).isDisabled(),true);
   await ring.getByRole('button',{name:'上一個場景',exact:true}).click();await ring.getByRole('heading',{name:ACTIVITIES.at(-2).title,exact:true}).waitFor();
   await page.goto(base+'/category/travel');await page.locator('article').first().waitFor();
   const card=page.locator('article').filter({has:page.locator('a[href="/product/travel-axa"]')}).first();
   const color=await card.evaluate(el=>el.style.getPropertyValue('--accent'));
   await card.getByRole('button',{name:/加入我的最愛/}).click();
   await card.getByRole('button',{name:'加入比較',exact:true}).click();
   await page.goto(base+'/favorites');await page.locator('a[href="/product/travel-axa"]').first().waitFor();
   const fav=page.locator('article').filter({has:page.locator('a[href="/product/travel-axa"]')}).first();
   assert.equal(await fav.locator('.depth-z-bar').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(0, 55, 137)');
   assert.equal(color,'#003789');
   await page.reload();await page.locator('a[href="/product/travel-axa"]').first().waitFor();
   await page.goto(base+'/compare?ids=travel-axa,travel-msig');await page.getByRole('button',{name:'清空全部',exact:true}).waitFor();
   await page.screenshot({path:`${out}/${width}-compare.png`});
   assert.deepEqual(errors,[]);results.push({width,heroes:7,carousel:11,favorites:'persisted',compare:'rendered',consistentCardColor:true,pass:true});
  }catch(e){results.push({width,pass:false,error:String(e),errors});await page.screenshot({path:`${out}/${width}-failed.png`});}
  await context.close();
 }
 for(const scenario of ['no-webgl','texture-failure','context-loss','normal-motion']){
  const context=await browser.newContext({viewport:{width:1440,height:960}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
   if(scenario==='no-webgl')await page.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:orig.call(this,type,...args);};});
   if(scenario==='texture-failure')await page.route('**/illustrations/travel.webp',r=>r.abort());
   await page.goto(base);await page.locator('h1').waitFor();const hero=page.locator('section[aria-labelledby="hero-title"]');
   if(scenario==='context-loss'){
    await page.waitForFunction(()=>Number(document.querySelector('section[aria-labelledby="hero-title"] canvas')?.style.opacity)===1);
    await hero.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost')));
   }
   if(scenario!=='normal-motion'){
    await hero.locator('img[src="/illustrations/travel.webp"]').waitFor();
    await hero.getByRole('button',{name:'寵物保險',exact:true}).click();await hero.locator('img[src="/illustrations/pet.webp"]').waitFor();
    await page.waitForFunction(()=>{const el=document.querySelector('section[aria-labelledby="hero-title"] img');return el?.complete&&el.naturalWidth>0;});
   }else{
    await hero.getByRole('button',{name:'暫停主題輪播',exact:true}).click();
    await hero.getByRole('button',{name:'播放主題輪播',exact:true}).waitFor();
    await pause(4000);await page.mouse.move(1000,400);await page.screenshot({path:`${out}/motion-hero.png`});
    await page.emulateMedia({reducedMotion:'reduce'});await hero.getByRole('button',{name:'播放主題輪播',exact:true}).waitFor({state:'hidden'});
   }
   const ring=page.locator('#categories-grid');await ring.scrollIntoViewIfNeeded();
   if(scenario==='no-webgl'){
    await ring.locator('img').waitFor();await ring.getByRole('button',{name:ACTIVITIES[5].title,exact:true}).click();
    await ring.locator(`img[src="${ACTIVITIES[5].photo}"]`).waitFor();
   }
   await pause(500);await ring.screenshot({path:`${out}/${scenario}-carousel.png`});assert.deepEqual(errors,[]);results.push({scenario,pass:true});
  }catch(e){results.push({scenario,pass:false,error:String(e),errors});}
  await context.close();
 }
}finally{await browser.close();await writeFile(out+'/results.json',JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));if(results.some(r=>!r.pass))process.exitCode=1;
