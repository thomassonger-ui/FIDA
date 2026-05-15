# ADR 001: Supabase as the Data Layer

**Status:** Accepted
**Date:** April 2026

## Context

FIDA OS needs a database, auth, storage, and real-time layer. The team is small (one developer) and the school is pre-revenue. The system must eventually support compliance-grade data handling (RLS, audit logging, encryption at rest).

## Decision

Use Supabase (hosted Postgres + Auth + Storage + Edge Functions) as the primary data layer.

## Rationale

- **Postgres underneath.** RLS, triggers, JSONB, and full SQL are available from day one. No ORM lock-in.
- **Auth built in.** Role-based access (admissions, registrar, advisor, admin) maps directly to Supabase Auth + RLS policies.
- **Storage included.** Supabase Storage (S3-backed) handles document uploads with the option to upgrade to direct S3 Object Lock for WORM compliance.
- **Free tier is sufficient for demo.** The demo runs on the free tier; production scales on the Pro plan ($25/mo).
- **Edge Functions.** Serverless functions for webhook handlers, scheduled jobs (attendance sync from Moodle), and API integrations.

## Trade-offs

- **Not WORM-native.** Supabase Storage doesn't expose S3 Object Lock. For true WORM, we'll need a direct S3 bucket for the document vault.
- **SSN encryption.** Supabase supports encryption at rest (pgcrypto), but dedicated KMS for SSN fields requires additional setup.
- **Vendor lock-in.** Postgres is portable, but Supabase Auth, Storage, and Edge Functions are platform-specific. Acceptable given the team size.

## Consequences

- All SoR tables live in one Supabase project
- The financial ledger is the exception — it lives in a third-party vendor (see ADR 004)
- Audit triggers use standard Postgres; no Supabase-specific features
