import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const data=JSON.parse(await readFile('public/data/insurance-data.json','utf8'));const selected=data.products.filter(p=>['travel-axa','travel-msig'].includes(p.id));
const out='export-evidence';await mkdir(out,{recursive:true});const browser=await chromium.launch();const results=[];
try{
 for(const viewport of [{width:1440,height:960},{width:390,height:844}]){
  const context=await browser.newContext({viewport,acceptDownloads:true,reducedMotion:'reduce'});const page=await context.newPage();const errors=[];let downloads=0;
  page.on('pageerror',e=>errors.push(String(e)));page.on('download',()=>downloads++);
  try{
   await page.goto('http://127.0.0.1:4173/compare?ids=travel-axa,travel-msig&campaign=private');
   const button=page.getByRole('button',{name:'匯出核對摘要',exact:true});
   const [file]=await Promise.all([page.waitForEvent('download'),button.click()]);
   const text=await readFile(await file.path(),'utf8');
   assert.match(file.suggestedFilename(),/^insurance-comparison-\d{4}-\d\d-\d\d\.md$/);assert.match(text,/不是報價/);assert.match(text,/資料快照/);assert.match(text,/匯出時間/);
   for(const product of selected)assert.ok(text.includes(product.product_name_zh));
   assert.ok(text.includes('/documents?product=travel-axa'));assert.ok(!text.includes('campaign=private'));assert.ok(!text.includes('](javascript:'));
   await writeFile(`${out}/${viewport.width}-comparison-sample.md`,text);
   assert.equal(await page.locator('a[download]').count(),0,'Temporary link leaked');
   const first=selected.find(p=>p.id==='travel-axa');await page.getByRole('button',{name:`移除 ${first.product_name_zh}`,exact:true}).click();
   await page.waitForURL(url=>url.searchParams.get('ids')==='travel-msig');
   const [second]=await Promise.all([page.waitForEvent('download'),button.click()]);const next=await readFile(await second.path(),'utf8');
   assert.ok(!next.includes('travel-axa'));assert.ok(next.includes('travel-msig'));
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:`${out}/${viewport.width}-export-ready.png`});
   await page.evaluate(()=>{URL.createObjectURL=()=>{throw Error('controlled test denial');};});
   await button.click();await page.getByRole('alert').filter({hasText:'未能匯出核對摘要'}).waitFor();assert.equal(downloads,2);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:`${out}/${viewport.width}-export-controls.png`});
   results.push({viewport,realDownloads:downloads,currentSelection:'pass',safeContent:'pass',failure:'not-success',errors});
  }catch(error){results.push({viewport,failed:true,error:String(error),errors});await page.screenshot({path:`${out}/${viewport.width}-failed.png`}).catch(()=>{});}
  finally{await context.close();}
 }
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));if(results.some(r=>r.failed))process.exitCode=1;
