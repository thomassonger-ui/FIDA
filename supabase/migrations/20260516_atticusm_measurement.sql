-- Atticus™M measurement layer (self-contained, idempotent)
-- Apply with: supabase db push  (or paste into SQL Editor in the dashboard)
--
-- This migration creates ALL tables it needs from scratch if they don't already
-- exist, so it can run on a clean database OR on one that already has the
-- earlier atticus tables. Safe to re-run.

-- ============================================================================
-- 0) ATTICUS — base conversation + messages tables
--    (originally in 20260415_atticus_tables.sql; included here so the
--    measurement layer doesn't depend on that migration being applied first)
-- ============================================================================

create table if not exists atticus_sessions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  ip_hash text,
  user_agent text,
  program_interest text,
  lead_name text,
  lead_email text,
  lead_phone text,
  lead_timeline text,
  handed_off_at timestamptz,
  message_count integer not null default 0,
  flagged_count integer not null default 0,
  source text
);

create index if not exists atticus_sessions_email_idx
  on atticus_sessions (lead_email)
  where lead_email is not null;

create index if not exists atticus_sessions_handed_off_idx
  on atticus_sessions (handed_off_at)
  where handed_off_at is not null;

create index if not exists atticus_sessions_source_idx
  on atticus_sessions (source)
  where source is not null;

create table if not exists atticus_messages (
  id bigserial primary key,
  session_id uuid not null references atticus_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now(),
  flagged boolean not null default false,
  flag_reason text
);

create index if not exists atticus_messages_session_idx
  on atticus_messages (session_id, created_at);

-- If the table already existed without the source column, add it now.
alter table atticus_sessions
  add column if not exists source text;

-- ============================================================================
-- 1) QR CODES — one row per printed/posted code
-- ============================================================================

create table if not exists qr_codes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  channel text,
  destination_path text not null default '/atticus',
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists qr_codes_slug_idx on qr_codes (slug);

-- ============================================================================
-- 2) QR SCANS — one row per scan event
--    slug is duplicated (not just FK) so historical scans survive code deletes
-- ============================================================================

create table if not exists qr_scans (
  id bigserial primary key,
  qr_code_id uuid references qr_codes(id) on delete set null,
  slug text not null,
  scanned_at timestamptz not null default now(),
  user_agent text,
  referrer text,
  ip_hash text
);

create index if not exists qr_scans_slug_idx on qr_scans (slug, scanned_at);
create index if not exists qr_scans_qr_code_idx on qr_scans (qr_code_id, scanned_at);

-- ============================================================================
-- 3) STUDENT ATTRIBUTION — add acquisition_source if those tables exist
-- ============================================================================

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'students'
  ) then
    execute 'alter table students add column if not exists acquisition_source text';
  end if;

  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'demo_students'
  ) then
    execute 'alter table demo_students add column if not exists acquisition_source text';
  end if;
end$$;

-- ============================================================================
-- 4) RLS — measurement tables are server-side only (service role uses them)
-- ============================================================================

alter table atticus_sessions enable row level security;
alter table atticus_messages enable row level security;
alter table qr_codes enable row level security;
alter table qr_scans enable row level security;
-- (no policies = no anon access; server routes use the service role key)
