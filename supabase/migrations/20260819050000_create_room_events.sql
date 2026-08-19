-- Append-only room lifecycle log (#125). `public.rooms` is deleted by the
-- hourly expiry sweep, so it can never answer "how many rooms have ever
-- been created" — this table is the only place that number survives.

create table public.room_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('ROOM_CREATED')),
  pin text not null,
  host_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.room_events is 'Append-only room lifecycle log (#125); read only via supabase db query --linked.';

create index room_events_created_at_idx on public.room_events (created_at);

-- The Data API does not expose new tables automatically, so grant explicitly.
grant insert on table public.room_events to authenticated;

alter table public.room_events enable row level security;

-- Write-only from the client, same shape as public.feedback: no select
-- policy, so nobody can read this through the API — Marcelo reads it
-- directly via `supabase db query --linked`, which bypasses RLS.
create policy "Host logs its own room events"
on public.room_events
for insert
to authenticated
with check ((select auth.uid()) = host_id);
