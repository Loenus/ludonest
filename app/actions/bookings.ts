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
import { toRomeISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

export interface BookingFormState {
  error?: string;
  ok?: boolean;
}

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
  const { error } = await supabase.from("bookings").insert({
    venue_id: venueId,
    player_id: session.userId,
    starts_at: startsAt,
    party_size: parsed.data.partySize,
    note: parsed.data.note ?? null,
  });

  if (error) return { error: "Invio della richiesta non riuscito. Riprova." };
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
