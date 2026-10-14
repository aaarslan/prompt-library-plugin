# Directory submission preparation

This repository provides source, branding, review cases, and a recording script. It does not claim an approved directory listing or OpenAI endorsement.

## Prepared

- Versioned source with MIT license and preserved third-party notices
- Square 512×512 PNG icon and editable SVG
- Five positive and three unsupported-request review cases
- A walkthrough script using fictional examples
- Source tests, mock-host UI tests, local HTTP/D1 smoke tooling, and deterministic packaging
- Intended publisher: Abdallah Arslan, individual; identity verification remains a portal step
- Explicit all-supported-countries targeting (`countries: []`) and free release (`commerce: false`), supplied by the owner
- A separate portable upload builder that omits private App bindings and credentials, verifies its ZIP inventory, and refuses missing materials unless explicitly building a preparation draft
- Existing product, support, privacy and terms URLs on aaarslan.com; recheck anonymous access and current data practices before submission
- Owner-approved adults-only eligibility (18+) in the app notice, policies and listing; the notice does not technically verify age
- Canonical source version 6 was retrieved for workspace reconciliation; the 2.0.0 repository changes have not been deployed

## Still required for submission

1. Configure verified usage budgets, update the public privacy disclosure for usage counters, apply the generated migration, deploy through the existing canonical workflow, and verify source/schema parity. Verify the publisher identity and the supported publication route for the existing Sites-owned canonical App. Do not create a duplicate private plugin merely to wrap an existing Site.
2. Complete the real intended-host demonstration and reviewer access using an adult, dedicated test identity and fictional records. Keep private credentials in secure portal fields.
3. Verify a reviewer-accessible recording URL, then add it to metadata and rebuild and inspect the final ZIP. Recheck all four populated public listing URLs anonymously against the actual deployed behavior.
4. Connect and test the exact deployed application in the intended ChatGPT host and saved submission. Local tests and a successful canonical deployment do not establish actual host rendering, clipboard behavior, or reviewer access.
5. Validate the final package and its imported metadata, resolve scans, and have the owner complete identity verification and legal/policy attestations in the supported portal. The illustration and walkthrough script remain preparation material, not a recorded demo.

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
