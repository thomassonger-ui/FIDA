# ADR 005: Document Vault — S3 Object Lock vs Hash Chain

**Status:** Accepted (Option 2 now, upgrade to Option 1 for production)
**Date:** April 2026

## Context

Accreditors and federal auditors require that certain documents (enrollment agreements, SAP notices, transcripts) be preserved in a non-editable, time-stamped format. "Non-editable after submission" means write-once semantics.

## Options Evaluated

### Option 1: Amazon S3 with Object Lock (Compliance Mode)
- **True WORM.** Once an object is locked, nobody — not even the root AWS account — can delete or modify it until the retention period expires.
- **Compliance mode** (vs. Governance mode) is the stricter variant: even users with `s3:BypassGovernanceRetention` permission cannot override the lock.
- **Cost:** S3 Standard pricing (~$0.023/GB/month). Object Lock has no additional charge.
- **Setup:** Requires a dedicated S3 bucket with versioning enabled and default retention policy. Not accessible via Supabase Storage — needs direct AWS SDK integration.

### Option 2: Supabase Storage + SHA-256 Hash Chain
- Upload files to Supabase Storage (S3 under the hood, but no Object Lock).
- Compute SHA-256 hash at upload time and store in `document_records` table.
- **Proves integrity** (tampering changes the hash) but **does not prevent deletion** (an admin could delete the file and the record).
- **Cost:** Included in Supabase plan.
- **Setup:** Minimal — uses existing Supabase infrastructure.

### Option 3: Third-Party Document Vault (Laserfiche, DocuWare, Box Governance)
- Purpose-built WORM-compliant storage with retention policies, legal holds, and audit trails.
- **SOC 2 certified** out of the box.
- **Cost:** $500–$2,000/month depending on vendor and volume.
- **Setup:** API integration required.

## Decision

**Start with Option 2** (Supabase Storage + hash chain) for the demo and MVP. This shows the architecture and intent — hashed, time-stamped, upload-locked UI.

**Upgrade to Option 1** (S3 Object Lock) before any real accreditation visit. This is the cheapest path to true WORM that the school controls directly.

**Consider Option 3** only if the school already uses a document management vendor or needs legal hold capabilities.

## Implementation Notes

- The `document_records` table stores the SHA-256 hash, not the file itself
- The upload API computes the hash server-side (never trust client-side hashing)
- The UI shows a lock icon per document and the first 16 chars of the hash
- Retention schedules are per-category (enrollment agreement: 6yr, transcript: 50yr, etc.)
- The upgrade path to S3 Object Lock requires: (1) new S3 bucket with versioning + default retention, (2) swap the upload API to write to S3 instead of Supabase Storage, (3) no change to the `document_records` table or the UI

## Consequences

- Demo/MVP: integrity provable but not enforced at storage layer
- Production: S3 Object Lock enforces immutability at the infrastructure level
- The `document_records` table works identically with either storage backend
- Migration from Option 2 to Option 1 is a backend change only — no UI or schema changes
