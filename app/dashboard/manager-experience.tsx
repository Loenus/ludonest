"use client";

import { useMemo } from "react";

import { AppShell } from "@/components/app-shell";
import { MANAGER_NAV } from "@/lib/nav";
import { useAppTab } from "@/lib/use-app-tab";
import type { Booking, ManagerEvent, Venue } from "@/lib/types";

const TAB_IDS = MANAGER_NAV.map((n) => n.id);

import { EventsView } from "./_components/events-view";
import { OverviewView } from "./_components/overview-view";
import { RequestsView } from "./_components/requests-view";
import { VenueView } from "./_components/venue-view";

interface ManagerExperienceProps {
  userName: string;
  venue: Venue;
  bookings: Booking[];
  events: ManagerEvent[];
}

export function ManagerExperience({
  userName,
  venue,
  bookings,
  events,
}: ManagerExperienceProps) {
  const [tab, setTab] = useAppTab(TAB_IDS, "dashboard");

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings],
  );

  return (
    <AppShell
      navItems={MANAGER_NAV}
      activeTab={tab}
      onTabChange={setTab}
      userName={userName}
      roleLabel="Gestore"
    >
      {tab === "dashboard" && (
        <OverviewView
          venue={venue}
          bookings={bookings}
          pendingCount={pendingCount}
          onGoToTab={setTab}
        />
      )}
      {tab === "locale" && <VenueView venue={venue} />}
      {tab === "eventi" && <EventsView events={events} />}
      {tab === "prenotazioni" && <RequestsView bookings={bookings} />}
    </AppShell>
  );
}
