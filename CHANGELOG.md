# Changelog

All notable changes to Jay's Engineering Lab are documented here.

## Unreleased — Engineering Tools expansion

### Added
- Explicit target selection for the core Ohm's Law + Power calculator.
- Multiple selectable solution methods for voltage, current, resistance, and power.
- Inductor calculator covering inductance, voltage, current slope, stored energy, inductive reactance, and frequency.
- Capacitor calculator covering capacitance, voltage, charge, stored energy, capacitive reactance, frequency, current, and voltage slope.
- Frequency ↔ period utility.
- Electrical unit conversion groups for frequency, time, inductance, capacitance, charge, and energy.

### Improved
- Engineering Tools no longer infers the desired core quantity from whichever two fields happen to be filled.
- Calculator inputs now show the exact quantity and units required by the selected method.
- Engineering math coverage expanded with deterministic tests for the new calculators and unit groups.
- Fixed Study Session stopping by adding the missing `updated_at` schema field required by the existing timestamp trigger.
- Added a production-verified migration for the Study Session timestamp fix.


## 0.3.1 — 2026-09-18

### Added
- Deterministic engineering math library separated from UI code.
- Automated Node tests for Ohm's Law, power relationships, resistor decoding, electrical unit conversion, and value formatting.
- CI quality gate now runs automated tests, the production build, and a high-severity dependency audit.

### Improved
- Ohm's Law + Power now requires exactly two supplied values and handles zero/divide-by-zero cases explicitly.
- 4-band resistor decoder now includes the fourth-band tolerance and rejects an invalid leading black digit.
- Electrical unit converter now groups dimensions and blocks invalid cross-dimensional conversions such as volts-to-amps.
- New account creation now requires at least 8 characters while existing account sign-in remains compatible with existing passwords.
- Engineering calculations are now independently testable instead of being embedded only inside the React view.

### Reliability
- Near-final core release gate now includes automated deterministic tests in addition to the production build.
- Dependency security scanning is now part of CI.

## 0.3.0 — 2026-09-18

### Added
- Engineering standards, verification matrix, database data dictionary, maintenance guidance, contribution standards, and GitHub issue templates.
- MIT License
- In-app Engineering Tools
- In-app Lab Guide
- Practical User Guide documentation
- Production Readiness audit
- GitHub Actions build verification
- Node 22 development baseline
- Electrical unit conversion
- Ohm's Law + power calculator
- 4-band resistor resistance decoder

### Improved
- Restored dark, high-contrast styling for icon actions, delete/create controls, native selectors, and number inputs so controls remain visible without hover.
- Scrollable desktop/mobile sidebar navigation keeps the full module list reachable without hiding System Settings or Core Load.
- Added a long-term maintenance and recovery guide.
- Test question editing
- Question-level score recalculation
- Direct missed-question to Mistake workflow
- Live header clock
- Production security hardening
- Foreign-key indexes
- Database trigger search-path hardening
- Repository documentation and roadmap

### Security
- Revoked direct execution access to the public SECURITY DEFINER rls_auto_enable() function.
- Re-checked Supabase security/performance advisors.
- Remaining advisor item: leaked-password protection must be enabled in Supabase Auth settings.

## 0.2.0

Connected cloud-backed workspaces, richer CRUD, study sessions, knowledge connections, private files, analytics, wellness tracking, error recovery, and data export.

## 0.1.0

Initial command-center foundation, curriculum hierarchy, Supabase schema, authentication, dashboard calculations, and core workspace architecture.


### 0.3.1 follow-up
- Corrected backup export metadata from V0.2 to V0.3.1.
- Expanded engineering calculation tests to cover all six core input-pair paths and additional edge cases.
- Added weekly Dependabot updates for npm dependencies and GitHub Actions.
