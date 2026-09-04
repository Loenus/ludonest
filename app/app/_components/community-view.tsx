import { MapPin, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MockupNotice } from "@/components/mockup-notice";
import { MATCH_POSTS } from "@/lib/mock-data";

export function CommunityView() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h1 className="ff-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          Community
        </h1>
        <Badge
          variant="outline"
          className="border border-amber-400/40 bg-gradient-to-r from-amber-400/10 to-amber-500/5 text-xs text-amber-300 sm:text-sm"
        >
          <Sparkles size={12} /> In arrivo
        </Badge>
      </div>
      <MockupNotice>
        Anteprima non interagibile: i tavoli qui sotto sono di esempio, non
        richieste reali di altri giocatori. Presto potrai davvero trovare
        compagni di gioco per completare un tavolo.
      </MockupNotice>
      <div className="flex w-full flex-col gap-2.5 sm:gap-3.5">
        {MATCH_POSTS.map((p) => (
          <Card
            key={p.id}
            className="w-full border border-border/60 bg-card/80 p-3 backdrop-blur transition-all hover:border-amber-400/40 hover:shadow-lg sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="w-full min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground sm:text-sm">
                  {p.game}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {p.seeking} {p.seeking === 1 ? "giocatore" : "giocatori"}
                  </span>
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
                  <MapPin size={12} /> {p.venueName}
                </p>
                <p className="mt-1 text-[11px] text-foreground sm:text-xs">{p.note}</p>
              </div>
              <Button
                disabled
                variant="outline"
                size="sm"
                className="w-full shrink-0 border-border/60 text-xs font-medium opacity-60 sm:w-auto"
              >
                Presto
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Card className="w-full border border-border/60 bg-gradient-to-br from-amber-400/10 to-amber-500/5 p-4 ring-1 ring-amber-400/20 backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex-1 text-xs font-medium text-foreground sm:text-sm">
            Vuoi essere avvisato?
          </p>
          <Button
            disabled
            className="w-full shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-xs font-semibold text-slate-950 shadow-lg shadow-amber-400/30 sm:w-auto sm:text-sm"
          >
            Avvisami — presto
          </Button>
        </div>
      </Card>
    </div>
  );
}
