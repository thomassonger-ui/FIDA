-- ============================================================
-- 004 — Document Records (hash chain)
-- ============================================================
-- Metadata table for the Document Vault. Each row represents
-- one file uploaded to Supabase Storage (or S3 Object Lock in
-- production). The SHA-256 hash proves integrity; the storage
-- layer enforces immutability.
--
-- Run after: 001-students.sql, 002-audit-events.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS document_records (
  id              BIGSERIAL   PRIMARY KEY,
  student_id      BIGINT      REFERENCES students(id),
  student_name    TEXT        NOT NULL,         -- denormalized for quick display

  -- Document metadata
  category        TEXT        NOT NULL CHECK (category IN (
    'enrollment_agreement','financial_disclosure','id_verification',
    'transcript','sap_notice','appeal_decision','placement_verification','other'
  )),
  filename        TEXT        NOT NULL,
  file_size_kb    INT         NOT NULL,
  mime_type       TEXT        NOT NULL DEFAULT 'application/pdf',

  -- Storage
  storage_path    TEXT        NOT NULL UNIQUE,  -- path in Supabase Storage / S3
  sha256          CHAR(64)    NOT NULL,         -- hex-encoded SHA-256 of file bytes

  -- Provenance
  uploaded_by     TEXT        NOT NULL,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Retention
  retention_years INT         NOT NULL DEFAULT 6,
  retention_expires DATE      NOT NULL,
  locked          BOOLEAN     NOT NULL DEFAULT TRUE,

  -- Notes
  notes           TEXT,

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_docs_student    ON document_records (student_id);
CREATE INDEX IF NOT EXISTS idx_docs_category   ON document_records (category);
CREATE INDEX IF NOT EXISTS idx_docs_hash       ON document_records (sha256);
CREATE INDEX IF NOT EXISTS idx_docs_retention  ON document_records (retention_expires);

-- Append-only: no updates or deletes while locked
CREATE OR REPLACE FUNCTION trg_docs_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.locked THEN
      RAISE EXCEPTION 'Cannot delete a locked document record. Retention expires: %', OLD.retention_expires;
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    -- Only allow unlocking after retention expires
    IF OLD.locked AND NEW.locked = FALSE AND OLD.retention_expires > CURRENT_DATE THEN
      RAISE EXCEPTION 'Cannot unlock document before retention expires on %', OLD.retention_expires;
    END IF;
    -- Never allow changing the hash or storage path
    IF OLD.sha256 IS DISTINCT FROM NEW.sha256 THEN
      RAISE EXCEPTION 'Cannot modify SHA-256 hash of a document record.';
    END IF;
    IF OLD.storage_path IS DISTINCT FROM NEW.storage_path THEN
      RAISE EXCEPTION 'Cannot modify storage path of a document record.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS document_records_immutable ON document_records;
CREATE TRIGGER document_records_immutable
  BEFORE UPDATE OR DELETE ON document_records
  FOR EACH ROW
  EXECUTE FUNCTION trg_docs_immutable();

-- Audit trigger
DROP TRIGGER IF EXISTS document_records_audit ON document_records;
CREATE TRIGGER document_records_audit
  AFTER INSERT OR UPDATE OR DELETE ON document_records
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_log();

COMMENT ON TABLE document_records IS 'Document vault metadata with SHA-256 hash chain. Files live in Supabase Storage or S3 Object Lock.';
COMMENT ON COLUMN document_records.sha256 IS 'SHA-256 hash of the file bytes at upload time. Used to verify integrity.';
COMMENT ON COLUMN document_records.locked IS 'WORM lock status. TRUE = immutable until retention expires.';
