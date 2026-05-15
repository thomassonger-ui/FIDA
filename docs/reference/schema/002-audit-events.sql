-- ============================================================
-- 002 — Audit Events (append-only)
-- ============================================================
-- Immutable log of every data change across SoR tables.
-- No UPDATE or DELETE allowed — enforced by RLS + no policies
-- granting those operations.
--
-- The trigger function below auto-logs changes to any table
-- that has the audit trigger attached.
--
-- Run after: (none — standalone, but attach triggers after
--            creating the tables they monitor)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_events (
  id              BIGSERIAL   PRIMARY KEY,
  table_name      TEXT        NOT NULL,
  record_id       TEXT        NOT NULL,       -- PK of the affected row (cast to text)
  action          TEXT        NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_values      JSONB,                      -- NULL for INSERT
  new_values      JSONB,                      -- NULL for DELETE
  changed_fields  TEXT[],                     -- list of columns that changed (UPDATE only)
  reason          TEXT,                       -- optional human-readable reason
  performed_by    TEXT        NOT NULL DEFAULT current_user,
  performed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  source          TEXT        DEFAULT 'app'   -- 'app', 'migration', 'bulk_import', 'system'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_events (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON audit_events (performed_at);
CREATE INDEX IF NOT EXISTS idx_audit_action       ON audit_events (action);

-- Prevent mutation: no UPDATE or DELETE on audit_events
-- (enforced via RLS when enabled; this trigger is a belt-and-suspenders guard)
CREATE OR REPLACE FUNCTION trg_audit_immutable()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only. Updates and deletes are not permitted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_events_immutable_update ON audit_events;
CREATE TRIGGER audit_events_immutable_update
  BEFORE UPDATE ON audit_events
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_immutable();

DROP TRIGGER IF EXISTS audit_events_immutable_delete ON audit_events;
CREATE TRIGGER audit_events_immutable_delete
  BEFORE DELETE ON audit_events
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_immutable();

-- ============================================================
-- Generic audit trigger function
-- Attach to any table: CREATE TRIGGER ... EXECUTE FUNCTION trg_audit_log();
-- ============================================================
CREATE OR REPLACE FUNCTION trg_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  rid TEXT;
  changed TEXT[];
  col TEXT;
BEGIN
  -- Determine the record ID (assumes 'id' column; override in trigger args if needed)
  IF TG_OP = 'DELETE' THEN
    rid := OLD.id::TEXT;
  ELSE
    rid := NEW.id::TEXT;
  END IF;

  -- Build changed-fields list for UPDATE
  IF TG_OP = 'UPDATE' THEN
    changed := ARRAY[]::TEXT[];
    FOR col IN SELECT column_name FROM information_schema.columns
               WHERE table_name = TG_TABLE_NAME AND table_schema = TG_TABLE_SCHEMA
    LOOP
      IF to_jsonb(OLD) ->> col IS DISTINCT FROM to_jsonb(NEW) ->> col THEN
        changed := array_append(changed, col);
      END IF;
    END LOOP;
  END IF;

  INSERT INTO audit_events (table_name, record_id, action, old_values, new_values, changed_fields)
  VALUES (
    TG_TABLE_NAME,
    rid,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END,
    changed
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Attach audit trigger to the students table
-- ============================================================
DROP TRIGGER IF EXISTS students_audit ON students;
CREATE TRIGGER students_audit
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW
  EXECUTE FUNCTION trg_audit_log();

COMMENT ON TABLE audit_events IS 'Append-only audit log. Every row mutation in SoR tables is captured here. No updates or deletes permitted.';
