"use client";

import { useState } from "react";
import { CalendarClock, History, MapPin, Users } from "lucide-react";

import { loadPastPlayerBookings } from "@/app/actions/bookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from "@/lib/booking-status";
import { formatBookingWhen } from "@/lib/format";
import type { BookingStatus, PlayerBooking } from "@/lib/types";

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge
      variant="outline"
      className={`h-5 shrink-0 rounded-full px-2 text-[10px] ${BOOKING_STATUS_TONE[status]}`}
    >
      {BOOKING_STATUS_LABEL[status]}
    </Badge>
  );
}

function BookingRow({ b }: { b: PlayerBooking }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 border-border/70 bg-card p-3.5">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin size={13} className="shrink-0 text-muted-foreground" />
          <span className="truncate">{b.venueName}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>{formatBookingWhen(b.startsAt)}</span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {b.partySize}
          </span>
        </p>
        {b.note && <p className="mt-1 max-w-md text-xs text-muted-foreground">“{b.note}”</p>}
      </div>
      <StatusBadge status={b.status} />
    </Card>
  );
}

export function ProfileBookings({ upcoming }: { upcoming: PlayerBooking[] }) {
  const sorted = [...upcoming].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const pendingCount = upcoming.filter((b) => b.status === "pending").length;
  const confirmedCount = upcoming.filter((b) => b.status === "accepted").length;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="ff-display text-lg font-semibold text-foreground">Le tue prenotazioni</h2>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="In attesa" value={pendingCount} tone="amber" />
        <Stat label="Confermate" value={confirmedCount} tone="emerald" />
      </div>

      <div className="flex flex-col gap-2.5">
        {sorted.length === 0 ? (
          <EmptyLine>Nessuna prenotazione in programma.</EmptyLine>
        ) : (
          sorted.map((b) => <BookingRow key={b.id} b={b} />)
        )}
      </div>

      <ArchivePanel />
    </section>
  );
}

function ArchivePanel() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PlayerBooking[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  async function load(next?: string) {
    setLoading(true);
    try {
      const page = await loadPastPlayerBookings(next);
      setRows((prev) => (next ? [...prev, ...page.bookings] : page.bookings));
      setCursor(page.nextCursor);
      setLoadedOnce(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-border/50 pt-4">
      {!open ? (
        <Button
          variant="outline"
          onClick={() => {
            setOpen(true);
            if (!loadedOnce) load();
          }}
          className="gap-2 rounded-xl text-sm"
        >
          <History size={15} /> Vedi lo storico
        </Button>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CalendarClock size={14} className="text-muted-foreground" /> Storico
            </p>
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
            <EmptyLine>Nessuna prenotazione passata.</EmptyLine>
          )}

          {rows.map((b) => (
            <BookingRow key={b.id} b={b} />
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
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "emerald";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs font-medium">{label}</p>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
