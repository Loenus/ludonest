"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

/**
 * Live "Prenotazioni" tab: keep the dashboard's server data fresh so new
 * requests and status changes appear without a manual reload.
 *
 * Supabase Realtime on `bookings` (filtered to this venue) is the real
 * mechanism — the event just triggers `router.refresh()`, which re-runs the
 * RLS-guarded server query. Polling is only a fallback: it runs until the
 * socket confirms it's live and stops the moment it is, so a working realtime
 * setup costs nothing extra (no repeated Worker hits / Supabase queries).
 */
export function useBookingsRealtime(venueId: string) {
  const router = useRouter();

  useEffect(() => {
    if (!venueId) return;

    const supabase = createClient();
    let cancelled = false;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    const refresh = () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (!cancelled && document.visibilityState === "visible") router.refresh();
      }, 300);
    };

    const startPoll = () => {
      if (poll || cancelled) return;
      console.info("bookings updates: polling every 30s (realtime unavailable)");
      poll = setInterval(() => {
        if (document.visibilityState === "visible") router.refresh();
      }, 30000);
    };
    const stopPoll = () => {
      if (poll) {
        clearInterval(poll);
        poll = undefined;
      }
    };

    // Safety net until (or unless) realtime confirms it's connected.
    startPoll();

    void (async () => {
      // `@supabase/ssr` doesn't push the user's JWT onto the realtime socket
      // until an auth event fires; without it RLS drops every postgres_changes
      // row for this table. Set it explicitly from the current session.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);

      channel = supabase
        .channel(`bookings-${venueId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `venue_id=eq.${venueId}`,
          },
          refresh,
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.info("bookings updates: realtime live");
            stopPoll();
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            startPoll();
          }
        });
    })();

    return () => {
      cancelled = true;
      clearTimeout(debounce);
      stopPoll();
      if (channel) void supabase.removeChannel(channel);
    };
  }, [venueId, router]);
}
