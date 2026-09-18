# Jay's Engineering Lab — Verification Matrix

Date: 2026-09-18

## Purpose

This matrix records what is currently verified, what is automated, and what still requires browser or production confirmation.

## Verification status

| Area | Current status | Evidence |
|---|---|---|
| GitHub source on `main` | Verified | Repository source |
| Vite production build | Verified | GitHub Actions CI |
| Node baseline | Verified | `.nvmrc` = 22; CI uses Node 22 |
| Supabase Auth | Verified in production workflow | Email/password sign-in was successfully used |
| Production Auth redirect configuration | Verified | Vercel production Site URL/redirect configuration |
| Postgres RLS enabled | Verified | Production schema review |
| Relationship ownership checks | Verified | Migration 004 + database policy review |
| Private Storage bucket | Verified | Production storage configuration/policies |
| Security advisor | Verified | One remaining Auth warning documented below |
| Performance advisor | Reviewed | Current findings are unused-index INFO notices |
| Error Boundary | Implemented | Top-level React recovery boundary |
| Sidebar scrolling | Implemented | Dedicated scroll container for primary navigation |
| Control visibility | Implemented | Shared dark native-control and action-button styling |
| Data export | Implemented | Settings JSON export |
| Browser end-to-end suite | Not yet implemented | Roadmap item |
| Full production browser smoke test | Not independently verified in this session | Vercel connector scope currently returns 403 |

## Automated build gate

GitHub Actions workflow:

`.github/workflows/ci.yml`

Triggers:

- push to `main`
- pull request to `main`

Current build gate:

`npm install → npm run check → vite build`

A successful run proves that the repository can produce a Vite production build. It does not prove every interactive browser workflow is correct.

## Direct production database verification

A direct PostgreSQL inspection on 2026-09-18 confirmed that every application table in the exposed `public` schema currently has Row Level Security enabled, including curriculum, learning, projects, circuits, components, wellness, files, tags, and relationship tables.

This check verifies the database-level RLS switch state. Policy correctness remains covered by the migration review and Supabase advisor review.

## Supabase advisor state

### Security

Current remaining warning:

`auth_leaked_password_protection`

Supabase reports leaked-password protection as disabled. This is an Auth dashboard feature and is documented as Pro-and-above.

### Performance

Current advisor notices are unused-index INFO findings.

These are expected to appear on a young, low-data project because an index can exist before real query volume exercises it. Index removal should not be based on this notice alone; reassess after meaningful usage.

## Manual smoke-test checklist

For a meaningful release, verify:

### Authentication
- sign up
- confirm email
- sign in
- sign out
- refresh while signed in
- return to production after email confirmation

### Core persistence
- create a subject
- create a unit
- create a lesson
- create a requirement
- mark requirement complete
- refresh
- confirm progress remains correct

### CRUD
- create
- edit
- save
- refresh
- delete
- confirm the record is gone

Repeat on at least one record in Notes, Tests, Circuits, Components, Projects, Mistakes, and Study Sessions.

### Relationships
- link components to a project
- link components to a circuit
- create a knowledge-graph connection
- refresh
- confirm the links remain

### Files
- upload a test file
- confirm it appears
- download it
- delete it
- confirm it disappears

### Backup
- export data
- verify the JSON contains expected structured records
- keep the export outside the application

### Responsive UI
- short desktop viewport
- mobile-width viewport
- scroll sidebar
- open each navigation module
- verify controls remain readable

## Release evidence rule

For major changes, record:

- commit SHA
- CI result
- deployment state
- manual checks performed
- known failures
- follow-up work

This turns debugging history into engineering history.


## Vercel deployment rate-limit event

On 2026-09-18, commit `e0581354eb0237b5c5b808a4b95dd60b1101f9ab` received these checks:

- GitHub Actions `CI / build (push)`: **Successful**
- Vercel: **Deployment rate limited — retry in 24 hours**

The Vercel failure is an external deployment-capacity/rate-limit condition, not a failed application build. No source-code rollback or application change is justified by this check alone.

Until the Vercel rate-limit window clears, production deployment status for newer commits must be treated as **not verified** unless another successful Vercel deployment check is recorded.

Operational response:

`Edit → build/CI → batch related changes → commit → deploy`

Avoid unnecessary deployment-triggering pushes while the project is operating within the Vercel Hobby deployment limits.

## Security verification — 2026-09-18

A direct production PostgreSQL authorization audit confirmed:

- all current application tables in `public` have Row Level Security enabled
- application-table policies target the `authenticated` role
- there are **0** application-table RLS policies for `anon`
- the `anon` role has no SELECT, INSERT, UPDATE, or DELETE table privileges on the application tables
- the private `engineering-lab-files` Storage bucket is not public
- Storage object policies restrict read/insert/update/delete operations to an authenticated user's UUID folder
- relationship and entity-tag access checks verify ownership of referenced entities
- `public.entity_owned_by_user` no longer has PUBLIC/anon execute access; only `authenticated` can execute it
- `public.set_updated_at` and `public.rls_auto_enable` do not have PUBLIC execute access

The Supabase Security Advisor still reports one external Auth warning:

`auth_leaked_password_protection`

This warning is separate from the database authorization model and must be enabled from Supabase Auth settings when the feature is available on the current plan.

These checks substantially reduce the risk of cross-user database access, but they do not protect an account whose credentials or active session are stolen.
