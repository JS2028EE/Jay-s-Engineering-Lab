# Contributing to Jay's Engineering Lab

Jay's Engineering Lab is a personal engineering system, but it is maintained using disciplined software and engineering practices.

## Before changing code

Read:

- README.md
- docs/ARCHITECTURE.md
- docs/ENGINEERING_STANDARDS.md
- docs/DATA_DICTIONARY.md
- docs/VERIFICATION.md
- docs/MAINTENANCE.md

Understand whether the change is application logic, data model, security policy, documentation, or infrastructure.

## Development baseline

- Node 22
- React + Vite
- Supabase/PostgreSQL
- JavaScript / JSX
- 2-space indentation
- UTF-8
- LF line endings

## Quality gate

Before treating a change as complete:

1. npm test
2. npm run check
3. npm run audit
4. inspect changed files
5. verify behavior where browser access is available
6. document security/data/deployment impact

The GitHub Actions workflow runs the same automated test/build/audit gate on pushes to main and pull requests.

## Database changes

Database changes must:

- preserve user ownership rules
- keep RLS enabled on exposed application tables
- use authenticated ownership checks
- include WITH CHECK for update/insert authorization where appropriate
- protect child records through parent ownership
- avoid unnecessary SECURITY DEFINER functions
- remove PUBLIC execute access from internal helper functions
- add indexes for important ownership/foreign-key paths
- be recorded as append-only Supabase migrations

After database changes:

- review Supabase security advisors
- verify RLS and policy behavior
- update the data dictionary
- update verification documentation
- record the production evidence

## UI feature completeness

Do not mark a feature complete because a button or page exists.

A meaningful feature needs:

Create → Read → Edit/Delete → Refresh persistence → Error handling → Permission enforcement

Where applicable, it should also relate to the rest of the Engineering Lab and feed derived metrics.

## Engineering evidence

Engineering calculations should be recorded as:

Equation → Substitution → Units → Result

Distinguish theoretical, simulated, measured, observed, and derived values.

Never present simulated or calculated telemetry as a physical measurement.

## Change discipline

Prefer small, coherent changes.

Batch related changes before pushing when possible so CI and deployment history remains understandable and Vercel deployment limits are not consumed by unnecessary pushes.

Commit messages should describe the change clearly, for example:

- feat: add component stock history
- fix: prevent duplicate project links
- security: harden ownership policy
- test: cover resistor decoder edge cases
- docs: record production verification

## Pull requests

The pull-request template requires:

- change summary
- verification evidence
- data/security impact
- engineering evidence
- notes about known limitations

## Reporting problems

Use the GitHub issue templates for:

- bug reports
- feature requests

Do not publish credentials, tokens, passwords, or private personal data in an issue.
