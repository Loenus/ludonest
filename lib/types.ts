import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

export type Role = "gamer" | "manager";

export interface Session {
  role: Role;
  name: string;
  email: string;
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

export interface Venue {
  id: number;
  name: string;
  city: string;
  address: string;
  distanceKm: number;
  rating: number;
  openNow: boolean;
  freeTables: number;
  totalTables: number;
  tags: string[];
  hours: string;
  description: string;
}

export interface GameEvent {
  id: number;
  venueId: number;
  title: string;
  date: string;
  time: string;
  genre: string;
  seatsLeft: number;
  seatsTotal: number;
}

export type RequestStatus = "pending" | "accepted" | "declined";

export interface BookingRequest {
  id: number;
  userName: string;
  date: string;
  time: string;
  people: number;
  status: RequestStatus;
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
