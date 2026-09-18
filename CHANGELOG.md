# Changelog

All notable changes to Jay's Engineering Lab are documented here.

## 0.3.0 — 2026-09-18

### Added
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
