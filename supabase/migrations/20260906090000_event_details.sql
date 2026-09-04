-- LudoNest — event details for the manager events CRUD
--
-- The `events` table has existed since the init migration but had no UI. The
-- venue manager can now create / edit / delete events, modelled on a real
-- open-day signup form: a free-text description plus a handful of structured
-- fields — kind, start (date + time), minimum consumption, "open to everyone",
-- limited seats, and the partner venues that host the event (references into
-- `venues`, picked from a search — not free text).
--
-- Idempotent: safe from the Supabase SQL editor as well as `supabase db push`.

set check_function_bodies = off;

-- Event kind: role-playing game / board game / card game.
do $$
begin
  create type public.event_kind as enum ('gdr', 'tavolo', 'carte');
exception
  when duplicate_object then null;
end $$;

alter table public.events
  add column if not exists description     text,
  add column if not exists kind            public.event_kind not null default 'tavolo',
  add column if not exists min_consumption numeric(6, 2)
    check (min_consumption is null or min_consumption >= 0),
  add column if not exists open_to_all     boolean not null default true,
  add column if not exists seats_limited   boolean not null default false,
  add column if not exists partner_venue_ids uuid[] not null default '{}';

-- `genre` (free text) is superseded by the structured `kind`.
alter table public.events drop column if exists genre;
