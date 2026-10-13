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
- Existing public product and support pages identifying Prompt Library and its publisher

## Still required for submission

1. Verify the publisher identity and the supported publication route for the existing Sites-owned canonical App. Do not create a duplicate private plugin merely to wrap an existing Site.
2. Review and publish the prepared privacy and terms pages on the publisher's existing website. The owner selected saved-record retention until deletion and the existing public support address. No additional advertising, analytics, or data-sale integrations are part of this release.
3. Verify all four listing pages' content and public access. Add the privacy and terms URL fields only after those pages are actually published and verified.
4. Deploy this source through the canonical Site's existing authorized integration and confirm the exact deployed version provides the documented controls. Follow the supported Sites source workflow and keep any short-lived, repository-scoped credentials in session memory only.
5. Record and verify a real demonstration of the exact submitted version in its intended host. The illustration and walkthrough script are not a recorded demo.
6. Provide a dedicated reviewer-accessible test environment and account through secure portal fields, without production data or credentials in the repository.
7. Validate the final package and its metadata, then connect and test the saved submission in the supported portal. The authorized publisher must resolve scans and attestations.

Upload, review submission, approval, and publishing are separate states. None is established by a successful source build or a public GitHub repository.

## Build the portable preparation archive

`python3 scripts/package-submission.py --endpoint "$VERIFIED_MCP_ENDPOINT" --draft`

Supply the verified existing endpoint from the private deployment connection; do not commit private Site URLs, tokens, reviewer credentials, or App bindings to this source. The builder includes `plugin.json`, portable OAuth `mcp.json`, the real PNG icon, and the MIT license. Its `submission-readiness.json` reports missing materials separately from online verification. Omit `--draft` to enforce complete metadata. It does not attest that URLs, the demo recording, the live host, publisher verification, or portal scans have passed.

The ordinary `package:source` archive is a public source export and must not be uploaded as a submission package.
