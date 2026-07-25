-- Nothing ever closed a room, so every visit to /host left a row behind
-- forever. Rooms are disposable: a class is over long before five hours pass
-- without the Host touching the state.

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- The sweep filters on updated_at, which the touch trigger already maintains.
create index if not exists rooms_updated_at_idx on public.rooms (updated_at);

-- Hourly rather than daily: the same rows get deleted either way, but hourly
-- keeps each delete tiny and the table bounded, instead of one large sweep
-- holding locks once a day. Minute 17 avoids the top-of-the-hour stampede.
select
  cron.schedule(
    'expire-abandoned-rooms',
    '17 * * * *',
    $$delete from public.rooms where updated_at < now() - interval '5 hours'$$
  );

comment on index public.rooms_updated_at_idx is 'Supports the hourly expiry sweep in cron job expire-abandoned-rooms.';
