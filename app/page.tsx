'use client';
import React, { useState } from "react";
import {
  Search, MapPin, Clock, Users, CalendarDays, LayoutDashboard, Store,
  ClipboardList, Sparkles, CheckCircle2, XCircle, Trash2, X, Navigation,
  TrendingUp, UserCircle2, Building2, Dice6, Dices, ChevronRight, Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/* ---------------------------------- DATI DI ESEMPIO ---------------------------------- */

const GENRES = ["Strategici", "Party Game", "Cooperativi", "GDR", "Wargame", "Famiglia", "Carte"];
const SPINE_COLORS = ["#E8A93B", "#3FB89F", "#E0637A", "#8B7FD6", "#4FA3D1"];
const MONTHS = ["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];

const INITIAL_VENUES = [
  { id: 1, name: "Il Dado Nero", city: "Milano", address: "Via dei Giochi 12", distanceKm: 0.8, rating: 5.2, openNow: true, freeTables: 3, totalTables: 10, tags: ["Strategici", "Cooperativi", "Famiglia"], hours: "16:00 - 24:00", description: "Locale storico nel cuore della città con oltre 500 giochi in libreria e un angolo dedicato ai cooperativi più recenti." },
  { id: 2, name: "Meeple House", city: "Milano", address: "Corso Ludico 45", distanceKm: 1.4, rating: 4.7, openNow: true, freeTables: 0, totalTables: 8, tags: ["Party Game", "Famiglia"], hours: "15:00 - 23:00", description: "Atmosfera informale, tornei settimanali di party game e drink a tema." },
  { id: 3, name: "Tavolo Rotondo", city: "Milano", address: "Piazza Torneo 3", distanceKm: 2.1, rating: 5.8, openNow: false, freeTables: 5, totalTables: 12, tags: ["GDR", "Wargame"], hours: "18:00 - 02:00", description: "Il punto di riferimento per giocatori di ruolo e wargamer, con tavoli prenotabili per campagne lunghe." },
  { id: 4, name: "La Locanda dei Giochi", city: "Milano", address: "Via del Ponte 88", distanceKm: 3.0, rating: 4.3, openNow: true, freeTables: 2, totalTables: 6, tags: ["Famiglia", "Carte"], hours: "14:00 - 22:00", description: "Un salotto accogliente, perfetto per famiglie e principianti, con staff sempre pronto a spiegare le regole." },
  { id: 5, name: "Zona Franca", city: "Milano", address: "Via Underground 7", distanceKm: 1.9, rating: 5.0, openNow: true, freeTables: 1, totalTables: 9, tags: ["Strategici", "GDR", "Carte"], hours: "17:00 - 01:00", description: "Spazio underground con eventi a tema e community molto attiva sui giochi di carte competitivi." },
  { id: 6, name: "Scacco Matto Café", city: "Milano", address: "Largo Regina 21", distanceKm: 2.6, rating: 4.9, openNow: false, freeTables: 4, totalTables: 7, tags: ["Strategici", "Famiglia"], hours: "09:00 - 20:00", description: "Caffetteria di giorno, ludoteca nel weekend: scacchi, giochi astratti e ottimo caffè." },
];

const INITIAL_EVENTS = [
  { id: 1, venueId: 1, title: "Torneo di Wingspan", date: "2026-08-28", time: "20:30", genre: "Strategici", seatsLeft: 2, seatsTotal: 8 },
  { id: 2, venueId: 3, title: "Campagna D&D - Sessione 1", date: "2026-08-29", time: "18:00", genre: "GDR", seatsLeft: 0, seatsTotal: 5 },
  { id: 3, venueId: 5, title: "Serata Carte - Sette e Mezzo", date: "2026-08-30", time: "21:00", genre: "Carte", seatsLeft: 4, seatsTotal: 10 },
  { id: 4, venueId: 2, title: "Party Game Night", date: "2026-09-02", time: "19:30", genre: "Party Game", seatsLeft: 6, seatsTotal: 12 },
];

const INITIAL_REQUESTS = [
  { id: 1, userName: "Marco B.", date: "2026-08-27", time: "20:00", people: 4, status: "pending" },
  { id: 2, userName: "Giulia F.", date: "2026-08-28", time: "18:30", people: 2, status: "pending" },
  { id: 3, userName: "Team Catan Lovers", date: "2026-08-26", time: "21:00", people: 6, status: "accepted" },
];

const MATCH_POSTS = [
  { id: 1, game: "Root", seeking: 2, venueName: "Il Dado Nero", note: "Cerchiamo 2 giocatori esperti per una campagna asimmetrica." },
  { id: 2, game: "Catan", seeking: 1, venueName: "Zona Franca", note: "Manca un giocatore per completare il tavolo di stasera." },
];

const PLAYER_NAV = [
  { id: "cerca", label: "Cerca", icon: Search },
  { id: "eventi", label: "Eventi", icon: CalendarDays },
  { id: "community", label: "Community", icon: Users },
  { id: "profilo", label: "Profilo", icon: UserCircle2 },
];

const MANAGER_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "locale", label: "Il tuo locale", icon: Store },
  { id: "eventi", label: "Eventi", icon: CalendarDays },
  { id: "prenotazioni", label: "Prenotazioni", icon: ClipboardList },
];

/* ---------------------------------- HELPER ---------------------------------- */

function formatEventDate(dateStr: string): { day: string; month: string } {
  const d = new Date(dateStr + "T00:00:00");
  return { day: String(d.getDate()).padStart(2, "0"), month: MONTHS[d.getMonth()] };
}

/* ---------------------------------- COMPONENTI UI ---------------------------------- */

function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-400/30">
        <Dices size={19} className="text-slate-950" />
      </div>
      <span className="ff-display text-lg font-bold tracking-tight text-foreground">TAVOLO</span>
    </div>
  );
}

function RoleSwitch({ role, setRole }: { role: string; setRole: (r: string) => void }) {
  return (
    <div className="flex gap-1.5 rounded-2xl bg-gradient-to-b from-white/80 to-amber-50/60 p-1.5 shadow-[0_12px_24px_rgba(120,84,31,0.08)] ring-1 ring-amber-100/80 backdrop-blur dark:from-transparent dark:to-transparent dark:shadow-none dark:ring-0">
      {["player", "manager"].map((r: string) => (
        <button
          key={r}
          type="button"
          onClick={() => setRole(r)}
          className={[
            "rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200",
            role === r
              ? "bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-400/20"
              : "text-[#5a3d2d] hover:text-[#2e1c11] dark:text-muted-foreground dark:hover:text-foreground",
          ].join(" ")}
        >
          {r === "player" ? "Giocatore" : "Gestore"}
        </button>
      ))}
    </div>
  );
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <Badge
      variant="secondary"
      className="rating-badge h-7 gap-1.5 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-amber-100/80 to-orange-50 px-2.5 text-[10px] shadow-[0_8px_18px_rgba(217,119,6,0.12)] dark:border-amber-400/40 dark:bg-gradient-to-r dark:from-amber-400/15 dark:to-amber-500/10 dark:shadow-none"
    >
      <Dice6 size={12} className="text-amber-500 dark:text-amber-400" />
      <span className="font-mono font-bold text-[11px] text-amber-700 dark:text-amber-300">{rating.toFixed(1)}</span>
      <span className="font-mono text-[9px] text-amber-600/80 dark:text-muted-foreground">/6</span>
    </Badge>
  );
}

function FilterChip({ label, icon: Icon, active, onClick }: { label: string; icon?: any; active: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      className={[
        "h-10 sm:h-9 shrink-0 rounded-xl px-3.5 text-xs sm:text-[11px] font-medium transition-all duration-200",
        active
          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/30 hover:shadow-lg"
          : "border border-[#e7c998] bg-[#fffaf2] text-[#4a3020] shadow-[0_8px_18px_rgba(127,94,53,0.08)] hover:border-[#d9a95c] hover:text-[#2a1a12] hover:bg-[#fff0d6] dark:border-border/60 dark:bg-transparent dark:text-muted-foreground dark:shadow-none",
      ].join(" ")}
    >
      {Icon && <Icon size={12} className="-ml-0.5" />}
      {label}
    </Button>
  );
}

function VenueCard({ venue, onOpen }: { venue: any; onOpen: (v: any) => void }) {
  const spine = SPINE_COLORS[venue.id % SPINE_COLORS.length];
  return (
    <Card className="group overflow-hidden border border-border/60 bg-card/90 backdrop-blur p-0 transition-all duration-300 shadow-[0_8px_24px_rgba(120,113,108,0.08)] hover:border-amber-400/50 hover:shadow-[0_16px_36px_rgba(245,158,11,0.12)] active:border-amber-400/60 dark:shadow-none">
      <button onClick={() => onOpen(venue)} className="w-full text-left">
        <div className="flex">
          <div className="w-3 shrink-0 transition-all duration-300 group-hover:w-4" style={{ background: spine }} />
          <div className="flex-1 p-4 sm:p-4">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm sm:text-base font-semibold text-foreground">{venue.name}</h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{venue.address}, {venue.city}</p>
              </div>
              <RatingBadge rating={venue.rating} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {venue.tags.map((t: string) => (
                <Badge key={t} variant="secondary" className="h-6 rounded-full border border-amber-200/80 bg-amber-50/90 px-2 text-[10px] text-amber-900 shadow-sm shadow-amber-200/40 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:shadow-none">{t}</Badge>
              ))}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 border-t border-border pt-2.5">
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Navigation size={12} /><span className="font-mono">{venue.distanceKm} km</span>
                </span>
                <span className="flex items-center gap-1.5" style={{ color: venue.openNow ? "var(--teal)" : "var(--coral)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: venue.openNow ? "var(--teal)" : "var(--coral)" }} />
                  {venue.openNow ? "Aperto ora" : "Chiuso"}
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground text-right sm:text-left">{venue.freeTables}/{venue.totalTables} tavoli</span>
            </div>
          </div>
        </div>
      </button>
    </Card>
  );
}

function VenueDetailModal({ venue, events, onClose, onBook, booked }: { venue: any; events: any[]; onClose: () => void; onBook: () => void; booked: boolean }) {
  if (!venue) return null;
  const spine = SPINE_COLORS[venue.id % SPINE_COLORS.length];
  const venueEvents = events.filter((e: any) => e.venueId === venue.id);
  const venuePosts = MATCH_POSTS.filter((p: any) => p.venueName === venue.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[6px] sm:p-6 md:p-8" onClick={onClose}>
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="max-h-[92vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[28px] border border-border/60 bg-card/95 shadow-[0_30px_80px_rgba(50,32,16,0.24)] ring-1 ring-border/40 transition-all duration-300 ease-out sm:w-[min(92vw,32rem)] md:max-w-xl"
      >
        <div className="h-3 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${spine}, ${spine}cc)` }} />
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="ff-display text-[1.35rem] font-bold tracking-[-0.03em] text-foreground">{venue.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-[0.82rem] text-muted-foreground">
                <MapPin size={13} /> {venue.address}, {venue.city}
              </p>
            </div>
            <button onClick={onClose} className="shrink-0 rounded-full bg-muted p-1.5 shadow-sm transition-all duration-200 hover:bg-muted/80 dark:hover:bg-muted/80">
              <X size={16} className="text-foreground" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingBadge rating={venue.rating} />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={13} /> {venue.hours}
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: venue.openNow ? "var(--teal)" : "var(--coral)" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: venue.openNow ? "var(--teal)" : "var(--coral)" }} />
              {venue.openNow ? "Aperto ora" : "Chiuso ora"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {venue.tags.map((t: string) => (
              <Badge key={t} variant="secondary" className="h-6 rounded-full border border-amber-200/80 bg-amber-50/90 px-2 text-[10px] text-amber-900 shadow-sm shadow-amber-200/40 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:shadow-none">{t}</Badge>
            ))}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground">{venue.description}</p>

          {venueEvents.length > 0 && (
            <div className="mt-6">
              <h4 className="ff-display mb-2.5 text-sm font-semibold text-foreground">Prossimi eventi</h4>
              <div className="flex flex-col gap-2">
                {venueEvents.map((ev: any) => {
                  const d = formatEventDate(ev.date);
                  return (
                    <div key={ev.id} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-2.5 dark:border-border/50 dark:bg-muted/40">
                      <div className="flex min-w-[44px] flex-col items-center justify-center rounded-xl bg-background p-1.5 ring-1 ring-border/30 dark:ring-border/50">
                        <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">{d.day}</span>
                        <span className="font-mono text-[9px] text-muted-foreground">{d.month}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">{ev.time} · {ev.seatsLeft} posti liberi</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-2.5 flex items-center gap-2">
              <h4 className="ff-display text-sm font-semibold text-foreground">Trova compagni di gioco</h4>
              <Badge variant="outline" className="border-amber-400/40 bg-amber-400/5 text-amber-300">
                <Sparkles size={11} /> In arrivo
              </Badge>
            </div>
            {venuePosts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {venuePosts.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-card p-2.5 dark:border-border/50 dark:bg-muted/40">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.game} · cercano {p.seeking}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.note}</p>
                    </div>
                    <Button disabled variant="outline" size="sm" className="shrink-0 text-xs opacity-60">Presto</Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nessuna richiesta di gruppo per questo locale al momento.</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={onBook} disabled={booked} className="flex-1 rounded-2xl border border-[#dca96d] bg-[linear-gradient(135deg,#f8d58c_0%,#f0b55a_35%,#df9146_100%)] text-[#2d1c12] font-semibold shadow-[0_16px_28px_rgba(184,117,38,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(184,117,38,0.28)] disabled:opacity-75 dark:border-amber-500/40 dark:bg-gradient-to-r dark:from-amber-600 dark:to-amber-700 dark:text-white dark:shadow-[0_16px_28px_rgba(120,53,15,0.24)] dark:hover:shadow-[0_18px_32px_rgba(120,53,15,0.32)]">
              {booked ? "✓ Richiesta inviata" : "Prenota un tavolo"}
            </Button>
          </div>
          {booked && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 size={13} /> Il locale ti risponderà a breve.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- APP ---------------------------------- */

export default function App() {
  const [role, setRole] = useState("player");
  const [playerTab, setPlayerTab] = useState("cerca");
  const [managerTab, setManagerTab] = useState("dashboard");

  const [venues, setVenues] = useState(INITIAL_VENUES);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const [search, setSearch] = useState("");
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [bookedVenueId, setBookedVenueId] = useState<number | null>(null);

  const managedVenue = venues.find((v) => v.id === 1)!;
  const [venueForm, setVenueForm] = useState({ ...managedVenue });
  const [saveMessage, setSaveMessage] = useState("");

  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "", genre: GENRES[0], seatsTotal: 8 });

  const navItems = role === "player" ? PLAYER_NAV : MANAGER_NAV;
  const activeTab = role === "player" ? playerTab : managerTab;
  const setActiveTab = role === "player" ? setPlayerTab : setManagerTab;

  function toggleGenre(g: string) {
    setActiveGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function openVenue(v: any) {
    setSelectedVenue(v);
    document.body.style.overflow = "hidden";
  }

  function closeVenue() {
    setSelectedVenue(null);
    document.body.style.overflow = "";
  }

  function handleBook() {
    if (!selectedVenue) return;
    setBookedVenueId(selectedVenue.id);
    if (selectedVenue.id === 1) {
      setRequests((prev) => [
        { id: Date.now(), userName: "Tu (richiesta demo)", date: "2026-08-26", time: "20:00", people: 2, status: "pending" },
        ...prev,
      ]);
    }
  }

  function updateRequestStatus(id: number, status: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  function saveVenue() {
    setVenues((prev) => prev.map((v) => (v.id === 1 ? { ...venueForm } : v)));
    setSaveMessage("Modifiche salvate");
    setTimeout(() => setSaveMessage(""), 2500);
  }

  function toggleFormTag(g: string) {
    setVenueForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).includes(g) ? prev.tags!.filter((t) => t !== g) : [...(prev.tags || []), g],
    }));
  }

  function addEvent() {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    setEvents((prev) => [
      ...prev,
      { id: Date.now(), venueId: 1, ...newEvent, seatsTotal: Number(newEvent.seatsTotal), seatsLeft: Number(newEvent.seatsTotal) },
    ]);
    setNewEvent({ title: "", date: "", time: "", genre: GENRES[0], seatsTotal: 8 });
    setShowEventForm(false);
  }

  function deleteEvent(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const filteredVenues = venues
    .filter((v) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = q === "" || v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || v.tags.some((t) => t.toLowerCase().includes(q));
      const matchesOpen = !onlyOpen || v.openNow;
      const matchesFree = !onlyFree || v.freeTables > 0;
      const matchesGenres = activeGenres.length === 0 || activeGenres.every((g) => v.tags.includes(g));
      return matchesSearch && matchesOpen && matchesFree && matchesGenres;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const managerEvents = events.filter((e) => e.venueId === 1).sort((a, b) => a.date.localeCompare(b.date));
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  /* ------------------------------ TAB: GIOCATORE ------------------------------ */

  function renderCerca() {
    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
        <div>
          <h1 className="ff-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">Trova il tuo tavolo</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">{filteredVenues.length} ludopub trovati</p>
        </div>

        <div className="relative w-full">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca ludopub..."
            className="w-full h-11 sm:h-12 rounded-2xl border border-border/60 bg-muted/40 pl-10 text-sm shadow-sm focus-visible:bg-background focus-visible:shadow-md transition-all duration-200"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip label="Aperto ora" icon={Clock} active={onlyOpen} onClick={() => setOnlyOpen(!onlyOpen)} />
          <FilterChip label="Tavoli liberi" icon={Users} active={onlyFree} onClick={() => setOnlyFree(!onlyFree)} />
          {GENRES.map((g) => (
            <FilterChip key={g} label={g} active={activeGenres.includes(g)} onClick={() => toggleGenre(g)} />
          ))}
        </div>

        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
            {filteredVenues.map((v) => <VenueCard key={v.id} venue={v} onOpen={openVenue} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3 sm:gap-4 rounded-2xl border border-border/60 bg-muted/40 py-16 sm:py-20 px-4 sm:px-6 w-full">
            <div className="rounded-full bg-muted/60 p-3 sm:p-4">
              <Dices size={32} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium text-foreground">Nessun ludopub trovato</p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Modifica i filtri</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearch(""); setActiveGenres([]); setOnlyOpen(false); setOnlyFree(false); }}
              className="mt-2 rounded-xl text-xs font-medium border-border/60 hover:bg-muted/80"
            >
              Reimposta filtri
            </Button>
          </div>
        )}
      </div>
    );
  }

  function renderEventiPlayer() {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
        <h1 className="ff-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Eventi e tornei</h1>
        <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full">
          {sorted.map((ev) => {
            const venue = venues.find((v) => v.id === ev.venueId);
            const d = formatEventDate(ev.date);
            const pct = Math.round(((ev.seatsTotal - ev.seatsLeft) / ev.seatsTotal) * 100);
            const full = ev.seatsLeft === 0;
            return (
              <Card key={ev.id} className="border border-border/60 bg-card/80 backdrop-blur p-3 sm:p-4 transition-all duration-200 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-400/10 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 px-3 py-2 ring-1 ring-amber-400/30">
                    <span className="font-mono text-base sm:text-lg font-bold text-amber-400">{d.day}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{d.month}</span>
                  </div>
                  <div className="min-w-0 flex-1 w-full">
                    <p className="truncate text-xs sm:text-sm font-semibold text-foreground">{ev.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] sm:text-xs text-muted-foreground">
                      <MapPin size={12} /> {venue ? venue.name : "—"} · {ev.time}
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: pct + "%", background: full ? "#f87171" : "#14b8a6" }} />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col sm:items-end gap-2 w-full sm:w-auto">
                    <Badge variant="secondary" className="h-6 w-fit rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 text-[10px] font-medium text-amber-900 shadow-sm shadow-amber-200/40 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:shadow-none">{ev.genre}</Badge>
                    <Button disabled={full} size="sm" className="h-8 sm:h-9 rounded-xl px-3 sm:px-4 text-[10px] sm:text-[11px] font-medium bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 disabled:opacity-60 transition-all w-full sm:w-auto">
                      {full ? "Al completo" : "Partecipa"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCommunity() {
    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="ff-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Community</h1>
          <Badge variant="outline" className="border border-amber-400/40 bg-gradient-to-r from-amber-400/10 to-amber-500/5 text-amber-300 text-xs sm:text-sm">
            <Sparkles size={12} /> In arrivo
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Presto potrai trovare altri giocatori. Preview:
        </p>
        <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full">
          {MATCH_POSTS.map((p) => (
            <Card key={p.id} className="border border-border/60 bg-card/80 backdrop-blur p-3 sm:p-4 transition-all hover:border-amber-400/40 hover:shadow-lg w-full">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1 w-full">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">{p.game} <span className="font-normal text-muted-foreground">· {p.seeking} {p.seeking === 1 ? "giocatore" : "giocatori"}</span></p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground"><MapPin size={12} /> {p.venueName}</p>
                  <p className="mt-1 text-[11px] sm:text-xs text-foreground">{p.note}</p>
                </div>
                <Button disabled variant="outline" size="sm" className="shrink-0 text-xs font-medium opacity-60 border-border/60 w-full sm:w-auto">Presto</Button>
              </div>
            </Card>
          ))}
        </div>
        <Card className="border border-border/60 bg-gradient-to-br from-amber-400/10 to-amber-500/5 backdrop-blur p-4 sm:p-5 ring-1 ring-amber-400/20 w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex-1 text-xs sm:text-sm font-medium text-foreground">Vuoi essere avvisato?</p>
            <Button className="shrink-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-400/30 hover:shadow-xl transition-all text-xs sm:text-sm w-full sm:w-auto">Avvisami</Button>
          </div>
        </Card>
      </div>
    );
  }

  function renderProfilo() {
    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
        <h1 className="ff-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Profilo</h1>
        <Card className="flex items-center gap-3 sm:gap-4 border border-border/60 bg-card/80 backdrop-blur p-4 sm:p-5 w-full">
          <div className="flex h-12 sm:h-14 w-12 sm:w-14 shrink-0 items-center justify-center rounded-full bg-muted">
            <UserCircle2 size={28} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="ff-display text-base font-semibold text-foreground truncate">Giocatore Ospite</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Demo · Milano</p>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3 w-full">
          <Card className="border border-border/60 bg-card/80 backdrop-blur p-4 w-full">
            <p className="font-mono text-xl sm:text-2xl font-bold text-amber-400">{bookedVenueId ? 1 : 0}</p>
            <p className="mt-1 text-xs text-muted-foreground">Prenotazioni</p>
          </Card>
          <Card className="border border-border/60 bg-card/80 backdrop-blur p-4 w-full">
            <p className="font-mono text-xl sm:text-2xl font-bold text-amber-400">3</p>
            <p className="mt-1 text-xs text-muted-foreground">Preferiti</p>
          </Card>
        </div>
        <Card className="overflow-hidden border border-border/60 bg-card/80 backdrop-blur w-full">
          {["Notifiche", "Preferenze", "Esci"].map((label, i) => (
            <button key={label} className="flex w-full items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm text-foreground transition-colors hover:bg-muted/40" style={{ borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)" }}>
              {label}
              <ChevronRight size={15} className="text-muted-foreground" />
            </button>
          ))}
        </Card>
      </div>
    );
  }

  /* ------------------------------ TAB: GESTORE ------------------------------ */

  function renderDashboard() {
    const stats = [
      { label: "Visite oggi", value: "47", icon: TrendingUp },
      { label: "Richieste in attesa", value: String(pendingCount), icon: ClipboardList },
      { label: "Tavoli occupati", value: `${managedVenue.totalTables - managedVenue.freeTables}/${managedVenue.totalTables}`, icon: Building2 },
      { label: "Valutazione media", value: managedVenue.rating.toFixed(1) + "/6", icon: Dice6 },
    ];
    return (
      <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
        <h1 className="ff-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          {stats.map((s) => (
            <Card key={s.label} className="border border-border/60 bg-card/80 backdrop-blur p-3 sm:p-4 w-full">
              <s.icon size={14} className="text-amber-400" />
              <p className="mt-2 font-mono text-base sm:text-lg font-bold text-foreground">{s.value}</p>
              <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        <Card className="border border-border/60 bg-card/80 backdrop-blur p-4 sm:p-5 w-full">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="ff-display text-xs sm:text-sm font-semibold text-foreground truncate">Prossimi eventi</h4>
            <button onClick={() => setManagerTab("eventi")} className="text-xs text-amber-400 shrink-0">Vedi</button>
          </div>
          {managerEvents.slice(0, 2).map((ev) => (
            <div key={ev.id} className="flex items-center justify-between border-t border-border py-2 text-xs sm:text-sm first:border-t-0 gap-2">
              <span className="text-foreground truncate">{ev.title}</span>
              <span className="font-mono text-[10px] sm:text-xs text-muted-foreground shrink-0">{ev.date}</span>
            </div>
          ))}
        </Card>

        <Card className="border border-border/60 bg-card/80 backdrop-blur p-4 sm:p-5 w-full">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="ff-display text-xs sm:text-sm font-semibold text-foreground truncate">Richieste recenti</h4>
            <button onClick={() => setManagerTab("prenotazioni")} className="text-xs text-amber-400 shrink-0">Vedi</button>
          </div>
          {requests.filter((r) => r.status === "pending").slice(0, 2).map((r) => (
            <div key={r.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-border py-2 sm:py-3 first:border-t-0 gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-foreground truncate">{r.userName}</p>
                <p className="mt-0.5 font-mono text-[10px] sm:text-xs text-muted-foreground">{r.date} · {r.time} · {r.people}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => updateRequestStatus(r.id, "accepted")} className="rounded-full bg-muted p-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </button>
                <button onClick={() => updateRequestStatus(r.id, "declined")} className="rounded-full bg-muted p-1.5">
                  <XCircle size={14} className="text-rose-400" />
                </button>
              </div>
            </div>
          ))}
          {pendingCount === 0 && <p className="pt-2 text-xs text-muted-foreground">Nessuna richiesta in attesa.</p>}
        </Card>
      </div>
    );
  }

  function renderLocale() {
    return (
      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="ff-display text-2xl md:text-3xl font-bold text-foreground">Il tuo locale</h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Nome locale</label>
            <Input className="mt-1.5" value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Città</label>
            <Input className="mt-1.5" value={venueForm.city} onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Indirizzo</label>
            <Input className="mt-1.5" value={venueForm.address} onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Orario</label>
            <Input className="mt-1.5" value={venueForm.hours} onChange={(e) => setVenueForm({ ...venueForm, hours: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Numero tavoli totali</label>
            <Input type="number" className="mt-1.5" value={venueForm.totalTables} onChange={(e) => setVenueForm({ ...venueForm, totalTables: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Generi disponibili</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <FilterChip key={g} label={g} active={venueForm.tags.includes(g)} onClick={() => toggleFormTag(g)} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Descrizione</label>
          <textarea rows={4} className="mt-1.5 w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={venueForm.description} onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })} />
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={saveVenue} className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300">Salva modifiche</Button>
          {saveMessage && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle2 size={14} /> {saveMessage}
            </span>
          )}
        </div>
      </div>
    );
  }

  function renderEventiManager() {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="ff-display text-2xl md:text-3xl font-bold text-foreground">Eventi</h1>
          <Button onClick={() => setShowEventForm(!showEventForm)} className="flex items-center gap-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300">
            <Plus size={15} /> Nuovo evento
          </Button>
        </div>

        {showEventForm && (
          <Card className="grid grid-cols-1 gap-3 border-border/80 bg-card p-4 md:grid-cols-2">
            <Input placeholder="Titolo evento" className="md:col-span-2" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
            <Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
            <select className="h-9 w-full rounded-xl border border-input bg-input/30 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={newEvent.genre} onChange={(e) => setNewEvent({ ...newEvent, genre: e.target.value })}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <Input type="number" placeholder="Posti totali" value={newEvent.seatsTotal} onChange={(e) => setNewEvent({ ...newEvent, seatsTotal: Number(e.target.value) })} />
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={addEvent} className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300">Salva evento</Button>
              <Button variant="outline" onClick={() => setShowEventForm(false)} className="rounded-xl">Annulla</Button>
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-2.5">
          {managerEvents.map((ev) => (
            <Card key={ev.id} className="flex items-center gap-3 border-border/80 bg-card p-3.5">
              <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-muted px-2.5 py-1.5">
                <span className="font-mono text-sm font-bold text-amber-400">{formatEventDate(ev.date).day}</span>
                <span className="font-mono text-[9px] text-muted-foreground">{formatEventDate(ev.date).month}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                <p className="font-mono text-xs text-muted-foreground">{ev.time} · {ev.seatsTotal} posti</p>
              </div>
              <Badge variant="secondary" className="h-6 shrink-0 rounded-full px-2 text-[10px]">{ev.genre}</Badge>
              <button onClick={() => deleteEvent(ev.id)} className="shrink-0 rounded-full bg-muted p-1.5">
                <Trash2 size={14} className="text-rose-400" />
              </button>
            </Card>
          ))}
          {managerEvents.length === 0 && <p className="text-sm text-muted-foreground">Nessun evento in programma. Creane uno nuovo.</p>}
        </div>
      </div>
    );
  }

  function renderPrenotazioni() {
    const statusStyle: Record<string, string> = {
      pending: "bg-amber-400/10 text-amber-300 border-amber-400/30",
      accepted: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
      declined: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    };
    const statusLabel: Record<string, string> = { pending: "In attesa", accepted: "Accettata", declined: "Rifiutata" };
    return (
      <div className="flex flex-col gap-5">
        <h1 className="ff-display text-2xl md:text-3xl font-bold text-foreground">Richieste di prenotazione</h1>
        <div className="flex flex-col gap-2.5">
          {requests.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-border/80 bg-card p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{r.userName}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">{r.date} · {r.time} · {r.people} persone</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={['rounded-full border px-2.5 py-1 text-xs font-semibold', statusStyle[r.status]].join(' ')}>
                  {statusLabel[r.status]}
                </span>
                {r.status === "pending" && (
                  <>
                    <Button onClick={() => updateRequestStatus(r.id, "accepted")} variant="outline" size="sm" className="flex items-center gap-1 rounded-xl border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">
                      <CheckCircle2 size={13} /> Accetta
                    </Button>
                    <Button onClick={() => updateRequestStatus(r.id, "declined")} variant="outline" size="sm" className="flex items-center gap-1 rounded-xl border-rose-500/40 text-rose-300 hover:bg-rose-500/10">
                      <XCircle size={13} /> Rifiuta
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function renderContent() {
    if (role === "player") {
      if (playerTab === "cerca") return renderCerca();
      if (playerTab === "eventi") return renderEventiPlayer();
      if (playerTab === "community") return renderCommunity();
      return renderProfilo();
    }
    if (managerTab === "dashboard") return renderDashboard();
    if (managerTab === "locale") return renderLocale();
    if (managerTab === "eventi") return renderEventiManager();
    return renderPrenotazioni();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <aside className="hidden border-r border-border/60 bg-card/80 backdrop-blur md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:p-6">
          <BrandLogo />
          <div className="mt-8 rounded-2xl bg-muted/40 backdrop-blur p-1.5"><RoleSwitch role={role} setRole={(r) => { setRole(r); }} /></div>
          <nav className="mt-8 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={[
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  activeTab === item.id
                    ? "bg-gradient-to-r from-amber-400/20 to-amber-500/10 text-amber-300 ring-1 ring-amber-400/30 shadow-md"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                ].join(" ")}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-muted/40 p-4 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">Demo · v0.1</p>
            <p className="mt-1 text-[10px] text-muted-foreground/70">Prototipo</p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col md:ml-64">
          {/* Header mobile */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur md:hidden">
            <BrandLogo />
            <RoleSwitch role={role} setRole={setRole} />
          </header>

          <main className="w-full flex-1 px-4 sm:px-5 md:px-8 py-6 sm:py-8 pb-24 md:pb-10">
            {renderContent()}
          </main>
        </div>

        {/* Bottom nav mobile */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border/60 bg-card/90 backdrop-blur md:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={[
                "flex flex-1 flex-col items-center gap-1.5 py-3 text-[10px] font-medium transition-colors",
                activeTab === item.id ? "text-amber-400" : "text-muted-foreground",
              ].join(" ")}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <VenueDetailModal
        venue={selectedVenue}
        events={events}
        onClose={closeVenue}
        onBook={handleBook}
        booked={selectedVenue ? bookedVenueId === selectedVenue.id : false}
      />
    </div>
  );
}