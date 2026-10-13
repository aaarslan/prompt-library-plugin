# Security

Do not put credentials, private prompts, database exports, or account identifiers in public issues or pull requests. Until a private vulnerability-reporting channel is verified for this repository, do not submit sensitive exploit details publicly.

## Deployment boundary

The server trusts `oai-authenticated-user-id` only because the intended Sites deployment authenticates the caller and provides that header. A raw Worker reachable directly from the internet must **not** accept a caller-controlled copy of that header. Do not deploy this source outside the trusted platform boundary without implementing and reviewing equivalent authentication and header stripping.

Every data-bearing operation scopes database access to the authenticated owner. UI state is not an authorization boundary. Built-in templates and the static UI are not private records. A platform service bypass token is not a user identity.

## Data controls

The user-requested export includes custom templates, drafts, field provenance, and saved template snapshots. Treat that file as private. Pagination does not give a transactional snapshot across multiple requests; avoid editing from other cards while exporting.

The explicit Delete all action removes that user's templates and drafts from the active application database. It does not delete conversation history or promise immediate removal from infrastructure backups. The app contains no scheduled expiry job. Deployment operators must establish and document their actual retention, backup, deletion, support, and incident-response practices before a public service launch.

## Development

Tests use synthetic values. Local development and test identity headers must never be mistaken for production authentication. No production credentials or database are included in this repository.
