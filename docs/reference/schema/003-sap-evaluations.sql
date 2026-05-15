-- ============================================================
-- 003 — SAP Evaluations
-- ============================================================
-- Append-only table for Satisfactory Academic Progress
-- evaluations. Each row is one evaluation checkpoint for one
-- student. State transitions (good_standing -> warning ->
-- probation -> termination) are recorded here with required
-- advisor sign-off.
--
-- Run after: 001-students.sql, 002-audit-events.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS sap_evaluations (
  id              BIGSERIAL   PRIMARY KEY,
  student_id      BIGINT      NOT NULL REFERENCES students(id),

  -- Checkpoint
  checkpoint_label TEXT       NOT NULL,        -- e.g. "Checkpoint 1 (Week 4)"
  evaluation_date  DATE       NOT NULL,
  payment_period   TEXT,                       -- e.g. "Spring 2026"

  -- Metrics at evaluation time
  cumulative_gpa   NUMERIC(3,2) NOT NULL,
  pace_pct         NUMERIC(5,2) NOT NULL,      -- completion rate as %
  max_timeframe_pct NUMERIC(5,2),              -- % of published program length consumed

  -- Thresholds applied
  gpa_threshold    NUMERIC(3,2) NOT NULL DEFAULT 2.00,
  pace_threshold   NUMERIC(5,2) NOT NULL DEFAULT 67.00,
  timeframe_threshold NUMERIC(5,2) NOT NULL DEFAULT 150.00,

  -- Status
  prior_status     TEXT        NOT NULL CHECK (prior_status IN (
    'good_standing','warning','probation','termination','appeal_approved'
  )),
  new_status       TEXT        NOT NULL CHECK (new_status IN (
    'good_standing','warning','probation','termination','appeal_approved'
  )),

  -- Advisor sign-off (required for every transition)
  advisor_name     TEXT        NOT NULL,
  advisor_note     TEXT        NOT NULL,        -- narrative explanation
  signed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Appeal info (populated only for appeal_approved transitions)
  appeal_id        BIGINT,                     -- references appeal record if applicable
  appeal_conditions TEXT,                      -- conditions of approved appeal

  -- Metadata
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       TEXT        NOT NULL DEFAULT current_user
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sap_student     ON sap_evaluations (student_id);
CREATE INDEX IF NOT EXISTS idx_sap_date        ON sap_evaluations (evaluation_date);
CREATE INDEX IF NOT EXISTS idx_sap_status      ON sap_evaluations (new_status);

-- Append-only: no updates or deletes
CREATE OR REPLACE FUNCTION trg_sap_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'sap_evaluations is append-only. Corrections must be entered as new rows.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sap_evaluations_no_update ON sap_evaluations;
CREATE TRIGGER sap_evaluations_no_update
  BEFORE UPDATE ON sap_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION trg_sap_immutable();

DROP TRIGGER IF EXISTS sap_evaluations_no_delete ON sap_evaluations;
CREATE TRIGGER sap_evaluations_no_delete
  BEFORE DELETE ON sap_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION trg_sap_immutable();

-- Audit trigger
DROP TRIGGER IF EXISTS sap_evaluations_audit ON sap_evaluations;
CREATE TRIGGER sap_evaluations_audit
  AFTER INSERT ON sap_evaluations
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_log();

COMMENT ON TABLE sap_evaluations IS 'Append-only SAP evaluation records. One row per student per checkpoint. Advisor sign-off required.';
COMMENT ON COLUMN sap_evaluations.advisor_note IS 'Required narrative from the advisor explaining the evaluation outcome and any actions taken.';
