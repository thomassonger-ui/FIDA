-- Staff countersignature on the enrollment agreement (School Official +
-- Representative lines of the CIE form). The executed PDF is filed as a
-- second student_documents row + vault record; the student-signed original
-- stays untouched.
alter table public.enrollment_agreements
  add column if not exists countersigned_at timestamptz,
  add column if not exists countersigner_name text,
  add column if not exists countersigner_title text,
  add column if not exists countersigned_pdf_sha256 text,
  add column if not exists countersigned_document_record_id bigint;
