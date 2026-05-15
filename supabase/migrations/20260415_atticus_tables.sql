-- Atticus conversation + lead capture tables.
-- Apply with: supabase db push  (or paste into SQL Editor in the dashboard)

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
  flagged_count integer not null default 0
);

create index if not exists atticus_sessions_email_idx
  on atticus_sessions (lead_email)
  where lead_email is not null;

create index if not exists atticus_sessions_handed_off_idx
  on atticus_sessions (handed_off_at)
  where handed_off_at is not null;

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

-- RLS: service role bypasses by default; nothing public is allowed.
alter table atticus_sessions enable row level security;
alter table atticus_messages enable row level security;
-- (no policies = no anon access; server routes use the service role key)
