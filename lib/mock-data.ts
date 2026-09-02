import type { GameEvent, MatchPost } from "@/lib/types";

/* ---------------------------------- COSTANTI ---------------------------------- */

export const GENRES = [
  "Strategici", "Party Game", "Cooperativi", "GDR", "Wargame", "Famiglia", "Carte",
] as const;

export const SPINE_COLORS = ["#E8A93B", "#3FB89F", "#E0637A", "#8B7FD6", "#4FA3D1"];

/* --------------------------------------------------------------------------- */
/*  Stage 1 note: venues, bookings and claims are now in Supabase. Events and  */
/*  community/match posts are still mock and self-contained (Stage 2).         */
/* --------------------------------------------------------------------------- */

export const INITIAL_EVENTS: GameEvent[] = [
  { id: 1, venueName: "Il Dado Nero", title: "Torneo di Wingspan", date: "2026-09-12", time: "20:30", genre: "Strategici", seatsLeft: 2, seatsTotal: 8 },
  { id: 2, venueName: "Tavolo Rotondo", title: "Campagna D&D - Sessione 1", date: "2026-09-14", time: "18:00", genre: "GDR", seatsLeft: 0, seatsTotal: 5 },
  { id: 3, venueName: "Zona Franca", title: "Serata Carte - Sette e Mezzo", date: "2026-09-18", time: "21:00", genre: "Carte", seatsLeft: 4, seatsTotal: 10 },
  { id: 4, venueName: "Meeple House", title: "Party Game Night", date: "2026-09-20", time: "19:30", genre: "Party Game", seatsLeft: 6, seatsTotal: 12 },
];

export const MATCH_POSTS: MatchPost[] = [
  { id: 1, game: "Root", seeking: 2, venueName: "Il Dado Nero", note: "Cerchiamo 2 giocatori esperti per una campagna asimmetrica." },
  { id: 2, game: "Catan", seeking: 1, venueName: "Zona Franca", note: "Manca un giocatore per completare il tavolo di stasera." },
];
