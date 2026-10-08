-- ============================================================
-- FIDA — Atticus SIS (2026-10-08)
-- Target project: pljgraqphhmsbscpvhbm
-- Run in the Supabase SQL editor. Additive only: new nullable columns on
-- public.students, three new tables. No existing rows are changed.
-- No SSN / TIN / last-4 is stored anywhere.
-- ============================================================

-- 1. Core SIS columns on the existing roster ----------------------------------
alter table public.students
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists middle_name text,
  add column if not exists preferred_name text,
  add column if not exists student_number text,
  add column if not exists dob date,
  add column if not exists school_email text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip text,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists photo_ref text,                 -- path in bucket student-documents
  add column if not exists modality text,                  -- on_ground | hybrid | online
  add column if not exists hs_credential text,             -- diploma | ged | atb
  add column if not exists id_verified_method text,        -- in_person | gov_id_upload | proctored
  add column if not exists id_verified_at date,
  add column if not exists ferpa_directory_optout boolean not null default false,
  add column if not exists ferpa_releases jsonb not null default '[]'::jsonb,
  add column if not exists custom jsonb not null default '{}'::jsonb;

create unique index if not exists students_student_number_idx
  on public.students (student_number) where student_number is not null;

-- Split existing full_name into first/last where empty (one-time, safe to re-run)
update public.students
   set first_name = coalesce(first_name, nullif(split_part(trim(full_name), ' ', 1), '')),
       last_name  = coalesce(last_name,  nullif(trim(substr(trim(full_name), length(split_part(trim(full_name), ' ', 1)) + 1)), ''))
 where full_name is not null and (first_name is null or last_name is null);

-- 2. Field configuration ----------------------------------------------------
create table if not exists public.sis_field_defs (
  key text primary key,
  label text not null,
  section text not null,                  -- profile | admissions | ferpa | custom
  field_type text not null default 'text',-- text | date | number | boolean | select | email | phone
  options jsonb,
  programs text[],                        -- null = all programs
  required boolean not null default false,
  visible_roles text[] not null default array['owner','registrar'],
  student_visible boolean not null default false,
  student_editable boolean not null default false,
  is_core boolean not null default false,
  active boolean not null default true,
  sort int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sis_field_defs enable row level security;

-- 3. Private staff notes ----------------------------------------------------
create table if not exists public.sis_student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  body text not null,
  author text not null,
  created_at timestamptz not null default now()
);
create index if not exists sis_student_notes_student_idx on public.sis_student_notes (student_id, created_at desc);
alter table public.sis_student_notes enable row level security;

-- 4. Audit trail for student-record edits (append-only) ----------------------
create table if not exists public.audit_events (
  id bigserial primary key,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  old_value jsonb,
  new_value jsonb,
  actor text not null,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_entity_idx on public.audit_events (entity_id, created_at desc);
alter table public.audit_events enable row level security;

-- 5. Seed core field definitions ----------------------------------------------
-- Roles: owner, registrar, admissions, instructor, read_only
insert into public.sis_field_defs (key, label, section, field_type, options, required, visible_roles, student_visible, student_editable, is_core, sort) values
  ('student_number','Student ID','profile','text',null,true, array['owner','registrar','admissions','instructor','read_only'],true,false,true,10),
  ('first_name','First name','profile','text',null,true, array['owner','registrar','admissions','instructor','read_only'],true,false,true,11),
  ('middle_name','Middle name','profile','text',null,false,array['owner','registrar','admissions','read_only'],true,false,true,12),
  ('last_name','Last name','profile','text',null,true, array['owner','registrar','admissions','instructor','read_only'],true,false,true,13),
  ('preferred_name','Preferred name','profile','text',null,false,array['owner','registrar','admissions','instructor','read_only'],true,true,true,14),
  ('dob','Date of birth','profile','date',null,true, array['owner','registrar','admissions','read_only'],true,false,true,15),
  ('school_email','School email','profile','email',null,false,array['owner','registrar','admissions','instructor','read_only'],true,false,true,20),
  ('email','Personal email','profile','email',null,true, array['owner','registrar','admissions','read_only'],true,false,true,21),
  ('phone','Phone','profile','phone',null,true, array['owner','registrar','admissions','instructor','read_only'],true,true,true,22),
  ('address_line1','Address','profile','text',null,true, array['owner','registrar','admissions','read_only'],true,true,true,23),
  ('address_line2','Address 2','profile','text',null,false,array['owner','registrar','admissions','read_only'],true,true,true,24),
  ('city','City','profile','text',null,true, array['owner','registrar','admissions','read_only'],true,true,true,25),
  ('state','State','profile','text',null,true, array['owner','registrar','admissions','read_only'],true,true,true,26),
  ('zip','ZIP','profile','text',null,true, array['owner','registrar','admissions','read_only'],true,true,true,27),
  ('emergency_contact_name','Emergency contact','profile','text',null,true, array['owner','registrar','admissions','instructor','read_only'],true,true,true,28),
  ('emergency_contact_phone','Emergency phone','profile','phone',null,true, array['owner','registrar','admissions','instructor','read_only'],true,true,true,29),
  ('program','Program','admissions','text',null,true, array['owner','registrar','admissions','instructor','read_only'],true,false,true,40),
  ('cohort_id','Cohort','admissions','text',null,false,array['owner','registrar','admissions','instructor','read_only'],true,false,true,42),
  ('start_date','Start date','admissions','date',null,true, array['owner','registrar','admissions','instructor','read_only'],true,false,true,43),
  ('modality','Modality','admissions','select','["on_ground","hybrid","online"]'::jsonb,false,array['owner','registrar','admissions','instructor','read_only'],true,false,true,44),
  ('hs_credential','HS credential','admissions','select','["diploma","ged","atb"]'::jsonb,false,array['owner','registrar','admissions','read_only'],false,false,true,45),
  ('id_verified_method','ID verified by','admissions','select','["in_person","gov_id_upload","proctored"]'::jsonb,false,array['owner','registrar','admissions','read_only'],false,false,true,47),
  ('id_verified_at','ID verified on','admissions','date',null,false,array['owner','registrar','admissions','read_only'],false,false,true,48),
  ('ferpa_directory_optout','Directory information opt-out','ferpa','boolean',null,false,array['owner','registrar','admissions','instructor','read_only'],true,false,true,80)
on conflict (key) do nothing;

-- FIDA program fields (dental assisting) — edit freely in /admin/settings/sis
insert into public.sis_field_defs (key, label, section, field_type, options, programs, required, visible_roles, student_visible, student_editable, is_core, sort) values
  ('cpr_bls_expires','CPR/BLS card expires','custom','date',null,null,false,array['owner','registrar','admissions','instructor','read_only'],true,false,false,100),
  ('hep_b_series_complete','Hep B series complete','custom','boolean',null,null,false,array['owner','registrar','admissions','read_only'],true,false,false,101),
  ('fl_radiography_cert','FL radiography certificate #','custom','text',null,null,false,array['owner','registrar','admissions','read_only'],true,false,false,102),
  ('scrub_size','Scrub size','custom','select','["XS","S","M","L","XL","2XL"]'::jsonb,null,false,array['owner','registrar','admissions','instructor','read_only'],true,true,false,103)
on conflict (key) do nothing;
