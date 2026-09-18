# Jay's Engineering Lab — Maintenance & Long-Term Use

Date: 2026-09-18

## Purpose

This document defines the low-maintenance operating procedure for Jay's Engineering Lab after the V0.3 production-readiness pass.

The goal is to make normal personal use stable without requiring constant engineering work.

## Normal use

The Lab is designed to run as a browser application backed by:

- GitHub for source history
- Vercel for production web delivery
- Supabase Auth for sign-in
- Supabase PostgreSQL for structured data
- private Supabase Storage for uploaded engineering files

Normal daily use does not require a local development environment or an active Codespace.

## Backup routine

Use Settings → data export to periodically export structured database records.

Recommended cadence:

- monthly for normal use
- immediately after a major curriculum build, project record, or large inventory update
- before making substantial schema or application changes

The current JSON export covers structured database records. Uploaded Storage files are not embedded in the JSON export.

Keep an independent copy of important exported files outside the Lab.

## Security routine

Keep these Auth protections enabled:

- email authentication
- email confirmation
- secure email change
- secure password change
- current-password requirement for password changes
- strong password requirements

Leaked-password protection should be enabled when the Supabase plan exposes that feature. Supabase currently documents it as a Pro-and-above Auth feature.

Never place a service-role or secret Supabase key in browser code or repository files.

## Deployment routine

Production changes follow:

`GitHub main → Vercel build → production deployment`

A GitHub commit is not, by itself, proof that the production site is running that commit. For important releases, verify the Vercel status attached to the exact commit.

GitHub Actions also runs the repository's Vite production build on pushes and pull requests to `main`.

## Annual review

No yearly feature work is required for ordinary usage, but an annual maintenance review is recommended:

1. Confirm the production site still loads and sign-in still works.
2. Export a fresh backup.
3. Review Supabase Auth security settings.
4. Review Supabase security/performance advisors.
5. Review dependency versions and browser compatibility before upgrading anything.
6. Read the changelog and roadmap before changing database migrations.

Do not perform a large dependency upgrade solely because a newer version exists. Upgrade deliberately, verify the build, verify authentication, and verify the core CRUD workflows.

## Current known limitations

The Lab is production-usable for personal engineering work, but it is not a finished V1.0 engineering operating system.

Known limitations include:

- no full import/restore workflow yet
- database export does not include Storage file contents
- no comprehensive browser end-to-end test suite yet
- rich note editing and attachment workflows can still be expanded
- analytics will become deeper over time
- no circuit simulation engine yet
- Supabase leaked-password protection remains externally dependent on plan availability

These limitations do not prevent the existing core data workflows from being used as intended.

## Long-term reliability rule

Do not judge reliability by how futuristic the UI looks.

The important checks are:

`Create → Save → Refresh → Read → Edit → Refresh`

and:

`Authenticate → Access own data → RLS protects other users`

A feature is considered operational only after its data survives reload and its ownership/security behavior is correct.

## Recovery

If the production UI ever reports a render failure, use the recovery action first and refresh the page.

If data appears missing, do not recreate records immediately. First verify the current signed-in account and inspect the relevant Supabase table/data.

For major failures, stop changing production data until the last known good deployment and backup have been identified.

## Definition of practical readiness

The current V0.3 foundation is suitable for normal personal use when:

- the production commit being tested is successfully deployed
- core workflows survive refresh
- Auth redirects to the production domain correctly
- RLS and private Storage policies remain enabled
- data exports are available
- the remaining Auth advisor warning is understood

This document intentionally does not promise that third-party services or dependency versions will remain unchanged for a full year. It defines the maintenance needed to keep the current system healthy as those external systems evolve.


## Dependency maintenance

Dependency maintenance is now partially automated through GitHub Dependabot.

Dependabot is configured to review npm dependencies and GitHub Actions weekly with a small pull-request limit. CI also runs a high-severity npm audit on the repository quality gate.

Dependency updates should still be reviewed for application compatibility before release.

## Release metadata

Data exports include the current application release version so backups can be traced to the software version that produced them.
