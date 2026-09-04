"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * App-shell tab state backed by the `?tab=` query string.
 *
 * Reading it from the URL means a reload — or a browser Back after visiting,
 * say, an event's public page — restores the tab the user was on instead of
 * snapping back to the first one. Writes go straight to `history.replaceState`
 * so switching tabs stays instant (no server round-trip) and doesn't pile up
 * history entries.
 */
export function useAppTab(validIds: readonly string[], fallback: string) {
  const searchParams = useSearchParams();

  const [tab, setTabState] = useState(() => {
    const raw = searchParams.get("tab");
    return raw && validIds.includes(raw) ? raw : fallback;
  });

  const setTab = useCallback(
    (id: string) => {
      setTabState(id);
      const params = new URLSearchParams(window.location.search);
      if (id === fallback) params.delete("tab");
      else params.set("tab", id);
      const qs = params.toString();
      const url = qs
        ? `${window.location.pathname}?${qs}`
        : window.location.pathname;
      window.history.replaceState(null, "", url);
    },
    [fallback],
  );

  return [tab, setTab] as const;
}
