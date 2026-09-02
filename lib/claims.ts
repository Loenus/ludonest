import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { VenueClaim } from "@/lib/types";

interface ClaimRow {
  id: string;
  requester_id: string;
  name: string;
  city: string;
  address: string;
  hours: string | null;
  description: string | null;
  status: VenueClaim["status"];
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles:
    | { full_name: string | null; email: string | null }
    | { full_name: string | null; email: string | null }[]
    | null;
}

function mapClaim(row: ClaimRow): VenueClaim {
  const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    requesterId: row.requester_id,
    requesterName: prof?.full_name?.trim() || "Utente",
    requesterEmail: prof?.email ?? null,
    name: row.name,
    city: row.city,
    address: row.address,
    hours: row.hours,
    description: row.description,
    status: row.status,
    reviewNote: row.review_note,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

const SELECT =
  "id, requester_id, name, city, address, hours, description, status, review_note, reviewed_at, created_at, profiles!venue_claims_requester_id_fkey(full_name, email)";

export async function listPendingClaims(): Promise<VenueClaim[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venue_claims")
    .select(SELECT)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as ClaimRow[]).map(mapClaim);
}
