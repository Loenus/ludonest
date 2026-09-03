-- LudoNest — structured address + opening hours
--
-- `hours` moves from free text to `jsonb` (the WeeklyHours shape:
--   { mon: { closed, open, close }, … } — validated in the app layer with zod).
-- Venues and claims also gain `lat` / `lng` from the address autocomplete,
-- for upcoming map / distance features.
--
-- Existing free-text `hours` values are dropped (Stage 1 demo data only);
-- re-run `supabase db reset` to reload the structured seed.
--
-- Written idempotently so it is safe to apply from the Supabase SQL editor
-- (which does not track migrations) as well as via `supabase db push`.

set check_function_bodies = off;

-- venues.hours : text -> jsonb (only if not already converted) ----------------
do $$
begin
  if (
    select data_type from information_schema.columns
    where table_schema = 'public' and table_name = 'venues' and column_name = 'hours'
  ) is distinct from 'jsonb' then
    alter table public.venues alter column hours type jsonb using null::jsonb;
  end if;
end $$;

alter table public.venues add column if not exists lat double precision;
alter table public.venues add column if not exists lng double precision;

-- venue_claims.hours : text -> jsonb -----------------------------------------
do $$
begin
  if (
    select data_type from information_schema.columns
    where table_schema = 'public' and table_name = 'venue_claims' and column_name = 'hours'
  ) is distinct from 'jsonb' then
    alter table public.venue_claims alter column hours type jsonb using null::jsonb;
  end if;
end $$;

alter table public.venue_claims add column if not exists lat double precision;
alter table public.venue_claims add column if not exists lng double precision;

-- Recreate the approval RPC so coordinates flow from claim -> venue.
create or replace function public.approve_venue_claim(claim_id uuid, note text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.venue_claims;
  new_venue_id uuid;
begin
  if not public.is_superadmin() then
    raise exception 'not authorized';
  end if;

  select * into c from public.venue_claims where id = claim_id for update;
  if not found then raise exception 'claim not found'; end if;
  if c.status <> 'pending' then raise exception 'claim already reviewed'; end if;
  if exists (select 1 from public.venues where owner_id = c.requester_id) then
    raise exception 'requester already owns a venue';
  end if;

  insert into public.venues (owner_id, name, city, address, hours, description, lat, lng)
  values (c.requester_id, c.name, c.city, c.address, c.hours, c.description, c.lat, c.lng)
  returning id into new_venue_id;

  update public.profiles set role = 'manager' where id = c.requester_id;

  update public.venue_claims
     set status = 'approved', reviewer_id = auth.uid(),
         reviewed_at = now(), review_note = note
   where id = claim_id;

  return new_venue_id;
end;
$$;
