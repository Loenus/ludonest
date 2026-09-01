import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { BookingRequest, RequestStatus } from "@/lib/types";

const STATUS_STYLE: Record<RequestStatus, string> = {
  pending: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  accepted: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  declined: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "In attesa",
  accepted: "Accettata",
  declined: "Rifiutata",
};

interface RequestsViewProps {
  requests: BookingRequest[];
  onUpdateRequestStatus: (id: number, status: RequestStatus) => void;
}

export function RequestsView({ requests, onUpdateRequestStatus }: RequestsViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="ff-display text-2xl font-bold text-foreground md:text-3xl">
        Richieste di prenotazione
      </h1>
      <div className="flex flex-col gap-2.5">
        {requests.map((r) => (
          <Card
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 border-border/80 bg-card p-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{r.userName}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {r.date} · {r.time} · {r.people} persone
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className={[
                  "rounded-full border px-2.5 py-1 text-xs font-semibold",
                  STATUS_STYLE[r.status],
                ].join(" ")}
              >
                {STATUS_LABEL[r.status]}
              </span>
              {r.status === "pending" && (
                <>
                  <Button
                    onClick={() => onUpdateRequestStatus(r.id, "accepted")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 rounded-xl border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <CheckCircle2 size={13} /> Accetta
                  </Button>
                  <Button
                    onClick={() => onUpdateRequestStatus(r.id, "declined")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 rounded-xl border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                  >
                    <XCircle size={13} /> Rifiuta
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
