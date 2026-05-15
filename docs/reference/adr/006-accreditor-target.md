# ADR 006: Accreditor Target — ACCSC vs COE Decision Framework

**Status:** Pending (must be decided before production build)
**Date:** April 2026

## Context

FIDA needs programmatic accreditation for its allied health programs. The two primary options for vocational/career schools are ACCSC (Accrediting Commission of Career Schools and Colleges) and COE (Council on Occupational Education). Their requirements for attendance, placement, and SAP overlap but diverge in important ways.

## Key Differences

### Attendance
| Requirement | ACCSC | COE |
|-------------|-------|-----|
| Tracking unit | Clock hours or credit hours | Clock hours (strongly preferred) |
| Minimum standard | School-defined, documented | 80% of scheduled hours |
| Reporting | Annual report | Annual report |

### Placement
| Requirement | ACCSC | COE |
|-------------|-------|-----|
| In-field definition | Trained occupation or related field | Broader — "gainful employment" |
| Minimum rate | 70% (varies by program) | 60% overall |
| Verification required | Yes — employer contact | Yes — employer contact |
| Wage data | Optional (strengthens GE disclosure) | Optional |
| Reporting window | Within 12 months of graduation | Within 12 months |

### SAP
| Requirement | ACCSC | COE |
|-------------|-------|-----|
| GPA minimum | School-defined (typically 2.0) | School-defined (typically 2.0) |
| Pace minimum | 67% (federal standard) | 67% (federal standard) |
| Max timeframe | 150% of published program length | 150% of published program length |
| Evaluation frequency | Each payment period | Each payment period |
| State machine | Warning -> Probation -> Termination | Warning -> Probation -> Termination |

### Other Differences
| Requirement | ACCSC | COE |
|-------------|-------|-----|
| Financial audit | Required annually | Required annually |
| Catalog requirements | Specific format | More flexible |
| Teach-out plan | Required if closing | Required if closing |
| Site visits | Unannounced possible | Scheduled |
| Renewal cycle | 5 years | 6 years |

## Decision Framework

Choose ACCSC if:
- The school's programs are in healthcare, technology, or skilled trades
- The school wants the stricter standard (looks better to students and employers)
- Programs will seek Title IV eligibility (ACCSC is well-established with DOE)

Choose COE if:
- The school's programs are broader vocational (not just allied health)
- The school wants a slightly lower placement threshold
- The school is in a state where COE has stronger recognition

## Impact on FIDA OS

The accreditor choice affects:
1. **Placement page:** In-field definition and minimum rate threshold
2. **Attendance page:** Whether clock hours are mandatory or optional
3. **SAP page:** Evaluation frequency and documentation requirements
4. **Document vault:** Which documents are required vs. optional
5. **Compliance page:** Which standards the SoR audit measures against

## Recommendation

**Default to ACCSC standards** in the demo build — they're stricter, which means building to ACCSC also satisfies COE. Encode the accreditor choice as a configuration variable so the same codebase works for either.

## Consequences

- The demo currently builds to ACCSC-like standards (stricter)
- The accreditor choice should be made before the production database schema is finalized
- In-field placement definitions must be configured per accreditor, not hardcoded
- The compliance page should show which accreditor standard is being measured against
