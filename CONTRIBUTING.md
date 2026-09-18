# Contributing to Jay's Engineering Lab

Jay's Engineering Lab is primarily a personal engineering system, but its repository follows normal software-engineering discipline.

## Before changing code

Read:

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/ENGINEERING_STANDARDS.md`
- `docs/MAINTENANCE.md`
- `SECURITY.md`

For database changes, also inspect the migration history in `supabase/migrations/`.

## Development

Use Node 22 as the project baseline.

Typical workflow:

`npm install`

`npm run dev`

For the production build:

`npm run check`

## Change rules

Prefer small, understandable changes.

Keep:

- source-of-truth data in Supabase/PostgreSQL
- ownership enforcement in RLS/database policies
- browser credentials limited to publishable Supabase credentials
- engineering calculations explicit and unit-aware
- documentation synchronized with implementation

Do not add fake data merely to make a screen look complete.

## Database migrations

Schema changes must be represented by a migration under:

`supabase/migrations/`

Never edit an old migration to change already-deployed history.

Use a new descriptive migration for new schema changes.

After database changes:

1. verify the migration
2. run Supabase advisors
3. inspect affected RLS policies
4. confirm frontend behavior
5. update the architecture/build documentation

## UI features

A UI control is considered complete only when it has a real action behind it.

Examples:

- Create must persist.
- Edit must update.
- Delete must delete.
- A progress display must derive from source data.
- A dropdown must have visible readable values.
- A loading state must not pretend data exists.

## Commit discipline

Prefer descriptive commit messages:

- `feat: add ...`
- `fix: ...`
- `security: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`

## Verification

Before calling a change complete:

`Build → Inspect → Verify → Document`

For changes touching authentication, RLS, Storage, or migrations, perform the applicable security review.

## Documentation rule

Historical documentation should remain historical. Do not rewrite old failures as though they never happened.

Update current-status documents when the implementation changes.

## Engineering record rule

When documenting an engineering result, distinguish:

- theoretical
- simulated
- measured
- observed
- derived

Do not invent measured values.
