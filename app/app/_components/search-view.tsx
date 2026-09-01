import { Clock, Dices, Search, Users } from "lucide-react";

import { FilterChip } from "@/components/filter-chip";
import { VenueCard } from "@/components/venue-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GENRES } from "@/lib/mock-data";
import type { Venue } from "@/lib/types";

export interface VenueFilters {
  search: string;
  onlyOpen: boolean;
  onlyFree: boolean;
  genres: string[];
}

interface SearchViewProps {
  venues: Venue[];
  filters: VenueFilters;
  onSearchChange: (value: string) => void;
  onToggleOpen: () => void;
  onToggleFree: () => void;
  onToggleGenre: (genre: string) => void;
  onResetFilters: () => void;
  onOpenVenue: (venue: Venue) => void;
}

export function SearchView({
  venues,
  filters,
  onSearchChange,
  onToggleOpen,
  onToggleFree,
  onToggleGenre,
  onResetFilters,
  onOpenVenue,
}: SearchViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="ff-display text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
          Trova il tuo tavolo
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
          {venues.length} ludopub trovati
        </p>
      </div>

      <div className="relative w-full">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca ludopub..."
          className="h-11 w-full rounded-2xl border border-border/60 bg-muted/40 pl-10 text-sm shadow-sm transition-all duration-200 focus-visible:bg-background focus-visible:shadow-md sm:h-12"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label="Aperto ora" icon={Clock} active={filters.onlyOpen} onClick={onToggleOpen} />
        <FilterChip label="Tavoli liberi" icon={Users} active={filters.onlyFree} onClick={onToggleFree} />
        {GENRES.map((g) => (
          <FilterChip
            key={g}
            label={g}
            active={filters.genres.includes(g)}
            onClick={() => onToggleGenre(g)}
          />
        ))}
      </div>

      {venues.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {venues.map((v) => (
            <VenueCard key={v.id} venue={v} onOpen={onOpenVenue} />
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-16 text-center sm:gap-4 sm:px-6 sm:py-20">
          <div className="rounded-full bg-muted/60 p-3 sm:p-4">
            <Dices size={32} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground sm:text-base">Nessun ludopub trovato</p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Modifica i filtri</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="mt-2 rounded-xl border-border/60 text-xs font-medium hover:bg-muted/80"
          >
            Reimposta filtri
          </Button>
        </div>
      )}
    </div>
  );
}
