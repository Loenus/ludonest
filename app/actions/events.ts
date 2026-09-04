"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getManagedVenue, requireRole, requireUser } from "@/lib/auth";
import { mapPartnerVenue, type VenueLiteRow } from "@/lib/events";
import { toRomeISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { PartnerVenue } from "@/lib/types";

export interface EventFormState {
  error?: string;
  ok?: boolean;
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Empty optional fields arrive as "" — treat them as "not provided". */
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/** An unchecked checkbox is simply absent from the FormData. */
const checkbox = z.preprocess(
  (v) => v === "on" || v === "true" || v === true,
  z.boolean(),
);

const eventSchema = z.object({
  title: z.string().trim().min(3, { error: "Il titolo è troppo corto." }).max(120),
  description: z
    .string({ error: "La descrizione è obbligatoria." })
    .trim()
    .min(1, { error: "La descrizione è obbligatoria." })
    .max(4000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Data non valida." }),
  time: z.string().regex(/^\d{2}:\d{2}$/, { error: "Ora non valida." }),
  kind: z.enum(["gdr", "tavolo", "carte"], { error: "Tipo di evento non valido." }),
  minConsumption: z.preprocess(
    blankToUndefined,
    z.coerce
      .number({ error: "Importo non valido." })
      .min(0, { error: "L'importo non può essere negativo." })
      .max(999)
      .optional(),
  ),
  openToAll: checkbox,
  seatsLimited: checkbox,
  seatsTotal: z.preprocess(
    blankToUndefined,
    z.coerce.number().int().min(0).max(500).optional(),
  ),
});

type EventInput = z.infer<typeof eventSchema>;

function readForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    date: formData.get("date"),
    time: formData.get("time"),
    kind: formData.get("kind"),
    minConsumption: formData.get("minConsumption"),
    openToAll: formData.get("openToAll"),
    seatsLimited: formData.get("seatsLimited"),
    seatsTotal: formData.get("seatsTotal"),
  });
}

/**
 * The client sends partner venue IDs (from the search picker). Keep only
 * well-formed IDs that resolve to a real, active venue — never the manager's
 * own — so a crafted POST can't attach arbitrary rows.
 */
async function resolvePartnerVenueIds(
  supabase: Supabase,
  formData: FormData,
  ownVenueId: string,
): Promise<string[]> {
  const ids = [...new Set(formData.getAll("partnerVenueIds").map(String))]
    .filter((id) => UUID_RE.test(id) && id !== ownVenueId)
    .slice(0, 20);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("venues")
    .select("id")
    .in("id", ids)
    .eq("status", "active");
  const valid = new Set((data ?? []).map((r: { id: string }) => r.id));
  return ids.filter((id) => valid.has(id));
}

function toRow(data: EventInput, venueId: string, partnerVenueIds: string[]) {
  return {
    venue_id: venueId,
    title: data.title,
    description: data.description,
    starts_at: toRomeISO(data.date, data.time),
    kind: data.kind,
    min_consumption: data.minConsumption ?? null,
    open_to_all: data.openToAll,
    seats_limited: data.seatsLimited,
    seats_total: data.seatsLimited ? (data.seatsTotal ?? 0) : 0,
    partner_venue_ids: partnerVenueIds,
  };
}

/** Typeahead for the partner-venue picker: active venues by name. */
export async function searchPartnerVenues(query: string): Promise<PartnerVenue[]> {
  await requireRole("manager");
  const venue = await getManagedVenue();

  const q = query.trim().replace(/[%_\\]/g, "").slice(0, 80);
  if (q.length < 2) return [];

  const supabase = await createClient();
  let builder = supabase
    .from("venues")
    .select("id, name, city, logo_path")
    .eq("status", "active")
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(8);
  if (venue) builder = builder.neq("id", venue.id);

  const { data, error } = await builder;
  if (error || !data) return [];
  return (data as unknown as VenueLiteRow[]).map(mapPartnerVenue);
}

/** Create an event for the current manager's venue. */
export async function createEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireRole("manager");
  const venue = await getManagedVenue();
  if (!venue) return { error: "Nessun locale associato al tuo account." };

  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const supabase = await createClient();
  const partnerVenueIds = await resolvePartnerVenueIds(supabase, formData, venue.id);
  const { error } = await supabase
    .from("events")
    .insert(toRow(parsed.data, venue.id, partnerVenueIds));
  if (error) return { error: "Creazione dell'evento non riuscita. Riprova." };

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Edit an existing event. `eventId` is bound by the caller; the update is
 * scoped to the manager's own venue (RLS `events_write_owner` re-checks).
 */
export async function updateEvent(
  eventId: string,
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireRole("manager");
  const venue = await getManagedVenue();
  if (!venue) return { error: "Nessun locale associato al tuo account." };

  const parsed = readForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const supabase = await createClient();
  const partnerVenueIds = await resolvePartnerVenueIds(supabase, formData, venue.id);
  const { error } = await supabase
    .from("events")
    .update(toRow(parsed.data, venue.id, partnerVenueIds))
    .eq("id", eventId)
    .eq("venue_id", venue.id);
  if (error) return { error: "Salvataggio non riuscito. Riprova." };

  revalidatePath("/dashboard");
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/*  Participation (public event page)                                  */
/* ------------------------------------------------------------------ */

export interface JoinState {
  error?: string;
  ok?: boolean;
}

/** A registered user joins an event. Identity comes from the session. */
export async function joinEvent(eventId: string): Promise<JoinState> {
  const session = await requireUser();
  const supabase = await createClient();

  const { data: ev } = await supabase
    .from("events")
    .select("starts_at, seats_limited, seats_total, seats_taken")
    .eq("id", eventId)
    .maybeSingle();
  if (!ev) return { error: "Evento non trovato." };
  if (new Date(ev.starts_at as string).getTime() < Date.now()) {
    return { error: "L'evento è già iniziato." };
  }
  if (ev.seats_limited && (ev.seats_taken as number) >= (ev.seats_total as number)) {
    return { error: "L'evento è al completo." };
  }

  const { error } = await supabase
    .from("event_participants")
    .insert({ event_id: eventId, profile_id: session.userId });
  // 23505 = unique_violation: already joined, treat as success.
  if (error && error.code !== "23505") {
    return { error: "Iscrizione non riuscita. Riprova." };
  }

  revalidatePath(`/eventi/${eventId}`);
  revalidatePath("/eventi");
  return { ok: true };
}

/** Undo participation. */
export async function leaveEvent(eventId: string): Promise<JoinState> {
  const session = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("profile_id", session.userId);
  if (error) return { error: "Operazione non riuscita. Riprova." };

  revalidatePath(`/eventi/${eventId}`);
  revalidatePath("/eventi");
  return { ok: true };
}

/** Delete one of the manager's own events. */
export async function deleteEvent(eventId: string): Promise<void> {
  await requireRole("manager");
  const venue = await getManagedVenue();
  if (!venue) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("venue_id", venue.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
}
