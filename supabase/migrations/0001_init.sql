-- LudoNest — initial schema (Stage 1)
-- Users, venues, venue claims, bookings, events. RLS enabled on every table.
-- Timezone for "today" boundaries is resolved in application queries
-- (timezone('Europe/Rome', now())), not stored here.

-- Helper functions are defined after the tables they read; this also lets the
-- planner skip cross-object body validation during the migration.
set check_function_bodies = off;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role     as enum ('player', 'manager', 'superadmin');
create type public.venue_status  as enum ('active', 'suspended');
create type public.claim_status  as enum ('pending', 'approved', 'rejected');
create type public.booking_status as enum ('pending', 'accepted', 'declined', 'cancelled');

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  role       public.user_role not null default 'player',
  full_name  text,
  email      text,
  created_at timestamptz not null default now()
);

-- New auth user -> profile row. Role is ALWAYS 'player' here; manager status
-- only ever comes from an approved venue claim.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Nobody may change their own role (blocks self-escalation). The claim-approval
-- flow changes a *different* user's role via the service-role client, where
-- auth.uid() is null, so this check does not fire there.
create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'cannot change your own role';
  end if;
  return new;
end;
$$;

create trigger profiles_no_self_role_change
  before update on public.profiles
  for each row execute function public.prevent_self_role_change();

-- ---------------------------------------------------------------------------
-- venues (one manager <-> one venue via owner_id unique)
-- ---------------------------------------------------------------------------
create table public.venues (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid unique references public.profiles on delete set null,
  name         text not null,
  city         text not null,
  address      text not null,
  hours        text,
  total_tables int  not null default 0 check (total_tables >= 0),
  genres       text[] not null default '{}',
  description  text,
  rating       numeric(2, 1) check (rating is null or (rating >= 0 and rating <= 6)),
  status       public.venue_status not null default 'active',
  created_at   timestamptz not null default now()
);

create index venues_city_idx on public.venues (city);

-- ---------------------------------------------------------------------------
-- venue_claims (register-as-manager request; reviewed by a superadmin)
-- ---------------------------------------------------------------------------
create table public.venue_claims (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles on delete cascade,
  name         text not null,
  city         text not null,
  address      text not null,
  hours        text,
  description  text,
  status       public.claim_status not null default 'pending',
  reviewer_id  uuid references public.profiles on delete set null,
  reviewed_at  timestamptz,
  review_note  text,
  created_at   timestamptz not null default now()
);

-- At most one pending claim per requester.
create unique index venue_claims_one_pending_per_requester
  on public.venue_claims (requester_id)
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- bookings (the hot path)
-- ---------------------------------------------------------------------------
create table public.bookings (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues on delete cascade,
  player_id   uuid not null references public.profiles on delete cascade,
  starts_at   timestamptz not null,
  party_size  int not null check (party_size between 1 and 50),
  note        text,
  status      public.booking_status not null default 'pending',
  decided_by  uuid references public.profiles on delete set null,
  decided_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index bookings_venue_starts_idx  on public.bookings (venue_id, starts_at);
create index bookings_venue_pending_idx on public.bookings (venue_id, starts_at)
  where status = 'pending';
create index bookings_player_idx        on public.bookings (player_id, starts_at desc);

-- ---------------------------------------------------------------------------
-- events + participants (schema only in Stage 1 — no UI wiring yet)
-- ---------------------------------------------------------------------------
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues on delete cascade,
  title       text not null,
  starts_at   timestamptz not null,
  genre       text,
  seats_total int not null default 0 check (seats_total >= 0),
  created_at  timestamptz not null default now()
);

create index events_venue_starts_idx on public.events (venue_id, starts_at);

create table public.event_participants (
  event_id   uuid not null references public.events on delete cascade,
  profile_id uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- Authorization helpers (security definer -> bypass RLS, no recursion).
-- Defined here so the tables they read already exist.
-- ---------------------------------------------------------------------------
create or replace function public.current_app_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'superadmin', false);
$$;

create or replace function public.owns_venue(v uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.venues where id = v and owner_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.venues             enable row level security;
alter table public.venue_claims       enable row level security;
alter table public.bookings           enable row level security;
alter table public.events             enable row level security;
alter table public.event_participants enable row level security;

-- profiles ------------------------------------------------------------------
create policy profiles_select_own   on public.profiles for select
  using (id = auth.uid());
create policy profiles_select_admin on public.profiles for select
  using (public.is_superadmin());
create policy profiles_update_own   on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles for update
  using (public.is_superadmin()) with check (public.is_superadmin());

-- venues ------------------------------------------------------------------
create policy venues_select on public.venues for select
  using (status = 'active' or owner_id = auth.uid() or public.is_superadmin());
create policy venues_insert_admin on public.venues for insert
  with check (public.is_superadmin());
create policy venues_update on public.venues for update
  using (owner_id = auth.uid() or public.is_superadmin())
  with check (owner_id = auth.uid() or public.is_superadmin());

-- venue_claims ----------------------------------------------------------
create policy venue_claims_insert_own on public.venue_claims for insert
  with check (requester_id = auth.uid() and status = 'pending');
create policy venue_claims_select_own on public.venue_claims for select
  using (requester_id = auth.uid());
create policy venue_claims_select_admin on public.venue_claims for select
  using (public.is_superadmin());
create policy venue_claims_update_admin on public.venue_claims for update
  using (public.is_superadmin()) with check (public.is_superadmin());

-- bookings ------------------------------------------------------------------
create policy bookings_insert_player on public.bookings for insert
  with check (player_id = auth.uid() and status = 'pending');
create policy bookings_select_player on public.bookings for select
  using (player_id = auth.uid());
create policy bookings_select_owner on public.bookings for select
  using (public.owns_venue(venue_id));
create policy bookings_select_admin on public.bookings for select
  using (public.is_superadmin());
-- player may only cancel their own still-pending request
create policy bookings_update_player on public.bookings for update
  using (player_id = auth.uid() and status = 'pending')
  with check (player_id = auth.uid() and status = 'cancelled');
-- venue owner decides (accept / decline / restore)
create policy bookings_update_owner on public.bookings for update
  using (public.owns_venue(venue_id)) with check (public.owns_venue(venue_id));
create policy bookings_update_admin on public.bookings for update
  using (public.is_superadmin()) with check (public.is_superadmin());

-- events ------------------------------------------------------------------
create policy events_select on public.events for select using (true);
create policy events_write_owner on public.events for all
  using (public.owns_venue(venue_id)) with check (public.owns_venue(venue_id));
create policy events_write_admin on public.events for all
  using (public.is_superadmin()) with check (public.is_superadmin());

-- event_participants ------------------------------------------------------
create policy ep_select_own on public.event_participants for select
  using (profile_id = auth.uid());
create policy ep_select_owner on public.event_participants for select
  using (exists (
    select 1 from public.events e
    where e.id = event_id and public.owns_venue(e.venue_id)
  ));
create policy ep_insert_own on public.event_participants for insert
  with check (profile_id = auth.uid());
create policy ep_delete_own on public.event_participants for delete
  using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Claim review (atomic) — callable only by a superadmin
-- ---------------------------------------------------------------------------
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

  insert into public.venues (owner_id, name, city, address, hours, description)
  values (c.requester_id, c.name, c.city, c.address, c.hours, c.description)
  returning id into new_venue_id;

  update public.profiles set role = 'manager' where id = c.requester_id;

  update public.venue_claims
     set status = 'approved', reviewer_id = auth.uid(),
         reviewed_at = now(), review_note = note
   where id = claim_id;

  return new_venue_id;
end;
$$;

create or replace function public.reject_venue_claim(claim_id uuid, note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_superadmin() then
    raise exception 'not authorized';
  end if;
  update public.venue_claims
     set status = 'rejected', reviewer_id = auth.uid(),
         reviewed_at = now(), review_note = note
   where id = claim_id and status = 'pending';
end;
$$;
