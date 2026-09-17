# Jay's Engineering Lab

A futuristic Electrical Engineering command center connecting curriculum, notes, tests, circuits, components, projects, mistakes, analytics, study sessions, and wellness.

## Stack

React + Vite · JavaScript · Supabase/PostgreSQL · Framer Motion · Recharts · Lucide

## Local development

1. Install Node.js LTS.
2. Clone this repository.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add the Supabase project URL and browser-safe anon/publishable key.
6. Run `npm run dev`.

Never commit a Supabase service-role key or other secret. Browser code should only use the public client key intended for frontend use.

## Supabase setup

Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor after creating the project. Then configure authentication and owner RLS policies before putting personal data into production.

## V0.1 architecture

`Subject → Unit → Lesson → Requirement` drives automatic curriculum progress. Dashboard statistics should be derived from database records rather than duplicated manually.

The current UI is a functional frontend shell for every planned module. Cloud CRUD, authentication, storage uploads, and advanced analytics are the next integration layer.
