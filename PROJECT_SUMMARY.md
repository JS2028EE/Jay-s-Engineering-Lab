# Jay's Engineering Lab

## Project Overview

**Jay's Engineering Lab** is a personal, futuristic Electrical Engineering operating system and command center. It is designed to connect the user's physical engineering lab with a digital engineering environment where learning, projects, components, mistakes, tests, notes, circuits, analytics, and personal development can be tracked over time.

The project is **not intended to be a normal notes app**. Its purpose is to become a long-term digital record and workspace for an engineer's development.

## Core Idea

> **Connect the real engineering world with the digital engineering world.**

Every component, test, mistake, solved circuit, project, note, study session, and lesson can become part of one connected engineering history.

---

# Main Modules

## 1. Dashboard / Command Center

The dashboard is the central live overview of the entire Engineering Lab.

It should display data calculated from the database rather than storing duplicate statistics.

Planned information includes:

- Overall engineering progress
- Subject progress bars
- Curriculum progress
- Total notes
- Total solved circuits
- Total tests
- Average test score
- Total components
- Total projects
- Active and completed projects
- Mistakes recorded and resolved
- Study hours
- Lessons and units completed
- Engineering analytics

Planned graphs include:

- Knowledge growth
- Test scores over time
- Study hours per week
- Mistakes by topic
- Projects completed
- Components acquired
- Accuracy by subject
- Subject progress

---

## 2. Custom Curriculum

The Custom Curriculum is a core part of the system.

The user creates their own engineering subjects, units, lessons, and lesson requirements.

Hierarchy:

`Subject → Unit → Lesson → Lesson Requirements`

Example:

`Circuit Analysis → Unit 01 — DC Circuits → Lesson 04 — Ohm's Law`

A lesson can contain requirements such as:

- Understand V = IR
- Rearrange the equation
- Solve basic problems
- Solve word problems
- Apply Ohm's Law to circuits
- Complete a practice test

The system automatically calculates lesson progress.

Example:

`4 / 6 requirements complete = 67%`

When all requirements are complete:

`LESSON = MASTERED = 100%`

Unit progress is calculated from its lessons. Subject progress is calculated from its units. Overall engineering progress is calculated from the curriculum.

Example:

```text
CIRCUIT ANALYSIS
Unit 01  100%
Unit 02   82%
Unit 03   45%
Unit 04    0%

OVERALL 57%
```

Lessons should be connectable to:

- Notes
- Tests
- Mistakes
- Circuits
- Projects
- Study Sessions

This makes the curriculum the center of the engineering learning graph.

---

## 3. Notes

The Notes module acts as a digital engineering notebook.

Notes can be organized by:

- Subject
- Course
- Topic
- Chapter
- Tags

Notes may contain:

- Text
- Equations
- Images
- Diagrams
- Circuit drawings
- Code
- Uploaded files
- Links
- Personal explanations

Notes can connect to concepts, tests, mistakes, circuits, and projects.

---

## 4. Tests & Grades

The Tests module records:

- Tests
- Quizzes
- Exams
- Practice tests

Each test can store:

- Test name
- Subject
- Topic
- Date
- Score
- Maximum score
- Percentage
- Questions missed
- Mistakes
- Notes
- Difficulty
- Files/images
- Retake information

The system should visualize improvement over time.

---

## 5. Solved Circuit Library

The Circuit Library stores solved engineering problems and circuits.

Each circuit can include:

- Circuit name
- Subject
- Topic
- Schematic
- Components
- Component values
- Equations
- Calculations
- Expected result
- Measured result
- Simulation result
- Final answer
- Explanation
- Date
- Related mistakes

Future versions may include:

- Drag-and-drop circuit editor
- Wires
- Live voltage/current labels
- Circuit simulation
- Animated current
- Waveforms
- Oscilloscope-style displays

---

## 6. Mistake Tracking

Mistake Tracking is a major learning feature.

Each mistake can store:

- Subject
- Topic
- Question
- User answer
- Correct answer
- Explanation
- What went wrong
- Date
- Severity
- Resolved/unresolved status
- Related test
- Related circuit
- Related note

Analytics can show:

- Most common mistakes
- Repeated mistakes
- Mistake frequency
- Resolved vs unresolved mistakes
- Improvement over time

Example:

```text
KCL                 11
Unit Conversion      7
Op-Amps              6
Sign Conventions     5
Ohm's Law            2
```

---

## 7. Component Inventory

The Component Library digitizes the physical engineering lab.

Each component can store:

- Component name
- Type
- Value
- Quantity
- Manufacturer
- Part number
- Purpose
- Date received
- Cost
- Package
- Specifications
- Datasheet
- Photo
- Physical storage location
- Notes

Components can connect to:

- Projects
- Circuits
- Notes

Example:

```text
2N3904
Type: NPN transistor
Quantity: 10
Purpose: Switching
Package: TO-92
```

---

## 8. Physical Lab Integration

The physical engineering lab will use labeled storage locations.

Example location codes:

```text
RES-A01
RES-A02
CAP-B01
IC-C01
SENSOR-D01
TOOLS-E01
POWER-F01
```

The digital component inventory points each component to its physical storage location.

Future functionality may include QR codes. Scanning a physical drawer or container could open its corresponding digital inventory.

This is a major part of the project's real-world-to-digital-world concept.

---

## 9. Projects

Each engineering project gets its own workspace.

Project information can include:

- Project name
- Description
- Goal
- Status
- Start date
- Due date
- Progress
- Components
- Schematics
- Code
- Images/videos
- Calculations
- Notes
- Problems/mistakes
- Tests
- Results
- Lessons learned
- Activity log

Example activity log:

```text
09:42 Added transistor
09:48 Updated resistor value
10:03 Solved current problem
```

Future project progress can be calculated from project tasks.

---

## 10. Study Sessions

Study Sessions record learning activity.

Each session can store:

- Subject
- Topic
- Start time
- End time
- Duration
- What was studied
- Problems solved
- Notes created

Study sessions power study-history and study-hour analytics.

---

## 11. Wellness

Wellness is a separate area from engineering analytics.

It tracks personal habits and daily development without mixing them into the engineering knowledge graph.

Categories include:

### Physical

- Workout
- Exercise
- Steps
- Sleep

### Nutrition & Hydration

- Healthy eating
- Water
- Meals

### Learning & Personal Growth

- Reading
- Personal development
- Journaling
- Study outside school

### Spiritual

- Prayer
- Scripture/religious reading

Daily check-ins can use yes/no values and optional measurements such as:

- Workout duration
- Workout type
- Workout rating
- Water amount
- Water goal
- Water percentage
- Reading minutes
- Reading pages
- Book
- Sleep hours
- Sleep goal
- Sleep rating

Planned wellness features:

- Streaks
- Daily status
- Weekly views
- Monthly views
- Yearly views
- Consistency calendar
- Wellness graphs

Example:

```text
Physical      88%
Nutrition     76%
Growth        83%
Spiritual     94%
```

Wellness should be encouraging rather than punitive.

---

## 12. Engineering Knowledge Graph

The Engineering Knowledge Graph connects related engineering information.

A generic relationship system can connect records using:

```text
source_type
source_id
relationship_type
target_type
target_id
created_at
```

Example relationships:

```text
KCL → related_to → Kirchhoff's Laws
KCL → appears_in → Test #4
KCL → explained_by → Note #17
KCL → caused → Mistake #12
KCL → used_in → Circuit #8
```

Future versions can display these relationships as an interactive visual graph.

Wellness remains separate unless intentionally connected later.

---

# Visual Design

The visual identity is:

**Futuristic Electrical Engineering Command Center**

with a:

**Neo-cyberpunk + hacker/technical interface** aesthetic.

The interface should feel like an engineering control system while remaining clean and readable.

## Visual Characteristics

- Near-black backgrounds
- Deep/electric blue
- Violet/neon purple
- Cyan accents
- Soft white text
- Glowing borders
- Dark translucent/glass panels
- Technical grids
- Circuit traces
- Moving particles
- Data streams
- Binary streams
- Oscilloscope waveforms
- Scanning effects
- Animated progress bars
- Glowing graphs
- Technical variables
- Futuristic typography

Example background data:

```text
V = 4.9823 V
I = 0.483 mA
R = 10.31 kΩ
f = 1.0024 kHz
θ = 42.81°
```

Planned animations include:

- Page transitions
- Glowing borders
- Hover effects
- Pulsing indicators
- Progress-bar energy effects
- Graph drawing
- Number counters
- Sliding panels
- Data-stream effects
- Circuit-current animations
- LED pulsing
- Waveform animations

The goal is a cyberpunk atmosphere without making the interface cluttered or difficult to use.

---

# Navigation

The planned navigation is similar to a futuristic engineering control panel:

```text
⚡
JAY'S
ENGINEERING LAB

◈ Dashboard
◇ Curriculum
◇ Notes
◇ Tests
◇ Circuits
◇ Components
◇ Projects
◇ Mistakes
◇ Analytics
◇ Wellness
```

Quick actions:

```text
+ Note
+ Test
+ Circuit
+ Mistake
+ Component
+ Project
+ Wellness Check-In
```

---

# Technology Stack

The project is a modern web/cloud application.

## Frontend

- JavaScript
- React
- Vite
- JSX
- HTML
- CSS
- Tailwind CSS
- Framer Motion
- Recharts
- KaTeX or MathJax

## Backend / Data

- Supabase
- PostgreSQL
- SQL
- Supabase Authentication
- Supabase Storage

## Runtime / Tooling

- Node.js

C/C++, Python, Arduino, Verilog/VHDL, and other engineering languages remain part of the user's broader engineering education and hardware projects. They are not the primary languages for the Engineering Lab web application itself.

---

# System Architecture

The application follows a layered architecture:

```text
React + Vite Frontend
        ↓
Visual System
Tailwind + CSS + Animations
        ↓
Application Logic
Progress + Analytics + Relationships
        ↓
Supabase PostgreSQL
        ↓
Supabase Storage
```

## Data Flow

```text
User
 ↓
React Interface
 ↓
Application Logic
 ↓
Supabase
 ├── PostgreSQL Database
 ├── Authentication
 └── Storage
```

The database stores structured information. Supabase Storage stores larger files such as PDFs, images, schematics, and photos. The database stores metadata and file paths.

---

# Database Architecture

Potential core tables include:

## Engineering

```text
users
subjects
units
lessons
lesson_requirements
topics
notes
tests
test_questions
mistakes
circuits
circuit_components
components
component_locations
projects
project_tasks
project_components
study_sessions
tags
entity_tags
relationships
```

## Wellness

```text
wellness_categories
wellness_habits
wellness_checkins
habit_measurements
habit_goals
```

## Files

```text
files
```

Actual files should be stored in Supabase Storage, while the database stores their metadata and storage paths.

Records should use IDs and foreign keys instead of duplicating complete records.

Many-to-many relationships should use linking tables such as:

```text
project_components
circuit_components
entity_tags
```

User-owned data should be protected with authentication and database security policies so personal information is only accessible to the appropriate authenticated user.

---

# Repository Structure

Planned project structure:

```text
jay-engineering-lab/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── components/
│   │   ├── projects/
│   │   ├── notes/
│   │   ├── tests/
│   │   ├── mistakes/
│   │   ├── circuits/
│   │   ├── wellness/
│   │   └── analytics/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Curriculum/
│   │   ├── Components/
│   │   ├── Projects/
│   │   ├── Notes/
│   │   ├── Tests/
│   │   ├── Mistakes/
│   │   ├── Circuits/
│   │   ├── Wellness/
│   │   └── Analytics/
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── database/
│   │   ├── calculations/
│   │   └── analytics/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   └── App.jsx
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── public/
├── .env
├── package.json
└── README.md
```

The exact structure can change as the application develops.

---

# V0.1 Development Goal

V0.1 should prove that the core data architecture works before adding advanced features.

Core V0.1 functionality:

- Dashboard
- Custom Subjects
- Custom Units
- Custom Lessons
- Lesson Requirements
- Automatic Lesson Progress
- Automatic Lesson Mastery
- Automatic Unit Progress
- Automatic Subject Progress
- Notes
- Components
- Projects
- Tests
- Mistakes
- Circuits
- Study Sessions
- Wellness Check-ins
- Supabase database
- Real cloud persistence

## Critical V0.1 Tests

The application must successfully demonstrate:

```text
Enter data
    ↓
Save to cloud
    ↓
Reload application
    ↓
Data remains
```

And:

```text
Complete Lesson Requirement
        ↓
Lesson percentage changes
        ↓
Unit percentage changes
        ↓
Subject percentage changes
        ↓
Dashboard updates
```

This proves that the application is actually data-driven rather than a static interface.

---

# Future Versions

## V0.2

- Advanced analytics
- Relationships
- Project tasks
- More advanced wellness features

## V0.3

- Authentication improvements
- File management
- Physical lab locations
- QR codes
- Knowledge graph

## V0.4+

Potential intelligent and engineering tools:

- AI search
- AI mistake explanations
- Engineering calculators
- Formula library
- Flashcards
- Practice questions
- Automatic documentation

## Long-Term Vision

The system may eventually become a digital circuit laboratory with:

- Interactive circuit editor
- SPICE simulation
- Circuit calculations
- Oscilloscope simulation
- Signal generator
- Waveform visualization
- Animated circuit behavior
- PWA/mobile support
- Offline support

---

# Project Philosophy

Jay's Engineering Lab should grow with the engineer using it.

The goal is to preserve a long-term record of:

- What was learned
- What was practiced
- What was built
- What went wrong
- What was fixed
- What was tested
- What components were used
- What projects were completed
- How knowledge developed
- How study habits changed

The application should connect these records instead of treating them as isolated features.

The final concept is:

> **Personal Engineering Notebook + Custom Curriculum + Component Inventory + Project Manager + Mistake/Learning System + Test/Grade Tracker + Circuit Library + Knowledge Graph + Engineering Analytics + Cloud Database + Physical Lab Inventory + Wellness Tracker + Future Digital Circuit Laboratory.**

---

# Repository Status

This repository is the starting point for the project. The initial goal is to establish the project documentation and architecture before building the application itself.
