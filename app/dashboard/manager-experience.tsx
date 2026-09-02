"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { GENRES } from "@/lib/mock-data";
import { MANAGER_NAV } from "@/lib/nav";
import type { Booking, GameEvent, Venue } from "@/lib/types";

import { EventsView, type NewEventDraft } from "./_components/events-view";
import { OverviewView } from "./_components/overview-view";
import { RequestsView } from "./_components/requests-view";
import { VenueView } from "./_components/venue-view";

const EMPTY_DRAFT: NewEventDraft = {
  title: "",
  date: "",
  time: "",
  genre: GENRES[0],
  seatsTotal: 8,
};

interface ManagerExperienceProps {
  userName: string;
  venue: Venue;
  bookings: Booking[];
}

export function ManagerExperience({ userName, venue, bookings }: ManagerExperienceProps) {
  const [tab, setTab] = useState("dashboard");

  // Venue editing and events are local-only in Stage 1 (persistence is Stage 2).
  const [venueForm, setVenueForm] = useState<Venue>(venue);
  const [saveMessage, setSaveMessage] = useState("");
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [draft, setDraft] = useState<NewEventDraft>(EMPTY_DRAFT);

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings],
  );

  function patchVenueForm(patch: Partial<Venue>) {
    setVenueForm((prev) => ({ ...prev, ...patch }));
  }

  function toggleVenueFormTag(tag: string) {
    setVenueForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  function saveVenue() {
    setSaveMessage("Salvataggio disponibile a breve");
    setTimeout(() => setSaveMessage(""), 2500);
  }

  function patchDraft(patch: Partial<NewEventDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function addEvent() {
    if (!draft.title || !draft.date || !draft.time) return;
    const seats = Number(draft.seatsTotal);
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        venueName: venue.name,
        title: draft.title,
        date: draft.date,
        time: draft.time,
        genre: draft.genre,
        seatsTotal: seats,
        seatsLeft: seats,
      },
    ]);
    setDraft(EMPTY_DRAFT);
    setShowEventForm(false);
  }

  function deleteEvent(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

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
      {tab === "locale" && (
        <VenueView
          form={venueForm}
          saveMessage={saveMessage}
          onChange={patchVenueForm}
          onToggleTag={toggleVenueFormTag}
          onSave={saveVenue}
        />
      )}
      {tab === "eventi" && (
        <EventsView
          events={events}
          showForm={showEventForm}
          draft={draft}
          onToggleForm={() => setShowEventForm((v) => !v)}
          onDraftChange={patchDraft}
          onAdd={addEvent}
          onDelete={deleteEvent}
        />
      )}
      {tab === "prenotazioni" && <RequestsView bookings={bookings} />}
    </AppShell>
  );
}
