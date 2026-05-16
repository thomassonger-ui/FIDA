-- ============================================================
-- FIDA Student Portal — v1 schema additions
-- Target project: pljgraqphhmsbscpvhbm
-- ============================================================
--
--  This migration extends the tickets system into a real per-student
--  portal. Adds:
--    - students            : the canonical roster (one row per portal-enabled student)
--    - student_invites     : tracking sent invites (so we can resend / audit)
--    - student_documents   : per-student document vault (separate from /admin/documents)
--    - tickets.student_id  : FK so submitted tickets auto-link to a student
--
--  Companion Supabase Storage bucket (create in Storage UI):
--    Name: student-documents
--    Public: false
--    File size limit: 25 MB
-- ============================================================

-- ------------------------------------------------------------
-- students
-- ------------------------------------------------------------

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,                          -- references auth.users.id (filled in on first portal login)
  email text not null unique,
  full_name text,
  phone text,
  program text,                                  -- 'radiography' | 'efda' | 'foundation' | 'professional_development' | etc.
  cohort_id text,
  start_date date,
  status text not null default 'invited',        -- 'invited' | 'active' | 'paused' | 'graduated' | 'withdrawn'
  source text,                                   -- 'admin' | 'moodle' | 'tickets' (for provenance)
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_email_idx
  on public.students (lower(email));
create index if not exists students_status_idx
  on public.students (status);
create index if not exists students_user_id_idx
  on public.students (user_id)
  where user_id is not null;

-- ------------------------------------------------------------
-- student_invites
-- ------------------------------------------------------------

create table if not exists public.student_invites (
  id bigserial primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  email text not null,
  sent_at timestamptz not null default now(),
  accepted_at timestamptz,
  sent_by text                                   -- admin email / 'auto-moodle' / etc.
);

create index if not exists student_invites_student_idx
  on public.student_invites (student_id);

-- ------------------------------------------------------------
-- student_documents
-- ------------------------------------------------------------

create table if not exists public.student_documents (
  id bigserial primary key,
  student_id uuid not null references public.students(id) on delete cascade,
  filename text not null,
  storage_path text not null,                    -- "<student_id>/<timestamp>-<safe-name>" in 'student-documents' bucket
  mime_type text,
  size_bytes integer not null,
  uploaded_by text not null,                     -- 'staff' | 'student'
  uploaded_by_email text,
  label text,                                    -- staff-set label e.g. 'Enrollment Agreement', 'Background Check'
  is_required boolean not null default false,    -- if true: appears on student's checklist; staff can flag missing
  created_at timestamptz not null default now()
);

create index if not exists student_documents_student_idx
  on public.student_documents (student_id, created_at desc);

-- ------------------------------------------------------------
-- tickets.student_id — link tickets back to a student row
-- ------------------------------------------------------------

alter table public.tickets
  add column if not exists student_id uuid references public.students(id);

create index if not exists tickets_student_idx
  on public.tickets (student_id)
  where student_id is not null;

-- ------------------------------------------------------------
-- Trigger: on ticket insert, auto-link to student by email match.
-- Also runs on update (in case email changes), but only if student_id is null.
-- ------------------------------------------------------------

create or replace function public.tickets_autolink_student()
returns trigger as $$
declare
  sid uuid;
begin
  if new.student_id is null and new.email is not null then
    select id into sid
    from public.students
    where lower(email) = lower(new.email)
    limit 1;
    if sid is not null then
      new.student_id := sid;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tickets_autolink_student on public.tickets;
create trigger trg_tickets_autolink_student
  before insert or update on public.tickets
  for each row
  execute function public.tickets_autolink_student();

-- ------------------------------------------------------------
-- Trigger: maintain students.updated_at
-- ------------------------------------------------------------

create or replace function public.touch_students_updated()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_students_updated on public.students;
create trigger trg_touch_students_updated
  before update on public.students
  for each row
  execute function public.touch_students_updated();

-- ------------------------------------------------------------
-- RLS — service-role only. App code uses SUPABASE_SERVICE_ROLE_KEY.
-- ------------------------------------------------------------

alter table public.students          enable row level security;
alter table public.student_invites   enable row level security;
alter table public.student_documents enable row level security;
