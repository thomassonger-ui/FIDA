# System of Record Audit — Blueprint School SIS

**Date:** April 15, 2026
**Auditor:** Claude (AI-assisted) + Tom Songer
**Standard:** Compliance-first design targeting ACCSC/COE accreditation

---

## Summary

| Status | Count | Modules |
|--------|-------|---------|
| Built | 0 | — |
| Partial | 1 | B (Enrollment & Admissions) |
| Demo only | 6 | A, C, D, E, F, G |
| Not built | 0 | — |

---

## Module A: Student Master Record

**Status:** Demo only

**Summary:** Demo roster generates fullname/email/risk tier/attendance/grade per cohort via deterministic PRNG, but nothing persists to a real database table.

**What's here:**
- 25 deterministic demo students per tracked cohort
- Risk tier + attendance + grade signals
- Student table page at /admin/students with import/export buttons

**What's missing:**
- DOB
- SSN (or last-4 reference)
- Legal name separate from display name
- CIP code
- Enrollment status enum (Active / LOA / Withdrawn / Graduated)
- Start date / expected completion date
- Real Postgres `students` table with RLS

**Flag:** Deterministic demo IDs (negative ints) don't survive a page refresh as real records — you're showing data that doesn't exist anywhere auditable.

**Data entry in production:** Three paths: (1) Atticus handoff auto-seeds applicant record; (2) Admissions staff form for enrollment fields (legal name, DOB, CIP, dates); (3) Bulk CSV/XLSX import for cohort migration. Every write logs to `audit_events`.

---

## Module B: Enrollment & Admissions Tracking

**Status:** Partial

**Summary:** Atticus -> atticus_sessions -> handoff captures the top of the funnel and the transcript is preserved. Everything downstream is missing.

**What's here:**
- Atticus intake conversations persisted (atticus_sessions + atticus_messages)
- Handoff timestamps per session
- Lead -> transcript trail for 30 days
- Leads page at /admin/leads with Supabase fallback to demo data

**What's missing:**
- Signed enrollment agreement storage
- Financial responsibility disclosure signatures
- Applicant -> Enrolled transition timestamps
- Append-only audit log for record changes

**Flag:** "Audit trail (no edits without logs)" is the hardest requirement — Postgres row mutation logging needs to be designed before anyone touches student records in prod. Consider an `audit_events` append-only table with triggers.

**Data entry in production:** Leads enter automatically via Atticus handoff. Staff promotes lead -> applicant -> enrolled. Atticus never writes to `students` directly — intelligence layer and SoR stay separated.

---

## Module C: Attendance Tracking

**Status:** Demo only

**Summary:** /admin/attendance simulates 16 weekly sessions with present/late/absent via Math.sin seeding. Not clock-hour aware.

**What's here:**
- Simulated 16-session history per tracked cohort
- Per-student present/late/absent breakdown
- Class-wide recent-sessions table
- Summary KPIs (avg attendance, on-track count, at-risk count)

**What's missing:**
- Clock-hour tracking (critical for allied-health Title IV)
- Instructor validation step
- Daily attendance logs (vs weekly)
- Tardy tracking distinct from absence

**Flag:** Clock-hour programs (which allied-health often are) have much stricter attendance requirements than credit-hour — you need to pick a model early. Moodle's attendance plugin can carry this if enabled.

**Data entry in production:** Instructors record attendance in Moodle. FIDA OS pulls daily snapshots via API and stores its own audit-grade copy. Clock-hour vs credit-hour model must be configured per program before any real data enters.

---

## Module D: Academic Progress / SAP Engine

**Status:** Demo only

**Summary:** Demo SAP dashboard built at /admin/sap with GPA, pace %, state machine, and evaluation checkpoints — but nothing persists to a real table.

**What's here:**
- GPA + pace % threshold bars per student
- Warning -> Probation -> Termination state machine (deterministic)
- 3 evaluation checkpoints (weeks 4, 8, 12) with advisor notes
- Compliance notes (evaluation windows, advisor sign-off, appeals, Title IV)
- Production-entry callout explaining how real data would flow

**What's missing:**
- Real `sap_evaluations` Postgres table (append-only)
- Advisor sign-off workflow (blocked until signed)
- Calendar-triggered evaluations (vs. static demo checkpoints)
- GPA pulled from Moodle gradebook via API
- Appeal submission + committee decision records

**Flag:** The demo shows the full state machine but transitions are deterministic, not advisor-driven. In production every transition must be blocked until an advisor signs off with a timestamped note. Unsigned transitions are an audit finding.

**Data entry in production:** Evaluations triggered automatically by academic calendar. GPA from Moodle gradebook; pace from enrollment record. System proposes status transition; advisor must sign off before it takes effect. Every evaluation writes to append-only `sap_evaluations` table.

**Thresholds:** GPA min 2.0, Pace min 67%, Max timeframe 150% (per 34 CFR 668.34).

---

## Module E: Financial Ledger

**Status:** Demo only

**Summary:** Demo ledger built at /admin/ledger with tuition, aid, payments, balances, and one R2T4 scenario — but no real financial data or third-party integration.

**What's here:**
- Per-student tuition charges ($14,500) + registration fees ($250)
- Financial aid (Pell Grant) disbursement entries
- Student payment records with running balance
- R2T4 return scenario for withdrawn student
- Third-party integration architecture callout (Regent / CampusNexus / Populi)
- Production-entry callout explaining data flow

**What's missing:**
- Real financial tables or third-party ledger integration
- Actual R2T4 federal formula calculation engine
- Title IV processor sync (COD/SAIG)
- Contra-entry correction workflow (no edits, only new entries)
- Bursar role with scoped write access

**Flag:** R2T4 (Return to Title IV) refund calculation is a federal formula that must be mathematically exact and audit-reproducible. Don't roll your own math — use a vetted vendor (Regent, CampusNexus) for the ledger and wire FIDA OS on top as the reporting layer.

**Data entry in production:** Tuition charges auto-generated at enrollment. Aid syncs from Title IV processor (COD/SAIG). Payments recorded by bursar in ledger vendor. FIDA OS pulls read-only summary. Financial records are immutable once posted — corrections are contra entries, never edits.

---

## Module F: Document Vault / Audit Locker

**Status:** Demo only

**Summary:** Demo vault built at /admin/documents with SHA-256 hashing, upload form, retention scheduling, and WORM lock indicators. Supabase Storage + hash chain (Option 2) — production should upgrade to S3 Object Lock.

**What's here:**
- Upload form with category, student name, file picker, notes
- SHA-256 hash computed at upload time
- Retention schedule per document category (3–50 years)
- WORM lock status indicator per document
- Document table with hash, uploader, timestamp, retention
- API route (POST /api/admin/documents) for Supabase Storage upload
- Architecture callout: Option 2 now, S3 Object Lock for production
- Production-entry callout explaining data flow

**What's missing:**
- S3 Object Lock integration (true WORM — production upgrade)
- Real `document_records` Postgres table + Supabase Storage bucket
- Per-student document completeness checklist
- Download with audit logging (who accessed what, when)
- Retention expiry automation (archive or delete on schedule)

**Flag:** The demo uses Supabase Storage + hash chain, which proves integrity but not immutability — an admin could still delete the file. For a real accreditation visit, upgrade to S3 Object Lock in compliance mode where nobody, including root, can modify locked objects.

**Data entry in production:** Staff uploads documents through the form. Server computes SHA-256, stores file in vault bucket, writes record with hash + uploader + timestamp + retention. File is immediately locked. Required documents per student: enrollment agreement, financial disclosure, ID scan, transcript, and any SAP notices.

**Retention schedule:**
- Enrollment agreement: 6 years
- Financial disclosure: 6 years
- ID verification: 5 years
- Transcript: 50 years (permanent)
- SAP notice: 6 years
- Appeal decision: 6 years
- Placement verification: 5 years
- Other: 3 years

---

## Module G: Job Placement Tracking

**Status:** Demo only

**Summary:** Demo placement dashboard built at /admin/placement with employer records, in-field validation, wage data, and verification workflow — but nothing persists.

**What's here:**
- Per-graduate employer name, position title, start date
- In-field vs. out-of-field status with justification text
- Verification workflow (verifier name + date)
- Optional consented wage data with privacy controls
- Computed placement rates replacing static 82% KPI
- Accreditor definition warning (ACCSC vs COE)
- Production-entry callout explaining data flow

**What's missing:**
- Real `placements` Postgres table with audit trail
- Employer verification call/letter upload step
- Career services staff entry form
- Wage consent/revocation workflow
- Accreditor-specific in-field definition enforcement

**Flag:** Accreditor (ACCSC / COE) placement definitions differ — "in-field" criteria must be documented and enforced at data-entry time. Wage data pulls you into privacy territory and should be optional + consented.

**Data entry in production:** Career services staff enters placement when graduate reports employment. Verification step (employer call or offer letter) confirms data before it counts. Records stored in `placements` table with append-only audit trail. Aggregate rates computed live from verified records, never from a static number.

---

## Cross-Cutting Flags

### 1. Demo vs product is conflated
Blueprint School is currently a presentation-grade mockup. Moving to SoR means a hard rewrite of the data layer with durable tables, migrations, RLS, and audit triggers. Budget 6–10 weeks for Phase 1 if it has to withstand a real ACCSC visit — not the 2–3 weeks the plan doc suggests.

### 2. Atticus-on-top is the right architecture
Don't bake intelligence into the SoR. Keep Atticus reading from SIS views and writing only to `atticus_*` tables. That way audits have one story (SIS) and intelligence stays a replaceable layer.

### 3. Moodle stays the LMS
Don't rebuild courses or the gradebook. SIS pulls grade snapshots from Moodle on a schedule and stores its own audit-grade copy. Two sources of truth is fine if one is clearly canonical per purpose.

### 4. PII surface is about to grow fast
DOB and SSN pull you into FERPA + state-specific data protection law. Once SSN lives in the database, you need encryption at rest with separate key management, access logging, and retention policies. Consider deferring SSN storage — many SIS systems store last-4 only for cross-referencing.

### 5. Interventions are about to become compliance-adjacent
Once SAP is real, the intervention timeline doubles as evidence that the school is acting on warning signals. Great for defense in an audit — but also means you can't silently delete or rewrite intervention records. Append-only from day one.

### 6. UI ambition is a risk too
The "Overview / Attendance / Academics / Financial / Documents / Placement" tabbed student profile is a big design project. Prototype one student profile end-to-end before extrapolating the pattern to scale.

### 7. Pick your accreditor target early
ACCSC vs COE vs regional — their definitions of attendance, placement, and SAP diverge. Building to the wrong standard now means a bigger rewrite later.

---

## Recommended Next Build Step

Queue the smallest move that turns demo into SoR foundation: a single real `students` table with RLS, plus an `audit_events` append-only table with row-level triggers. Migrate the Overview watchlist to read from it instead of `demoStudents()`.

Everything else stacks on top — preferably via third-party integrations (financial ledger, document vault) kept in their own service boundary. Keeping those concerns separate is smart for audit purposes: when the auditor asks "where does this data live and who can change it," the answer is one service per answer, not one app for everything.
