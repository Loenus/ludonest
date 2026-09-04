"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { AVATAR_BUCKET, safeAvatarPath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export interface ProfileFormState {
  error?: string;
  notice?: string;
  ok?: boolean;
}

const profileSchema = z.object({
  firstName: z.string().trim().min(1, { error: "Inserisci il tuo nome." }).max(60),
  lastName: z.string().trim().min(1, { error: "Inserisci il tuo cognome." }).max(60),
  email: z.email({ error: "Inserisci un indirizzo email valido." }),
});

/**
 * The current player edits their own identity: name, photo, email. The user
 * id is resolved from the session (never the client) — `profiles_update_own`
 * RLS re-checks ownership regardless.
 */
export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await requireRole("player");

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`;

  // Empty / malformed / someone else's folder -> null (falls back to the
  // generated default).
  const avatarPath = safeAvatarPath(formData.get("avatarPath"), session.userId);

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, avatar_path: avatarPath })
    .eq("id", session.userId);
  if (error) return { error: "Salvataggio non riuscito. Riprova." };

  // Best-effort: drop the previous photo now that it is unreferenced.
  if (session.avatarPath && session.avatarPath !== avatarPath) {
    await supabase.storage.from(AVATAR_BUCKET).remove([session.avatarPath]).catch(() => {});
  }

  let notice: string | undefined;
  if (parsed.data.email !== session.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: parsed.data.email,
    });
    if (emailError) {
      return { error: "Impossibile aggiornare l'email. Riprova." };
    }
    notice = "Controlla la tua nuova email per confermare il cambiamento.";
  }

  revalidatePath("/app");
  return { ok: true, notice };
}
