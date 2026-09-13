-- Enrollment agreements — in-house e-signature for the Entry Level diploma.
--
-- Flow (agreed with Tom, 2026-09-13):
--   staff marks prospect Registered ($150 paid) → agreement email with a
--   one-time signing link → student signs on /enroll/<token> → PDF filed to
--   student_documents + document_records → $600 deposit email (QBO link).
--
-- One row per agreement sent. Re-sending voids the previous unsigned row.

create table if not exists public.enrollment_agreements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  token text not null unique,                    -- 32-byte random, url-safe; in the signing link
  version text not null,                         -- e.g. 'elda-interim-2026-09'
  status text not null default 'sent',           -- 'sent' | 'signed' | 'void'
  sent_at timestamptz not null default now(),
  sent_by text,                                  -- 'admin' | 'auto:promote'
  expires_at timestamptz not null default (now() + interval '30 days'),
  -- filled at signing
  signed_at timestamptz,
  signer_name text,                              -- typed signature (must equal legal name)
  signer_email text,
  signer_ip text,
  signer_user_agent text,
  guardian_name text,                            -- typed guardian signature when signer < 18
  fields jsonb not null default '{}'::jsonb,     -- dob, address, phone, emergency contact, plan, military
  pdf_sha256 text,
  student_document_id bigint references public.student_documents(id) on delete set null,
  document_record_id bigint,                     -- document_records.id (vault copy)
  deposit_email_sent_at timestamptz,
  deposit_paid_at timestamptz,                   -- staff marks when the $600 lands in QBO
  created_at timestamptz not null default now()
);

create index if not exists enrollment_agreements_student_idx
  on public.enrollment_agreements (student_id, created_at desc);

alter table public.enrollment_agreements enable row level security;
-- No policies: service-role only, like the rest of the portal tables.
