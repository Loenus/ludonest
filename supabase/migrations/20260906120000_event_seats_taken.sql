-- LudoNest — public events pages: denormalised participant tally
--
-- Split out of 20260906090000 so it still applies on databases where that
-- migration already ran. `event_participants` is only readable by the
-- participant and the venue owner (RLS), but the public /eventi pages need
-- "posti liberi" and `events` is world-readable — so keep a counter on the
-- event row, synced by trigger.
--
-- Idempotent: safe from the Supabase SQL editor as well as `supabase db push`.

set check_function_bodies = off;

-- Guard against an earlier draft of 20260906090000 that used a free-text
-- `partner_venues` column instead of `partner_venue_ids`.
alter table public.events
  add column if not exists partner_venue_ids uuid[] not null default '{}';
alter table public.events drop column if exists partner_venues;

alter table public.events
  add column if not exists seats_taken int not null default 0
    check (seats_taken >= 0);

-- ---------------------------------------------------------------------------
-- Keep events.seats_taken in step with event_participants
-- ---------------------------------------------------------------------------
create or replace function public.sync_event_seats_taken()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.events set seats_taken = seats_taken + 1 where id = new.event_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.events set seats_taken = greatest(seats_taken - 1, 0) where id = old.event_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists event_participants_seats_ins on public.event_participants;
drop trigger if exists event_participants_seats_del on public.event_participants;

create trigger event_participants_seats_ins
  after insert on public.event_participants
  for each row execute function public.sync_event_seats_taken();

create trigger event_participants_seats_del
  after delete on public.event_participants
  for each row execute function public.sync_event_seats_taken();

-- Backfill existing rows.
update public.events e
   set seats_taken = (
     select count(*) from public.event_participants p where p.event_id = e.id
   )
 where e.seats_taken is distinct from (
   select count(*) from public.event_participants p where p.event_id = e.id
 );
