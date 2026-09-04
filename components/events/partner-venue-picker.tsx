"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { searchPartnerVenues } from "@/app/actions/events";
import { Input } from "@/components/ui/input";
import type { PartnerVenue } from "@/lib/types";
import { VenueAvatar } from "@/lib/venue-avatar";

/**
 * Partner venues are optional and must be existing venues: the manager searches
 * by name and picks from the results. Each pick renders below the field as a
 * round logo + name, one per row, and rides along as hidden `partnerVenueIds`.
 */
export function PartnerVenuePicker({
  defaultValue = [],
}: {
  defaultValue?: PartnerVenue[];
}) {
  const [selected, setSelected] = useState<PartnerVenue[]>(defaultValue);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PartnerVenue[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, startSearch] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);

  const q = query.trim();

  useEffect(() => {
    if (q.length < 2) return;
    const t = setTimeout(() => {
      startSearch(async () => {
        setResults(await searchPartnerVenues(q));
        setOpen(true);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selectedIds = new Set(selected.map((v) => v.id));
  const available =
    q.length >= 2 ? results.filter((v) => !selectedIds.has(v.id)) : [];

  function add(v: PartnerVenue) {
    setSelected((prev) => [...prev, v]);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <div ref={boxRef} className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => available.length > 0 && setOpen(true)}
          placeholder="Cerca un locale già registrato…"
          aria-label="Cerca locale partner"
          autoComplete="off"
          className="rounded-xl pl-9"
        />

        {open && (available.length > 0 || (q.length >= 2 && !searching)) && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {available.length > 0 ? (
              <ul className="max-h-60 overflow-auto p-1">
                {available.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => add(v)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <VenueAvatar venue={v} size={22} />
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        {v.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {v.city}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Nessun locale trovato.
              </p>
            )}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {selected.map((v) => (
            <li key={v.id} className="flex items-center gap-2 text-sm">
              <VenueAvatar venue={v} size={24} />
              <span className="min-w-0 flex-1 truncate text-foreground">{v.name}</span>
              <button
                type="button"
                onClick={() => remove(v.id)}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-rose-500"
                aria-label={`Rimuovi ${v.name}`}
              >
                <X size={14} />
              </button>
              <input type="hidden" name="partnerVenueIds" value={v.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
