-- ============================================================
-- 006 — Atticus Sessions & Messages (existing)
-- ============================================================
-- These tables already exist in the Supabase project. This file
-- documents the schema for reference and ensures consistency
-- if recreated.
--
-- Atticus writes to these tables during intake conversations.
-- The SIS reads from them but never writes to them directly.
-- This separation keeps the intelligence layer and SoR layer
-- cleanly bounded.
-- ============================================================

CREATE TABLE IF NOT EXISTS atticus_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lead info (extracted during conversation)
  lead_name         TEXT,
  lead_email        TEXT,
  lead_phone        TEXT,
  program_interest  TEXT,
  lead_timeline     TEXT,

  -- Session state
  handed_off_at     TIMESTAMPTZ,              -- NULL until handoff sentinel fires
  last_activity_at  TIMESTAMPTZ,
  message_count     INT         DEFAULT 0,
  flagged_count     INT         DEFAULT 0,     -- messages with disclosure flags

  -- Metadata
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_atticus_sessions_handoff
  ON atticus_sessions (handed_off_at)
  WHERE handed_off_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_atticus_sessions_created
  ON atticus_sessions (created_at);

-- ============================================================

CREATE TABLE IF NOT EXISTS atticus_messages (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID        NOT NULL REFERENCES atticus_sessions(id) ON DELETE CASCADE,

  role              TEXT        NOT NULL CHECK (role IN ('user','assistant','system')),
  content           TEXT        NOT NULL,

  -- Flagging
  flagged           BOOLEAN     NOT NULL DEFAULT FALSE,
  flag_reason       TEXT,                      -- e.g. "criminal_history", "financial_hardship"

  -- Metadata
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_atticus_messages_session
  ON atticus_messages (session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_atticus_messages_flagged
  ON atticus_messages (session_id)
  WHERE flagged = TRUE;

-- ============================================================
-- Note: These tables are in the Atticus service boundary.
-- The SIS reads from them via views or direct queries but
-- NEVER writes to them. Lead -> Applicant promotion happens
-- by creating a new row in the `students` table with
-- `source = 'atticus'` and `atticus_session_id` linking back.
-- ============================================================

COMMENT ON TABLE atticus_sessions IS 'Atticus intake conversations. Intelligence layer — separate from SoR.';
COMMENT ON TABLE atticus_messages IS 'Individual messages within an Atticus session. Includes disclosure flags.';
