-- ═══════════════════════════════════════════════════════════════
-- SurgeryReady — Supabase Database Setup (Deidentified Access Codes)
--
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- After running, disable the Email auth provider:
--   Dashboard → Authentication → Sign In / Up → Email → disable.
--
-- Architecture:
--   * Plans are saved under a SHA-256 hash of a client-generated
--     access code (SR-XXXX-XXXX-XXXX). The plaintext code never
--     leaves the patient's browser; the server stores no names,
--     emails, accounts, or other identifiers.
--   * Anonymous clients have ZERO direct table access (RLS enabled
--     with no policies + explicit revoke). All reads/writes go
--     through the security-definer RPC functions below, called via
--     supabase.rpc() with the anon key.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. TEARDOWN (clean cutover from the email-auth schema) ──
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.progress;
drop table if exists public.plans;
drop table if exists public.profiles;

-- ── 2. ANON PLANS TABLE ──
create table public.anon_plans (
  code_hash    text primary key,             -- SHA-256 hex of access code; plaintext never stored
  plan_data    jsonb not null,               -- deidentified assessment answers (no firstName)
  plan_output  jsonb,                        -- null while the save is a partial (mid-assessment)
  current_step integer,                      -- 0-5 form step for partial saves; null when finished
  progress     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS with no policies denies all direct access; revoke is belt-and-suspenders.
alter table public.anon_plans enable row level security;
revoke all on table public.anon_plans from anon, authenticated, public;

-- ── 3. RPC FUNCTIONS (the only access path) ──

create or replace function public.save_plan(
  p_code_hash text,
  p_plan_data jsonb,
  p_plan_output jsonb default null,
  p_current_step integer default null,
  p_progress jsonb default null
) returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_code_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid code format';
  end if;
  if pg_column_size(p_plan_data) + coalesce(pg_column_size(p_plan_output), 0)
     + coalesce(pg_column_size(p_progress), 0) > 400000 then
    raise exception 'payload too large';
  end if;
  insert into public.anon_plans (code_hash, plan_data, plan_output, current_step, progress)
  values (p_code_hash, p_plan_data, p_plan_output, p_current_step, coalesce(p_progress, '{}'::jsonb))
  on conflict (code_hash) do update set
    plan_data    = excluded.plan_data,
    plan_output  = excluded.plan_output,
    current_step = excluded.current_step,
    progress     = coalesce(excluded.progress, anon_plans.progress),
    updated_at   = now();
end;
$$;

create or replace function public.load_plan(p_code_hash text)
returns table (plan_data jsonb, plan_output jsonb, current_step integer, progress jsonb)
language sql stable security definer set search_path = public
as $$
  select plan_data, plan_output, current_step, progress
  from public.anon_plans where code_hash = p_code_hash;
$$;

create or replace function public.save_progress(p_code_hash text, p_progress jsonb)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_found boolean;
begin
  if pg_column_size(p_progress) > 200000 then
    raise exception 'payload too large';
  end if;
  update public.anon_plans
     set progress = p_progress, updated_at = now()
   where code_hash = p_code_hash;
  get diagnostics v_found = row_count;
  return v_found;
end;
$$;

create or replace function public.delete_plan(p_code_hash text)
returns void
language sql security definer set search_path = public
as $$
  delete from public.anon_plans where code_hash = p_code_hash;
$$;

-- ── 4. FUNCTION GRANTS ──
revoke execute on function public.save_plan(text, jsonb, jsonb, integer, jsonb) from public;
revoke execute on function public.load_plan(text) from public;
revoke execute on function public.save_progress(text, jsonb) from public;
revoke execute on function public.delete_plan(text) from public;
grant execute on function public.save_plan(text, jsonb, jsonb, integer, jsonb) to anon, authenticated;
grant execute on function public.load_plan(text) to anon, authenticated;
grant execute on function public.save_progress(text, jsonb) to anon, authenticated;
grant execute on function public.delete_plan(text) to anon, authenticated;

-- ── 5. OPTIONAL HOUSEKEEPING ──
-- Purge partial saves untouched for a year (run manually or via pg_cron):
-- delete from public.anon_plans
--   where plan_output is null and updated_at < now() - interval '1 year';
