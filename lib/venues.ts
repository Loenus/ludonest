import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isOpenNow, parseHours } from "@/lib/hours";
import type { Venue, VenueStatus } from "@/lib/types";

interface VenueRow {
  id: string;
  owner_id: string | null;
  name: string;
  city: string;
  address: string;
  hours: unknown;
  lat: number | null;
  lng: number | null;
  logo_path: string | null;
  genres: string[];
  description: string | null;
  rating: number | string | null;
  status: VenueStatus;
}

export function mapVenue(row: VenueRow): Venue {
  const hours = parseHours(row.hours);
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    hours,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    logoPath: row.logo_path ?? null,
    tags: row.genres ?? [],
    description: row.description ?? "",
    rating: row.rating == null ? null : Number(row.rating),
    status: row.status,
    ownerId: row.owner_id,
    openNow: isOpenNow(hours),
  };
}

/** Active venues, for the player search. Sorted by name (no geolocation yet). */
export async function listVenues(): Promise<Venue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("status", "active")
    .order("name");

  if (error || !data) return [];
  return data.map(mapVenue);
}

export async function getVenue(id: string): Promise<Venue | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("venues").select("*").eq("id", id).maybeSingle();
  return data ? mapVenue(data) : null;
}
