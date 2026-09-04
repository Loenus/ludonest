"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { VenueDetailModal } from "@/components/venue-detail-modal";
import type { PublicEvent } from "@/lib/events";
import { PLAYER_NAV } from "@/lib/nav";
import type { Venue } from "@/lib/types";
import { useAppTab } from "@/lib/use-app-tab";

import { ChatView } from "./_components/chat-view";
import { CommunityView } from "./_components/community-view";
import { EventsView } from "./_components/events-view";
import { ProfileView } from "./_components/profile-view";
import { SearchView } from "./_components/search-view";

const TAB_IDS = PLAYER_NAV.map((n) => n.id);

export function PlayerExperience({
  userName,
  venues,
  events,
}: {
  userName: string;
  venues: Venue[];
  events: PublicEvent[];
}) {
  const [tab, setTab] = useAppTab(TAB_IDS, "cerca");

  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookedVenueIds, setBookedVenueIds] = useState<string[]>([]);

  const filteredVenues = useMemo(() => {
    const q = search.trim().toLowerCase();
    return venues.filter((v) => {
      const matchesSearch =
        q === "" ||
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q));
      const matchesOpen = !onlyOpen || v.openNow;
      const matchesGenres = genres.length === 0 || genres.every((g) => v.tags.includes(g));
      return matchesSearch && matchesOpen && matchesGenres;
    });
  }, [venues, search, genres, onlyOpen]);

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  }

  function resetFilters() {
    setSearch("");
    setGenres([]);
    setOnlyOpen(false);
  }

  function openVenue(venue: Venue) {
    setSelectedVenue(venue);
    document.body.style.overflow = "hidden";
  }

  function closeVenue() {
    setSelectedVenue(null);
    document.body.style.overflow = "";
  }

  function handleBooked(venueId: string) {
    setBookedVenueIds((prev) => (prev.includes(venueId) ? prev : [...prev, venueId]));
  }

  return (
    <AppShell
      navItems={PLAYER_NAV}
      activeTab={tab}
      onTabChange={setTab}
      userName={userName}
      roleLabel="Giocatore"
    >
      {tab === "cerca" && (
        <SearchView
          venues={filteredVenues}
          filters={{ search, onlyOpen, genres }}
          onSearchChange={setSearch}
          onToggleOpen={() => setOnlyOpen((v) => !v)}
          onToggleGenre={toggleGenre}
          onResetFilters={resetFilters}
          onOpenVenue={openVenue}
        />
      )}
      {tab === "eventi" && <EventsView events={events} />}
      {tab === "community" && <CommunityView />}
      {tab === "chat" && <ChatView />}
      {tab === "profilo" && (
        <ProfileView userName={userName} bookedCount={bookedVenueIds.length} />
      )}

      <VenueDetailModal
        venue={selectedVenue}
        booked={selectedVenue ? bookedVenueIds.includes(selectedVenue.id) : false}
        onClose={closeVenue}
        onBooked={handleBooked}
      />
    </AppShell>
  );
}
