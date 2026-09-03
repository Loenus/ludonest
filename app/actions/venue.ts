"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getManagedVenue, requireRole } from "@/lib/auth";
import { readHoursField } from "@/lib/hours";
import { GENRES } from "@/lib/mock-data";
import { safeVenueLogoPath, VENUE_LOGO_BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export interface VenueFormState {
  error?: string;
  ok?: boolean;
}

/** Empty hidden fields arrive as "" — treat them as "not provided". */
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const venueSchema = z.object({
  name: z.string().trim().min(2, { error: "Inserisci il nome del locale." }).max(120),
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

/**
 * The current manager edits their venue. The venue is resolved from the
 * session (never the client), and RLS `venues_update` re-checks ownership.
 */
export async function updateVenue(
  _prev: VenueFormState,
  formData: FormData,
): Promise<VenueFormState> {
  const session = await requireRole("manager");

  const venue = await getManagedVenue();
  if (!venue) return { error: "Nessun locale associato al tuo account." };

  const parsed = venueSchema.safeParse({
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
  if (typeof hours === "string") return { error: hours };

  const allowed = new Set<string>(GENRES);
  const genres = [...new Set(formData.getAll("genres").map(String))].filter((g) =>
    allowed.has(g),
  );

  // Empty / malformed -> null (falls back to the generated default).
  const logoPath = safeVenueLogoPath(formData.get("logoPath"), session.userId);

  const supabase = await createClient();
  const { error } = await supabase
    .from("venues")
    .update({
      name: parsed.data.name,
      address: parsed.data.address,
      city: parsed.data.city,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      hours,
      genres,
      logo_path: logoPath,
      description: parsed.data.description ?? null,
    })
    .eq("id", venue.id);

  if (error) return { error: "Salvataggio non riuscito. Riprova." };

  // Best-effort: drop the previous logo file now that it is unreferenced.
  const oldPath = (venue as { logo_path?: string | null }).logo_path ?? null;
  if (oldPath && oldPath !== logoPath) {
    await supabase.storage.from(VENUE_LOGO_BUCKET).remove([oldPath]).catch(() => {});
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
