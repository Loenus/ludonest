# LudoNest

**Il tavolo da gioco più vicino a te.**

LudoNest è la piattaforma che mette in contatto i ludopub e i locali da gioco da tavolo con chi vuole giocare. Da un lato i giocatori trovano un locale, prenotano un tavolo e scoprono gli eventi in programma; dall'altro i gestori dei locali amministrano prenotazioni, orari ed eventi da un'unica dashboard — senza telefonate, fogli Excel o messaggi sparsi.

## Di cosa si tratta

Chi organizza serate di giochi da tavolo conosce il problema: trovare un tavolo libero richiede una telefonata, sapere cosa succede stasera in un locale richiede di seguirlo sui social, e chi gestisce il locale finisce a tenere il registro delle prenotazioni a mano. LudoNest prova a risolvere tutto questo con un'unica web app:

- **Trovare un locale** — l'utente sfoglia i ludopub della rete, con orari, indirizzo e generi di gioco disponibili.
- **Prenotare un tavolo** — in pochi tocchi, senza dover contattare nessuno.
- **Scoprire gli eventi** — tornei, serate a tema, campagne di ruolo, demo di novità: ogni evento ha una propria pagina con dettagli, copertina e posti rimasti.
- **Gestire un locale** — chi amministra un ludopub ha una dashboard dedicata per accettare/rifiutare le prenotazioni in tempo reale, creare eventi e tenere aggiornate le informazioni del locale.

### I tre ruoli

Tutti si registrano come utenti normali; da lì si diramano tre livelli:

1. **Giocatore** — può prenotare tavoli e iscriversi agli eventi di qualsiasi locale.
2. **Gestore** — un giocatore può proporsi come amministratore di *un* locale; una volta approvato, sblocca la dashboard di gestione per quel ludopub.
3. **Superadmin** — supervisiona la rete: approva o rifiuta le richieste di gestione e ha visibilità completa su locali e prenotazioni.

### Roadmap

- [x] Progettazione del database
- [x] Integrazione con Supabase
- [x] Autenticazione (email/password + Google)
- [ ] Prenotazioni: rifinitura lato gestore e lato giocatore
- [ ] "Trova il tuo tavolo" con mappa
- [ ] Pagine evento più curate graficamente, come vere pagine di riferimento dell'evento

## Com'è fatta (per chi programma)

Un'applicazione web full-stack, pensata per essere semplice da mantenere e veloce da far girare:

- **[Next.js 16](https://nextjs.org)** (App Router) + **React 19** + **TypeScript** — le pagine sono organizzate per ruolo sotto `app/` (`app/app` per i giocatori, `app/dashboard` per i gestori, `app/admin` per il superadmin).
- **[Supabase](https://supabase.com)** come backend: Postgres per i dati, Auth per il login, Storage per le immagini (loghi dei locali, avatar, copertine eventi) e Realtime per aggiornare le prenotazioni a schermo senza ricaricare la pagina. Lo schema, le policy di Row Level Security e i dati di esempio vivono in `supabase/migrations/` e `supabase/seed.sql`.
- **Tailwind CSS 4** + componenti **shadcn/ui** per l'interfaccia.
- Deploy come **Cloudflare Worker** tramite **OpenNext**, con pipeline **GitHub Actions** che ad ogni push su `main` applica le migration al database e pubblica l'app.

Documentazione più approfondita:

- [`docs/SUPABASE.md`](./docs/SUPABASE.md) — come configurare un progetto Supabase da zero (schema, auth, ruoli).
- [`docs/DEPLOY-CLOUDFLARE.md`](./docs/DEPLOY-CLOUDFLARE.md) — come funziona il deploy su Cloudflare e perché questa scelta.

## Avviare il progetto in locale

```bash
npm install
cp .env.example .env.local   # poi vedi docs/SUPABASE.md per compilarlo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).
