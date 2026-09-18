# Jay's Engineering Lab — Roadmap

This roadmap separates what is working now from what still needs to be built.

## CURRENT — Functional foundation

### Working workspaces

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

### Working data principles

- Supabase persistence
- Authenticated user access
- RLS-protected data
- Curriculum progress calculation
- Core Load calculation
- Test percentage calculation
- Study-hour aggregation
- Project task progress
- Mistake resolution state
- Inventory quantity totals

## PHASE 1 — Finish CRUD quality

The current modules need full lifecycle support, not only create/delete.

### Notes

Add:

- edit
- rich text / Markdown
- subject + topic selection
- tags
- images and files
- linked mistakes, tests, circuits, and projects

### Tests

Add:

- test questions
- missed-question tracking
- per-question scores
- retakes
- subject/topic links
- automatic mistake creation
- score history

### Circuits

Add:

- schematic upload
- component selection
- circuit-component linking
- subject/topic links
- edit
- image preview
- measured vs expected comparison

### Components

Add:

- edit
- dedicated physical locations
- location management
- component photos
- datasheets
- project links
- circuit links
- quantity adjustments

### Mistakes

Add:

- subject/topic
- related test
- related circuit
- related note
- recurring-mistake detection
- edit

### Wellness

Add:

- edit categories
- edit habits
- measurements
- goals
- date history
- weekly/monthly views
- streaks
- consistency calendar

### Study Sessions

This is a major missing CRUD surface.

Add:

- session creation
- timer
- manual duration entry
- subject/topic
- summary
- history
- weekly study graphs

## PHASE 2 — Connect the system

The next major goal is to make the modules communicate.

### Curriculum connections

Each lesson should be able to show:

- notes
- tests
- mistakes
- circuits
- projects
- study sessions

### Project connections

Each project should show:

- components used
- circuits
- notes
- tests
- mistakes
- project tasks
- activity history

### Component connections

A component should be able to answer:

- Where is it physically?
- Which projects use it?
- Which circuits use it?
- How many are left?

## PHASE 3 — Knowledge graph

Implement the existing `relationships` table.

Provide a controlled relationship system such as:

```
related_to
explained_by
appears_in
caused
uses
tested_by
built_with
derived_from
```

Then build an interactive engineering knowledge graph.

## PHASE 4 — Files and storage

Add real Supabase Storage integration.

Supported artifacts:

- PDFs
- datasheets
- schematics
- images
- project photos
- videos or video links
- code files

Database records should store metadata and storage paths.

## PHASE 5 — Advanced analytics

Add:

- study hours by week
- test score trends
- mistake frequency by topic
- subject mastery history
- project completion history
- component acquisition history
- engineering activity timeline
- requirement completion velocity
- repeated-mistake analysis

Analytics should always clearly identify the underlying data source.

## PHASE 6 — Real engineering tools

Long-term:

- engineering calculator
- Ohm's Law calculator
- resistor/color-code tools
- unit converter
- formula library
- circuit problem generator
- flashcards
- practice tests
- waveform tools
- electronics reference tables

## PHASE 7 — Circuit laboratory

Long-term advanced system:

- drag-and-drop circuit editor
- wires
- component symbols
- value entry
- node labels
- voltage/current calculations
- SPICE integration
- waveform visualization
- simulated oscilloscope
- animated current flow

## PHASE 8 — Physical lab integration

Long-term physical-digital bridge:

- QR labels
- component drawer codes
- QR scan
- instant component lookup
- stock adjustments
- project checkout/return
- low-stock alerts

## PHASE 9 — Reliability

Before calling the system mature:

- loading states
- empty states
- error recovery
- form validation
- optimistic updates where appropriate
- retry handling
- automated tests
- production smoke tests
- mobile layout audit
- accessibility audit
- data export
- backup strategy

## PHASE 10 — Intelligent layer

Only after the underlying data is reliable:

- AI engineering search
- AI note summarization
- mistake explanations
- study recommendations
- automatic tagging
- related-concept discovery
- natural-language queries across the lab

AI should assist with the data, not become the source of truth.

## Definition of complete

A module is considered complete only when it supports the full lifecycle:

`Create → Read → Edit → Delete → Relate → Analyze`

and when the relevant dashboard/analytics values automatically respond to the data.
