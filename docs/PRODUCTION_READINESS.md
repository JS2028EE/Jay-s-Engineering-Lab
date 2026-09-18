# Production Readiness Audit

Date: 2026-09-18

## Audit scope
GitHub source, Supabase schema/security/performance advisors, deployment configuration, application architecture, and documented feature lifecycle.

## Remediated
- Fixed independently scrollable sidebar navigation so all modules remain reachable on short desktop/mobile viewports.
- Revoked public/anonymous/authenticated EXECUTE access to the public SECURITY DEFINER function `rls_auto_enable()`.
- Hardened the `set_updated_at()` function search path.
- Added indexes for foreign-key columns identified by the Supabase performance advisor.
- Confirmed application tables in the exposed public schema have RLS enabled.
- Confirmed frontend uses a browser-safe Supabase key rather than a service-role key.
- Confirmed Files uses a private Storage bucket with per-user UUID folder policies.
- Added an MIT license.
- Added a production-hardening migration to source control.

## Remaining external configuration
Supabase's security advisor reports leaked-password protection is disabled. Enable leaked-password protection in Supabase Auth password-security settings. This is dashboard configuration, not a SQL migration.

## Remaining product work
- Automated frontend smoke tests and browser verification.
- Editable test questions and score recalculation.
- One-click mistake creation from missed questions.
- Rich Notes and attachment workflows.
- Inventory stock-movement history and low-stock alerts.
- Project activity history.
- Stronger database-level ownership validation for generic relationships.
- Import/restore and Storage manifest backup.
- Engineering calculators and practice tools.
- Production browser smoke testing on every major release.

## Current practical status

The V0.3 application foundation is suitable for normal personal use. The current release still has a small number of maturity gaps documented in `docs/MAINTENANCE.md`; these are expansion/testing items rather than reasons to stop using the existing core CRUD system.

The remaining Supabase security advisor warning is Auth leaked-password protection. Supabase documents this as a Pro-and-above dashboard feature.

## Release gate

The Lab is considered operational for personal use when the current production commit is deployed successfully, core workflows survive refresh, RLS/Storage isolation is verified, Auth settings are reviewed, and backups can be exported.

Long-term stability is not a guarantee that Vercel, Supabase, browsers, or dependency releases will remain unchanged. The maintenance guide defines the recommended annual review.
