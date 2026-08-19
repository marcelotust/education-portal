-- Cheap defense-in-depth against a bot flooding either write path (#128).
-- RLS on both tables only checks identity (auth.uid() = submitted_by / host_id),
-- never volume — and anonymous sessions are trivial to regenerate, so per-identity
-- limits alone would not stop a script that signs in fresh each request. These
-- triggers reject at the database layer regardless of how the insert arrives
-- (the app's own form, or a direct call to the Supabase REST API), which a
-- client-side honeypot on its own cannot do.
--
-- feedback: a global window. Real contact-form submissions are rare even during
-- a traffic spike (it is an opt-in secondary action, not the app's core CTA), so
-- capping total volume site-wide is safe and simplest.
--
-- rooms: a per-host_id window instead of global. Room creation IS the core CTA —
-- a real launch spike (Product Hunt, Reddit, see #93) can mean many different
-- people each creating one room within the same few minutes, which a global cap
-- would misread as an attack and block. Limiting per host_id stops one bot
-- identity from hammering the endpoint without punishing everyone else's
-- legitimate room creation.

create or replace function public.enforce_feedback_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.feedback
  where created_at > now() - interval '10 minutes';

  if recent_count >= 10 then
    raise exception 'Too many messages submitted recently. Please try again later.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger feedback_rate_limit
before insert on public.feedback
for each row
execute function public.enforce_feedback_rate_limit();

create or replace function public.enforce_room_creation_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.rooms
  where host_id = new.host_id
    and created_at > now() - interval '10 minutes';

  if recent_count >= 5 then
    raise exception 'Too many rooms created recently. Please try again in a few minutes.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger rooms_rate_limit
before insert on public.rooms
for each row
execute function public.enforce_room_creation_rate_limit();
