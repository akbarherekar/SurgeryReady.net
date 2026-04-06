-- ═══════════════════════════════════════════════════════════════
-- SurgeryReady — Supabase Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  first_name  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. PLANS TABLE
create table if not exists public.plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  plan_hash   text not null,
  plan_data   jsonb not null,
  plan_output jsonb not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.plans enable row level security;

create policy "Users can read own plans"
  on public.plans for select
  using (auth.uid() = user_id);

create policy "Users can insert own plans"
  on public.plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own plans"
  on public.plans for update
  using (auth.uid() = user_id);


-- 3. PROGRESS TABLE
create table if not exists public.progress (
  id            uuid primary key default gen_random_uuid(),
  plan_id       uuid references public.plans(id) on delete cascade not null,
  item_key      text not null,
  completed     boolean default false,
  step_states   jsonb default '{}',
  logged_values jsonb default '[]',
  updated_at    timestamptz default now(),
  unique(plan_id, item_key)
);

alter table public.progress enable row level security;

create policy "Users can read own progress"
  on public.progress for select
  using (
    exists (
      select 1 from public.plans
      where plans.id = progress.plan_id
      and plans.user_id = auth.uid()
    )
  );

create policy "Users can insert own progress"
  on public.progress for insert
  with check (
    exists (
      select 1 from public.plans
      where plans.id = progress.plan_id
      and plans.user_id = auth.uid()
    )
  );

create policy "Users can update own progress"
  on public.progress for update
  using (
    exists (
      select 1 from public.plans
      where plans.id = progress.plan_id
      and plans.user_id = auth.uid()
    )
  );

-- 4. INDEXES
create index if not exists idx_plans_user_id on public.plans(user_id);
create index if not exists idx_plans_hash on public.plans(user_id, plan_hash);
create index if not exists idx_progress_plan_id on public.progress(plan_id);
