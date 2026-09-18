# Jay's Engineering Lab — User Guide

## What the Lab is

Jay's Engineering Lab is a personal engineering operating system. PostgreSQL/Supabase is the source of truth; the React interface is the control surface.

## Recommended daily workflow

### 1. Start with Curriculum
Create the engineering subjects you are actually studying. Build units, lessons, and specific requirements. Mark requirements complete only after you have done the work.

### 2. Study
Use **Study Sessions** to record real time. Start the timer for focused work or enter a completed session manually.

### 3. Capture knowledge
Use **Notes** for explanations, derivations, observations, code snippets, and things you want to remember.

### 4. Measure learning
Use **Tests** to record assessment results. Add questions when you want question-level evidence. A question can be edited, deleted, or logged as a mistake. When question points are complete, **RECALC** can rebuild the parent score.

### 5. Learn from mistakes
Use **Mistakes** to record the problem, your answer, the correct answer, what went wrong, and the lesson learned. Resolving a mistake keeps it in your history.

### 6. Build
Use **Circuits** for solved/experimental circuits and **Projects** for larger builds. Components can be linked to both so the digital record matches the physical lab.

### 7. Organize the lab
Use **Components** for inventory and **component locations** for physical storage. Use **Files** for private engineering artifacts.

### 8. Connect knowledge
Use **Connections** to relate lessons, notes, tests, mistakes, circuits, components, and projects. The long-term goal is a navigable engineering knowledge graph.

### 9. Review
Use **Dashboard** for current state and **Analytics** for trends. Core Load is incomplete curriculum work divided by total curriculum requirements. Engineering Progress is the completed portion.

## Engineering Tools

The **Engineering Tools** workspace currently provides:

- Ohm's Law and power calculations
- 4-band resistor resistance decoding
- Electrical unit conversion

Use these as verification tools. Keep the reasoning in your circuit/note record when the calculation matters.

## Wellness

Wellness is intentionally separate from engineering performance. Track habits, measurements, goals, streaks, and consistency without turning wellness into a hidden academic score.

## Data and security

- Sign-in uses Supabase Auth.
- User-owned database records are protected with Row Level Security.
- Private files use a non-public Storage bucket and user-scoped folders.
- Never put a Supabase service-role key in frontend code.
- JSON export in Settings covers structured database records; binary Storage files are not embedded in that JSON export.

## Backup

Use **Settings → Export Data** regularly. A mature backup process should include both the JSON record export and a Storage-object manifest.

## Definitions

**Engineering Progress**
`completed requirements ÷ total requirements × 100`

**Core Load**
`incomplete requirements ÷ total requirements × 100`

**Lesson Mastered**
All requirements in a lesson are complete and the lesson has at least one requirement.

**Project Progress**
`completed project tasks ÷ total project tasks × 100`

**Test Percentage**
`score ÷ max score × 100`

**Study Hours**
Sum of recorded study-session durations.

## Release rule

A feature is not finished because the page looks finished. It is finished when the underlying data saves correctly, survives refresh, can be edited/deleted safely, respects ownership, and produces correct dependent metrics.
