"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getManagedVenue, requireRole } from "@/lib/auth";
import {
  getPastPlayerBookings,
  getPastVenueBookings,
  type PastPage,
  type PastPlayerPage,
} from "@/lib/bookings";
import { dayKey, toRomeISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

export interface BookingFormState {
  error?: string;
  ok?: boolean;
}

const ONE_PER_DAY_MESSAGE =
  "Hai già una prenotazione per questo giorno. Puoi averne una sola al giorno, in qualsiasi locale.";

const requestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Data non valida." }),
  time: z.string().regex(/^\d{2}:\d{2}$/, { error: "Ora non valida." }),
  partySize: z.coerce.number().int().min(1, { error: "Almeno 1 persona." }).max(50),
  note: z.string().trim().max(500).optional(),
});

/** Player requests a table. `venueId` is bound by the caller. */
export async function requestBooking(
  venueId: string,
  _prev: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const session = await requireRole("player");

  const parsed = requestSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
    partySize: formData.get("partySize"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const startsAt = toRomeISO(parsed.data.date, parsed.data.time);
  if (new Date(startsAt).getTime() < Date.now()) {
    return { error: "Scegli una data e un'ora futura." };
  }

  const supabase = await createClient();

  // One table a day, whichever venue or time — any other still-active
  // booking (pending or accepted) on the same calendar day blocks a new one.
  const { data: active } = await supabase
    .from("bookings")
    .select("starts_at")
    .eq("player_id", session.userId)
    .in("status", ["pending", "accepted"]);
  if ((active ?? []).some((b) => dayKey(b.starts_at) === parsed.data.date)) {
    return { error: ONE_PER_DAY_MESSAGE };
  }

  const { error } = await supabase.from("bookings").insert({
    venue_id: venueId,
    player_id: session.userId,
    starts_at: startsAt,
    party_size: parsed.data.partySize,
    note: parsed.data.note ?? null,
  });

  if (error) {
    // 23505 = unique_violation — the DB-level guard against a race between
    // two near-simultaneous requests for the same day.
    if (error.code === "23505") return { error: ONE_PER_DAY_MESSAGE };
    return { error: "Invio della richiesta non riuscito. Riprova." };
  }

  revalidatePath("/app");
  return { ok: true };
}

async function decide(bookingId: string, status: Exclude<BookingStatus, "cancelled">) {
  const session = await requireRole("manager");
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      status,
      decided_by: status === "pending" ? null : session.userId,
      decided_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function acceptBooking(bookingId: string) {
  await decide(bookingId, "accepted");
}
export async function declineBooking(bookingId: string) {
  await decide(bookingId, "declined");
}
export async function restoreBooking(bookingId: string) {
  await decide(bookingId, "pending");
}

/**
 * The player cancels their own still-pending request — deleted outright, not
 * soft-marked, so it disappears from their history and frees up the day.
 */
export async function cancelBooking(bookingId: string): Promise<void> {
  const session = await requireRole("player");
  const supabase = await createClient();
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("player_id", session.userId)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  revalidatePath("/app");
}

/** Archive pager for the manager dashboard. */
export async function loadPastBookings(cursor?: string): Promise<PastPage> {
  await requireRole("manager");
  const venue = await getManagedVenue();
  if (!venue) return { bookings: [], nextCursor: null };
  return getPastVenueBookings(venue.id, cursor);
}

/** Archive pager for the player's own profile. */
export async function loadPastPlayerBookings(cursor?: string): Promise<PastPlayerPage> {
  const session = await requireRole("player");
  return getPastPlayerBookings(session.userId, cursor);
}
