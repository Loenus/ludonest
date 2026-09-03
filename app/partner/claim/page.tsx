import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clock3, LogOut } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { ClaimForm } from "./claim-form";

export const metadata: Metadata = {
  title: "Richiedi il tuo locale · LudoNest",
};

export default async function ClaimPage() {
  const session = await requireUser();
  const supabase = await createClient();

  if (session.role === "manager") redirect("/dashboard");
  if (session.role === "superadmin") redirect("/admin");

  const { data: owned } = await supabase
    .from("venues")
    .select("id")
    .eq("owner_id", session.userId)
    .maybeSingle();
  if (owned) redirect("/dashboard");

  const { data: pendingClaim } = await supabase
    .from("venue_claims")
    .select("id, name, created_at")
    .eq("requester_id", session.userId)
    .eq("status", "pending")
    .maybeSingle();

  return (
    <main className="relative mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} /> Torna alla home
      </Link>

      {pendingClaim ? (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-400/5 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-500">
            <Clock3 size={22} />
          </span>
          <h1 className="ff-display mt-4 text-xl font-bold text-foreground">
            Richiesta in revisione
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            La tua richiesta per <strong className="text-foreground">{pendingClaim.name}</strong> è
            in attesa di approvazione da parte di un amministratore. Ti avviseremo appena è pronta.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="ff-display text-2xl font-bold text-foreground">Richiedi il tuo locale</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Inserisci i dati del locale. Un amministratore controllerà la richiesta e, una volta
              approvata, potrai gestirlo dal tuo account.
            </p>
          </div>
          <ClaimForm />
        </>
      )}

      <div className="mt-14 flex flex-col items-center gap-3 border-t border-border/50 pt-6 text-center sm:mt-16 sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-muted-foreground">
          Sei connesso come{" "}
          <span className="font-medium text-foreground">{session.email}</span>
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs font-semibold text-foreground/80 shadow-sm backdrop-blur transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <LogOut size={13} /> Esci
          </button>
        </form>
      </div>
    </main>
  );
}
