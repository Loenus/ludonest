-- LudoNest — live bookings for the manager dashboard
--
-- Publish `bookings` row changes on the `supabase_realtime` publication so the
-- "Prenotazioni" tab updates the moment a player sends a request or a status
-- changes — no manual reload. RLS still governs what each subscriber receives,
-- and the client only uses the event as a trigger to re-run the server query.
--
-- Idempotent: safe from the Supabase SQL editor as well as `supabase db push`.

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.bookings;
exception
  when duplicate_object then null;
end $$;

-- Full old row on UPDATE/DELETE so realtime filters and payloads are complete.
alter table public.bookings replica identity full;
