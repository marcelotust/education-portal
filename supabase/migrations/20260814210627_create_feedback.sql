-- Contact/feedback inbox for EduParty (#55): suggestions, new-game requests,
-- and bug reports, submitted through the /contact page. No email or nickname
-- is collected, matching the no-PII stance already in the Privacy Policy —
-- `submitted_by` exists only so Marcelo can trace abuse, never shown to anyone.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('SUGGESTION', 'GAME_REQUEST', 'BUG')),
  message text not null check (char_length(message) between 1 and 2000),
  submitted_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.feedback is 'Suggestions, game requests, and bug reports submitted from /contact.';

grant insert on table public.feedback to authenticated;

alter table public.feedback enable row level security;

-- Write-only from the client: no select policy, so nobody can read anyone
-- else's submission through the API. Marcelo reads the table directly via
-- `supabase db query --linked`, which bypasses RLS.
create policy "Signed-in users can submit feedback"
on public.feedback
for insert
to authenticated
with check ((select auth.uid()) = submitted_by);
