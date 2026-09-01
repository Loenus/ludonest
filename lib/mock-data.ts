import type { BookingRequest, GameEvent, MatchPost, Venue } from "@/lib/types";

/* ---------------------------------- COSTANTI ---------------------------------- */

export const GENRES = [
  "Strategici", "Party Game", "Cooperativi", "GDR", "Wargame", "Famiglia", "Carte",
] as const;

export const SPINE_COLORS = ["#E8A93B", "#3FB89F", "#E0637A", "#8B7FD6", "#4FA3D1"];

/** Il locale gestito dall'utente "gestore" nel prototipo. */
export const MANAGED_VENUE_ID = 1;

/* ---------------------------------- DATI DI ESEMPIO ---------------------------------- */

export const INITIAL_VENUES: Venue[] = [
  { id: 1, name: "Il Dado Nero", city: "Milano", address: "Via dei Giochi 12", distanceKm: 0.8, rating: 5.2, openNow: true, freeTables: 3, totalTables: 10, tags: ["Strategici", "Cooperativi", "Famiglia"], hours: "16:00 - 24:00", description: "Locale storico nel cuore della città con oltre 500 giochi in libreria e un angolo dedicato ai cooperativi più recenti." },
  { id: 2, name: "Meeple House", city: "Milano", address: "Corso Ludico 45", distanceKm: 1.4, rating: 4.7, openNow: true, freeTables: 0, totalTables: 8, tags: ["Party Game", "Famiglia"], hours: "15:00 - 23:00", description: "Atmosfera informale, tornei settimanali di party game e drink a tema." },
  { id: 3, name: "Tavolo Rotondo", city: "Milano", address: "Piazza Torneo 3", distanceKm: 2.1, rating: 5.8, openNow: false, freeTables: 5, totalTables: 12, tags: ["GDR", "Wargame"], hours: "18:00 - 02:00", description: "Il punto di riferimento per giocatori di ruolo e wargamer, con tavoli prenotabili per campagne lunghe." },
  { id: 4, name: "La Locanda dei Giochi", city: "Milano", address: "Via del Ponte 88", distanceKm: 3.0, rating: 4.3, openNow: true, freeTables: 2, totalTables: 6, tags: ["Famiglia", "Carte"], hours: "14:00 - 22:00", description: "Un salotto accogliente, perfetto per famiglie e principianti, con staff sempre pronto a spiegare le regole." },
  { id: 5, name: "Zona Franca", city: "Milano", address: "Via Underground 7", distanceKm: 1.9, rating: 5.0, openNow: true, freeTables: 1, totalTables: 9, tags: ["Strategici", "GDR", "Carte"], hours: "17:00 - 01:00", description: "Spazio underground con eventi a tema e community molto attiva sui giochi di carte competitivi." },
  { id: 6, name: "Scacco Matto Café", city: "Milano", address: "Largo Regina 21", distanceKm: 2.6, rating: 4.9, openNow: false, freeTables: 4, totalTables: 7, tags: ["Strategici", "Famiglia"], hours: "09:00 - 20:00", description: "Caffetteria di giorno, ludoteca nel weekend: scacchi, giochi astratti e ottimo caffè." },
];

export const INITIAL_EVENTS: GameEvent[] = [
  { id: 1, venueId: 1, title: "Torneo di Wingspan", date: "2026-08-28", time: "20:30", genre: "Strategici", seatsLeft: 2, seatsTotal: 8 },
  { id: 2, venueId: 3, title: "Campagna D&D - Sessione 1", date: "2026-08-29", time: "18:00", genre: "GDR", seatsLeft: 0, seatsTotal: 5 },
  { id: 3, venueId: 5, title: "Serata Carte - Sette e Mezzo", date: "2026-08-30", time: "21:00", genre: "Carte", seatsLeft: 4, seatsTotal: 10 },
  { id: 4, venueId: 2, title: "Party Game Night", date: "2026-09-02", time: "19:30", genre: "Party Game", seatsLeft: 6, seatsTotal: 12 },
];

export const INITIAL_REQUESTS: BookingRequest[] = [
  { id: 1, userName: "Marco B.", date: "2026-08-27", time: "20:00", people: 4, status: "pending" },
  { id: 2, userName: "Giulia F.", date: "2026-08-28", time: "18:30", people: 2, status: "pending" },
  { id: 3, userName: "Team Catan Lovers", date: "2026-08-26", time: "21:00", people: 6, status: "accepted" },
];

export const MATCH_POSTS: MatchPost[] = [
  { id: 1, game: "Root", seeking: 2, venueName: "Il Dado Nero", note: "Cerchiamo 2 giocatori esperti per una campagna asimmetrica." },
  { id: 2, game: "Catan", seeking: 1, venueName: "Zona Franca", note: "Manca un giocatore per completare il tavolo di stasera." },
];
