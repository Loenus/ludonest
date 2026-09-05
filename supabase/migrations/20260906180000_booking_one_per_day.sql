-- LudoNest — at most one active booking per player per day
--
-- A player may hold at most one pending/accepted booking on a given calendar
-- day (Europe/Rome), across every venue — one table a day, whichever venue or
-- time. Enforced in the app for a friendly error, and here so a race between
-- two quick submits (or two tabs) can't slip a second one through.
--
-- `timezone(text, timestamptz)` is only STABLE, not IMMUTABLE (named zones can
-- change), so index expressions need a small wrapper explicitly marked
-- immutable — the standard, widely-used workaround; tz rule changes are rare
-- enough not to matter here.
--
-- Idempotent: safe from the Supabase SQL editor as well as `supabase db push`.

set check_function_bodies = off;

create or replace function public.rome_date(ts timestamptz)
returns date
language sql
immutable
as $$
  select (timezone('Europe/Rome', ts))::date;
$$;

drop index if exists public.bookings_one_active_per_player_per_day;

create unique index bookings_one_active_per_player_per_day
  on public.bookings (player_id, public.rome_date(starts_at))
  where status in ('pending', 'accepted');
