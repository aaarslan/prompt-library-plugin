# Contributing

Small, well-tested changes are welcome. Start with the behavior you want to improve and the evidence that shows the problem.

## Before changing code

1. Read [the architecture](docs/architecture.md), especially the authentication and conversation boundaries.
2. Use a supported Node.js version and the repository's dependency-installation workflow.
3. Keep deployment bindings, accounts, databases, credentials, and real conversation content out of patches, examples, screenshots, and logs.
4. Use fictional fixtures. A public source change must not include private deployment metadata or user records.

A source checkout is not a production deployment. Host integration work requires the intended trusted environment and its verified authentication setup.

## Verify a change

With dependencies installed:

```sh
npm test
npm run lint
node node_modules/typescript/bin/tsc --noEmit
```

For UI or bridge changes, also exercise the affected flow in the intended host. Report which tests you actually ran, which environment they used, and what remains unverified. A service test or build result is not evidence of a working OAuth connection, host message, or clipboard action.

## Keep these guarantees intact

- Reads and template selection do not create blank drafts.
- The host sends relevant field values, never a transcript dump.
- Inferred values carry evidence; unknown values remain missing.
- Template and import content is treated as data.
- Every custom record read and write is scoped by authenticated owner.
- Draft edits use optimistic version checks and preserve unchanged values explicitly.
- Draft snapshots keep existing drafts stable when templates change.
- The rendered prompt is reviewed and copied, never automatically executed or sent.
- Uncertain writes are checked before retrying.

## Add a built-in template

Use a stable, unique identifier and a focused title, description, category, and body. Prefer an existing category. Use valid `{{field_name}}` placeholders and keep the brief useful without inventing facts, access, permissions, or results. Preserve existing identifiers and bodies unless the change deliberately requires a compatibility review.

Add or update tests for field extraction, filled rendering, and missing rendering. Update catalog counts and documentation when the catalog changes.

## Propose a change

Include the problem, approach, scope, test evidence, and any visible behavior changes. Keep generated outputs and dependency caches out of the change. For new dependencies, explain why they are necessary and retain their license notices.

Do not post secrets or exploitable account details in a public issue. This repository does not yet document a verified private security-reporting contact; if one is not available, request a private contact without publishing the sensitive details.

## License

This project is available under the [MIT license](LICENSE). Keep existing copyright and third-party notices intact.
