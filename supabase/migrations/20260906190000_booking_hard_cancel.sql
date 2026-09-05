-- LudoNest — cancelling a booking deletes it, rather than soft-marking it
--
-- The player wants a cancelled booking to actually disappear — from the DB,
-- and therefore from their own history and the manager's dashboard — not
-- just be hidden behind a "cancelled" status. Replaces the old "cancel by
-- updating status" policy with a delete policy scoped the same way: only
-- your own still-pending booking.
--
-- Idempotent: safe from the Supabase SQL editor as well as `supabase db push`.

drop policy if exists bookings_update_player on public.bookings;
drop policy if exists bookings_delete_player on public.bookings;

create policy bookings_delete_player on public.bookings for delete
  using (player_id = auth.uid() and status = 'pending');

-- One-time cleanup: remove rows soft-cancelled before this migration.
delete from public.bookings where status = 'cancelled';
