"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface ClaimState {
  error?: string;
}

const claimSchema = z.object({
  name: z.string().trim().min(2, { error: "Inserisci il nome del locale." }),
  city: z.string().trim().min(2, { error: "Inserisci la città." }),
  address: z.string().trim().min(4, { error: "Inserisci l'indirizzo." }),
  hours: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
});

/** A registered user submits a request to open/manage a venue. */
export async function submitClaim(_prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const session = await requireUser();

  const parsed = claimSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    address: formData.get("address"),
    hours: formData.get("hours") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

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
    hours: parsed.data.hours ?? null,
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
