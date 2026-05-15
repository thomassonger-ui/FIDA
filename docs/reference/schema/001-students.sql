-- ============================================================
-- 001 — Student Master Record
-- ============================================================
-- Core student table for FIDA OS. Every enrolled student gets
-- one row. RLS restricts access by staff role. All mutations
-- fire an audit trigger (see 002-audit-events.sql).
--
-- Run after: (none — this is the foundation table)
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
  id              BIGSERIAL PRIMARY KEY,

  -- Identity
  legal_first     TEXT        NOT NULL,
  legal_last      TEXT        NOT NULL,
  display_name    TEXT,                       -- preferred name if different
  email           TEXT        NOT NULL UNIQUE,
  phone           TEXT,
  dob             DATE,
  ssn_last4       CHAR(4),                   -- last 4 only; full SSN in ledger vendor

  -- Program
  program_title   TEXT        NOT NULL,
  cip_code        TEXT,                       -- 6-digit Classification of Instructional Programs
  credential      TEXT        CHECK (credential IN ('certificate','diploma','degree')),
  clock_hours     INT,                        -- NULL if credit-hour program
  credit_hours    INT,                        -- NULL if clock-hour program

  -- Enrollment
  enrollment_status TEXT      NOT NULL DEFAULT 'applicant'
    CHECK (enrollment_status IN (
      'applicant','enrolled','loa','withdrawn','graduated','terminated'
    )),
  cohort_id       TEXT,
  start_date      DATE,
  expected_completion DATE,
  actual_completion   DATE,
  withdrawal_date     DATE,

  -- Source tracking
  atticus_session_id UUID,                    -- links to atticus_sessions if lead came via Atticus
  source          TEXT        DEFAULT 'manual'
    CHECK (source IN ('atticus','manual','bulk_import')),

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      TEXT        NOT NULL DEFAULT current_user
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_email       ON students (email);
CREATE INDEX IF NOT EXISTS idx_students_status      ON students (enrollment_status);
CREATE INDEX IF NOT EXISTS idx_students_cohort      ON students (cohort_id);
CREATE INDEX IF NOT EXISTS idx_students_program     ON students (program_title);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION trg_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS students_updated_at ON students;
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION trg_students_updated_at();

-- RLS (enable after configuring Supabase auth roles)
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY students_staff_read  ON students FOR SELECT USING (auth.role() IN ('admissions','registrar','advisor','admin'));
-- CREATE POLICY students_admissions  ON students FOR INSERT WITH CHECK (auth.role() IN ('admissions','admin'));
-- CREATE POLICY students_registrar   ON students FOR UPDATE USING (auth.role() IN ('registrar','admin'));

COMMENT ON TABLE students IS 'Student master record — one row per enrolled student. Foundation of the SoR.';
COMMENT ON COLUMN students.ssn_last4 IS 'Last 4 digits only. Full SSN lives in the third-party ledger vendor if needed.';
COMMENT ON COLUMN students.atticus_session_id IS 'Links to atticus_sessions.id if the student originated from an Atticus intake conversation.';
