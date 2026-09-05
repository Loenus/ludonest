import type { LucideIcon } from "lucide-react";

import type { WeeklyHours } from "@/lib/hours";

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

export type AppRole = "player" | "manager" | "superadmin";

export interface Session {
  userId: string;
  role: AppRole;
  email: string;
  fullName: string;
  /** Object path in the `avatars` bucket, or `null` for the generated default. */
  avatarPath: string | null;
}

/* ------------------------------------------------------------------ */
/*  Domain                                                             */
/* ------------------------------------------------------------------ */

export type Genre =
  | "Strategici"
  | "Party Game"
  | "Cooperativi"
  | "GDR"
  | "Wargame"
  | "Famiglia"
  | "Carte";

export type VenueStatus = "active" | "suspended";

/** UI-facing venue. Sourced from the `venues` table; a few fields are
 *  presentation-only and derived client-side (Stage 1 has no geolocation or
 *  live table state). */
export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  /** Structured opening hours, or `null` when not set. */
  hours: WeeklyHours | null;
  /** Address coordinates from the geocoder (nullable until set). */
  lat: number | null;
  lng: number | null;
  /** Object path in the `venue-logos` bucket, or `null` for the generated default. */
  logoPath: string | null;
  tags: string[];
  description: string;
  rating: number | null;
  status: VenueStatus;
  ownerId: string | null;
  /** Derived from `hours`. */
  openNow: boolean;
  /** Not tracked yet — undefined until geolocation exists. */
  distanceKm?: number;
}

/** Role-playing game / board game / card game. Mirrors the `event_kind` enum. */
export type EventKind = "gdr" | "tavolo" | "carte";

/** A venue referenced as a partner on an event (resolved from `venues`). */
export interface PartnerVenue {
  id: string;
  name: string;
  city: string;
  logoPath: string | null;
}

/** A venue event as managed from the dashboard. DB-backed (`events` table). */
export interface ManagerEvent {
  id: string;
  venueId: string;
  title: string;
  description: string;
  /** ISO timestamp — start date + time. */
  startsAt: string;
  kind: EventKind;
  /** Minimum consumption in euro, or `null` when none is required. */
  minConsumption: number | null;
  /** Open to every skill level (experienced, beginners, first-timers). */
  openToAll: boolean;
  seatsLimited: boolean;
  seatsTotal: number;
  /** Confirmed participants (denormalised `events.seats_taken`). */
  seatsTaken: number;
  /** Seats still free, or `null` when the event has no seat limit. */
  seatsLeft: number | null;
  /** Partner venues that host the event, resolved from `partner_venue_ids`. */
  partnerVenues: PartnerVenue[];
  /** Object path in the `event-covers` bucket, or `null` for the gradient fallback. */
  coverPath: string | null;
  /** Hex colour (`#rrggbb`) the manager picked to brand the page, or `null`. */
  accentColor: string | null;
  createdAt: string;
}

export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled";

/** A booking request as shown in the manager dashboard. */
export interface Booking {
  id: string;
  venueId: string;
  playerId: string;
  playerName: string;
  /** ISO timestamp. */
  startsAt: string;
  partySize: number;
  note: string | null;
  status: BookingStatus;
  decidedAt: string | null;
  createdAt: string;
}

/** A booking as shown in the player's own profile — same shape, plus the venue name. */
export interface PlayerBooking extends Omit<Booking, "playerName"> {
  venueName: string;
}

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface VenueClaim {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string | null;
  name: string;
  city: string;
  address: string;
  hours: WeeklyHours | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  status: ClaimStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface MatchPost {
  id: number;
  game: string;
  seeking: number;
  venueName: string;
  note: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}
