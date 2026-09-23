-- Contact-form spam guard (lib/spam-guard.ts).
-- tickets.status gains the value 'spam' (text column, no check constraint).
alter table public.tickets add column if not exists spam_reason text;

create table if not exists public.blocked_senders (
  id bigserial primary key,
  value text not null unique,          -- exact email OR bare domain, lower-case
  note text,
  created_at timestamptz not null default now()
);
alter table public.blocked_senders enable row level security;  -- service-role only
