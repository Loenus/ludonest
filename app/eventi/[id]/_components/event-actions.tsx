"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, LogIn, Pencil, X } from "lucide-react";

import { joinEvent, leaveEvent } from "@/app/actions/events";
import { EventForm } from "@/components/events/event-form";
import { Button } from "@/components/ui/button";
import type { AppRole, ManagerEvent } from "@/lib/types";

/**
 * Role-aware CTA for the public event page.
 * - visitor  → prompt to sign in
 * - player / other registered user → join / leave
 * - owning manager → edit the event inline
 */
export function EventActions({
  event,
  role,
  joined,
  canManage,
  isPast,
}: {
  event: ManagerEvent;
  role: AppRole | null;
  joined: boolean;
  canManage: boolean;
  isPast: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const full = event.seatsLimited && (event.seatsLeft ?? 0) <= 0;

  if (canManage) {
    if (editing) {
      return (
        <EventForm
          mode="edit"
          event={event}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
          onCancel={() => setEditing(false)}
        />
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">Questo è un tuo evento.</p>
        <Button
          onClick={() => setEditing(true)}
          className="w-full rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300"
        >
          <Pencil size={15} /> Modifica evento
        </Button>
      </div>
    );
  }

  if (!role) {
    return (
      <Link
        href="/login"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
      >
        <LogIn size={15} /> Accedi per partecipare
      </Link>
    );
  }

  if (isPast) {
    return <p className="text-sm text-muted-foreground">Questo evento è concluso.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {joined ? (
        <>
          <p className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <CalendarCheck size={15} /> Sei iscritto a questo evento
          </p>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await leaveEvent(event.id);
                router.refresh();
              })
            }
            className="w-full rounded-xl"
          >
            <X size={15} /> Annulla partecipazione
          </Button>
        </>
      ) : (
        <Button
          disabled={pending || full}
          onClick={() =>
            start(async () => {
              const res = await joinEvent(event.id);
              if (res?.error) {
                setError(res.error);
              } else {
                setError(null);
                router.refresh();
              }
            })
          }
          className="w-full rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-60"
        >
          {full ? "Al completo" : pending ? "Iscrizione…" : "Partecipa"}
        </Button>
      )}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
