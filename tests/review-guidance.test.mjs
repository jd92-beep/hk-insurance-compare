import {createHash} from "node:crypto";
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
test('active agent instructions agree with blocking zero-warning CI',()=>{
  for(const path of ['AGENTS.md','GEMINI.md','.github/PULL_REQUEST_TEMPLATE.md']) {
    const text=read(path);
    assert.ok(text.includes('npm ci'),`${path}: use reproducible install`);
    assert.ok(text.includes('npm run lint -- --max-warnings=0'),`${path}: document the actual lint gate`);
    assert.doesNotMatch(text,/git push origin master|維持.{0,20}(?:17|22).{0,20}(?:baseline|錯誤|error)|158 款現行最新/);
  }
});
test('PR template requires reproducible evidence and a bounded content claim',()=>{
  const text=read('.github/PULL_REQUEST_TEMPLATE.md');
  for(const heading of ['Base/head SHA','Reproduction','Changed files','Verification evidence','Data and PDF evidence','Dependencies and rollback','Unverified / out of scope']) {
    assert.ok(text.includes(heading),`Missing ${heading}`);
  }
  assert.match(text,/Not run/);
});

test('legacy guidance is preserved byte-for-byte but the old entrypoints redirect to current state',()=>{
  const original={
    'AGENTS.md':'ffd0ad3c00015d231497b5bcb8f9ea1a08145397',
    'GEMINI.md':'7083f18c1889072cde7d02e37723057f61f76ff2',
    '01-what-has-been-done.md':'c1c7e8253e5852fd65347affae3deaec3e242d4d',
    '02-current-problems.md':'cac7c13746c459ea5816edfef37edb3d2f7f410f',
    '03-next-phases.md':'9450930bed1347af824e3e9355d546c8612ff548',
    '04-goals.md':'5a8c25b7f4378f4a4dd40cfb231490fb5a3ece44',
    '05-notes-for-next-agent.md':'39782d37af6a39cf4ba9e9ceebc495078db4e9a3',
  };
  for(const [name,sha] of Object.entries(original)){
    const bytes=readFileSync(`handoff/archive/pre-audit-2026-09-06/${name}`);
    assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),sha,name);
    if(/^0/.test(name))assert.ok(read(`handoff/${name}`).includes('00-current-status.md'));
  }
  assert.ok(read('handoff/00-current-status.md').includes('problem-register-2026-09-06.md'));
  assert.ok(read('docs/review/problem-register-2026-09-06.md').includes('INS-20'));
});
