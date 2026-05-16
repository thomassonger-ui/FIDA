-- Campaign Templates — AI-generated marketing copy library for Atticus™M
-- Apply with: supabase db push  (or paste into SQL Editor)
-- Idempotent: safe to re-run.

-- ============================================================================
-- 1) CAMPAIGN_TEMPLATES — saved + starred copy variations
-- ============================================================================

create table if not exists campaign_templates (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('social','reel','email','sms','yard_sign')),
  program text not null check (program in ('rdp_ce','efda','both')),
  goal text not null,
  audience text,
  subject text,        -- email only
  preview_text text,   -- email only
  body text not null,
  char_count integer not null default 0,
  generated_by text not null default 'ai' check (generated_by in ('ai','manual')),
  starred boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  created_by_email text,
  source_prompt_hash text
);

create index if not exists campaign_templates_channel_idx
  on campaign_templates (channel, created_at desc)
  where archived_at is null;

create index if not exists campaign_templates_starred_idx
  on campaign_templates (starred, created_at desc)
  where starred = true and archived_at is null;

create index if not exists campaign_templates_program_idx
  on campaign_templates (program, created_at desc)
  where archived_at is null;

-- ============================================================================
-- 2) CAMPAIGN_GENERATIONS — observability for the generate endpoint
-- ============================================================================

create table if not exists campaign_generations (
  id bigserial primary key,
  channel text not null,
  program text not null,
  goal text not null,
  audience text,
  variations integer not null default 3,
  model text not null,
  tokens_in integer,
  tokens_out integer,
  duration_ms integer,
  generated_at timestamptz not null default now(),
  generated_by_email text,
  error text
);

create index if not exists campaign_generations_recent_idx
  on campaign_generations (generated_at desc);

-- ============================================================================
-- 3) RLS — server-side only (service role)
-- ============================================================================

alter table campaign_templates enable row level security;
alter table campaign_generations enable row level security;
-- (no policies = no anon access; server routes use the service role key)
