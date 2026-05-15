# ADR 004: Third-Party Financial Ledger

**Status:** Accepted
**Date:** April 2026

## Context

The SIS needs to track tuition, payments, financial aid, refunds, and R2T4 (Return to Title IV) calculations. R2T4 is a federal formula that must be mathematically exact and audit-reproducible.

## Decision

The financial ledger belongs in a dedicated third-party system. Apex SIS reads summary views from the ledger vendor via API. It does not store or calculate financial data itself.

## Recommended Vendors

1. **Regent** — Tuition management + R2T4 calculation engine. Purpose-built for Title IV schools.
2. **CampusNexus (Anthology)** — Full SIS with integrated ledger. Overkill if only using the financial module, but proven at scale.
3. **Populi** — Lightweight alternative with built-in billing, financial aid, and R2T4. Good fit for smaller schools.

## Rationale

- **R2T4 is not DIY.** The federal formula (34 CFR 668.22) has edge cases (leave of absence, module-based programs, clock-hour adjustments) that are easy to get wrong. A wrong R2T4 calculation is a federal finding.
- **Audit separation.** When the auditor asks "where does financial data live and who can change it," the answer is one vendor with its own access controls — not the same app that runs attendance and admissions.
- **Liability boundary.** If the R2T4 calculation is wrong, the vendor shares liability. If you roll your own, you own 100% of the risk.
- **SSN stays in the vendor.** The ledger vendor handles full SSN for ISIR matching and COD reporting. Apex SIS stores last-4 only.

## What Apex SIS Reads

- Student balance (charges minus credits)
- Payment status (paid in full, balance due, delinquent)
- Financial aid status (awarded, disbursed, returned)
- R2T4 flag (has a return been calculated?)
- Aid warning (approaching SAP loss of eligibility)

## What Apex SIS Does NOT Do

- Calculate tuition or fees
- Process payments
- Run R2T4 formulas
- Store full SSN
- Generate 1098-T tax forms

## Consequences

- The /admin/ledger page in the demo shows what the SIS would display, not what it would calculate
- In production, the ledger page queries the vendor API on each load
- Financial data is never duplicated into Supabase — the vendor is the single source of truth
- The Supabase `students` table has no financial columns
