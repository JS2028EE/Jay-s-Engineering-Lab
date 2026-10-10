# Jay's Engineering Lab — Verification Matrix

Date: 2026-09-18

## Purpose

This matrix records what is currently verified, what is automated, and what still requires browser or production confirmation.

## Verification status

| Area | Current status | Evidence |
|---|---|---|
| GitHub source on main | Verified | Repository source |
| Deterministic engineering unit tests | Added / locally verified | 14 automated tests passed locally on 2026-09-18 |
| Vite production build | Verified on prior release commits | GitHub Actions CI |
| Node baseline | Verified | .nvmrc = 22; CI uses Node 22 |
| Dependency security audit | Added to CI | npm audit high-severity gate |
| Supabase Auth | Verified in production workflow | Email/password sign-in was successfully used |
| Production Auth redirect configuration | Verified | Production redirect configuration |
| Postgres RLS enabled | Verified | Direct production schema review |
| Application-table anon privileges | Verified | Direct production privilege review |
| Relationship ownership checks | Verified | Migration 004 + database policy review |
| Function execute hardening | Verified | Migration 005 + direct privilege review |
| Private Storage bucket | Verified | Production storage configuration/policies |
| Security advisor | Reviewed | One remaining Auth warning documented below |
| Performance advisor | Reviewed | Current findings are unused-index INFO notices |
| Error Boundary | Implemented | Top-level React recovery boundary |
| Sidebar scrolling | Implemented | Dedicated scroll container for primary navigation |
| Control visibility | Implemented | Shared dark native-control and action-button styling |
| Study Session stop/update | Verified | Production trigger/schema fix applied and tested |
| Data export | Implemented | Settings JSON export |
| Browser end-to-end suite | Not yet implemented | Future maturity item |
| Full production browser smoke test | Not independently verified in this session | Vercel deployment is currently rate-limited |

## Automated quality gate

GitHub Actions workflow:

.github/workflows/ci.yml

The quality job runs:

1. npm install
2. npm run check
3. npm run audit

The check command runs:

1. Node deterministic tests
2. Vite production build

A successful automated test/build run proves that the deterministic test suite passes and the application compiles. It does not prove every interactive browser workflow is correct.

## Deterministic engineering tests

The current suite covers:

- Ohm's Law resistance/current/voltage relationships
- zero and divide-by-zero handling
- power-based calculations
- 4-band resistor decoding
- resistor tolerance
- invalid leading resistor digit
- same-dimension unit conversion
- rejection of cross-dimensional conversion
- grouped unit metadata
- engineering-number formatting

Latest engineering-tool CI verification: 16 tests passed on the expanded-tool feature line.

Study Session stop behavior was additionally verified directly against the production database after the timestamp schema fix.

## Direct production database verification

A direct PostgreSQL inspection on 2026-09-18 confirmed that every application table in the exposed public schema currently has Row Level Security enabled.

The same audit confirmed:

- 0 application-table RLS policies target anon
- anon has no SELECT, INSERT, UPDATE, or DELETE privileges on the application tables
- ownership policies use authenticated identity and auth.uid()
- child records verify parent ownership
- relationship and entity-tag records verify referenced entity ownership
- internal helper/trigger functions do not retain PUBLIC execute access

## Supabase advisor state

### Security

Current remaining warning:

auth_leaked_password_protection

Supabase reports leaked-password protection as disabled. This is an Auth dashboard setting rather than a database RLS failure.

### Performance

Current advisor notices are unused-index INFO findings.

These are expected on a young, low-data project. Index removal should not be based on this notice alone; reassess after meaningful usage.

## Deployment state

On 2026-09-18, Vercel reported:

Deployment rate limited — retry in 24 hours

The affected GitHub commit had a successful GitHub Actions build but did not receive a successful Vercel deployment.

Until a successful deployment check is recorded, production deployment status for newer commits is not considered verified.

## Manual smoke-test checklist

For the final core release, verify:

### Authentication
- sign up
- confirm email
- sign in
- sign out
- refresh while signed in
- production email-confirmation return

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

Repeat on at least one record in Notes, Tests, Circuits, Components, Projects, and Mistakes.

### Study Sessions
- start a session
- confirm the live timer advances
- stop the session
- confirm `ended_at` and `duration_minutes` are saved
- refresh
- confirm the completed session remains in history

### Relationships
- link components to a project
- link components to a circuit
- create a knowledge-graph connection
- refresh
- confirm links remain

### Files
- upload a test file
- confirm it appears
- download it
- delete it
- confirm it disappears

### Backup
- export data
- verify expected structured records are present
- retain the export outside the application

### Responsive/accessibility
- short desktop viewport
- mobile-width viewport
- scroll the sidebar
- open every navigation module
- verify keyboard focus and readable controls
- verify error messages and empty states

## Release evidence rule

For major changes, record:

- commit SHA
- CI result
- deployment state
- manual checks performed
- known failures
- follow-up work

This turns debugging history into engineering history.
