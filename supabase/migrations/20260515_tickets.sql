-- ============================================================
-- FIDA Tickets / Student Inquiry Center
-- Apply with: supabase db push   (or paste into SQL Editor)
-- Target project: pljgraqphhmsbscpvhbm
-- ============================================================
--
-- Architecture:
--   - Identity = student's verified email (managed via Supabase Auth OTP)
--   - tickets       — one row per inquiry
--   - ticket_messages — message thread (student + staff + system notes)
--   - ticket_attachments — file links pointing at the
--     'ticket-attachments' Storage bucket
--   - RLS enabled; no anon access. All app reads/writes go through
--     server routes using the service-role key.
--
-- Companion bucket (create manually in Storage UI, or via API):
--   Name: ticket-attachments
--   Public: false
--   File size limit: 10 MB
--
-- Status values (string, no enum so they're easy to extend later):
--   open               — student just submitted, no staff reply yet
--   awaiting_staff     — student has replied, ball is in staff court
--   awaiting_student   — staff has replied, ball is in student court
--   resolved           — staff has marked resolved, student can re-open
--   closed             — archived; no further activity expected
--
-- Category values:
--   academics, financial_aid, scheduling, transcripts, tech, other
-- ============================================================

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  student_name text,
  program text,
  category text not null default 'other',
  subject text not null,
  status text not null default 'open',
  assigned_to uuid,                                -- references auth.users(id)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  last_reply_at timestamptz not null default now(),
  last_reply_by text not null default 'student'   -- 'student' | 'staff' | 'system'
);

create index if not exists tickets_email_idx
  on public.tickets (lower(email));
create index if not exists tickets_status_idx
  on public.tickets (status);
create index if not exists tickets_last_reply_idx
  on public.tickets (last_reply_at desc);

-- ------------------------------------------------------------

create table if not exists public.ticket_messages (
  id bigserial primary key,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_type text not null check (author_type in ('student','staff','system')),
  author_name text,
  author_email text,
  body text not null,
  is_internal_note boolean not null default false,  -- staff-only; never shown to students
  created_at timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_idx
  on public.ticket_messages (ticket_id, created_at);

-- ------------------------------------------------------------

create table if not exists public.ticket_attachments (
  id bigserial primary key,
  message_id bigint not null references public.ticket_messages(id) on delete cascade,
  storage_path text not null,           -- e.g. "<ticket_id>/<message_id>/<filename>"
  filename text not null,
  mime_type text,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

create index if not exists ticket_attachments_message_idx
  on public.ticket_attachments (message_id);

-- ------------------------------------------------------------
-- Maintain tickets.last_reply_at / last_reply_by / updated_at
-- whenever a message is appended.
-- ------------------------------------------------------------

create or replace function public.touch_ticket_on_message()
returns trigger as $$
begin
  if new.is_internal_note then
    -- internal notes do not move the customer-facing clock
    update public.tickets
      set updated_at = now()
      where id = new.ticket_id;
  else
    update public.tickets
      set last_reply_at = new.created_at,
          last_reply_by = new.author_type,
          updated_at = now(),
          status = case
            when new.author_type = 'student' and status in ('awaiting_student','resolved','closed') then 'awaiting_staff'
            when new.author_type = 'student' and status = 'open' then 'open'
            when new.author_type = 'staff'   and status in ('open','awaiting_staff') then 'awaiting_student'
            else status
          end
      where id = new.ticket_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_ticket_on_message on public.ticket_messages;
create trigger trg_touch_ticket_on_message
  after insert on public.ticket_messages
  for each row
  execute function public.touch_ticket_on_message();

-- ------------------------------------------------------------
-- Row-level security
-- ------------------------------------------------------------

alter table public.tickets             enable row level security;
alter table public.ticket_messages     enable row level security;
alter table public.ticket_attachments  enable row level security;

-- No policies created. Service-role bypasses RLS; anon/authenticated have
-- zero access by default. All ticket reads/writes flow through the Next.js
-- server routes which use SUPABASE_SERVICE_ROLE_KEY.
--
-- (If you later want to let signed-in students read their own tickets
-- directly from the browser, add policies like:
--    create policy "tickets_own_email" on public.tickets
--      for select using ( lower(email) = lower(auth.jwt() ->> 'email') );
-- )
