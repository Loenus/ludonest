"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import {
  GENRES,
  INITIAL_EVENTS,
  INITIAL_REQUESTS,
  INITIAL_VENUES,
  MANAGED_VENUE_ID,
} from "@/lib/mock-data";
import { MANAGER_NAV } from "@/lib/nav";
import type { BookingRequest, GameEvent, RequestStatus, Venue } from "@/lib/types";

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

/** The prototype manager always owns venue #1. */
const OWNED_VENUE = INITIAL_VENUES.find((v) => v.id === MANAGED_VENUE_ID)!;

export function ManagerExperience({ userName }: { userName: string }) {
  const [tab, setTab] = useState("dashboard");

  const [venue, setVenue] = useState<Venue>(OWNED_VENUE);
  const [events, setEvents] = useState<GameEvent[]>(INITIAL_EVENTS);
  const [requests, setRequests] = useState<BookingRequest[]>(INITIAL_REQUESTS);

  const [venueForm, setVenueForm] = useState<Venue>(OWNED_VENUE);
  const [saveMessage, setSaveMessage] = useState("");

  const [showEventForm, setShowEventForm] = useState(false);
  const [draft, setDraft] = useState<NewEventDraft>(EMPTY_DRAFT);

  const managerEvents = useMemo(
    () =>
      events
        .filter((e) => e.venueId === MANAGED_VENUE_ID)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests],
  );

  function updateRequestStatus(id: number, status: RequestStatus) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

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
    setVenue(venueForm);
    setSaveMessage("Modifiche salvate");
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
        venueId: MANAGED_VENUE_ID,
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
          pendingCount={pendingRequests.length}
          upcomingEvents={managerEvents}
          pendingRequests={pendingRequests}
          onUpdateRequestStatus={updateRequestStatus}
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
          events={managerEvents}
          showForm={showEventForm}
          draft={draft}
          onToggleForm={() => setShowEventForm((v) => !v)}
          onDraftChange={patchDraft}
          onAdd={addEvent}
          onDelete={deleteEvent}
        />
      )}
      {tab === "prenotazioni" && (
        <RequestsView requests={requests} onUpdateRequestStatus={updateRequestStatus} />
      )}
    </AppShell>
  );
}
