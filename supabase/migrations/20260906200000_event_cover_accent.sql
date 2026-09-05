-- LudoNest — event page personalisation: cover image + accent colour
--
-- A manager can brand an event's public page like it were their own: a wide
-- cover photo and an accent colour used for the date, the primary action and
-- highlights. Both optional — the page falls back to a themed gradient and the
-- app's amber.
--
-- Cover files live in the public `event-covers` Storage bucket (never in the
-- deployed bundle), client-side cropped to a banner and re-encoded to webp so
-- Storage/bandwidth stay inside the free tier.
--
-- Idempotent: safe from the Supabase SQL editor as well as `supabase db push`.

set check_function_bodies = off;

alter table public.events
  add column if not exists cover_path   text,
  add column if not exists accent_color text
    check (accent_color is null or accent_color ~ '^#[0-9A-Fa-f]{6}$');

-- Storage bucket -----------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

-- Public read; writes are owner-scoped: an object must live under a top-level
-- folder named with the uploader's uid ("<uid>/<file>").
do $$
begin
  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'event_covers_public_read') then
    create policy event_covers_public_read on storage.objects
      for select using (bucket_id = 'event-covers');
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'event_covers_owner_insert') then
    create policy event_covers_owner_insert on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'event-covers'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'event_covers_owner_update') then
    create policy event_covers_owner_update on storage.objects
      for update to authenticated
      using (
        bucket_id = 'event-covers'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'event_covers_owner_delete') then
    create policy event_covers_owner_delete on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'event-covers'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;
end $$;
