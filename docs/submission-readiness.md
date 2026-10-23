# Directory submission preparation

## October 23 gallery candidate — not submitted

Local source 2.1.0 adds explicit previews and gallery sorting. Current read-only Creator inspection confirms the existing private App-backed plugin and its unchanged binding. The existing Sites publication remains version 19, source 2.0.0; the candidate has not been deployed.

The current ChatGPT rehearsal returned catalog data but its app card remained blank, then displayed “This response couldn’t load.” Local simulated-host browser results do not establish a passing ChatGPT flow. The public demo URL returned HTTP 404; its obsolete URL is omitted from the preparation metadata. A replacement recording, verified reviewer access, canonical identity-preserving submission route, exact saved-submission checks and owner attestations remain required. Earlier dated records below describe historical checks, not current readiness.

This repository provides source, branding, review cases, and a recording script. It does not claim an approved directory listing or OpenAI endorsement.

## Prepared

- Versioned source with MIT license and preserved third-party notices
- Square 512×512 PNG icon and editable SVG
- Five positive and three unsupported-request review cases
- A walkthrough script and a [public v19 UI update plus the labeled 3:27 v18 workflow recording](https://aaarslan.com/prompt-library/demo/) using fictional Demo records and the owner's explicit account-isolation exception; complete public playback and decode verified
- Source tests, mock-host UI tests, local HTTP/D1 smoke tooling, and deterministic packaging
- Publisher: Abdallah Arslan, individual; the selected organization now shows Verified
- Explicit all-supported-countries targeting (`countries: []`) and free release (`commerce: false`), supplied by the owner
- A separate portable upload builder that omits private App bindings and credentials, verifies its ZIP inventory, and refuses missing materials unless explicitly building a preparation draft
- Existing product, support, privacy and terms pages verified in the public browser; the October 14 privacy update discloses usage counters and cleanup
- Owner-approved adults-only eligibility (18+) in the app notice, policies and listing; the notice does not technically verify age
- Canonical Sites version 19 runs source 2.0.0 with UI resource v10 and the configured launch caps; the original App/plugin identity and owner-only audience are preserved
- Complete portable submission ZIP with the verified recording URL, checked inventory and no detected secrets; upload remains blocked on canonical identity and reviewer access
- Authenticated v19 resource retrieval and real Chrome card/copy behavior verified; earlier Safari checks cover the repaired integration. The complete Demo catalog includes all 35 built-ins and owned fictional templates.

## Still required for submission

1. Confirm the supported App Directory submission and reviewer-installation route for the existing Sites-owned App. Support recommends public review but has not guaranteed identity preservation through submission. The October 14, 7:39 PM EDT check found no reply to the latest authorized follow-up. The HTML resource failure is resolved; do not create a duplicate App.
2. Establish a dedicated reviewer installation and sign-in path without using the owner's credentials. The local development demonstration is recorded, but reviewer access is not verified. Keep any credentials in secure portal fields.
3. Complete the review cases against the exact saved submission. Development rehearsal observed the expected draft lifecycle, native copy/paste, import preview, snapshot preservation, and unsupported-request boundaries. A private development installation does not establish submitted-host or external-reviewer access.
4. Validate the final package and its imported metadata, resolve scans, and have the owner complete legal/policy attestations in the supported portal. The verified organization's portal currently exposes ZIP upload but no existing canonical App entry or reuse selector; no draft was created because identity preservation is unresolved.

Upload, review submission, approval, and publishing are separate states. None is established by a successful source build or a public GitHub repository.

## Build the portable preparation archive

`python3 scripts/package-submission.py --endpoint "$VERIFIED_MCP_ENDPOINT" --draft`

Supply the verified existing endpoint from the private deployment connection; do not commit private Site URLs, tokens, reviewer credentials, or App bindings to this source. The builder includes `plugin.json`, portable OAuth `mcp.json`, the real PNG icon, and the MIT license. Its `submission-readiness.json` reports missing materials separately from online verification. Omit `--draft` to enforce complete metadata. It does not attest that URLs, the demo recording, the live host, publisher verification, or portal scans have passed.

The ordinary `package:source` archive is a public source export and must not be uploaded as a submission package.

## Tool annotation explanations

Use these explanations with the portal's supported fields and verify them against its current scan. The tool schemas retain their boolean annotations; no extension keys are invented. Every operation is scoped to the authenticated owner and selected workspace.

| Tool | readOnlyHint | Read-only explanation | openWorldHint | Open-world explanation | destructiveHint | Destructive explanation |
|---|---|---|---|---|---|---|
| export_library | true | Reads one page of the signed-in owner's existing records without mutating storage. | false | Operates only on that owner's bounded private library; it does not transmit the export to an outside service. | false | Does not modify or remove records. |
| delete_library_data | false | Deletes persisted templates and drafts after exact confirmation. | false | Operates only on the authenticated owner's library; no external service action. | true | Irreversibly removes active database records and snapshots within the stated scope. |
| list_templates | true | Reads stored templates and built-in examples; creates no draft. | false | Returns the authenticated owner's catalog and the app's built-ins only. | false | Makes no persistent changes. |
| open_library | true | Reads catalog, recent draft summaries and an optional selected template/draft. Selection alone does not save. | false | Reads only the app's built-ins and the authenticated owner's library. | false | Does not modify existing records. |
| save_template | false | Creates a template or updates an owned template. | false | Writes only to the authenticated owner's library. | true | Its update variant can overwrite an existing template's title, body, description or category. |
| preview_import | true | Validates and parses the supplied text in memory without saving or executing it. | false | Uses only the supplied content; does not fetch external content or publish it. | false | Does not change saved records. |
| prepare_draft | false | Saves a new draft and its template snapshot. | false | Creates a record only within the authenticated owner's library. | false | Does not overwrite an existing draft or execute the rendered prompt. |
| update_draft | false | Persists replacement field values with an optimistic version check. | false | Updates only an owned draft in the library. | true | Replaces prior field values; omitted fields become missing. |
| render_prompt | true | Reads a stored draft and deterministically renders its snapshot. | false | Uses only that owned record; does not execute or send the result elsewhere. | false | Does not modify saved records. |
