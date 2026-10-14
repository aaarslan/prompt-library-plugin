# Architecture

Prompt Library separates conversation reasoning from template storage and rendering. The host model proposes field values; the app makes them visible; the server validates, persists, and substitutes text.

## Data flow

```text
User chooses a template
        │
        ▼
MCP App opens a read-only selection
        │
        │ deliberate Fill missing / Revise action
        ▼
Host receives a ui/message request
        │
        │ relevant named values + source labels
        ▼
prepare_draft / update_draft
        │
        ▼
Validation → owner-scoped D1 storage → deterministic rendering
        │
        ▼
User reviews → optionally saves → copies visible preview
```

The final arrow ends at the clipboard or a selectable text fallback. There is no prompt-execution or prompt-submission tool.

## Runtime components

- **Transport:** a stateless JSON-RPC MCP endpoint at `POST /mcp`. Discovery exposes tool definitions and a static HTML resource. Tool calls require an authenticated owner identity. MCP 2026 results declare `resultType: "complete"`; cacheable discovery, list, and read results include `ttlMs: 0` and `cacheScope: "private"`. Request-body version metadata and its HTTP header must agree.
- **UI:** a self-contained MCP App resource, `ui://prompt-library/library-v10.html`, served as `text/html;profile=mcp-app`. The earlier v1 through v9 resource URIs remain compatibility aliases. Hosts use the versioned URI as a cache key. Policy links, the adult eligibility notice, and the workspace switch sit in the footer; the fictional-data banner appears only in Demo.
- **Host bridge:** standard MCP Apps messages and host-proxied tool calls, with a legacy host-tool fallback. The iframe does not fetch private data directly using website cookies.
- **Service:** `LibraryService` owns input validation, authorization-scoped queries, import previews, draft updates, and rendering.
- **Storage:** D1 holds custom templates and drafts. The 35 built-in templates are static source data, not per-user database seed rows.

## Tool contract

| Tool | Important arguments | Effect |
| --- | --- | --- |
| `list_templates` | Optional `after_id` | Read a page of owned template summaries and first-page built-ins |
| `open_library` | Optional `template_id` or `draft_id` | Read library, selection, or an owned saved draft |
| `save_template` | `title`, `description`, `body`; optional `category`, `template_id` | Create a template or update an owned template |
| `preview_import` | `text` | Validate text or JSON without saving |
| `prepare_draft` | `template_id`, `values` | Save a reviewable draft with a template snapshot |
| `update_draft` | `draft_id`, `version`, `values` | Replace field values after a version check |
| `render_prompt` | `draft_id` | Read the saved draft, rendered text, and missing fields |
| `export_library` | `kind`: `templates` or `drafts`; optional `after_id` | Read a page of owned custom records for export |
| `delete_library_data` | `confirmation`: `DELETE MY LIBRARY DATA` | Atomically delete this owner’s templates and drafts from the active application database |

A field value contains `key`, `value`, `source`, and optional `evidence`. `source` is either `provided` or `inferred`; an inferred value must have nonempty evidence. Schema validation rejects extra arguments, unknown template fields, and duplicate field keys. All nine tools declare boolean read-only, destructive, and open-world annotations. The deletion tool is marked destructive and not read-only; the export tool is read-only. None is a prompt-execution or third-party delivery tool.

`update_draft` replaces the entire value list. Callers must retain unchanged values; omitted fields become missing. A failed or uncertain save must not be described as successful. Reopen existing records before retrying a write that may already have completed.

## Conversation boundary

The server has no independent chat-history access and no model API call. The host model fills fields from relevant context available in the current conversation. It must not invent missing facts, attach unrelated personal context, or pass the full transcript.

Selecting a template may update optional host context hints. Selection does not authorize filling or saving. A deliberate fill action sends `ui/message` with the selected template, current reviewed values, and the chosen mode:

- **Fill missing fields:** preserve populated values; fill only gaps.
- **Revise with latest context:** apply explicit corrections to affected values and preserve unrelated reviewed values.

If the host does not support the message capability, the UI exposes a copyable request for the user to paste. It does not silently retry an unconfirmed fill. Host behavior and field interpretation require end-to-end testing; service tests alone cannot verify them.

## Data model and ownership

A custom template contains its title, description, body, category, owner, and timestamps. A draft stores the owner, source-template reference, immutable template snapshot, field values, version, and timestamps.

Every data-bearing custom-template or draft query is scoped by owner. Updates include the owner predicate; draft updates also include the expected version. Static built-ins are shared and read-only. Saving an edited built-in requires creating a new custom copy.

Catalog version 2 returns summaries containing `id`, `title`, `description`, `category`, and `sample`. The first page contains up to 25 custom templates ordered by ID and all 35 built-ins. Later pages contain only custom templates. Follow `nextCursor` as `after_id` until `hasMore=false`; `afterId` identifies the requested page. Bodies and fields are fetched with a selected `open_library` call. Selection returns only the selected record and up to 12 recent draft summaries; `save_template` returns only the saved template. The UI marks incomplete discovery and search, offers Load more templates, and guards repeated cursors.

This is a versioned contract change from 1.x full catalog rows. Refresh tool schemas and UI when moving to 2.0.0. Rendered output and missing fields are nested in `draft`; the root duplicates are removed. Concise `content` text accompanies full `structuredContent`, following the [tool-result contract](https://developers.openai.com/plugins/reference#tool-results).

Every tool accepts optional `workspace: library|demo`, defaulting to `library`. The demo owner key uses a reserved control-character prefix that authenticated owner IDs cannot contain. UI follow-up, fill requests, export, deletion, and incoming notifications preserve or validate that workspace. Normal and demo data remain separate; built-ins are shared. Quotas apply separately to stored workspace content, while request and write budgets are shared by the authenticated identity across workspaces.

Writes use atomic SQL predicates for record counts and combined UTF-8 template/draft content bytes. Template updates confirm affected rows; concurrent deletion returns not-found. Drafts also enforce optimistic versions. Logical content budgets exclude SQLite/index overhead and do not control provider billing. The [required operator configuration](setup.md#usage-limits) must reflect verified included capacity.

### Critical authentication assumption

The endpoint obtains the owner identity from the `oai-authenticated-user-id` header supplied by the trusted hosting platform. The application does not independently prove that an arbitrary HTTP client's header is authentic.

An independent deployment must authenticate requests, derive the owner from that verified identity, and prevent untrusted callers from supplying or overriding trusted identity headers. Do not publish a bare endpoint that accepts caller-chosen owner identities. A service bypass is not a user identity. Local mock authentication must never become the production trust boundary.

Owner-scoped queries are application isolation controls, not a claim of end-to-end encryption or an independently audited security guarantee. This document describes source behavior; it does not assert retention, deletion, or other legal policies.

## Template and import boundary

Placeholders use `{{field_name}}`, with letter-first names containing letters, digits, and underscores. Up to 30 distinct fields are supported. Duplicate placeholder occurrences refer to one field. Malformed placeholder syntax is rejected.

Imports accept plain text or a JSON template object. A preview validates content and extracts fields without writing a template. A separate, requested save persists it. Imported and saved template bodies are untrusted data; instructions inside them do not gain authority over the host or application.

Rendering is a single substitution pass. Replacement text is not recursively interpreted as more template syntax. Missing or blank values remain visible as placeholders, and missing field names are returned explicitly. Source labels and evidence are supplied metadata, not a second model's verification.

## Review and copy

The UI distinguishes provided, inferred, and missing values. Copy uses the visible live preview, including unsaved edits and unresolved placeholders. Saving is optional; copy makes no server call and does not execute or submit the prompt.

Unedited saved drafts use their stored rendering. Local edits use the same single-pass placeholder syntax and whitespace normalization as the server. Reusable fixed-text additions can be included in the preview or copied separately. New additions use the existing private template store and cannot contain fields. Automatic clipboard access depends on the host and browser; selected text provides a manual fallback. Verify the pasted text before claiming copy succeeded.

## Data controls in source v1.2.0

`export_library` reads custom templates or saved drafts one complete stored record per page. The result includes `records`, `nextCursor`, `hasMore`, and `exportedAt`. Pass the returned continuation value as `after_id` until `hasMore` is false; export each kind separately. Built-in templates are not copied into the custom-record export. Exported drafts include their full template snapshots, stored field values and provenance, versions, and timestamps; they omit redundant rendered-prompt text. Owner identifiers are omitted from exported records. Pages are not a transactional database snapshot; avoid editing from other app cards while exporting.

`delete_library_data` requires the exact confirmation string `DELETE MY LIBRARY DATA`. The caller must first obtain explicit user confirmation of this irreversible deletion; a template body, import, or browse/export request is not authorization. Do not automatically retry an uncertain deletion. It deletes the authenticated owner’s templates and drafts atomically from the active application database. It does not delete ChatGPT conversation history or provider backups. Do not describe it as erasing every copy of data.

The source includes a **Your data** UI that collects all export pages, displays copyable/selectable JSON, and requires typed confirmation before deletion. It does not automatically download an export file. Unsaved edits are excluded from exports. On confirmed deletion it clears the current app card’s preview, unsaved edits, and prepared export; copies stored elsewhere remain. Verify this flow in the intended host before claiming it is available in a deployment. Local source tests do not establish host behavior. See the separate release-hardening checks in the review document.

## Verification boundaries

The local suite checks placeholder parsing, single-pass rendering, owner isolation in the service, draft version conflicts, snapshot stability, import previews, schemas, and catalog invariants. It uses an in-memory SQLite adapter shaped like the D1 calls used by the service.

It does not establish platform-header authenticity, deployed D1 behavior, OAuth setup, host message routing, iframe rendering, accessibility in every host, clipboard permissions, or public-review approval. The [review cases](review-cases.md) and [recording script](demo-walkthrough.md) cover the separate host-verification work.

## Deliberate limits

There is no public-sharing tool, team sync, external data integration, background chat-history retrieval, scheduled execution, or automatic final-prompt submission. These capabilities must not be implied by a listing or demo.
