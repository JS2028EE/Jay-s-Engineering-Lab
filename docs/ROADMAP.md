# Jay's Engineering Lab — Roadmap

This roadmap separates what is working now from what still needs to be built.

## CURRENT — V0.3 connected foundation

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
- Study Sessions
- Connections / Knowledge Graph
- Files
- Settings / Data Export

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

## NEXT — V0.4 deep learning workflows

Most of the original CRUD foundation is implemented. V0.4 should focus on deeper editing, richer attachments, cross-links, and study workflows rather than rebuilding the core lifecycle.

The major CRUD lifecycle is already implemented across the current V0.3 workspaces. The next work should deepen those workflows rather than rebuild their basic CRUD.

### Notes

Deepen:

- rich text / Markdown
- equations
- tags
- images and files
- linked mistakes, tests, circuits, and projects

### Tests

Deepen:

- retakes
- richer score history
- broader review workflows

### Circuits

Deepen:

- schematic upload
- image preview
- measured vs expected comparison

### Components

Deepen:

- component photos
- datasheets
- quantity adjustments
- stock history

### Mistakes

Deepen:

- recurring-mistake detection
- richer cross-linking

### Wellness

Deepen:

- goal history
- date history
- weekly/monthly views
- consistency calendar

### Study Sessions

Deepen:

- edit
- pause/resume
- weekly study graphs

## V0.5 — Connect and deepen the system

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

## V0.6 — Knowledge graph

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

## V0.7 — Files and storage

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

## V0.8 — Advanced analytics

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

## V0.9 — Real engineering tools

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

## V1.0 — Circuit laboratory

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

## Post-V1.0 — Physical lab integration

Long-term physical-digital bridge:

- QR labels
- component drawer codes
- QR scan
- instant component lookup
- stock adjustments
- project checkout/return
- low-stock alerts

## Reliability gate

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

## Future intelligent layer

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

