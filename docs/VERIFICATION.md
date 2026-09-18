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
