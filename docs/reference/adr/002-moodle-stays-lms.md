# ADR 002: Moodle Stays the LMS

**Status:** Accepted
**Date:** April 2026

## Context

Blueprint School already uses Moodle Cloud as the LMS for course delivery, gradebook, and attendance. The SIS needs grade and attendance data for SAP calculations. The question is whether to rebuild these features inside the SIS or pull from Moodle.

## Decision

Moodle stays the LMS. The SIS pulls grade and attendance snapshots from Moodle via its web services API and stores its own audit-grade copy.

## Rationale

- **Don't rebuild the gradebook.** Moodle's gradebook is mature, instructor-friendly, and already in use. Rebuilding it would take months and add no compliance value.
- **Two sources of truth is fine** if one is clearly canonical per purpose. Moodle is canonical for instruction; the SIS is canonical for compliance reporting.
- **Attendance plugin.** Moodle's `mod_attendance` plugin tracks sessions with present/late/absent marks. The SIS pulls daily snapshots and stores an immutable copy.
- **Grade snapshots.** The SIS pulls cumulative grades at each SAP evaluation checkpoint. The snapshot becomes the audit record; live Moodle grades may change after.

## Trade-offs

- **API dependency.** If Moodle is down, the SIS can't pull fresh data. Mitigated by caching the last successful snapshot.
- **Clock-hour gap.** Moodle's attendance plugin tracks sessions, not clock hours. For clock-hour programs, the SIS may need to derive cumulative hours from session data + scheduled duration.
- **Two places to look.** Instructors work in Moodle; administrators look at the SIS. This is acceptable and common in the industry.

## Consequences

- Moodle API credentials (URL + token) are stored as environment variables
- The SIS never writes to Moodle — it's read-only
- Grade snapshots are frozen at evaluation time and stored in `sap_evaluations`
- Attendance snapshots are pulled daily and stored in a future `attendance_snapshots` table
