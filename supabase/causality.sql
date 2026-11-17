-- The causality auditor's memory (Challenge 4). Run this in the Supabase
-- dashboard: SQL Editor -> New query -> paste this whole file -> Run.
-- Expect "Success. No rows returned." Safe to run more than once.

drop table if exists public.causality_latest cascade;

create table public.causality_latest (
  key text primary key,
  probe jsonb not null,
  answer jsonb not null,
  summary jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.causality_latest enable row level security;

create policy "anyone can read" on public.causality_latest
  for select using (true);
create policy "anyone can insert" on public.causality_latest
  for insert with check (true);
create policy "anyone can update" on public.causality_latest
  for update using (true);

grant select, insert, update on public.causality_latest to anon;
