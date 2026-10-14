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

At that earlier preparation step, the developer portal blocked creation/upload until individual or business identity verification. The October 14 follow-up below supersedes that identity status. No submission draft was uploaded. The actual synthetic-data recording, dedicated reviewer account/access, the exact saved-host review cases, portal scans, and owner legal attestations remain incomplete.

## October 14 source remediation, version 2.0.0

Verified locally on the specified Mac with Node.js 24.21.0. The checkout began at `bb0ddd5b736fd5d915e85ab092f3d25739ed5adb`. Canonical Sites version 6 source, commit `7330ab0c4080af7b15ef8cbf183314d5dfff186d`, was retrieved through the source workflow to reconcile demo isolation. Private project bindings and credentials were excluded. At the initial remediation handoff, these changes had not been deployed, pushed, uploaded, or submitted. The publication follow-up below records later activation.

| Check | Observed result |
|---|---|
| Locked clean install | `npm ci --ignore-scripts` passed |
| Compiler and service/body/package regressions | `npm run check` passed: 39 Node tests and five UI suites using fictional fixtures |
| UI behavior | Real-service simulated bridge reaches all 211 custom templates, rejects repeated cursors, fetches selected bodies, waits for initial workspace context, and preserves normal records during demo operations |
| Lint | Passed with no errors; one existing homepage `img` advisory remains |
| Production build | `npm run build` passed |
| Local D1 initialization | Both migrations applied to fresh local storage; HTTP smoke uses a separate fresh temporary database |
| Local HTTP/D1 smoke | Discovery, nine schemas, resources, authenticated persistence, owner/workspace denial, quotas, exports, and confirmed deletion passed; the cancellation limit below remains |
| Query plans | Generated owner/ID indexes avoid temporary sorting. The supplied two-owner, 1,000-row-per-table reproduction also passed without missing or foreign export records |
| Migration generation | `npm run db:generate` reports no schema drift after the registered migration and snapshot |
| PNG and portable packaging | Full 512×512 icon chunks and compressed pixels validated; corrupt fixtures rejected. Fictional endpoint preparation test retains normalized asset references and reports missing recording evidence |
| Secrets | Gitleaks 8.30.1, verified release checksum: all five Git commits scanned without findings; sanitized working source also scanned before delivery |
| Dependency audit | Production dependency audit has zero findings. Full audit retains eight high development-dependency findings from the single unpatched `braces` advisory through lint and Vinext tooling; critical and moderate findings were removed |
| Public listing URLs | Anonymous HTTPS GETs returned 200 and actual product/support/privacy/terms content on all four existing aaarslan.com URLs. No redirects or account cookies were used |

The oversized chunked HTTP request returns 413. In local Wrangler/Miniflare transport, the first subsequent POST can return `500: Network connection lost`; one explicit read-only ping confirms recovery. The smoke test logs that exception and never retries a mutation. Updating the local runtime did not eliminate this edge case. Related upstream transport reports include [cancelled-body handling](https://github.com/cloudflare/workers-sdk/pull/15028) and [unread-body proxy failures](https://github.com/cloudflare/workers-sdk/issues/15203). This does not establish production behavior; repeat that boundary test on the intended host before release.

The initial activation prerequisites were migration `0001`, operator-selected `PROMPT_LIBRARY_LIMITS`, and a public usage-counter disclosure. Their later completion is recorded below. Recheck the deployed version and schema inventory, authentication bypass boundaries, real ChatGPT rendering/mobile/clipboard behavior, dedicated reviewer access, recording playback, final package and portal scans, and owner attestations. No paid resource, plan, audience, country, publisher, or commerce setting was changed.

## October 14 hosting and publication follow-up

Implementation commits `4e1ad01` and `aad8940` were pushed to public `main`. Canonical Sites version 8 deployed successfully from pushed source `c49397a1efc2ed625564eac323460df808ed2879` with runtime environment revision 1 and MCP enabled. Private hosting bindings remain outside this public repository. The original App/plugin identity and owner-only audience were preserved.

The owner authorized conservative production caps after research: 100 templates, 200 drafts, and 2 MiB per workspace; 30 tool attempts and 10 writes per user per minute across both workspaces; and 60 tool attempts globally per minute. The [setup guide](setup.md#usage-limits) records the configured JSON and source links. Sites documents 10 GB of D1 storage per Site, but no numeric request allowance was found in the account UI. Incremental hosting is estimated at $0 within the included beta allowance; application caps are not a billing guarantee. No paid resource, model API, plan upgrade, or domain was added.

The live database overview exposes `drafts`, `templates`, and the new `library_usage` table. Authenticated Demo preflights returned 35 catalog-version-2 summaries with no bodies, the selected full Project brief, and the preview-only import fixture with exactly topic and audience. These were reads and preview checks; no normal-library content was changed. They do not constitute the full submitted-host review cases.

The existing publisher website deployed commit `9b65319` as Worker version `774688f9-b5ce-498b-a67c-33875471aa61`. Its build, 40 existing tests, and deployment dry run passed. All four listing pages were inspected in the public browser; privacy shows the October 14 usage-counter disclosure. A direct Python HTTP check was denied by the outer service, so it was not counted as an anonymous HTTP pass.

The first real ChatGPT rehearsal returned template data but failed to open the app card. The host requested the old v4 cache key. The breaking UI was corrected to resource v5, retaining v1 through v4 aliases. Compiler, all 39 Node tests, all five UI suites, production build, and local HTTP/D1 smoke passed again with the previously recorded local cancellation caveat. The updated Site deployed, tool metadata was refreshed, and the existing OAuth account reconnected with the same basic-profile scope. A subsequent host request used resource v5 but still returned HTTP 404 and `HTML asset not found`. No iframe rendering or clipboard success is claimed.

The portal's selected organization shows Verified and the individual publisher is available. No submission draft was uploaded, submitted, approved, or published. A dedicated reviewer installation/account, the actual recording URL, final saved-submission tests and scans, and owner attestations remain incomplete. Personal Sites plugins cannot currently be shared directly with another ChatGPT user; a Site-only viewer invitation would not establish plugin access. Resolve the existing App's supported review path and HTML resource lookup before recording a successful demo or sending reviewer invitations.
