# Jay's Engineering Lab — Data Dictionary

Date: 2026-09-18

## Purpose

This is the human-readable map of the PostgreSQL model. The authoritative schema remains the SQL migration history in `supabase/migrations/`.

## Ownership model

Direct user-owned records contain a `user_id` tied to the authenticated Supabase user.

Child records inherit ownership through parent rows.

Examples:

`Subject → Unit → Lesson → Requirement`

`Project → Project Task`

`Test → Test Question`

`Wellness Category → Habit → Goal / Check-in`

Many-to-many records use link tables with ownership checks.

## Curriculum

| Table | Purpose | Parent |
|---|---|---|
| `subjects` | Top-level engineering subject/course | user |
| `units` | Subject sections | subject |
| `lessons` | Learning units inside a section | unit |
| `lesson_requirements` | Explicit mastery requirements | lesson |
| `topics` | Reusable topic labels | user / optional subject |

Progress views:

- `lesson_progress`
- `unit_progress`
- `subject_progress`

## Learning records

| Table | Purpose | Parent |
|---|---|---|
| `notes` | Engineering notebook entries | user |
| `tests` | Assessment records | user |
| `test_questions` | Question-level evidence | test |
| `mistakes` | Structured learning errors | user |
| `study_sessions` | Recorded engineering study time | user |

Important data principles:

- test scores are bounded by database checks
- question numbers are unique per test
- study-session end time cannot precede its start time
- mistake severity is constrained to known values

## Physical engineering lab

| Table | Purpose | Parent |
|---|---|---|
| `components` | Inventory records | user |
| `component_locations` | Physical storage locations | user |
| `project_components` | Components used by projects | project + component |
| `circuit_components` | Components used by circuits | circuit + component |

The component model supports both digital inventory and physical location tracking.

## Projects

| Table | Purpose | Parent |
|---|---|---|
| `projects` | Engineering build records | user |
| `project_tasks` | Measurable project work | project |

Project progress is derived from completed tasks rather than manually stored as a percentage.

## Circuits

| Table | Purpose | Parent |
|---|---|---|
| `circuits` | Solved/experimental circuit records | user |
| `circuit_components` | Circuit bill-of-material links | circuit + component |

Circuit records can distinguish:

- expected result
- measured result
- simulation result
- final answer
- explanation

That separation is important for engineering evidence integrity.

## Wellness

| Table | Purpose | Parent |
|---|---|---|
| `wellness_categories` | Habit groups | user |
| `wellness_habits` | Repeatable habits | category |
| `habit_goals` | Goal windows/targets | habit |
| `wellness_checkins` | Daily completion/measurement history | habit |

Wellness is deliberately separate from engineering scoring.

## Files

| Table | Purpose |
|---|---|
| `files` | Metadata for private Storage objects |

Binary files live in the private Supabase Storage bucket. PostgreSQL stores metadata and the storage path.

## Knowledge graph

| Table | Purpose |
|---|---|
| `tags` | User-owned labels |
| `entity_tags` | Tag-to-entity links |
| `relationships` | Explicit entity-to-entity knowledge links |

The relationship system is database-constrained to supported entity and relationship types.

## Derived metrics

### Engineering Progress

`completed curriculum requirements / total curriculum requirements × 100`

### Core Load

`incomplete curriculum requirements / total curriculum requirements × 100`

### Lesson Mastery

A lesson is mastered when it has at least one requirement and every requirement is complete.

### Unit Progress

Average child lesson progress.

### Subject Progress

Average child unit progress.

### Test Average

Average percentage for tests with valid score/max-score pairs.

### Study Hours

Sum of stored study-session durations.

### Project Progress

`completed tasks / total tasks × 100`

### Mistake Resolution

`resolved mistakes / total mistakes × 100`

## Schema change rule

The migrations are append-only history.

A deployed schema change should be represented by a new migration rather than rewriting an existing migration.

