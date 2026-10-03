-- Memos: a team member asks another to do something on a prospect (usually a
-- call). The recipient gets an email with a private link, answers there, and
-- the answer lands on the prospect's notes.
create table if not exists public.prospect_memos (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects(id) on delete cascade,
  token text not null unique,
  from_key text not null,
  to_key text not null,
  goal text not null,
  brief text not null,
  due_on date,
  answer text,
  answered_at timestamptz,
  reminded_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists prospect_memos_open_idx on public.prospect_memos (to_key, answered_at);
create index if not exists prospect_memos_prospect_idx on public.prospect_memos (prospect_id);
alter table public.prospect_memos enable row level security;
