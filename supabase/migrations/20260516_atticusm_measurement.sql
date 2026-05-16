-- Atticus™M measurement layer
-- Adds QR-code system + source attribution so the dashboard can show live KPIs.
-- Apply with: supabase db push  (or paste into SQL Editor in the dashboard)

-- 1) QR codes registry (one row per printed/posted code)
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

-- 2) QR scans — one row per scan event (slug duplicated so deleting a code doesn't lose history)
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

-- 3) Source attribution on atticus_sessions (existing table from 20260415_atticus_tables.sql)
alter table atticus_sessions
  add column if not exists source text;

create index if not exists atticus_sessions_source_idx
  on atticus_sessions (source)
  where source is not null;

-- 4) Source attribution on students (if the table exists; otherwise skip silently)
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

-- RLS — QR tables are server-side only; no anon access
alter table qr_codes enable row level security;
alter table qr_scans enable row level security;
-- (no policies → service role only; redirect handler + admin page use service role)
