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
