import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

export type AppRole = "player" | "manager" | "superadmin";

export interface Session {
  userId: string;
  role: AppRole;
  email: string;
  fullName: string;
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
  hours: string;
  totalTables: number;
  tags: string[];
  description: string;
  rating: number | null;
  status: VenueStatus;
  ownerId: string | null;
  /** Derived from `hours`. */
  openNow: boolean;
  /** Not tracked yet — undefined until real-time table state exists. */
  freeTables?: number;
  /** Not tracked yet — undefined until geolocation exists. */
  distanceKm?: number;
}

export interface GameEvent {
  id: number;
  venueName: string;
  title: string;
  date: string;
  time: string;
  genre: string;
  seatsLeft: number;
  seatsTotal: number;
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

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface VenueClaim {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string | null;
  name: string;
  city: string;
  address: string;
  hours: string | null;
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
