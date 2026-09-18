# Jay's Engineering Lab — Build History

This document records the major development stages, bugs, failures, fixes, and architectural decisions made while building Jay's Engineering Lab.

## 1. Original vision

Jay's Engineering Lab began as a long-term personal Electrical Engineering operating system rather than a normal notes app.

The central idea is:

> Connect the real engineering world with the digital engineering world.

The system is intended to connect curriculum, engineering notes, tests, mistakes, circuits, component inventory, projects, study sessions, analytics, and wellness into one persistent history.

The visual direction was established as a futuristic electrical-engineering command center with a neo-cyberpunk / technical interface.

## 2. Foundation

The first implementation established:

- React + Vite frontend
- JavaScript / JSX
- Supabase PostgreSQL backend
- Supabase Authentication
- React Router
- Framer Motion
- Recharts
- Lucide icons
- Vercel deployment
- GitHub as the source repository
- Row Level Security for user-owned data

The Supabase schema was created around the relationships:

`Subject → Unit → Lesson → Requirement`

with additional records for notes, tests, questions, mistakes, components, locations, projects, tasks, circuits, study sessions, wellness, tags, files, and relationships.

## 3. Authentication problem

### Problem

Supabase email confirmation initially redirected to localhost after account confirmation. That worked for a local development flow but failed from the deployed application.

### Fix

The production Site URL and redirect configuration were changed to the Vercel production domain while retaining localhost for development.

### Lesson

Production authentication redirects must explicitly match the deployed domain. Local development and production redirect URLs both need to be maintained.

## 4. Codespaces

The project was developed through GitHub Codespaces because the local machine did not have VS Code installed.

The application successfully ran through Vite on port 5173 in Codespaces.

### Lesson

The Codespace is development infrastructure, not the production application. The GitHub repository, Supabase project, and Vercel deployment are the persistent pieces.

## 5. First dashboard

The first dashboard visually contained example values such as:

- Engineering Progress
- Lessons Mastered
- Study Hours
- Projects
- fake telemetry values
- a decorative progress graph

### Problem

The interface looked complete, but the numbers were not connected to real user records.

### Fix

The dashboard was rebuilt to query Supabase and calculate statistics from actual records.

### Permanent rule

No dashboard value should be hardcoded when the value can be derived from stored data.

## 6. Navigation bug

### Problem

Navigation links changed the browser URL, but the page content did not always update because the app was reading `window.location.pathname` directly instead of reacting to router state.

### Fix

The application was changed to use React Router's location state. Dashboard and module routing became reactive.

### Lesson

Application routing must be driven by React Router state rather than reading the browser location once during render.

## 7. Curriculum creation bug

### Problem

Clicking **New Subject** appeared to do nothing.

The form visibility logic depended on form contents, so selecting a new subject did not satisfy the condition needed to render the form.

### Fix

A separate explicit `creating` state was introduced.

### Result

Curriculum creation became:

`Subject → Unit → Lesson → Requirement`

with real Supabase inserts and automatic progress recalculation.

## 8. Projects workspace

Projects initially used a placeholder module.

### Fix

A real project workspace was implemented with:

- project creation
- project status
- goal
- description
- dates
- project tasks
- task completion
- calculated task-based progress
- project deletion
- task deletion

### Lesson

Project progress should come from project tasks instead of a manually entered percentage.

## 9. The hardcoded Core Load problem

### Problem

The sidebar displayed:

`CORE LOAD = 32.8%`

This was a decorative hardcoded number.

### Fix

Core Load became a derived metric:

`Core Load = incomplete curriculum requirements / total curriculum requirements × 100`

Engineering Progress is the complementary metric:

`Engineering Progress = completed curriculum requirements / total curriculum requirements × 100`

### Result

Checking off a curriculum requirement changes the real progress and real Core Load.

## 10. Placeholder-module problem

### Problem

Notes, Tests, Circuits, Components, Mistakes, Analytics, and Wellness were initially routed to a generic placeholder module.

The navigation existed, but the modules were not actual functional workspaces.

### Fix

Dedicated pages were added for:

- Notes
- Tests
- Circuits
- Components
- Mistakes
- Analytics
- Wellness

### Result

These modules now have real database-backed workflows rather than only visual shells.

## 11. Quick Action problem

### Problem

The Quick Action panel initially contained buttons that did not perform real actions.

### Fix

Quick Actions were changed to real navigation links for the supported workspaces.

### Lesson

A UI control should never imply functionality that does not exist.

## 12. Production deployment failures

Several rapid changes were made while deploying the new workspaces.

One deployment succeeded for the earlier version, while later deployments failed during the process of adding Analytics and Wellness.

The production site consequently continued serving the last successful deployment until a corrected build was accepted.

### Important lesson

A GitHub commit does not guarantee that production is already running that commit.

The deployment state must be verified separately.

## 13. Analytics JSX failure

### Problem

The new Analytics component contained malformed JSX around its history section.

A first attempted textual fix did not actually replace the malformed block.

### Fix

The Analytics component was rewritten cleanly with explicit JSX structure.

### Result

The corrected deployment was accepted by Vercel.

### Lesson

For larger JSX structures, replacing a malformed section with clean structured JSX is safer than trying to patch a complex string fragment.

## 14. Current working foundation

The application currently contains real database-backed workspaces for:

- Dashboard
- Curriculum
- Projects
- Notes
- Tests
- Circuits
- Components
- Mistakes
- Analytics
- Wellness

The dashboard and analytics metrics are calculated from Supabase records.

## 15. Development philosophy going forward

The system should follow these rules:

1. No fake statistics.
2. No hardcoded progress percentages.
3. No fake telemetry presented as live data.
4. Every create action must save a real record.
5. Every saved record must survive a page reload.
6. Progress must be calculated from source records.
7. User-owned data must remain protected by authentication and RLS.
8. Production deployment must be verified after important changes.
9. The UI may look futuristic, but the underlying data model must remain rigorous.
10. A feature is not considered finished just because the button exists.

## 16. Milestone

The project has crossed an important threshold:

It is no longer only a visual prototype.

It is now a cloud-backed engineering data system with real CRUD foundations and calculated metrics.

The next phase is about making every module deeper, more connected, editable, testable, and useful for long-term engineering work.
