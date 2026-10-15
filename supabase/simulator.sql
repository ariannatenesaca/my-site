create table if not exists public.simulator_latest (
  key text primary key,
  problem jsonb not null,
  answer jsonb not null,
  candidates jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.simulator_latest enable row level security;

drop policy if exists "anyone can read" on public.simulator_latest;
drop policy if exists "anyone can insert" on public.simulator_latest;
drop policy if exists "anyone can update" on public.simulator_latest;

create policy "anyone can read" on public.simulator_latest
  for select using (true);
create policy "anyone can insert" on public.simulator_latest
  for insert with check (true);
create policy "anyone can update" on public.simulator_latest
  for update using (true);
