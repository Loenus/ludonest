"use client";

import { useState, useTransition } from "react";
import {
  Check, ChevronDown, Clock, History, RotateCcw, Users, X,
} from "lucide-react";

import {
  acceptBooking, declineBooking, loadPastBookings, restoreBooking,
} from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dayKey, dayLabel, formatBookingWhen, groupByDay, timeLabel } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function RequestsView({ bookings }: { bookings: Booking[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function run(id: string, fn: (id: string) => Promise<void>) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await fn(id);
      } finally {
        setPendingId(null);
      }
    });
  }

  const pending = bookings
    .filter((b) => b.status === "pending")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const accepted = bookings
    .filter((b) => b.status === "accepted")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const declined = bookings
    .filter((b) => b.status === "declined")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const acceptedToday = accepted.filter(
    (b) => dayLabel(dayKey(b.startsAt)) === "Oggi",
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="ff-display text-2xl font-bold text-foreground md:text-3xl">
          Prenotazioni
        </h1>
      </div>

      {/* summary */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="In attesa" value={pending.length} tone="amber" />
        <Stat label="Confermate oggi" value={acceptedToday} tone="emerald" />
        <Stat label="Rifiutate" value={declined.length} tone="muted" />
      </div>

      {/* pending queue */}
      <section className="flex flex-col gap-3">
        <SectionTitle icon={Clock}>Da confermare</SectionTitle>
        {pending.length === 0 ? (
          <EmptyLine>Nessuna richiesta in attesa.</EmptyLine>
        ) : (
          pending.map((b) => (
            <Card
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-amber-400/40 bg-amber-400/5 p-4"
            >
              <BookingIdentity b={b} strong />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  disabled={pendingId === b.id}
                  onClick={() => run(b.id, acceptBooking)}
                  className="gap-1 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  <Check size={14} /> Accetta
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingId === b.id}
                  onClick={() => run(b.id, declineBooking)}
                  className="gap-1 rounded-xl border-rose-400/50 text-rose-500 hover:bg-rose-500/10"
                >
                  <X size={14} /> Rifiuta
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>

      {/* confirmed, grouped by day */}
      <section className="flex flex-col gap-3">
        <SectionTitle icon={Check}>Prossime confermate</SectionTitle>
        {accepted.length === 0 ? (
          <EmptyLine>Nessuna prenotazione confermata in programma.</EmptyLine>
        ) : (
          groupByDay(accepted).map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((b) => (
                <Card
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-border/70 bg-card p-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.playerName}</p>
                    <p className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <span>{timeLabel(b.startsAt)}</span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {b.partySize}
                      </span>
                      {b.note && <span className="truncate">· {b.note}</span>}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pendingId === b.id}
                    onClick={() => {
                      if (confirm("Annullare questa prenotazione confermata?")) {
                        run(b.id, declineBooking);
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-rose-500"
                  >
                    Annulla
                  </Button>
                </Card>
              ))}
            </div>
          ))
        )}
      </section>

      {/* declined — de-emphasised, collapsed */}
      {declined.length > 0 && (
        <details className="group rounded-2xl border border-border/50 bg-muted/30 px-4">
          <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
            Rifiutate · oggi e future ({declined.length})
            <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-2 pb-4">
            {declined.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-card/60 px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">
                  {b.playerName} · {formatBookingWhen(b.startsAt)} · {b.partySize} pers.
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pendingId === b.id}
                  onClick={() => run(b.id, restoreBooking)}
                  className="gap-1 text-xs text-muted-foreground hover:text-amber-600"
                >
                  <RotateCcw size={13} /> Ripristina
                </Button>
              </div>
            ))}
          </div>
        </details>
      )}

      <ArchivePanel />
    </div>
  );
}

function ArchivePanel() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Booking[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  async function load(next?: string) {
    setLoading(true);
    try {
      const page = await loadPastBookings(next);
      setRows((prev) => (next ? [...prev, ...page.bookings] : page.bookings));
      setCursor(page.nextCursor);
      setLoadedOnce(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-2 border-t border-border/50 pt-4">
      {!open ? (
        <Button
          variant="outline"
          onClick={() => {
            setOpen(true);
            if (!loadedOnce) load();
          }}
          className="gap-2 rounded-xl text-sm"
        >
          <History size={15} /> Vedi vecchie prenotazioni
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Storico prenotazioni</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground"
            >
              Nascondi
            </Button>
          </div>

          {loading && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Caricamento…</p>
          )}
          {loadedOnce && rows.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">Nessuna prenotazione passata.</p>
          )}

          {rows.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/40 bg-card/60 px-3 py-2 text-sm"
            >
              <span className="text-foreground">{b.playerName}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatBookingWhen(b.startsAt)} · {b.partySize} pers. · {STATUS_LABEL[b.status]}
              </span>
            </div>
          ))}

          {cursor && (
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => load(cursor)}
              className="mt-1 self-start rounded-xl text-xs"
            >
              {loading ? "Caricamento…" : "Carica altre"}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

const STATUS_LABEL: Record<Booking["status"], string> = {
  pending: "in attesa",
  accepted: "confermata",
  declined: "rifiutata",
  cancelled: "annullata",
};

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "emerald" | "muted";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300"
      : tone === "emerald"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
        : "border-border/60 bg-card text-muted-foreground";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs font-medium">{label}</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: typeof Clock;
  children: React.ReactNode;
}) {
  return (
    <h2 className="ff-display flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon size={15} className="text-muted-foreground" /> {children}
    </h2>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function BookingIdentity({ b, strong }: { b: Booking; strong?: boolean }) {
  return (
    <div>
      <p className={`text-sm ${strong ? "font-semibold" : "font-medium"} text-foreground`}>
        {b.playerName}
      </p>
      <p className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span>{formatBookingWhen(b.startsAt)}</span>
        <span className="flex items-center gap-1">
          <Users size={12} /> {b.partySize}
        </span>
      </p>
      {b.note && <p className="mt-1 max-w-md text-xs text-muted-foreground">“{b.note}”</p>}
    </div>
  );
}
