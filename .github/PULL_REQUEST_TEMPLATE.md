## 1. Base/head SHA and purpose

Base branch / parent PR: 
Exact head SHA: 
APP_VERSION / BUILD_NUMBER: 
User-visible outcome: 
Production changed? No, unless separately authorized and documented.

## 2. Reproduction

<!-- Use synthetic data for examples. State actual vs expected, route, inputs, viewport and root cause. -->
Steps to reproduce the old failure:
Expected behavior:
Observed old behavior:
Root cause (file/function, not just the symptom):

## 3. Changed files and interfaces

| File | Specific change | Why required | Interfaces/consumers affected |
|---|---|---|---|

What must remain unchanged:
What another agent must NOT simplify, remove or overwrite:
Durable implementation/handoff note:

## 4. Verification evidence

<!-- Fill PASS/FAIL/Not run/Blocked honestly. A checked command is not proof unless its output was observed. -->

| Command / scenario | Before fix | This exact head | Evidence or limitation |
|---|---|---|---|
| `npm ci` (Node22, committed lockfile) | | Not run | |
| Regression that reproduces the old bug | | Not run | |
| `npm test` | | Not run | |
| `npm run lint -- --max-warnings=0` | | Not run | Zero errors and warnings required |
| `npm run build` | | Not run | List warnings separately |
| `npm run test:filters` | | Not run | Required for comparison/data changes |
| Relevant desktop/mobile browser flows | | Not run | Browser/version/viewport, screenshots |
| Failed network / empty / keyboard / reduced motion | | Not run | As applicable |

Exact Actions run + tested SHA:
What was mocked vs a real file/browser/service:
Screenshots reviewed and observed defects:

## 5. Data and PDF evidence

<!-- Say 'No policy/data/PDF changes' when true; do not imply inherited data was reverified. -->
Changed policy claims / products / tiers:
Official source and applicable version/effective date:
Physical PDF page / literal excerpt / conditions:
Dataset and document fingerprints:
Freshness / sale or renewal-only status:
Audit or manifest regeneration and reviewed diff:

A literal match, HTTP200, download date or hash is NOT semantic/freshness certification. Missing and unknown values stay explicit. Never fabricate a quote/page or alter a policy number to pass a test.

## 6. Dependencies and rollback

Required parent PRs and order:
Other branches NOT included:
Expected merge-conflict files and which behavior must be preserved:
Migration / external side effects:
Rollback procedure and any trust/data risk:

Do not merge/push to `master` or enable auto-merge without separate authorization. A green PR is not a deployment.

## 7. Unverified / out of scope

Remaining bugs and follow-up acceptance criteria:
Devices/browsers not tested:
Policy semantics/latest-version checks not completed:
Security/accessibility/performance claims this PR does NOT establish:
