import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const data=JSON.parse(await readFile('public/data/insurance-data.json','utf8'));
const out='category-evidence';await mkdir(out,{recursive:true});
const browser=await chromium.launch();const results=[];
try{
 for(const viewport of [{width:1440,height:960},{width:390,height:844}]){
  const context=await browser.newContext({viewport});
  for(const id of new Set(data.products.map(p=>p.category))){
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   try{
    await page.goto(`http://127.0.0.1:4173/category/${id}`);
    const guide=page.locator('section[aria-labelledby="decision-heading"]');
    await guide.waitFor({timeout:20000});
    await guide.getByRole('checkbox').first().check();
    if(!await guide.getByRole('checkbox').first().isChecked())throw Error('Preparation checkbox failed');
    await guide.getByRole('button',{name:'下一步',exact:true}).click();
    if(await guide.locator('dt').count()!==3)throw Error('Comparison stage missing');
    await guide.getByRole('button',{name:'下一步',exact:true}).click();
    if(await guide.locator('ol li').count()!==3)throw Error('Verification stage missing');
    if(await guide.getByRole('link',{name:'開啟 PDF 中心'}).getAttribute('href')!=='/documents')throw Error('Broken PDF center CTA');
    await guide.getByRole('button',{name:'重設準備清單',exact:true}).click();
    if(await guide.getByRole('checkbox').first().isChecked())throw Error('Reset failed');
    if(['travel','medical','top-up-medical','pet'].includes(id))await guide.screenshot({path:`${out}/${viewport.width}-${id}.png`});
    results.push({viewport,category:id,checkbox:'pass',stages:'pass',reset:'pass',errors});
   }catch(e){results.push({viewport,category:id,failed:true,errors:[...errors,String(e)]});await page.screenshot({path:`${out}/${viewport.width}-${id}-error.png`});}
   finally{await page.close();}
  }
  // Record existing overflow before the separate layout fix, without hiding it.
  const probe=await context.newPage();await probe.goto('http://127.0.0.1:4173/insurers');await probe.locator('h1').waitFor();await probe.waitForTimeout(800);
  await writeFile(`${out}/${viewport.width}-overflow.json`,JSON.stringify(await probe.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).slice(0,25).map(e=>({tag:e.tagName,class:e.className,text:e.textContent?.slice(0,120),width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))),null,2));
  await context.close();
 }
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));if(results.some(r=>r.failed||r.errors.length))process.exitCode=1;
