const GAMES = [
  "Catan",
  "Wingspan",
  "Root",
  "Terraforming Mars",
  "Brass: Birmingham",
  "Gloomhaven",
  "Ark Nova",
  "7 Wonders",
  "Dungeons & Dragons",
  "Everdell",
  "Carcassonne",
  "Scythe",
  "Azul",
  "Twilight Imperium",
];

/** Classic board-game pawn ("meeple") used as a separator between titles. */
function Meeple() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0 text-amber-500/70"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2c1.7 0 3 1.3 3 3 0 .8-.3 1.5-.8 2 .9.3 1.8.9 2.6 1.7l4 4-2.1 2.1-3.1-3.1c-.2 1 .1 2 .8 3.3l2.6 4.7H7l2.6-4.7c.7-1.3 1-2.3.8-3.3l-3.1 3.1L4.2 14.7l4-4c.8-.8 1.7-1.4 2.6-1.7-.5-.5-.8-1.2-.8-2 0-1.7 1.3-3 3-3z" />
    </svg>
  );
}

export function GameMarquee() {
  const row = [...GAMES, ...GAMES];

  return (
    <section className="border-y border-border/50 bg-card/40 py-8 backdrop-blur">
      <p className="mx-auto max-w-6xl px-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
        Dai grandi classici alle ultime novità
      </p>

      <div className="marquee-mask mt-5">
        <div className="marquee-track flex w-max items-center gap-6">
          {row.map((game, i) => (
            <span key={`${game}-${i}`} className="flex items-center gap-6">
              <span className="ff-display whitespace-nowrap text-lg font-semibold text-foreground/75 sm:text-xl">
                {game}
              </span>
              <Meeple />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
