# ADR 003: Atticus-on-Top Architecture

**Status:** Accepted
**Date:** April 2026

## Context

Atticus is the AI-powered intake advisor that handles prospective student conversations. The SIS is the system of record for enrolled students. The question is how tightly to couple them.

## Decision

Keep Atticus as a separate intelligence layer that reads from SIS views and writes only to `atticus_*` tables. The SIS never calls Atticus; Atticus never writes to SIS tables directly.

## Rationale

- **Audit clarity.** When an auditor asks "where does student data live and who can change it," the answer is the SIS. Atticus is a separate system that feeds leads into the funnel but doesn't touch compliance-grade records.
- **Replaceable intelligence.** If the AI layer needs to change (different model, different vendor, different approach), the SIS is unaffected. Atticus is a plugin, not a dependency.
- **Separation of concerns.** Atticus handles: conversation, disclosure flagging, lead extraction, handoff. The SIS handles: enrollment, attendance, SAP, financial records, document vault, placement. No overlap.

## Data Flow

```
Prospective student
    -> Atticus conversation (writes to atticus_sessions + atticus_messages)
    -> Handoff (atticus_sessions.handed_off_at set)
    -> Staff reviews lead in /admin/leads (reads atticus_sessions)
    -> Staff promotes lead to applicant (creates row in students table with source='atticus')
    -> Atticus session ID linked but Atticus tables are read-only from SIS perspective
```

## Trade-offs

- **Manual promotion.** A staff member must explicitly promote a lead to a student record. This is intentional — the SIS doesn't auto-enroll from AI conversations.
- **Duplicate data.** Lead name/email exists in both `atticus_sessions` and `students`. The `students` record is canonical; `atticus_sessions` is the evidence trail.

## Consequences

- Atticus writes only to `atticus_sessions` and `atticus_messages`
- The SIS reads `atticus_*` tables for the Leads page but never modifies them
- `students.atticus_session_id` provides the linkage for audit trail
- Atticus can be deployed, updated, or removed without any SIS migration
