-- LudoNest — venue logo / profile picture
--
-- Managers may upload a small round logo (Instagram-style). Files live in the
-- public `venue-logos` Storage bucket — NEVER in the app bundle deployed to
-- Cloudflare — and are cropped + resized to 400x400 client-side (~15 KB each)
-- before upload. `logo_path` stores the object path inside the bucket; a NULL
-- value means "use the generated default" (a deterministic themed SVG that the
-- app renders on the fly, no storage, no library).
--
-- Idempotent: safe from the Supabase SQL editor as well as `supabase db push`.

set check_function_bodies = off;

alter table public.venues       add column if not exists logo_path text;
alter table public.venue_claims add column if not exists logo_path text;

-- Storage bucket -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('venue-logos', 'venue-logos', true)
on conflict (id) do nothing;

-- Public read; writes are owner-scoped: an object must live under a top-level
-- folder named with the uploader's uid ( "<uid>/<file>" ).
do $$
begin
  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'venue_logos_public_read') then
    create policy venue_logos_public_read on storage.objects
      for select using (bucket_id = 'venue-logos');
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'venue_logos_owner_insert') then
    create policy venue_logos_owner_insert on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'venue-logos'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'venue_logos_owner_update') then
    create policy venue_logos_owner_update on storage.objects
      for update to authenticated
      using (
        bucket_id = 'venue-logos'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'venue_logos_owner_delete') then
    create policy venue_logos_owner_delete on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'venue-logos'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;
end $$;

-- Carry the logo from an approved claim through to the new venue -------------
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

  insert into public.venues
    (owner_id, name, city, address, hours, description, lat, lng, logo_path)
  values
    (c.requester_id, c.name, c.city, c.address, c.hours, c.description, c.lat, c.lng, c.logo_path)
  returning id into new_venue_id;

  update public.profiles set role = 'manager' where id = c.requester_id;

  update public.venue_claims
     set status = 'approved', reviewer_id = auth.uid(),
         reviewed_at = now(), review_note = note
   where id = claim_id;

  return new_venue_id;
end;
$$;
