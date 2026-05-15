-- ============================================================
-- 005 — Placements
-- ============================================================
-- Job placement tracking for graduates. Career services staff
-- enter records; verification step confirms before the record
-- counts toward published rates.
--
-- Run after: 001-students.sql, 002-audit-events.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS placements (
  id              BIGSERIAL   PRIMARY KEY,
  student_id      BIGINT      NOT NULL REFERENCES students(id),

  -- Graduation
  graduation_date DATE        NOT NULL,

  -- Employment
  status          TEXT        NOT NULL CHECK (status IN (
    'placed_in_field','placed_out_of_field','seeking','not_available','pending_verification'
  )),
  employer_name   TEXT,
  employer_address TEXT,
  employer_phone  TEXT,
  employer_contact TEXT,
  position_title  TEXT,
  start_date      DATE,
  is_full_time    BOOLEAN,

  -- In-field determination
  is_in_field     BOOLEAN,
  in_field_justification TEXT,                -- must cite accreditor definition
  accreditor_standard    TEXT CHECK (accreditor_standard IN ('ACCSC','COE','regional','other')),

  -- Verification
  verification_method TEXT CHECK (verification_method IN (
    'employer_call','offer_letter','pay_stub','linkedin','other'
  )),
  verified_by     TEXT,
  verified_on     DATE,

  -- Wage data (optional, requires consent)
  wage_consented  BOOLEAN     NOT NULL DEFAULT FALSE,
  hourly_wage     NUMERIC(8,2),
  wage_consent_revoked_at TIMESTAMPTZ,        -- set if graduate revokes consent

  -- Notes
  notes           TEXT,

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      TEXT        NOT NULL DEFAULT current_user
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_placements_student  ON placements (student_id);
CREATE INDEX IF NOT EXISTS idx_placements_status   ON placements (status);
CREATE INDEX IF NOT EXISTS idx_placements_verified ON placements (verified_on) WHERE verified_on IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trg_placements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS placements_updated_at ON placements;
CREATE TRIGGER placements_updated_at
  BEFORE UPDATE ON placements
  FOR EACH ROW
  EXECUTE FUNCTION trg_placements_updated_at();

-- In-field justification is locked once verified
CREATE OR REPLACE FUNCTION trg_placements_lock_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.verified_on IS NOT NULL AND NEW.is_in_field IS DISTINCT FROM OLD.is_in_field THEN
    RAISE EXCEPTION 'Cannot change in-field status after verification. Submit a new verification cycle.';
  END IF;
  IF OLD.verified_on IS NOT NULL AND NEW.in_field_justification IS DISTINCT FROM OLD.in_field_justification THEN
    RAISE EXCEPTION 'Cannot change in-field justification after verification. Submit a new verification cycle.';
  END IF;
  -- Handle wage consent revocation
  IF OLD.wage_consented AND NOT NEW.wage_consented THEN
    NEW.hourly_wage := NULL;
    NEW.wage_consent_revoked_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS placements_lock_verified ON placements;
CREATE TRIGGER placements_lock_verified
  BEFORE UPDATE ON placements
  FOR EACH ROW
  EXECUTE FUNCTION trg_placements_lock_verified();

-- Audit trigger
DROP TRIGGER IF EXISTS placements_audit ON placements;
CREATE TRIGGER placements_audit
  AFTER INSERT OR UPDATE OR DELETE ON placements
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_log();

COMMENT ON TABLE placements IS 'Graduate job placement records with employer verification and in-field validation.';
COMMENT ON COLUMN placements.in_field_justification IS 'Must cite the accreditor definition. Locked after verification.';
COMMENT ON COLUMN placements.hourly_wage IS 'Stored only with explicit graduate consent. NULLed if consent is revoked.';
