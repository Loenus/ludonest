import type { MatchPost } from "@/lib/types";

/* ---------------------------------- COSTANTI ---------------------------------- */

export const GENRES = [
  "Strategici", "Party Game", "Cooperativi", "GDR", "Wargame", "Famiglia", "Carte",
] as const;

export const SPINE_COLORS = ["#E8A93B", "#3FB89F", "#E0637A", "#8B7FD6", "#4FA3D1"];

/* --------------------------------------------------------------------------- */
/*  Stage 1 note: venues, bookings, claims and events are now in Supabase.     */
/*  Community/match posts are still mock and self-contained (Stage 2).         */
/* --------------------------------------------------------------------------- */

export const MATCH_POSTS: MatchPost[] = [
  { id: 1, game: "Root", seeking: 2, venueName: "Il Dado Nero", note: "Cerchiamo 2 giocatori esperti per una campagna asimmetrica." },
  { id: 2, game: "Catan", seeking: 1, venueName: "Zona Franca", note: "Manca un giocatore per completare il tavolo di stasera." },
];
