import "server-only";

import { cache } from "react";

import { todayStartRomeISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventKind, ManagerEvent, PartnerVenue, Session } from "@/lib/types";

const EVENT_FIELDS =
  "id, venue_id, title, description, starts_at, kind, min_consumption, open_to_all, seats_limited, seats_total, seats_taken, partner_venue_ids, created_at";

interface EventRow {
  id: string;
  venue_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  kind: EventKind;
  min_consumption: number | string | null;
  open_to_all: boolean;
  seats_limited: boolean;
  seats_total: number;
  seats_taken: number;
  partner_venue_ids: string[] | null;
  created_at: string;
}

export function mapEvent(
  row: EventRow,
  partners: Map<string, PartnerVenue>,
): ManagerEvent {
  return {
    id: row.id,
    venueId: row.venue_id,
    title: row.title,
    description: row.description ?? "",
    startsAt: row.starts_at,
    kind: row.kind,
    minConsumption: row.min_consumption == null ? null : Number(row.min_consumption),
    openToAll: row.open_to_all,
    seatsLimited: row.seats_limited,
    seatsTotal: row.seats_total,
    seatsTaken: row.seats_taken,
    seatsLeft: row.seats_limited
      ? Math.max(row.seats_total - row.seats_taken, 0)
      : null,
    partnerVenues: (row.partner_venue_ids ?? [])
      .map((id) => partners.get(id))
      .filter((v): v is PartnerVenue => Boolean(v)),
    createdAt: row.created_at,
  };
}

export interface VenueLiteRow {
  id: string;
  name: string;
  city: string;
  logo_path: string | null;
}

export function mapPartnerVenue(row: VenueLiteRow): PartnerVenue {
  return { id: row.id, name: row.name, city: row.city, logoPath: row.logo_path ?? null };
}

/** Build the `id -> PartnerVenue` lookup for a set of events. */
async function loadPartnerVenues(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: EventRow[],
): Promise<Map<string, PartnerVenue>> {
  const ids = [...new Set(rows.flatMap((r) => r.partner_venue_ids ?? []))];
  const map = new Map<string, PartnerVenue>();
  if (ids.length === 0) return map;

  const { data } = await supabase
    .from("venues")
    .select("id, name, city, logo_path")
    .in("id", ids);
  for (const v of (data ?? []) as VenueLiteRow[]) map.set(v.id, mapPartnerVenue(v));
  return map;
}

/* ------------------------------------------------------------------ */
/*  Manager dashboard                                                  */
/* ------------------------------------------------------------------ */

/** Every event for a venue, soonest first, with partner venues resolved. */
export async function listVenueEvents(venueId: string): Promise<ManagerEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_FIELDS)
    .eq("venue_id", venueId)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("listVenueEvents:", error.message);
    return [];
  }
  if (!data) return [];
  const rows = data as unknown as EventRow[];
  const partners = await loadPartnerVenues(supabase, rows);
  return rows.map((r) => mapEvent(r, partners));
}

/* ------------------------------------------------------------------ */
/*  Public events pages                                                */
/* ------------------------------------------------------------------ */

export interface EventVenueRef {
  id: string;
  name: string;
  city: string;
  logoPath: string | null;
}

export interface PublicEvent extends ManagerEvent {
  venue: EventVenueRef;
}

interface PublicEventRow extends EventRow {
  venues: VenueLiteRow | VenueLiteRow[] | null;
}

const PUBLIC_EVENT_FIELDS = `${EVENT_FIELDS}, venues!events_venue_id_fkey(id, name, city, logo_path)`;

function mapPublicEvent(
  row: PublicEventRow,
  partners: Map<string, PartnerVenue>,
): PublicEvent | null {
  const v = Array.isArray(row.venues) ? row.venues[0] : row.venues;
  if (!v) return null; // suspended / hidden venue — drop from the public list
  return {
    ...mapEvent(row, partners),
    venue: { id: v.id, name: v.name, city: v.city, logoPath: v.logo_path ?? null },
  };
}

/** Upcoming events across every active venue, soonest first. */
export async function listPublicEvents(): Promise<PublicEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(PUBLIC_EVENT_FIELDS)
    .gte("starts_at", todayStartRomeISO())
    .order("starts_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("listPublicEvents:", error.message);
    return [];
  }
  if (!data) return [];
  const rows = data as unknown as PublicEventRow[];
  const partners = await loadPartnerVenues(supabase, rows);
  return rows
    .map((r) => mapPublicEvent(r, partners))
    .filter((e): e is PublicEvent => e !== null);
}

/** Memoised per request — `generateMetadata` and the page both read it. */
export const getPublicEvent = cache(
  async (id: string): Promise<PublicEvent | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select(PUBLIC_EVENT_FIELDS)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("getPublicEvent:", error.message);
      return null;
    }
    if (!data) return null;
    const row = data as unknown as PublicEventRow;
    const partners = await loadPartnerVenues(supabase, [row]);
    return mapPublicEvent(row, partners);
  },
);

export interface EventViewerState {
  /** The signed-in user has joined this event. */
  joined: boolean;
  /** The signed-in manager owns the venue hosting this event. */
  canManage: boolean;
}

export async function getEventViewerState(
  event: PublicEvent,
  session: Session | null,
): Promise<EventViewerState> {
  if (!session) return { joined: false, canManage: false };
  const supabase = await createClient();

  const { data: part } = await supabase
    .from("event_participants")
    .select("event_id")
    .eq("event_id", event.id)
    .eq("profile_id", session.userId)
    .maybeSingle();

  let canManage = false;
  if (session.role === "manager") {
    const { data: venue } = await supabase
      .from("venues")
      .select("id")
      .eq("id", event.venue.id)
      .eq("owner_id", session.userId)
      .maybeSingle();
    canManage = Boolean(venue);
  }

  return { joined: Boolean(part), canManage };
}
