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
- All four published and content-verified product, support, privacy and terms pages on aaarslan.com
- Owner-approved adults-only eligibility (18+) in the app notice, policies and listing; the notice does not technically verify age
- Canonical Site version 4 deployed from the tested source; its audience remains limited to the owner

## Still required for submission

1. Verify the publisher identity and the supported publication route for the existing Sites-owned canonical App. Do not create a duplicate private plugin merely to wrap an existing Site.
2. Complete the real intended-host demonstration and reviewer access using an adult, dedicated test identity and fictional records. Keep private credentials in secure portal fields.
3. Verify a reviewer-accessible recording URL, then add it to metadata and rebuild and inspect the final ZIP. The four public listing pages are already verified and their fields populated.
4. Connect and test the exact deployed application in the intended ChatGPT host and saved submission. Local tests and a successful canonical deployment do not establish actual host rendering, clipboard behavior, or reviewer access.
5. Validate the final package and its imported metadata, resolve scans, and have the owner complete identity verification and legal/policy attestations in the supported portal. The illustration and walkthrough script remain preparation material, not a recorded demo.

Upload, review submission, approval, and publishing are separate states. None is established by a successful source build or a public GitHub repository.

## Build the portable preparation archive

`python3 scripts/package-submission.py --endpoint "$VERIFIED_MCP_ENDPOINT" --draft`

Supply the verified existing endpoint from the private deployment connection; do not commit private Site URLs, tokens, reviewer credentials, or App bindings to this source. The builder includes `plugin.json`, portable OAuth `mcp.json`, the real PNG icon, and the MIT license. Its `submission-readiness.json` reports missing materials separately from online verification. Omit `--draft` to enforce complete metadata. It does not attest that URLs, the demo recording, the live host, publisher verification, or portal scans have passed.

The ordinary `package:source` archive is a public source export and must not be uploaded as a submission package.
