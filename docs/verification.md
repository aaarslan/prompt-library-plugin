# Verification record

## October 23 private deployment and host compatibility follow-up

The existing owner-private Site deployed source `29c157a8e22dccf2faf128fc25b6ccbb2c3128b5` successfully as version 20, retaining environment revision 1, MCP, the original App/plugin and one-owner audience with no external visitors. The approved temporary source credential was used only through the official source helper and expired; it was not printed or persisted.

All 35 built-in prompts were read individually: 25 retained and 10 revised for complete requested outcomes, proportionate rigor, or reduced mandatory ceremony. The per-template decisions and before/after wording are in [the catalog review](catalog-review-2026-10-23.json). IDs and placeholder keys are unchanged. Forty Node tests and all five UI suites passed, including a new regression proving that a saved built-in draft keeps its original snapshot when the catalog body changes.

Authenticated resource retrieval through the existing connection returned v11 as `text/html;profile=mcp-app`, 125,123 bytes, SHA-256 `d47d3609e7bc1076e222b206c0c5d7b92f7a60e137fcf815884c6d36ebcea18c`, exactly matching the deployed source. The v10 alias returned the same current HTML. The resource has empty network/resource CSP allowlists and no external script bundles. This establishes resource transport/content, not successful rendering of the new view.

A retry in real ChatGPT web rendered the old gallery, establishing that this remote Site is not generally desktop-only. Its installed tool catalog still advertises v10, and the rendered cached view was old. The existing App’s supported Refresh tools action did not advance that observed URI. A fresh invocation again failed its first load. Same-account Reconnect was blocked by automatic approval review and did not execute; latest-gallery host acceptance remains unverified. Native Computer Use access was denied by the automation layer, so no native-client compatibility result is claimed. No protocol aliases, permission grants, or App identities were changed to work around these results.

The deployed source omits `_meta.ui.domain`. Current official UI reference documentation requires a unique domain for submission but supplies a development default, so this is a submission gap rather than a demonstrated cause of the initial loading failure. The current portfolio `dev` tree contains no demo route or MP4 assets; its route parser returns not-found for the documented demo URL. No replacement recording is claimed. The proper initial-public-submission ownership route for this private Sites-owned App still needs verification; absence of a selector alone is not proof that it is unsupported.


## October 23 gallery candidate, source 2.1.0 — not deployed or submitted

The candidate adds read-only original-template previews with variable lists, title/category sorting, and optional contextual filling in an expandable section. The existing owner/Demo boundary, import preview, draft snapshots, optimistic version checks, and live unsaved copy remain unchanged. UI resource v11 retains v1–v10 aliases.

Typecheck, 39 Node tests, all five existing UI suites with targeted gallery assertions, production build, and the isolated local HTTP/D1 smoke passed. The smoke retains the documented Miniflare first-post-cancellation connection caveat and confirms recovery with one read-only ping. In a real browser against a clearly labeled local host simulation, original prompt/field previews, template selection, editing three fictional Orchard values, and actual clipboard readback passed. At a 390-pixel viewport, the document and scroll widths both measured 390. The temporary viewport was reset. These checks do not establish current ChatGPT-host acceptance.

A current authenticated ChatGPT rehearsal returned the Demo catalog but showed a blank app card followed by “Couldn’t display Prompt Library” and “This response couldn’t load.” The loading failure remains unresolved. The public demo URL returned HTTP 404, while product/support/privacy/terms pages returned 200 with the intended content. The obsolete demo URL is absent from current preparation metadata. The portal exposes a ZIP upload and the saved individual developer identity, but no existing canonical App reuse selector was observed. No archive was uploaded, no duplicate App was created, and no submission or publication occurred.

Plugin Creator metadata and files identify the existing private, personal App-backed plugin. Its binding and audience remain unchanged. The live Site still runs version 19/source 2.0.0. The incomplete preparation ZIP has four files and reports the missing verified actual-host recording, with reviewer access, canonical submission identity, saved-version tests/scans and owner attestations still outstanding. The public source candidate passes the repository audit and a fresh Gitleaks scan; generated private hosting configuration and build outputs are excluded from public source.


## October 14 v19 cleanup and review materials

The v19 cleanup was imported from the owning source commit `5f7eee3`. It moves audience/policy links and the explicit workspace switch into an accessible footer, hides the normal-library banner, retains the fictional Demo notice, and advances the UI resource to v10 while preserving aliases v1–v9. No authentication, data schema, production caps, or canonical App/plugin/Site identities changed.

Typecheck, all 39 Node tests, all five existing UI suites, production build, local HTTP/D1 smoke including the v9 alias, and the public-source audit passed. The packaging regression now supplies its own missing-recording fixture instead of relying on release metadata staying incomplete. Authenticated `resources/read` returned 118,674 bytes as `text/html;profile=mcp-app`, SHA-256 `ac76a0df264566c9d2820126ee886166187b19c2aceea2de43eee9a2856564eb`, exactly matching this source.

In real ChatGPT on Chrome, the first card load failed; one explicit Try again opened the v19 interface. The recording starts after that recovery. Three fictional Demo values and an addition updated the unsaved preview, and Copy prompt pasted the exact expected text with both remaining placeholders into an unsent composer. Nothing was saved or sent. At a 390-pixel viewport, document and scroll widths both measured 390; the footer remained keyboard reachable. The temporary viewport was reset. Safari evidence belongs to the earlier repair, not this v19 check.

The fresh v19 UI recording is `releases/prompt-library-demo-v19.mp4`: 44.42 seconds, H.264, 1788×1066, 12 fps, 982,710 bytes, SHA-256 `a42ebb0b4f865471e15c0bdbf135996b61c7bff3361a265d094070500fc5636c`. It uses chronological continuous CUA screen captures, cropped account navigation, and shortened idle gaps. Full decode passed. Anonymous public HTTP returned 200 with video/mp4, and Chrome playback reached 44.42 seconds with ended=true and no media error. The public page also retains the separately labeled v18 full workflow recording; those cases were not repeated in v19.

The isolated existing publisher checkout, commit `3c0cf63`, passed its build, 40 static tests, and deployment dry run. The public entry JavaScript and stylesheet still match byte-for-byte. Deployment `a0650f71-3b05-4131-a250-98a451545811` uploaded only the updated demo page and new MP4 to the same static Worker and domains, without new services, bindings, plan changes, or paid resources.

The rebuilt portable submission archive is `releases/v19-submission/prompt-library-v2.0.0-submission.zip`, SHA-256 `eb3db778dfcea90c6c58e5025ef656f91c66d7b51a72392a6a577047f1198017`. Its four-file inventory, current demo URL/release notes, five positive and three scoped negative cases, and secret scan passed. Material completeness does not establish submission readiness.

OpenAI Support was checked in the existing signed-in case at October 14, 7:39:56 PM EDT. The latest entry remains the owner's authorized follow-up; no reply followed it. No new message was sent. Existing identity linking, external reviewer installation/sign-in, and plan-specific Sites hosting clarification remain pending. No duplicate App or reviewer invitation was created, and no ZIP upload or Directory submission occurred.

## October 14 v17 merge and v18 review fixes

The v17 repair and a bounded repair of independent Muse Wonder Contributor findings were merged and pushed to main as `fc24f08`. Source 2.0.0 is deployed as Sites version 18 with resource v9. Authenticated `resources/read` returned 117,647 bytes with SHA-256 `de113546482352ebb02c62c268d3238f4ab3aee4859f832bf217780b871d9793`, matching the merged source. The original App/plugin/Site, owner-only audience, database bindings, and production caps are preserved.

The repair clears obsolete host theme variables, aligns live whitespace and placeholder rendering with saved rendering, gates expansion by the active bridge, refreshes edited additions, and rejects additions containing fields. Typecheck, all 39 service tests, existing UI suites with targeted regressions, build, and the local HTTP/D1 smoke passed. Resource aliases v1 through v8 were checked locally. Real ChatGPT verified desktop rendering, unsaved preview/addition copy into an unsent composer, saved revision/reopening, import preview, and snapshot preservation. At 390 pixels, the app document and scroll widths both measured 390; the full saved prompt remained selectable. The temporary viewport was reset.

The owner-authorized fictional Demo workspace was used for recording. The final greeting fixture uses quoted bodies with final periods: its current template is `Welcome {{person}}.`, while its unchanged version-1 draft renders `Hello River.`. Authenticated readback independently confirmed that snapshot and Orchard release version 2 with the five corrected provided values. No normal-library writes or deletions were performed.

A rapid automatic-copy paste initially returned the previous clipboard text. Explicit selectable-text copy then pasted the exact saved Orchard rendering; the recording shows this fallback. An unquoted greeting fixture omitted punctuation in the host's tool arguments; the exact quoted-body case was repeated successfully. These earlier attempts are not counted as passing the exact corrected cases.

The initial unrestricted scheduling boundary request invoked ChatGPT's separate automation feature and created Morning Engineering News. This failed host-wide attempt was paused immediately and verified by the task's Resume control. It remains disabled. The three final negative prompts explicitly restrict the host to Prompt Library and prohibit other apps/automation features. Fresh conversations then refused scheduling/delivery, invisible account-wide history retrieval, and public sharing/Notion synchronization without Prompt Library calls or workflow success claims. The unrestricted attempt is retained in local evidence and excluded from the scoped-case demo.

The final actual recording is `releases/prompt-library-demo-v18.mp4`: 206.75 seconds, H.264, 1554×974, 12 fps, 2,854,966 bytes, SHA-256 `0f3ded40e3039387083d57e7c9d5614697ad614bdfbf0dd5797f3c5eaa44264b`. Account navigation is cropped; playback is accelerated 1.3× and long pauses shortened. All retained frames came from the same recording tab. A complete FFmpeg decode passed. The public demo is https://aaarslan.com/prompt-library/demo/; anonymous HTTP access returned 200 with video/mp4, and Chrome played through to 206.75 seconds with ended=true and no media error. The four-file portable submission archive passed inventory, metadata and secret checks; it remains blocked from upload by canonical identity/reviewer access.

Cloudflare login now works with the existing OAuth scopes. The isolated publisher branch `feature/prompt-library-demo-hosting`, commit `4db87ab`, preserves the public release's entry JavaScript and stylesheet byte-for-byte. Build and dry run passed. Deployment uploaded only the demo page and MP4 to the existing static Worker and domains; version `800b962f-60a5-4559-a008-6339960dc561`. No bindings, paid services, plan changes, new domains, or Worker resources were added. Static asset storage and requests have no additional charge under [Cloudflare's documented pricing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/). Sites' plan-specific numeric request allowance and any public-release cost implications remain with OpenAI Support; the existing application caps are unchanged and are not billing guarantees.

The verified organization's portal still has no canonical Prompt Library entry or App reuse selector. The personal integration remains private and DEVELOPMENT. The owner authorized a follow-up, which was sent in the existing OpenAI Support conversation, requesting canonical ownership/linking, the reviewer installation/sign-in route, and plan-specific hosting clarification. No duplicate integration, reviewer grant, owner-credential sharing, upload, submission, or attestation was performed. The demo demonstrates the development installation, not a saved submission or external reviewer access.

## Earlier verification history

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
| Recorded demo | Recorded locally on October 14 | Real development-host MP4; public hosting and reviewer access remain incomplete; see the latest follow-up below |

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

The portal's selected organization shows Verified and the individual publisher is available. No submission draft was uploaded, submitted, approved, or published. A dedicated reviewer installation/account, the actual recording URL, final saved-submission tests and scans, and owner attestations remain incomplete. Personal Sites plugins cannot currently be shared directly with another ChatGPT user; a Site-only viewer invitation would not establish plugin access. The following repair resolves HTML loading; the supported public-review route remains to be confirmed.

## October 14 deployed resource repair

Authenticated `mcpServer/resource/read` through the installed Codex app-server client exposed the actual gateway error: `PerRequestReadResourceResult` rejected missing `ttlMs` and `cacheScope`. The server advertised MCP 2026-07-28 while returning older response envelopes. HTTP 200 at the Worker and the host's generic HTML asset 404 had obscured this source-side protocol defect. A temporary 228-byte resource and legacy-MIME probe also failed and were removed.

Modern results now include `resultType: "complete"`; discovery, tool/resource lists, and resource reads include `ttlMs: 0` and `cacheScope: "private"`, matching the [MCP 2026 schema](https://modelcontextprotocol.io/specification/2026-07-28/schema). Version selection accepts request-body metadata, rejects disagreement with the HTTP header, and preserves legacy response shapes. A selected-template launch now loads its missing catalog once without resetting the editor or already loaded catalog pages. UI resource v6 preserves v1 through v5 read aliases. Temporary logging and the diagnostic view are absent from the final source.

Canonical Sites version 15 deployed source `c7d1b4ba186919ad909d52f137bd169be9ef6254`, preserving the existing App/plugin, owner-only audience, database bindings, and environment revision 1. Authenticated v6 retrieval returned the required MIME type and 108,637 HTML bytes, matching source SHA-256 `55283e184d219aedb2cc890bb0e4619ee16733afe68d72a9afe0b86a3c663230`. Fresh Chrome widget requests returned HTTP 200 at 20:21:30 and 20:21:37 UTC. Chrome and Safari rendered Project brief's five fields and the complete 35-template Demo catalog. At a 390-pixel Chrome viewport, the document remained 390 pixels wide and the visible card frame was 358 pixels wide; the override was reset.

Type checking, 39 Node tests, all five UI suites, production build, and local HTTP/D1 smoke passed. New regression checks cover modern cache metadata, body/header version agreement, legacy aliases, uncached tool results, and selected-only catalog bootstrap. The previously documented local Miniflare post-cancellation caveat remains. Muse Wonder Full 1.0 Contributor independently reviewed the protocol and UI changes with no blocking findings; a flag-ordering nit was corrected and affected checks passed again. Live checks made no normal-library writes and establish card/catalog behavior, not the full reviewer/demo workflow. No paid services, plan changes, or new App identities were added.


## October 23 — merged gallery and actual v11 host verification

PR #1 merged normally at `1e992004fa2e3298b47eb12009fe602c7d58884a`, including the ten prompt improvements and all 35 per-template review decisions. IDs and placeholder keys remain unchanged. Same-account reconnect completed with the existing Identity permission and canonical App. Installed `open_library` metadata now references `ui://prompt-library/library-v11.html`; the authenticated resource remains 125,123 bytes, SHA-256 `d47d3609e7bc1076e222b206c0c5d7b92f7a60e137fcf815884c6d36ebcea18c`.

In a fresh ChatGPT web conversation, the initial view failed. The supported Try again action rendered the new gallery. Search for Architecture review, its original-prompt preview, Use this template, six fictional field edits, live preview, clipboard readback, no-match recovery and alphabetical sorting passed. The UI confirmed that copying sent nothing to chat. No template or draft was saved or deleted; existing normal-library data was not opened. This establishes the observed flow after retry, not dependable first-load behavior, native-client acceptance or the eight full submission cases. The initial host error remains unresolved; Worker HTTP 200 and valid resources alone do not establish its cause.

The existing portfolio demo route now serves actual v11 host screenshots with fictional data and explicit recording/submission limitations. Portfolio source `8a711f7`, Worker version `03b8f288-9701-4112-98ed-b81fb359ff1a`; HTTP 200 and the gallery screenshot hash match were verified. The previous recording could not be recovered; screenshots are not a substitute for the required demo video. Available browser screencast capture was unavailable, and the prior native Computer Use denial was preserved.
