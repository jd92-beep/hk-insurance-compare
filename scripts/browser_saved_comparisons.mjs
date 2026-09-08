import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base='http://127.0.0.1:4173', key='ic-saved-comparisons-v1', out='saved-evidence';
const dataset=JSON.parse(await readFile('public/data/insurance-data.json','utf8'));
await mkdir(out,{recursive:true});const browser=await chromium.launch();const results=[];
const open=async page=>{const panel=page.locator('[data-saved-comparisons]');await panel.waitFor();if(await panel.getAttribute('open')===null)await panel.locator('summary').click();return panel;};
try{
 for(const viewport of [{width:1440,height:960},{width:390,height:844}]){
  for(const scenario of ['save-restore-sync','changed-missing','unsupported','quota']){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   try{
    if(scenario==='unsupported')await page.addInitScript(({key})=>localStorage.setItem(key,JSON.stringify({version:2,sets:[]})),{key});
    if(scenario==='quota')await page.addInitScript(({key})=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('test quota','QuotaExceededError');return original.call(this,k,v);};},{key});
    await page.goto(base+'/compare?ids=travel-axa,travel-msig');await page.getByRole('button',{name:'清空全部',exact:true}).waitFor();let panel=await open(page);
    await panel.getByRole('button',{name:'儲存目前 2 款',exact:true}).waitFor();
    await panel.getByLabel('組合名稱',{exact:true}).fill('旅遊候選');
    await panel.getByRole('button',{name:'儲存目前 2 款',exact:true}).click();
    if(scenario==='unsupported'||scenario==='quota'){
     await panel.getByRole('alert').waitFor();assert.equal(await panel.locator('[data-saved-set]').count(),0);
     const raw=await page.evaluate(key=>localStorage.getItem(key),key);
     if(scenario==='unsupported')assert.equal(JSON.parse(raw).version,2);else assert.equal(raw,null);
     assert.ok(!(await panel.innerText()).includes('已收藏「'));
    }else{
     await panel.locator('[data-saved-set]').waitFor();
     const raw=await page.evaluate(key=>localStorage.getItem(key),key);assert.deepEqual(JSON.parse(raw).sets[0].products.map(p=>p.id),['travel-axa','travel-msig']);
     if(scenario==='changed-missing'){
      const changed=structuredClone(dataset);changed.products=changed.products.filter(p=>p.id!=='travel-msig');changed.products.find(p=>p.id==='travel-axa').coverage[0].limit='TEST changed summary';
      await page.route('**/data/insurance-data.json',r=>r.fulfill({json:changed}));await page.reload();panel=await open(page);
      await panel.getByText(/1 款網站資料或來源指紋已變動/).waitFor();await panel.getByText(/目前缺少/).waitFor();
      assert.equal(JSON.parse(await page.evaluate(key=>localStorage.getItem(key),key)).sets[0].products.length,2,'Saved record silently replaced');
      await panel.getByRole('button',{name:'載入仍有資料的 1 款',exact:true}).click();
      await page.waitForURL(url=>url.searchParams.get('ids')==='travel-axa');
     }else{
      await page.reload();panel=await open(page);await panel.locator('[data-saved-set]').waitFor();
      await page.getByRole('button',{name:'清空全部',exact:true}).click();await page.getByRole('heading',{name:'仲未揀產品',exact:true}).waitFor();
      panel=await open(page);await panel.getByRole('button',{name:'重新開啟比較',exact:true}).click();
      await page.waitForURL(url=>url.searchParams.get('ids')==='travel-axa,travel-msig');
      // URL changes before React replaces the empty-state panel. Wait for the new comparison view.
      await page.getByRole('button',{name:'清空全部',exact:true}).waitFor();
      panel=await open(page);await panel.getByRole('button',{name:'儲存目前 2 款',exact:true}).waitFor();
      await panel.evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-90,behavior:'instant'}));
      await page.screenshot({path:`${out}/${viewport.width}-saved-comparison.png`});
      const second=await context.newPage();second.on('pageerror',e=>errors.push(String(e)));await second.goto(base+'/compare');const other=await open(second);await other.locator('[data-saved-set]').waitFor();
      await panel.getByRole('button',{name:'刪除收藏 旅遊候選',exact:true}).click();assert.equal(await panel.locator('[data-saved-set]').count(),1);
      await panel.getByRole('button',{name:'確認刪除 旅遊候選',exact:true}).click();
      await other.locator('[data-saved-set]').waitFor({state:'detached'});
      assert.deepEqual(JSON.parse(await page.evaluate(key=>localStorage.getItem(key),key)).sets,[]);
      assert.deepEqual(JSON.parse(await page.evaluate(()=>localStorage.getItem('ic-compare-tray'))),['travel-axa','travel-msig']);
     }
    }
    assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    results.push({viewport,scenario,result:'pass',errors});
   }catch(error){results.push({viewport,scenario,failed:true,error:String(error),errors});await page.screenshot({path:`${out}/${viewport.width}-${scenario}-failure.png`}).catch(()=>{});}
   finally{await context.close();}
  }
 }
}finally{await browser.close();await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));if(results.some(r=>r.failed))process.exitCode=1;
