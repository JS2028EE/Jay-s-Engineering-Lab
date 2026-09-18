# Jay's Engineering Lab — Architecture

## System principle

The Engineering Lab is a data system first and a visual dashboard second.

The interface is responsible for displaying and editing information. Supabase/PostgreSQL is the persistent source of truth. Calculations should be derived from those records.

## High-level architecture

```
User
  ↓
React + Vite
  ↓
Page / Component
  ↓
Supabase client
  ↓
PostgreSQL + RLS
  ↓
Persistent Engineering History
```

Authentication is provided by Supabase Auth.

Files such as PDFs, images, schematics, and photos should eventually use Supabase Storage, while PostgreSQL stores metadata and paths.

## Core entities

### Curriculum

```
Subject
  └── Unit
      └── Lesson
          └── Requirement
```

Progress is derived bottom-up.

### Projects

```
Project
  └── Project Task
```

Project progress is derived from completed tasks.

### Physical lab

```
Component
  └── Physical Location
```

A component can later be connected to projects and circuits.

### Learning feedback

```
Test
  └── Test Question

Mistake
  ├── Test
  ├── Circuit
  └── Note
```

These relationships are planned to become explicit rather than duplicated text.

## Real-statistics contract

The dashboard must not store duplicate summary values when the underlying records already exist.

Examples:

### Engineering Progress

`completed requirements / total requirements × 100`

### Core Load

`incomplete requirements / total requirements × 100`

### Lesson Mastery

A lesson is mastered when it has requirements and every requirement is complete.

### Unit Progress

Average of child lesson progress.

### Subject Progress

Average of child unit progress.

### Test Average

Average of:

`score / max_score × 100`

for tests that contain valid scores.

### Study Hours

Sum of recorded study-session duration.

### Project Progress

`completed tasks / total tasks × 100`

for projects with tasks.

### Mistake Resolution

`resolved mistakes / total mistakes × 100`

## Security

User-owned tables use authenticated ownership and Row Level Security.

Child records inherit ownership through their parent relationships.

The frontend must never use a Supabase service-role key.

Only browser-safe public credentials belong in frontend environment variables.

## Current frontend structure

The application uses page components for major workspaces:

```
src/
  App.jsx
  lib/
    data.js
    supabase.js
  pages/
    DashboardPage.jsx
    CurriculumPage.jsx
    ProjectsPage.jsx
    NotesPage.jsx
    TestsPage.jsx
    CircuitsPage.jsx
    ComponentsPage.jsx
    MistakesPage.jsx
    AnalyticsPage.jsx
    WellnessPage.jsx
```

## Current database foundation

Important tables include:

### Curriculum

- subjects
- units
- lessons
- lesson_requirements
- topics

### Learning

- notes
- tests
- test_questions
- mistakes
- study_sessions

### Physical engineering

- components
- component_locations
- circuits
- circuit_components

### Projects

- projects
- project_tasks
- project_components

### Wellness

- wellness_categories
- wellness_habits
- habit_goals
- wellness_checkins

### Connection system

- tags
- entity_tags
- relationships
- files

## Database views

The schema already contains derived views for:

- lesson_progress
- unit_progress
- subject_progress
- project_progress

These are valuable because calculations can be repeated consistently from the database instead of reimplemented differently in every page.

## Planned architecture improvement

A future version should centralize reusable calculations into database views/functions and frontend helpers so that Dashboard and Analytics never disagree about the definition of a metric.

## Data flow goal

A complete engineering record should be able to move through this lifecycle:

```
Create
  ↓
Save
  ↓
Retrieve
  ↓
Edit
  ↓
Relate
  ↓
Analyze
  ↓
Visualize
```

The system should eventually support the same lifecycle for every major entity.

## Engineering knowledge graph

The `relationships` table is designed to support connections such as:

```
KCL
  → related_to → Kirchhoff's Laws
  → explained_by → Note
  → appears_in → Test
  → caused → Mistake
  → used_in → Circuit
```

This graph should be built only after entity CRUD is reliable.

## Separation of wellness

Wellness remains a separate subsystem.

Engineering analytics should not silently turn habits into engineering performance scores.

The wellness subsystem can still have its own consistency metrics, streaks, goals, and history.

## Product principle

The visual layer may be futuristic.

The data layer must be boring, explicit, secure, and correct.
