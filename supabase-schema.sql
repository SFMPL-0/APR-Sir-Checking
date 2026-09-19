-- ============================================================================
-- Freight Profit & Tax Calculator — Supabase schema
-- Run this once in your project's SQL Editor:
-- https://supabase.com/dashboard/project/hvqgxbxzzbyklzyerfpf/sql/new
--
-- Scale note: at ~20-30 calculations/day, calculation_history reaches
-- roughly 35,000-55,000 rows over 5 years. Each row is small (a few KB of
-- JSON), so this stays well within Postgres/Supabase limits for row count
-- and B-tree index lookups (an index makes a lookup roughly O(log n),
-- so going from 5,000 to 5,000,000 rows barely changes query time). The
-- indexes below are chosen specifically so listing/searching that much
-- history stays fast rather than degrading as it grows.
-- ============================================================================

-- 1) Key/value table for the "current" working state: the active input,
--    expenses, interest tranches, TDS settings, general settings and the
--    scenario list. One row per key.
create table if not exists public.app_state (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2) One row per saved trip/calculation snapshot (History tab).
create table if not exists public.saved_calculations (
  id                text primary key,
  name              text not null,
  trip_number       text,
  notes             text,
  input             jsonb not null,
  expenses          jsonb not null,
  interest_tranches jsonb not null,
  tds_settings      jsonb not null,
  general_settings  jsonb not null,
  result            jsonb not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_saved_calculations_created_at
  on public.saved_calculations (created_at desc);

create index if not exists idx_saved_calculations_trip_number
  on public.saved_calculations (trip_number);

-- 3) Automatic, unnamed log of every calculation performed. Written in the
--    background (debounced) whenever the numbers settle, independent of the
--    explicit "Save Current Trip" button, so nothing is ever lost even if
--    the user forgets to save. This is what powers the "Auto Log" tab.
--
--    At ~20-30 entries/day this reaches ~35,000-55,000 rows over 5 years.
--    trip_number/selling_price/buying_price/net_profit are stored as plain
--    indexed columns (not just inside the `result` JSONB) specifically so
--    that listing, searching and paging through years of history stays fast
--    without Postgres having to parse JSON on every row.
create table if not exists public.calculation_history (
  id                text primary key,
  trip_number       text,
  selling_price     numeric,
  buying_price      numeric,
  net_profit        numeric,
  input             jsonb not null,
  expenses          jsonb not null,
  interest_tranches jsonb not null,
  tds_settings      jsonb not null,
  general_settings  jsonb not null,
  result            jsonb not null,
  created_at        timestamptz not null default now()
);

-- If you created this table with the earlier version of this schema
-- (before trip_number/selling_price/buying_price/net_profit existed),
-- run this to add the missing columns without losing any data:
alter table public.calculation_history add column if not exists trip_number text;
alter table public.calculation_history add column if not exists selling_price numeric;
alter table public.calculation_history add column if not exists buying_price numeric;
alter table public.calculation_history add column if not exists net_profit numeric;

-- Primary access pattern: "give me the latest page of history" and
-- "give me everything older than the last row I already have" (keyset
-- pagination) — both satisfied by a single descending index on created_at.
create index if not exists idx_calculation_history_created_at
  on public.calculation_history (created_at desc);

-- Lets "search by trip/LR number" run as an index lookup instead of a full
-- table scan once you have tens of thousands of rows.
create index if not exists idx_calculation_history_trip_number
  on public.calculation_history (trip_number);

-- ============================================================================
-- Row Level Security
--
-- The app talks to Supabase using the public "anon" (publishable) key, which
-- is embedded in the JS bundle and visible to anyone who opens the app.
-- There is no login system, so this schema treats the data as belonging to
-- a single trusted user/team rather than per-account data. RLS is still
-- enabled with explicit policies (rather than left off) so access is a
-- deliberate, visible choice here instead of a Supabase security-advisor
-- warning you have to silence later.
--
-- If you ever make this app public-facing or multi-user, add Supabase Auth
-- and rewrite these policies to filter by auth.uid() instead of "true".
-- ============================================================================

alter table public.app_state enable row level security;
alter table public.saved_calculations enable row level security;
alter table public.calculation_history enable row level security;

drop policy if exists "app_state_select" on public.app_state;
create policy "app_state_select" on public.app_state
  for select using (true);

drop policy if exists "app_state_insert" on public.app_state;
create policy "app_state_insert" on public.app_state
  for insert with check (true);

drop policy if exists "app_state_update" on public.app_state;
create policy "app_state_update" on public.app_state
  for update using (true) with check (true);

drop policy if exists "saved_calculations_select" on public.saved_calculations;
create policy "saved_calculations_select" on public.saved_calculations
  for select using (true);

drop policy if exists "saved_calculations_insert" on public.saved_calculations;
create policy "saved_calculations_insert" on public.saved_calculations
  for insert with check (true);

drop policy if exists "saved_calculations_update" on public.saved_calculations;
create policy "saved_calculations_update" on public.saved_calculations
  for update using (true) with check (true);

drop policy if exists "saved_calculations_delete" on public.saved_calculations;
create policy "saved_calculations_delete" on public.saved_calculations
  for delete using (true);

drop policy if exists "calculation_history_select" on public.calculation_history;
create policy "calculation_history_select" on public.calculation_history
  for select using (true);

drop policy if exists "calculation_history_insert" on public.calculation_history;
create policy "calculation_history_insert" on public.calculation_history
  for insert with check (true);

drop policy if exists "calculation_history_delete" on public.calculation_history;
create policy "calculation_history_delete" on public.calculation_history
  for delete using (true);
