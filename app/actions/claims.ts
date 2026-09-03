"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireUser } from "@/lib/auth";
import { readHoursField } from "@/lib/hours";
import { safeVenueLogoPath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export interface ClaimState {
  error?: string;
}

/** Empty hidden fields arrive as "" — treat them as "not provided". */
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const claimSchema = z.object({
  name: z.string().trim().min(2, { error: "Inserisci il nome del locale." }),
  address: z
    .string()
    .trim()
    .min(4, { error: "Seleziona un indirizzo dai suggerimenti." }),
  city: z
    .string()
    .trim()
    .min(2, { error: "Seleziona un indirizzo dai suggerimenti." }),
  lat: z.preprocess(
    blankToUndefined,
    z.coerce.number({ error: "Seleziona un indirizzo dai suggerimenti." }).gte(-90).lte(90),
  ),
  lng: z.preprocess(
    blankToUndefined,
    z.coerce.number({ error: "Seleziona un indirizzo dai suggerimenti." }).gte(-180).lte(180),
  ),
  description: z.string().trim().max(1000).optional(),
});

/** A registered user submits a request to open/manage a venue. */
export async function submitClaim(_prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const session = await requireUser();

  const parsed = claimSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const hours = readHoursField(formData.get("hours"));
  if (typeof hours === "string") {
    return { error: hours };
  }

  const logoPath = safeVenueLogoPath(formData.get("logoPath"), session.userId);

  const supabase = await createClient();

  const { data: owned } = await supabase
    .from("venues")
    .select("id")
    .eq("owner_id", session.userId)
    .maybeSingle();
  if (owned) redirect("/dashboard");

  const { error } = await supabase.from("venue_claims").insert({
    requester_id: session.userId,
    name: parsed.data.name,
    city: parsed.data.city,
    address: parsed.data.address,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    hours,
    logo_path: logoPath,
    description: parsed.data.description ?? null,
  });

  if (error) {
    return {
      error: error.code === "23505"
        ? "Hai già una richiesta in attesa di revisione."
        : "Invio non riuscito. Riprova.",
    };
  }

  revalidatePath("/partner/claim");
  return {};
}

export async function approveClaim(claimId: string, note?: string): Promise<void> {
  await requireRole("superadmin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_venue_claim", {
    claim_id: claimId,
    note: note ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function rejectClaim(claimId: string, note?: string): Promise<void> {
  await requireRole("superadmin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_venue_claim", {
    claim_id: claimId,
    note: note ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
