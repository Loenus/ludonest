"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { AddressSuggestion } from "@/app/api/address/route";

export interface AddressValue {
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
}

interface AddressAutocompleteProps {
  defaultValue?: Partial<AddressValue>;
  onChange?: (value: AddressValue) => void;
  required?: boolean;
  label?: string;
  /** Outline the field in red (set by the parent after a failed submit). */
  invalid?: boolean;
  /** Fired on any keystroke / pick, so the parent can drop `invalid`. */
  onEdit?: () => void;
}

/** ms to wait after the last keystroke before hitting the geocoder. */
const DEBOUNCE_MS = 500;
/** don't query for anything shorter than this (after trimming). */
const MIN_QUERY = 6;

const STREET_PREFIX =
  /^(via|viale|v\.le|corso|c\.so|piazza|p\.za|piazzale|largo|vicolo|strada|contrada|borgo|calle|salita|località|localita|frazione|rotonda|circonvallazione)\b[\s.]*/i;

/**
 * Only start suggesting once the user has typed something more specific than a
 * street-type word: at least MIN_QUERY chars, and at least 3 chars of actual
 * name after stripping a leading "via" / "viale" / "corso" / …
 */
function shouldQuery(raw: string): boolean {
  const q = raw.trim();
  if (q.length < MIN_QUERY) return false;
  return q.replace(STREET_PREFIX, "").trim().length >= 3;
}

const EMPTY: AddressValue = { address: "", city: "", lat: null, lng: null };

export function AddressAutocomplete({
  defaultValue,
  onChange,
  required,
  label = "Indirizzo",
  invalid,
  onEdit,
}: AddressAutocompleteProps) {
  const listId = useId();
  const hasInitialPick = Boolean(
    defaultValue?.address && defaultValue?.lat != null && defaultValue?.lng != null,
  );

  const [query, setQuery] = useState(defaultValue?.address ?? "");
  const [selected, setSelected] = useState<AddressValue | null>(
    hasInitialPick
      ? {
          address: defaultValue!.address!,
          city: defaultValue!.city ?? "",
          lat: defaultValue!.lat!,
          lng: defaultValue!.lng!,
        }
      : null,
  );
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [touched, setTouched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function emit(value: AddressValue) {
    onChange?.(value);
  }

  function runSearch(q: string) {
    abortRef.current?.abort();
    if (!shouldQuery(q)) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    fetch(`/api/address?q=${encodeURIComponent(q.trim())}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((data: { results?: AddressSuggestion[] }) => {
        setResults(data.results ?? []);
        setActiveIndex(data.results && data.results.length > 0 ? 0 : -1);
        setOpen(true);
      })
      .catch(() => {
        /* aborted or network error — keep the field usable */
      })
      .finally(() => {
        if (abortRef.current === controller) setLoading(false);
      });
  }

  function handleInput(next: string) {
    setQuery(next);
    setTouched(true);
    onEdit?.();
    if (selected) {
      setSelected(null);
      emit(EMPTY);
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(next), DEBOUNCE_MS);
  }

  function pick(s: AddressSuggestion) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    onEdit?.();
    const value: AddressValue = {
      address: s.address,
      city: s.city,
      lat: s.lat,
      lng: s.lng,
    };
    setSelected(value);
    setQuery(s.label);
    setResults([]);
    setOpen(false);
    setLoading(false);
    setActiveIndex(-1);
    emit(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        pick(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showHint =
    required && touched && !selected && shouldQuery(query) && !loading;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>

      <div className="relative">
        <MapPin
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Inizia a digitare una via…"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={invalid || undefined}
          className="h-11 rounded-xl pl-9 pr-9 aria-invalid:ring-destructive/40"
        />
        {loading && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}

        {open && results.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-border/60 bg-card/95 p-1 shadow-lg backdrop-blur"
          >
            {results.map((s, i) => (
              <li key={`${s.label}-${i}`} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(s)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    i === activeIndex ? "bg-muted/70 text-foreground" : "text-foreground/80"
                  }`}
                >
                  <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{s.address}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[s.postcode, s.city].filter(Boolean).join(" ")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showHint && (
        <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
          Seleziona un indirizzo dall&apos;elenco dei suggerimenti.
        </p>
      )}
      {selected?.city && (
        <p className="text-[11px] text-muted-foreground">
          Città: <span className="font-medium text-foreground">{selected.city}</span>
        </p>
      )}

      <input type="hidden" name="address" value={selected?.address ?? ""} />
      <input type="hidden" name="city" value={selected?.city ?? ""} />
      <input type="hidden" name="lat" value={selected?.lat ?? ""} />
      <input type="hidden" name="lng" value={selected?.lng ?? ""} />
    </div>
  );
}
