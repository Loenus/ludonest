import { Navigation } from "lucide-react";

import { RatingBadge } from "@/components/rating-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SPINE_COLORS } from "@/lib/mock-data";
import type { Venue } from "@/lib/types";

interface VenueCardProps {
  venue: Venue;
  onOpen: (venue: Venue) => void;
}

export function VenueCard({ venue, onOpen }: VenueCardProps) {
  const spine = SPINE_COLORS[venue.id % SPINE_COLORS.length];
  return (
    <Card className="group overflow-hidden border border-border/60 bg-card/90 backdrop-blur p-0 transition-all duration-300 shadow-[0_8px_24px_rgba(120,113,108,0.08)] hover:border-amber-400/50 hover:shadow-[0_16px_36px_rgba(245,158,11,0.12)] active:border-amber-400/60 dark:shadow-none">
      <button onClick={() => onOpen(venue)} className="w-full text-left">
        <div className="flex">
          <div
            className="w-3 shrink-0 transition-all duration-300 group-hover:w-4"
            style={{ background: spine }}
          />
          <div className="flex-1 p-4 sm:p-4">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm sm:text-base font-semibold text-foreground">
                  {venue.name}
                </h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {venue.address}, {venue.city}
                </p>
              </div>
              <RatingBadge rating={venue.rating} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {venue.tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="h-6 rounded-full border border-amber-200/80 bg-amber-50/90 px-2 text-[10px] text-amber-900 shadow-sm shadow-amber-200/40 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:shadow-none"
                >
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-t border-border pt-2.5">
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Navigation size={12} />
                  <span className="font-mono">{venue.distanceKm} km</span>
                </span>
                <span
                  className="flex items-center gap-1.5"
                  style={{ color: venue.openNow ? "var(--teal)" : "var(--coral)" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: venue.openNow ? "var(--teal)" : "var(--coral)" }}
                  />
                  {venue.openNow ? "Aperto ora" : "Chiuso"}
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground text-right sm:text-left">
                {venue.freeTables}/{venue.totalTables} tavoli
              </span>
            </div>
          </div>
        </div>
      </button>
    </Card>
  );
}
