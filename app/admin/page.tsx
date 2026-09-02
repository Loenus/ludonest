import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { listPendingClaims } from "@/lib/claims";
import { createClient } from "@/lib/supabase/server";

import { AdminExperience } from "./admin-experience";

export const metadata: Metadata = {
  title: "Amministrazione · LudoNest",
};

export default async function AdminPage() {
  const session = await requireRole("superadmin");

  const claims = await listPendingClaims();

  const supabase = await createClient();
  const { data: venues } = await supabase
    .from("venues")
    .select("id, name, city, status, owner_id")
    .order("created_at", { ascending: false });

  return (
    <AdminExperience
      userName={session.fullName}
      pendingClaims={claims}
      venues={venues ?? []}
    />
  );
}
