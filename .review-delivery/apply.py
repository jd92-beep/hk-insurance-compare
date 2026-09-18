"""One-off, hash-checked delivery of locally tested review edits. Never targets master."""
import base64, gzip, hashlib, json, pathlib, subprocess, zipfile
ROOT = pathlib.Path.cwd()
EXPECTED = 'a96175485b0529a3a0de7b5535d08d591336cd02fa0e6787eef8098911eb4e47'
def sha(raw): return hashlib.sha256(raw).hexdigest()
def safe(path):
    p = pathlib.PurePosixPath(path)
    assert not p.is_absolute() and '..' not in p.parts and p.parts[0] in ('src','tests','docs','public'), path
    target = ROOT / p
    assert not target.is_symlink() and target.resolve().is_relative_to(ROOT), path
    return target
s = ''.join((ROOT / f'.review-delivery/part-{i}.b64').read_text().strip() for i in range(1,5))
# Transport-only corrections. The final SHA below must still match the local reviewed payload.
for old, new in [('Tq3k3YZ','Tq3k2YZ'),('jtptptsv','jtptsv'),('VxpYmJmptu','VxpYmptu'),('J7+eZZqe','J7+eZqe'),('pp2PNuF88t','pp2PNuF8t'),('sSnvnrnr19','sSnvnr19')]:
    s = s.replace(old,new)
pathlib.Path('/tmp/received-payload.b64').write_text(s)
raw = gzip.decompress(base64.b64decode(s, validate=True))
assert sha(raw) == EXPECTED, 'Payload digest differs from locally reviewed changes; stop without editing'
payload = json.loads(raw)
assert subprocess.check_output(['git','rev-parse','HEAD^']).decode().strip() == payload['base'], 'Branch base moved'
changed=[]
for f in payload['files']:
    p=safe(f['path']); old=p.read_bytes() if p.exists() else None
    assert (sha(old) if old is not None else None) == f['before'], 'Original changed: '+f['path']
    lines=(old or b'').decode().splitlines(keepends=True)
    for start,count,text in reversed(f['edits']): lines[start:start+count]=[text]
    new=''.join(lines).encode(); assert sha(new)==f['after'], 'Bad output: '+f['path']
    p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(new); changed.append(f['path'])
p=safe('public/data/insurance-data.json'); old=p.read_bytes(); assert sha(old)==payload['data']['before']
data=json.loads(old)
for op,path,*value in payload['data']['operations']:
    parent=data
    for key in path[:-1]: parent=parent[key]
    if op=='set': parent[path[-1]]=value[0]
    elif op=='remove': del parent[path[-1]]
    else: raise ValueError(op)
new=(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n').encode()
assert sha(new)==payload['data']['after']; p.write_bytes(new); changed.append(str(p.relative_to(ROOT)))
archive=pathlib.Path('/tmp/source-status.zip').read_bytes()
assert sha(archive)=='1d47cf639311a30eeef6fb2c36cc94103e86bb1d36db3f4f1798cb583134187d'
with zipfile.ZipFile('/tmp/source-status.zip') as z: sources=json.loads(z.read('report.json'))
report={'audited_at':'2026-09-18','baseline_dataset_sha256':sources['source_dataset_sha256'],'method':sources['method'],'not_policy_verification':True,'results':[{k:v for k,v in row.items() if k in ['url','products','http_status','final_url','content_type','truncated','error']} for row in sources['results']]}
safe('docs/review/source-reachability-2026-09-18.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
subprocess.run(['python','scripts/audit_evidence.py','--as-of','2026-09-18'],check=True)
for path,digest in payload['generated'].items():
    assert sha(safe(path).read_bytes())==digest, 'Generated output differs: '+path
    changed.append(path)
pathlib.Path('/tmp/review-changed.json').write_text(json.dumps(changed))
print('APPLIED AND HASH VERIFIED',len(changed),'files. Application tests follow.')
