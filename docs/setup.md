# Set up the source

## Requirements

- Node.js 22.13 or newer; Node 24 was used for the release checks
- npm and internet access to the official npm registry for dependencies
- Python 3 only if producing the deterministic source ZIP

```sh
npm ci --ignore-scripts
npm run check
npm run build
```

`check` runs TypeScript, service/catalog tests, and the JSDOM mock-host UI suites. Those tests use fictional data. They do not establish real host rendering or clipboard access. No browser, CI configuration, paid API, or production credentials are required for these checks.

## Local HTTP and D1 smoke

After building, initialize the local SQLite-backed D1 binding once:

```sh
npm run db:init:local
npm run test:http
```

`db:init:local` explicitly uses Wrangler's `--local` flag and accepts no arguments. It does not connect to a production database. The schema migration creates tables, so do not re-run it against an already initialized local test database. `test:http` creates and removes its own fresh local D1 state, starts and stops a local Worker, uses synthetic owner headers, and checks MCP discovery, UI resources, authentication failures, storage, and owner isolation.

## Usage limits

Before enabling this source, set the runtime variable `PROMPT_LIBRARY_LIMITS` to a JSON object with all six positive integer fields. There are no production defaults. Missing or invalid configuration rejects library tools; discovery and static UI resources remain available.

| Field | Budget |
|---|---|
| `templatesPerWorkspace` | Custom template records per authenticated workspace |
| `draftsPerWorkspace` | Saved draft records per authenticated workspace |
| `bytesPerWorkspace` | Combined UTF-8 bytes of template title/description/body/category and saved draft snapshot/field JSON |
| `requestsPerMinute` | Authenticated tool attempts per user across both workspaces |
| `writesPerMinute` | Mutating tool attempts per user across both workspaces |
| `globalRequestsPerMinute` | Authenticated tool attempts across the deployment |

Choose values after verifying the existing deployment's included allowance and provider-enforced nonbilling limits. Application counters cannot guarantee zero charges or limit anonymous HTTP traffic. No plan upgrade or paid service is needed by this implementation. Rate limits use fixed minute buckets; requests rejected at one counter may still consume the other counter. Content writes are never retried automatically. Counters store opaque owner identifiers and counts, not prompt text; old buckets become eligible for bounded cleanup after two minutes and remain until subsequent requests remove them.

The owner-authorized October 14 launch profile uses 100 templates, 200 drafts, and 2 MiB of logical content per workspace; 30 authenticated tool attempts and 10 mutating attempts per user per minute; and 60 tool attempts globally per minute. The two workspaces together permit up to 4 MiB of logical content per account, excluding database and index overhead. Set the runtime value through Sites, without adding credentials or production bindings to this repository:

```json
{"templatesPerWorkspace":100,"draftsPerWorkspace":200,"bytesPerWorkspace":2097152,"requestsPerMinute":30,"writesPerMinute":10,"globalRequestsPerMinute":60}
```

These are application operating caps, not published provider request allowances. The [Sites developer guide](https://learn.chatgpt.com/docs/sites) specifies 10 GB of D1 storage per Site. [OpenAI's beta policy](https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites) includes usage up to changeable account-wide plan limits; numeric request allowances were unavailable in the inspected account UI. Estimated incremental hosting is $0 within that included allowance. Existing subscription and domain costs are separate. This implementation has no model API, R2 storage, paid add-on, or automatic upgrade path; provider limits can restrict availability earlier than application caps.

Local `test:http` supplies explicit fictional test budgets. For manual local development use ignored Wrangler `.dev.vars` configuration. Hosted configuration must use the existing deployment's supported runtime-variable workflow. Apply generated migrations through that same authorized workflow before activating this source. `0001` creates the usage table and both export indexes; it does not rewrite stored owner keys or prompt content. Remote migration and deployment are separate operations.

## Development

```sh
npm run dev
```

The local website is a connection guide, not a replacement for the embedded MCP App. The full app is served as a `ui://` MCP resource and needs a compatible host bridge. Use the mock-host tests to exercise UI behavior without a ChatGPT connection.

## Hosted deployments

The public `.openai/hosting.json` intentionally has no project binding. Use an authorized Sites workflow to provision your own deployment, configure its D1 binding, and apply migrations. The original private service and its credentials are not part of this repository.

Do not point an unrelated raw server at this code and trust the incoming `oai-authenticated-user-id` header. The intended platform authenticates users and supplies that identity. Any alternate host must provide an equivalent reviewed authentication boundary that strips untrusted identity headers. See [Security](../SECURITY.md).

## Source release archive

```sh
npm run audit:public
npm run package:source
```

The source ZIP, file manifest, and checksum are written under ignored `releases/`. Paths and contents are sorted, ZIP timestamps are fixed, and permissions are normalized. The archive excludes dependencies, Git history, runtime state, database files, builds, logs, and local environment files.

This ZIP is a public **source archive**. It is not a submission-ready plugin upload and does not install or publish a ChatGPT app. See [submission preparation](submission-readiness.md).
