import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isOpenNow } from "@/lib/format";
import type { Venue, VenueStatus } from "@/lib/types";

interface VenueRow {
  id: string;
  owner_id: string | null;
  name: string;
  city: string;
  address: string;
  hours: string | null;
  total_tables: number;
  genres: string[];
  description: string | null;
  rating: number | string | null;
  status: VenueStatus;
}

export function mapVenue(row: VenueRow): Venue {
  const hours = row.hours ?? "";
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    hours,
    totalTables: row.total_tables,
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
