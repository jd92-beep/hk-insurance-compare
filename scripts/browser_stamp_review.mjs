import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const output = 'browser-evidence'; await mkdir(output,{recursive:true});
const browser = await chromium.launch(); const results=[];
try {
  for(const viewport of [{width:1440,height:960},{width:390,height:844}]) {
    const page = await browser.newPage({viewport,reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror',error=>errors.push(String(error)));
    try {
      await page.goto(base+'/');
      await page.locator('svg textPath').first().waitFor({state:'attached',timeout:20000});
      const stamps=await page.locator('svg textPath').evaluateAll(nodes=>nodes.filter(node=>node.textContent.includes('SOURCE REFERENCE')).map(node=>{
        const href=node.getAttribute('href');
        const svg=node.closest('svg');
        return {text:node.textContent,href,ownsPath:[...svg.querySelectorAll('path[id]')].some(path=>'#'+path.id===href)};
      }));
      assert.ok(stamps.length>=2,'Expected several actual inline stamps on the landing page');
      assert.equal(new Set(stamps.map(stamp=>stamp.href)).size,stamps.length,'Duplicate inline SVG reference');
      assert.ok(stamps.every(stamp=>stamp.ownsPath),'A stamp points to another SVG instance');
      const ringText=await page.locator('svg textPath').allTextContents();
      assert.ok(ringText.every(text=>!(/VERIFIED|官方文件核實/i.test(text))),'Unsubstantiated verification wording');
      const raw=await page.request.get(base+'/stamp-seal.svg');
      assert.ok(raw.ok()); assert.match(await raw.text(),/SOURCE REFERENCE/);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      assert.equal(overflow,false,'Page overflows viewport');
      await page.screenshot({path:`${output}/${viewport.width}-neutral-stamp.png`});
      assert.equal(errors.length,0,errors.join('\n'));
      results.push({viewport,stamps:stamps.length,uniquePaths:'pass',neutralCopy:'pass',overflow,errors});
    } catch(error) {
      results.push({viewport,failed:true,errors:[...errors,String(error)]});
      await page.screenshot({path:`${output}/${viewport.width}-neutral-stamp-failed.png`}).catch(()=>{});
    } finally {await page.close();}
  }
} finally {
  await browser.close(); await writeFile(`${output}/neutral-stamp-results.json`,JSON.stringify(results,null,2));
}
console.log(JSON.stringify(results,null,2));
if(results.some(result=>result.failed)) process.exitCode=1;
