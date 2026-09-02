import "server-only";

import { createClient } from "@/lib/supabase/server";
import { todayStartRomeISO } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

const SELECT =
  "id, venue_id, player_id, starts_at, party_size, note, status, decided_at, created_at, profiles!bookings_player_id_fkey(full_name)";

interface BookingRow {
  id: string;
  venue_id: string;
  player_id: string;
  starts_at: string;
  party_size: number;
  note: string | null;
  status: BookingStatus;
  decided_at: string | null;
  created_at: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
}

export function mapBooking(row: BookingRow): Booking {
  const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    venueId: row.venue_id,
    playerId: row.player_id,
    playerName: prof?.full_name?.trim() || "Giocatore",
    startsAt: row.starts_at,
    partySize: row.party_size,
    note: row.note,
    status: row.status,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
  };
}

/** Today + future bookings for a venue (any status), soonest first. */
export async function getVenueBookingsFromToday(venueId: string): Promise<Booking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(SELECT)
    .eq("venue_id", venueId)
    .gte("starts_at", todayStartRomeISO())
    .order("starts_at", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as BookingRow[]).map(mapBooking);
}

export interface PastPage {
  bookings: Booking[];
  nextCursor: string | null;
}

/** Paginated archive: bookings before today, most recent first. */
export async function getPastVenueBookings(
  venueId: string,
  cursor?: string,
  limit = 50,
): Promise<PastPage> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(SELECT)
    .eq("venue_id", venueId)
    .lt("starts_at", cursor ?? todayStartRomeISO())
    .order("starts_at", { ascending: false })
    .limit(limit + 1);
  if (error || !data) return { bookings: [], nextCursor: null };

  const rows = (data as unknown as BookingRow[]).map(mapBooking);
  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  return {
    bookings: page,
    nextCursor: hasMore ? page[page.length - 1].startsAt : null,
  };
}
