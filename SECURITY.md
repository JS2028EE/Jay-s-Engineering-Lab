# Security Policy

## Scope

Jay's Engineering Lab is a personal engineering workspace. The project accepts security reports about application code, database policies, Storage rules, authentication integration, or accidental exposure of secrets.

## Reporting

Do not publish credentials, API keys, tokens, or private personal data in a public issue.

Use the repository's private security reporting mechanism when available. Include what happened, the affected area, reproduction steps, expected behavior, observed behavior, and whether personal data or credentials were involved.

## Secret handling

Never commit:
- Supabase service-role or secret keys
- passwords
- session tokens
- private certificates
- production credentials
- local .env files

Frontend code may use only the Supabase publishable/browser-safe key.

## Database security

The project uses Supabase Row Level Security for user-owned data and a private Storage bucket for uploaded engineering files.

Security changes should be followed by a Supabase security-advisor review.

## Auth configuration

Leaked-password protection should be enabled in the Supabase Auth dashboard before treating the deployment's authentication security review as complete.


## Current security audit

Verified on 2026-09-18 against the production database:

- Application tables use Row Level Security.
- Application authorization policies are scoped to `authenticated` and compare ownership to `auth.uid()`.
- Child records use parent ownership checks where appropriate.
- Cross-entity relationship rows require both referenced entities to belong to the current user.
- Application tables have no direct SELECT/INSERT/UPDATE/DELETE privileges for the `anon` role.
- The engineering file bucket is private, with Storage policies scoped to the authenticated user's UUID folder.
- Internal helper/trigger functions do not retain PUBLIC execute privileges.
- The frontend is designed to use a publishable/browser-safe Supabase key; service-role/secret keys must never be shipped to the browser.

### What this means

An unauthenticated random visitor is not authorized to read, modify, or delete another user's application records through the database API.

A different authenticated user also cannot use the normal application authorization path to read or delete your records, because the RLS policies require ownership by that user's `auth.uid()`.

This protection assumes your account credentials and active session remain secret. Someone who obtains your valid login credentials or steals an active authenticated session is no longer an unauthenticated attacker and may be able to act with your account's permissions.

### Remaining Auth hardening

The current Supabase Security Advisor reports:

`auth_leaked_password_protection`

Supabase recommends enabling leaked-password protection in Auth password-security settings. This should be treated as an outstanding authentication-hardening item rather than a database RLS failure.

### Operational rules

1. Never commit or publish service-role keys, passwords, refresh tokens, or local `.env` files.
2. Use a unique, strong password for the Lab account.
3. Keep email confirmation enabled.
4. Enable leaked-password protection when available.
5. Enable MFA/2FA when available for the account.
6. Sign out from devices you no longer control.
7. Treat exported JSON backups as sensitive because they contain structured engineering data.
