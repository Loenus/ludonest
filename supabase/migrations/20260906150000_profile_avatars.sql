-- LudoNest — player profile photo
--
-- A registered user may upload a small round profile photo (same treatment as
-- venue logos: cropped + resized client-side to a small webp) instead of the
-- generated default avatar. Files live in the public `avatars` Storage bucket
-- — never in the app bundle deployed to Cloudflare. `avatar_path` stores the
-- object path inside the bucket; NULL means "use the generated default".
--
-- Idempotent: safe from the Supabase SQL editor as well as `supabase db push`.

set check_function_bodies = off;

alter table public.profiles add column if not exists avatar_path text;

-- Storage bucket -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read; writes are owner-scoped: an object must live under a top-level
-- folder named with the uploader's uid ( "<uid>/<file>" ).
do $$
begin
  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'avatars_public_read') then
    create policy avatars_public_read on storage.objects
      for select using (bucket_id = 'avatars');
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'avatars_owner_insert') then
    create policy avatars_owner_insert on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'avatars_owner_update') then
    create policy avatars_owner_update on storage.objects
      for update to authenticated
      using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;

  if not exists (select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'avatars_owner_delete') then
    create policy avatars_owner_delete on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = (select auth.uid()::text)
      );
  end if;
end $$;
