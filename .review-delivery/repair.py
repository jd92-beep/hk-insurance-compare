"""Verified documentation follow-up: retain navigation and assert immutable archive bodies."""
import hashlib, json, pathlib, subprocess
P=pathlib.Path
def sha(b): return hashlib.sha256(b).hexdigest()
p=P('scripts/refresh_review_docs_20260918.py')
assert sha(p.read_bytes())=='7c4510623d514fa9537a1d1ac46ff33f3de76e45f31541b4044863df4a5c8893'
s=p.read_text().replace('进階數值','進階數值').replace('必須区分','必須區分').replace('不可推断','不可推斷').replace('預設隐藏','預設隱藏')
needle='Read [current delivery](../docs/review/2026-09-18-release.md), [evidence disposition](../docs/review/2026-09-18-evidence.md) and [AGENTS.md](../AGENTS.md).'
assert s.count(needle)==1
s=s.replace(needle,needle+'\n\nNavigation: [current handover](00-current-status.md) and [historical problem register](../docs/review/problem-register-2026-09-06.md). The register is historical; re-check each item against the current head.')
p.write_text(s)
p=P('tests/review-guidance.test.mjs'); assert sha(p.read_bytes())=='23da495ea757a890669c399be87fe400e7fda0e985bfe855e62d5c52f39d107b'
p.write_bytes(P('.review-delivery/test-repair.mjs').read_bytes())
subprocess.run(['python','scripts/refresh_review_docs_20260918.py'],check=True)
expected={
'handoff/00-current-status.md':'3c9631a09210e757fae5fa571e5b0b76f13f41f5317a8645f8417a12a080b668',
'handoff/01-what-has-been-done.md':'d174bd7bb5df687558234fd0e58f6ebf40c6bd1e43ed715d4acfbfcbe4dec530',
'handoff/02-current-problems.md':'8747028492e9633a0cf9b7c8cd27c31cad15b4b94971c3e9999056aa75cd3b67',
'handoff/03-next-phases.md':'ccf64a304bd96a4f4c2b3a3df169d844509f5dc3803ccfc572470f54e3954bfa',
'handoff/04-goals.md':'5812afa1ee4638b0babf024a7d3b90700f65a6b8fdc2fec5f93e5bcb2f215236',
'handoff/05-notes-for-next-agent.md':'182d6c83356bc7bdc395b9fd1300d0027d539e5b152d949084ce3567504bc6b8',
'handoff/06-pr-merge-status-2026-09-06.md':'46e7d39e9360b06e861a0a3d4fa786318f56d81fe4f5121f4bc578bbb4c08635',
'handoff/README.md':'fc75f8d9861741dce93fa7214b30ebb8befc7a2d1dd4606b68251929031a1c6e',
'scripts/refresh_review_docs_20260918.py':'dc7dad289aa5659607ff9880fef68fad136385b8bf51d8fce28b7533c1e9e499',
 'tests/review-guidance.test.mjs':'dadf8d4adf2a000f0b87abfd57f03f7055c500d0f0bd03dc0d35d01638b54efb'}
for path,digest in expected.items(): assert sha(P(path).read_bytes())==digest, path
P('/tmp/repair-changed.json').write_text(json.dumps(list(expected)))
print('Documentation repair output hashes verified; original archive-body assertions retained.')
