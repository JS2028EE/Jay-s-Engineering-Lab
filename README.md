# Jay's Engineering Lab

> A personal Electrical Engineering operating system for learning, building, measuring, and documenting engineering work.

A futuristic Electrical Engineering command center connecting curriculum, notes, tests, circuits, components, projects, mistakes, analytics, study sessions, and wellness.

## Engineering principle

The Lab treats engineering data as evidence, not decoration. The system separates theoretical calculations, simulations, physical measurements, observations, and derived metrics. PostgreSQL/Supabase is the source of truth; the UI is the control surface.

## Stack

React + Vite · JavaScript · Supabase/PostgreSQL · Framer Motion · Recharts · Lucide

## Local development

1. Install Node.js LTS.
2. Clone this repository.
3. Run npm install.
4. Copy .env.example to .env.
5. Add the Supabase project URL and browser-safe anon/publishable key.
6. Run npm run dev.

Quality commands:

- npm test — deterministic engineering tests
- npm run check — tests plus production Vite build
- npm run audit — high-severity dependency audit

Never commit a Supabase service-role key or other secret. Browser code should only use the public client key intended for frontend use.

## Supabase setup

Run the Supabase migrations in order after creating the project. Then configure authentication and owner RLS policies before putting personal data into production.

## V0.3.1 near-final foundation

The current application is the near-final core personal engineering workspace with authenticated CRUD foundations, derived analytics, study-session tracking, physical lab locations, component relationships, project/circuit links, knowledge connections, private file storage support, data export, wellness measurements/streaks, deterministic engineering tools, a Lab Guide, a UI error boundary, independently scrollable sidebar navigation, and an automated quality gate.

The automated gate covers:

- deterministic engineering calculations
- production Vite build
- high-severity dependency audit

The database is audited for RLS and per-user ownership. Production deployment is a separate release check.

## Documentation

- [Engineering Standards](docs/ENGINEERING_STANDARDS.md)
- [Verification Matrix](docs/VERIFICATION.md)
- [Data Dictionary](docs/DATA_DICTIONARY.md)
- [Maintenance & Recovery](docs/MAINTENANCE.md)
- [Security Policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [Project Summary](PROJECT_SUMMARY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Build History](docs/BUILD_HISTORY.md)
- [Roadmap](docs/ROADMAP.md)
- [User Guide](docs/USER_GUIDE.md)
- [Production Readiness](docs/PRODUCTION_READINESS.md)

## Production

Vercel builds from the GitHub main branch.

A Vercel deployment-rate-limit event occurred on 2026-09-18. GitHub Actions passed the application build for the affected commit, while Vercel rejected deployment because of its deployment limit. The production release gate therefore remains open until a successful deployment is independently verified.

## Security

The frontend is restricted to the browser-safe Supabase publishable/anon key. Application data is protected by authenticated access and Row Level Security. The engineering-lab-files Storage bucket is private and its object policies are scoped to the authenticated user's UUID folder.

The current remaining Supabase Security Advisor warning is leaked-password protection. Enable it from Supabase Auth settings when available on the current plan.

## License

MIT — see LICENSE.
