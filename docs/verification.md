# Verification record

Checked on 2026-10-13 with Node.js 24.19.0 against source v1.2.0.

| Check | Result | Scope |
|---|---|---|
| Clean dependency install | Passed | `npm ci --ignore-scripts`, package lock, official npm registry |
| TypeScript | Passed | `npm run typecheck` |
| Service/catalog tests | Passed, 17 tests | Fictional in-memory SQLite fixtures; owner isolation, export pagination, confirmed deletion, rendering bounds |
| UI mock-host suites | Passed | Original interaction regression, redesign regression, data-control regression; no real host/network |
| Production build | Passed | `npm run build` from sanitized source without private Site bindings |
| Local HTTP/D1 smoke | Passed | 9 tools, UI resources, auth and origin rejection, storage, export, atomic synthetic-owner deletion |
| Public-source scan | Passed | No known private bindings, credentials, database state, account URLs, runtime logs, or CI workflows |
| Browser pixel/visual pass | Blocked | Chromium could not start under the available execution permissions |
| Submitted-host review cases | Not run | Requires the exact saved submission and reviewer access |
| Recorded demo | Not recorded | The walkthrough is a script; the overview asset is an illustration |

Mock tests do not prove actual ChatGPT rendering, clipboard permission, or App directory acceptance. Repeat intended-host checks on the exact submitted version. No production data was deleted or exported as a fixture for this verification.

## Mac submission-preparation follow-up, source v1.2.1

Checked on 2026-10-13. Clean locked dependency installation, TypeScript, all 17 service tests, all three mock-host UI suites, production build, and isolated local HTTP/D1 checks passed. The HTTP smoke now checks MCP `server/discover`, protocol `2026-07-28`, negotiation and legacy compatibility alongside authentication/origin rejection, owner isolation, persistence, export, and explicitly confirmed deletion of fictional fixture records.

The portable preparation ZIP was reopened and inspected: four files, a 512×512 PNG icon, no `.app.json`, no App declarations or private compatibility manifests, and no credential headers. The root manifest validates against Agent Plugins 1.0. The MCP transport validates against that base schema after separating the documented OpenAI OAuth extension (which the base schema predates). No client-registration mode or client credentials were inferred.

The owner selected the individual publisher Abdallah Arslan, all supported countries, and a free release. Privacy and terms pages are prepared in the publisher's website checkout and passed its build and 40 static checks; they remain drafts until reviewed and published. The official portal is accessible on the Mac, but no upload or review submission has been made. The canonical Site's saved version 3 predates this preparation; authenticated intended-host behavior, a real recorded demonstration, dedicated reviewer access, scans, and owner attestations remain unverified.

## Approved adult-only publication follow-up

The owner approved an adults-only (18+) release. The app homepage and embedded UI, published privacy and terms, and public listing description use that requirement consistently. The eligibility notice explicitly does not technically verify age; no unsupported age metadata field or date-of-birth collection was added.

Both existing website domains returned all four listing pages publicly with HTTP 200, the intended publisher and contact, and the 18+ notice. All eight HTML responses matched the tested build after excluding only the existing Cloudflare browser-check injection identified by its exact script markers. The website passed its 40 checks; complete policy HTML remains prerendered and policy client code loads on demand within the original initial-download budget.

The existing canonical Site was built and deployed as version 4 from the exact pushed source and deployment archive. Its native publication succeeded with MCP enabled, and its audience remains the owner alone. The nine-tool connection is available. A direct authenticated `preview_import` preflight with the fictional import-boundary fixture returned `previewOnly=true` and exactly `topic` and `audience`; no saved owner records were read or written. This is a protocol preflight, not a completed reviewer test or recorded demo.

The developer portal currently blocks creation/upload until individual or business identity verification. The owner-selected individual identity requires the owner to complete that flow. No submission draft was uploaded. The actual synthetic-data recording, dedicated reviewer account/access, the exact saved-host review cases, portal scans, and owner legal attestations remain incomplete.
