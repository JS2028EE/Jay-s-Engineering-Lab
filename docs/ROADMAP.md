# Jay's Engineering Lab — Roadmap

This roadmap separates the core personal lab system from optional deeper capabilities.

## CURRENT — V0.3.1 near-final foundation

The core personal engineering workspace is now the target release line.

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
- Engineering Tools
- Lab Guide

### Working data principles

- Supabase persistence
- Authenticated user access
- RLS-protected user-owned data
- Private Storage for uploaded files
- Curriculum progress calculation
- Core Load calculation
- Test percentage calculation
- Study-hour aggregation
- Project task progress
- Mistake resolution state
- Inventory quantity totals
- Controlled cross-entity relationships
- Deterministic engineering-tool calculations

### Near-final release gate

The core release is considered near-final when these are all true:

- GitHub Actions automated tests pass.
- Production Vite build passes.
- Dependency security audit passes.
- Authentication and production email confirmation work.
- Core CRUD workflows survive refresh.
- RLS/Storage isolation is verified.
- Data export works.
- Major UI paths have loading, empty, and error states.
- Production deployment is successfully verified.
- Remaining Auth hardening settings are reviewed.

The system does not need every advanced feature below to be useful as a complete personal engineering lab.

## V0.4 — Depth and polish

Optional post-core expansion:

### Notes
- Markdown/rich formatting
- equations
- tags
- broader file/image attachments
- linked engineering records

### Tests
- retakes
- score history
- review workflows

### Circuits
- schematic preview
- measured vs expected comparison
- richer engineering evidence fields

### Components
- component photos
- stock movement history
- low-stock warnings

### Mistakes
- repeated-topic analysis
- stronger cross-linking

### Wellness
- goal history
- calendar views
- longer-term consistency trends

### Study Sessions
- edit
- pause/resume
- richer weekly history

## V0.5+ — Connected entity experiences

Deeper entity detail pages can surface:

- related notes
- tests
- mistakes
- circuits
- projects
- components
- study sessions
- relationship history

## V0.6+ — Interactive knowledge graph

Use the existing relationships table to build a visual graph of engineering concepts and artifacts.

## V0.7+ — Storage depth

Expand private file handling with:

- richer metadata
- attachment references across workspaces
- backup manifests
- media previews

## V0.8+ — Advanced analytics

Expand analytics with:

- weekly study history
- score trends
- mistake frequency
- mastery history
- project completion history
- inventory history
- engineering activity timeline
- repeated-mistake analysis

## V0.9+ — Advanced engineering toolchain

Potential additions:

- formula library
- circuit problem generator
- flashcards
- practice tests
- waveform tools
- electronics reference tables

## V1.0+ — Circuit laboratory

Long-term advanced system:

- drag-and-drop circuit editor
- wires and nodes
- component symbols
- SPICE integration
- waveform visualization
- simulated instrumentation

## Post-V1.0 — Physical lab integration

Potential physical-digital bridge:

- QR labels
- component drawer codes
- QR scanning
- stock checkout/return
- low-stock alerts

## Future intelligent layer

Only after the underlying data is stable:

- engineering search
- note summarization
- mistake explanations
- automatic tagging
- related-concept discovery
- natural-language queries

AI should assist with the data, not become the source of truth.

## Definition of complete

A core module is considered complete when its actual lifecycle matches the functionality it advertises, data survives refresh, permissions are enforced at the database layer, errors are recoverable, and relevant metrics derive from source records.
