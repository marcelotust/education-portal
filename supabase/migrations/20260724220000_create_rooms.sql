-- Persistent rooms for EduParty.
-- The whole FSM state lives in a single JSONB column so a cartridge swap never
-- drops the room, and Realtime broadcasts the row change to every Client.

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  -- 4-letter PIN students type to join. Uppercase, no ambiguous I/O.
  pin text not null unique check (pin ~ '^[A-HJ-NP-Z]{4}$'),
  host_id uuid not null references auth.users (id) on delete cascade,
  -- Mirrors the RoomState contract in src/types/room.ts.
  state jsonb not null default jsonb_build_object(
    'status', 'LOBBY_IDLE',
    'slots', jsonb_build_array(null, null, null, null, null, null),
    'selectedGameId', null,
    'currentRound', null
  ),
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.rooms is 'One persistent classroom per Host; state holds the room FSM.';

-- Students look rooms up by PIN on every join attempt.
create index rooms_pin_idx on public.rooms (pin) where is_open;
create index rooms_host_id_idx on public.rooms (host_id);

-- Keep updated_at honest without trusting the client.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger rooms_touch_updated_at
before update on public.rooms
for each row
execute function public.touch_updated_at();

-- The Data API does not expose new tables automatically, so grant explicitly.
grant select on table public.rooms to anon, authenticated;
grant insert, update, delete on table public.rooms to authenticated;

alter table public.rooms enable row level security;

-- Anyone signed in (students use anonymous auth) may read an open room:
-- Clients are read-only state listeners.
create policy "Signed-in users can read open rooms"
on public.rooms
for select
to authenticated
using (is_open);

-- Only the Host writes. This is the database-side twin of the Host-only
-- guard in RoomProvider.
create policy "Host creates its own room"
on public.rooms
for insert
to authenticated
with check ((select auth.uid()) = host_id);

create policy "Host updates its own room"
on public.rooms
for update
to authenticated
using ((select auth.uid()) = host_id)
with check ((select auth.uid()) = host_id);

create policy "Host deletes its own room"
on public.rooms
for delete
to authenticated
using ((select auth.uid()) = host_id);

-- Stream row changes to subscribed Clients.
alter publication supabase_realtime add table public.rooms;
