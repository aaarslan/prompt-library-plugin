# Changelog

## 1.2.1 — Public submission preparation

- Add `server/discover` and MCP 2026-07-28 negotiation while retaining the three supported legacy protocol versions.
- Verify the current protocol through the local HTTP/D1 smoke test, alongside anonymous rejection, owner isolation, export, and confirmed deletion of fictional records.
- Prepare portable submission metadata using the existing canonical MCP endpoint. Public listing, publisher declarations, reviewer access, recording, and approval remain separate verification steps.

## 1.2.0 — Source release preparation

### Added

- `export_library` for paginated export of the authenticated user’s custom templates or drafts, including draft snapshots and excluding owner identifiers.
- `delete_library_data` for atomic deletion of that user’s templates and drafts from the active application database after exact typed confirmation.
- A **Your data** dialog for export and deletion controls, subject to release UI and host verification.

### Scope and verification

- The MCP contract now has nine tools, with UI resource `ui://prompt-library/library-v3.html`; the v1 and v2 resource URIs remain compatibility aliases.
- Deletion does not erase ChatGPT conversation history or provider backups.
- These additions belong to the source-release preparation. Their deployment, end-to-end host verification, public submission, and directory approval are separate steps and are not claimed here.
- All 17 local v1.2.0 service/catalog tests passed on 2026-10-13, including paginated owner-scoped export and explicitly confirmed deletion using fictional in-memory fixtures. This is separate from deployment or host evidence.
- Rendered output is limited to 100,000 UTF-8 bytes to prevent repeated-placeholder amplification; stored exports remain available independently of rendering.
- Export returns one complete stored record per page. Pages are not a transactional snapshot; avoid other-card edits during export.

## 1.1.0

### Added

- 32 built-in templates, bringing the catalog to 35 templates across eight categories.
- Search, category and library-scope filters, a paginated card grid, and recent-draft navigation.
- Explicit **Fill missing fields** and **Revise with latest context** modes for host-model assistance.
- A refreshed review workspace with field-source summaries, missing-detail indicators, and saved-version status.
- A latest-saved-draft check before copying, with review required when the saved content changes.

### Preserved

- Seven MCP tools and deterministic, copy-only rendering.
- Platform-authenticated owner scoping, template snapshots, and version-checked draft updates.
- The three original built-in template identifiers and bodies.
- Existing custom templates and drafts; expanded built-ins require no data migration.

### Compatibility

- The UI resource is `ui://prompt-library/library-v2.html`; the v1 resource URI remains a compatibility alias.
- Host capabilities determine whether deliberate fill requests and clipboard actions run directly or use the visible manual fallback.

### Verification note

The 13 local service/catalog regression tests passed during documentation preparation on 2026-10-13. Submission-host review cases remain **Not run** in this evidence set. This version entry does not claim a public listing, approval, or publication date.
