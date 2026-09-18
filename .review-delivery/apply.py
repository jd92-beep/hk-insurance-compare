"""One-off hash-checked delivery of reviewed UI edits; review branch only."""
import base64, hashlib, json, lzma, pathlib, subprocess
ROOT = pathlib.Path.cwd().resolve()
EXPECTED = 'ffb547606c6e7f053edbeb06dde92f19c44abcd891f3761d697de22fd56afa8c'
def digest(raw): return hashlib.sha256(raw).hexdigest()
def safe(path):
    p = pathlib.PurePosixPath(path)
    assert not p.is_absolute() and '..' not in p.parts and p.parts[0] in ('.github','src','tests','scripts','docs','handoff','README.md','AGENTS.md','GEMINI.md','info.md','public'), path
    target = ROOT / p
    assert not target.is_symlink() and target.resolve().is_relative_to(ROOT), path
    return target
parts = [(ROOT / f'.review-delivery/ui-{i}.b64').read_text().strip() for i in range(1,8)]
s = ''.join(parts)
pathlib.Path('/tmp/received-ui.b64').write_text(s)
print('Transport lengths:', [len(p) for p in parts], flush=True)
raw = lzma.decompress(base64.b64decode(s, validate=True))
assert digest(raw) == EXPECTED, 'Payload differs from locally reviewed edits; no application files edited'
payload = json.loads(raw)
subprocess.run(['git','merge-base','--is-ancestor',payload['base'],'HEAD'],check=True)
changed=[]
for f in payload['files']:
    p=safe(f['path']); old=p.read_bytes() if p.exists() else None
    assert (digest(old) if old is not None else None) == f['before'], 'Original changed: '+f['path']
    if f['after'] is None:
        p.unlink()
    else:
        lines=(old or b'').decode().splitlines(keepends=True)
        for start,count,text in reversed(f['edits']): lines[start:start+count]=[text]
        new=''.join(lines).encode()
        assert digest(new)==f['after'], 'Output differs: '+f['path']
        p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(new)
    changed.append(f['path'])
subprocess.run(['python','scripts/refresh_review_docs_20260918.py'],check=True)
subprocess.run(['python','scripts/audit_evidence.py','--as-of','2026-09-18'],check=True)
for path,sha in payload['generated'].items():
    assert digest(safe(path).read_bytes()) == sha, 'Generated output differs: '+path
    changed.append(path)
subprocess.run(['python','.review-delivery/repair.py'],check=True)
repaired=json.loads(pathlib.Path('/tmp/repair-changed.json').read_text())
for path,sha in payload['generated'].items():
    if path not in repaired: assert digest(safe(path).read_bytes())==sha,path
changed += repaired
pathlib.Path('/tmp/review-changed.json').write_text(json.dumps(sorted(set(changed))))
print('APPLIED AND HASH VERIFIED',len(set(changed)),'files. Application gates follow.',flush=True)
