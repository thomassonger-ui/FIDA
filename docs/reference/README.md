# FIDA — SIS Reference Package

This package contains the reference documentation, templates, database schema, and architecture decisions for the FIDA Student Information System (SIS) demo built on Next.js + Supabase + Moodle.

**Owner:** WorldTeachPathways
**Builder:** Tom Songer / Bear Team
**Stack:** Next.js 15, Supabase (Postgres + Storage), Moodle LMS, Atticus AI intake advisor
**Live demo:** https://fida.vercel.app

---

## Contents

### `sor-audit.md`
Full System of Record audit — all 7 required modules (A–G) with current status, what's built, what's missing, compliance flags, and cross-cutting risks. This is the single source of truth for what the demo can and cannot do.

### `templates/`
Customizable document templates for the compliance workflow:
- `enrollment-agreement.md` — Student enrollment agreement
- `financial-disclosure.md` — Financial responsibility disclosure
- `sap-warning.md` — SAP warning letter
- `sap-probation.md` — SAP probation letter with improvement plan
- `appeal-form.md` — SAP appeal request form
- `placement-verification.md` — Employer placement verification form

### `schema/`
SQL CREATE TABLE statements for the production database:
- `001-students.sql` — Student master record with audit triggers
- `002-audit-events.sql` — Append-only audit log
- `003-sap-evaluations.sql` — SAP state machine evaluations
- `004-document-records.sql` — Document vault metadata + hash chain
- `005-placements.sql` — Job placement tracking
- `006-atticus-sessions.sql` — Atticus intake conversations (existing)

### `adr/`
Architecture Decision Records:
- `001-supabase.md` — Why Supabase for the data layer
- `002-moodle-stays-lms.md` — Why Moodle stays the LMS
- `003-atticus-on-top.md` — Intelligence layer vs SoR separation
- `004-third-party-ledger.md` — Why the financial ledger belongs in a vendor
- `005-document-vault-worm.md` — S3 Object Lock vs hash chain
- `006-accreditor-target.md` — ACCSC vs COE decision framework

---

## How to use this package

**For Claude:** Read `README.md` first to understand the structure, then read specific files as needed. The `sor-audit.md` file is the most comprehensive reference — start there for any compliance or architecture question.

**For school owners:** The `templates/` folder contains editable documents you can customize with your school name, program details, and accreditor-specific language. Print or convert to PDF for student signatures.

**For developers:** The `schema/` folder contains the production-ready Postgres schema. Run these migrations in order against your Supabase project. Each file is idempotent (uses `IF NOT EXISTS`).

---

Generated April 2026 from the FIDA OS compliance-first system design.
