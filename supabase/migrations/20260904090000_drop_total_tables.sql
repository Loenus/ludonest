-- LudoNest — drop venues.total_tables
--
-- Per-venue table capacity is no longer modelled: bookings carry their own
-- party_size and the manager confirms or declines each request by hand. The
-- player search no longer has a "free tables" filter either.
--
-- Idempotent so it is safe to apply from the Supabase SQL editor as well as
-- via `supabase db push`.

alter table public.venues drop column if exists total_tables;
