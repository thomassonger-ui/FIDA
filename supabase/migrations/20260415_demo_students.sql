-- demo_students: the enrolled-student roster shown at /admin/students.
-- Intentionally permissive columns so the CSV/XLSX importer can map loosely.

create table if not exists public.demo_students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  program text,           -- "Medical Assisting" | "Medical Billing & Coding" | "Patient Care Technology"
  cohort_id text,          -- free text for demo; real build would FK demo_cohorts
  status text default 'active', -- active | paused | graduated | withdrawn
  start_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists demo_students_email_idx
  on public.demo_students (lower(email)) where email is not null;
create index if not exists demo_students_program_idx
  on public.demo_students (program);
create index if not exists demo_students_cohort_idx
  on public.demo_students (cohort_id);

alter table public.demo_students enable row level security;
-- no policies = service-role-only access (matches other admin tables)
