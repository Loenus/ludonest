"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { VenueDetailModal } from "@/components/venue-detail-modal";
import { INITIAL_EVENTS, INITIAL_VENUES } from "@/lib/mock-data";
import { PLAYER_NAV } from "@/lib/nav";
import type { Venue } from "@/lib/types";

import { CommunityView } from "./_components/community-view";
import { EventsView } from "./_components/events-view";
import { ProfileView } from "./_components/profile-view";
import { SearchView } from "./_components/search-view";

export function PlayerExperience({ userName }: { userName: string }) {
  const [tab, setTab] = useState("cerca");

  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookedVenueId, setBookedVenueId] = useState<number | null>(null);

  const filteredVenues = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INITIAL_VENUES.filter((v) => {
      const matchesSearch =
        q === "" ||
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q));
      const matchesOpen = !onlyOpen || v.openNow;
      const matchesFree = !onlyFree || v.freeTables > 0;
      const matchesGenres = genres.length === 0 || genres.every((g) => v.tags.includes(g));
      return matchesSearch && matchesOpen && matchesFree && matchesGenres;
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [search, genres, onlyOpen, onlyFree]);

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  }

  function resetFilters() {
    setSearch("");
    setGenres([]);
    setOnlyOpen(false);
    setOnlyFree(false);
  }

  function openVenue(venue: Venue) {
    setSelectedVenue(venue);
    document.body.style.overflow = "hidden";
  }

  function closeVenue() {
    setSelectedVenue(null);
    document.body.style.overflow = "";
  }

  function handleBook() {
    if (selectedVenue) setBookedVenueId(selectedVenue.id);
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
          filters={{ search, onlyOpen, onlyFree, genres }}
          onSearchChange={setSearch}
          onToggleOpen={() => setOnlyOpen((v) => !v)}
          onToggleFree={() => setOnlyFree((v) => !v)}
          onToggleGenre={toggleGenre}
          onResetFilters={resetFilters}
          onOpenVenue={openVenue}
        />
      )}
      {tab === "eventi" && <EventsView events={INITIAL_EVENTS} venues={INITIAL_VENUES} />}
      {tab === "community" && <CommunityView />}
      {tab === "profilo" && (
        <ProfileView userName={userName} bookedCount={bookedVenueId ? 1 : 0} />
      )}

      <VenueDetailModal
        venue={selectedVenue}
        events={INITIAL_EVENTS}
        booked={selectedVenue ? bookedVenueId === selectedVenue.id : false}
        onClose={closeVenue}
        onBook={handleBook}
      />
    </AppShell>
  );
}
