"use client";

import { AppShell } from "@/components/app-shell";
import { ADMIN_NAV } from "@/lib/nav";
import { useAppTab } from "@/lib/use-app-tab";
import type { VenueClaim } from "@/lib/types";

import { ClaimsView } from "./_components/claims-view";

const TAB_IDS = ADMIN_NAV.map((n) => n.id);

interface AdminVenue {
  id: string;
  name: string;
  city: string;
  status: string;
  owner_id: string | null;
}

interface AdminExperienceProps {
  userName: string;
  pendingClaims: VenueClaim[];
  venues: AdminVenue[];
}

export function AdminExperience({ userName, pendingClaims, venues }: AdminExperienceProps) {
  const [tab, setTab] = useAppTab(TAB_IDS, "richieste");

  return (
    <AppShell
      navItems={ADMIN_NAV}
      activeTab={tab}
      onTabChange={setTab}
      userName={userName}
      roleLabel="Amministratore"
    >
      {tab === "richieste" && <ClaimsView claims={pendingClaims} />}

      {tab === "locali" && (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <h1 className="ff-display text-2xl font-bold text-foreground md:text-3xl">Locali</h1>
          <div className="flex flex-col gap-2">
            {venues.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3.5 text-sm"
              >
                <span className="font-medium text-foreground">{v.name}</span>
                <span className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{v.city}</span>
                  <span
                    className={
                      v.status === "active"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500"
                    }
                  >
                    {v.status}
                  </span>
                  <span>{v.owner_id ? "assegnato" : "senza gestore"}</span>
                </span>
              </div>
            ))}
            {venues.length === 0 && (
              <p className="text-sm text-muted-foreground">Nessun locale.</p>
            )}
          </div>
        </div>
      )}

      {tab === "utenti" && (
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="ff-display text-2xl font-bold text-foreground md:text-3xl">Utenti</h1>
          <p className="mt-3 rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
            Gestione utenti in arrivo.
          </p>
        </div>
      )}
    </AppShell>
  );
}
