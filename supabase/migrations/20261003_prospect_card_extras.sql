-- Pipeline card extras: pin to top, contact title, an optional second contact,
-- and the last VA call (for the "VA sent" badge).
alter table public.prospects
  add column if not exists pinned_at timestamptz,
  add column if not exists contact_title text,
  add column if not exists contact2_name text,
  add column if not exists contact2_title text,
  add column if not exists contact2_phone text,
  add column if not exists contact2_email text,
  add column if not exists last_va_call_at timestamptz,
  add column if not exists last_va_outcome text;
