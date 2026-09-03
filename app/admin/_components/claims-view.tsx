"use client";

import { useState, useTransition } from "react";
import { Check, MapPin, X } from "lucide-react";

import { approveClaim, rejectClaim } from "@/app/actions/claims";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatHoursShort } from "@/lib/hours";
import type { VenueClaim } from "@/lib/types";

export function ClaimsView({ claims }: { claims: VenueClaim[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function act(id: string, fn: (id: string, note?: string) => Promise<void>, note?: string) {
    setBusyId(id);
    startTransition(async () => {
      try {
        await fn(id, note);
      } finally {
        setBusyId(null);
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div>
        <h1 className="ff-display text-2xl font-bold text-foreground md:text-3xl">
          Richieste locali
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {claims.length} in attesa di revisione
        </p>
      </div>

      {claims.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
          Nessuna richiesta in attesa.
        </p>
      ) : (
        claims.map((c) => (
          <Card key={c.id} className="flex flex-col gap-3 border-border/70 bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="ff-display text-base font-semibold text-foreground">{c.name}</h2>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} /> {c.address}, {c.city}
                  {formatHoursShort(c.hours) && ` · ${formatHoursShort(c.hours)}`}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p className="font-medium text-foreground">{c.requesterName}</p>
                {c.requesterEmail && <p>{c.requesterEmail}</p>}
              </div>
            </div>

            {c.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
            )}

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={busyId === c.id}
                onClick={() => act(c.id, approveClaim)}
                className="gap-1 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Check size={14} /> Approva
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === c.id}
                onClick={() => {
                  const note = prompt("Motivo del rifiuto (facoltativo):") ?? undefined;
                  act(c.id, rejectClaim, note);
                }}
                className="gap-1 rounded-xl border-rose-400/50 text-rose-500 hover:bg-rose-500/10"
              >
                <X size={14} /> Rifiuta
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
