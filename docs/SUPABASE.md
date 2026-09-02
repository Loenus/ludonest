# Supabase setup — LudoNest (Stage 1)

Real auth (email/password + Google) and the relational backend for users,
venues, venue claims and bookings. Do these steps once.

## 1. Create the project

1. Create a project at <https://supabase.com/dashboard>. Note the **project ref**
   (the `xxxx` in `https://xxxx.supabase.co`).
2. **Settings → API** — copy `Project URL`, `anon` key and `service_role` key.

## 2. Environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # server only — never NEXT_PUBLIC_
```

`.env*` is gitignored. Restart `npm run dev` after editing.

## 3. Apply the schema

**SQL editor** (Dashboard → SQL) — run in order:

1. paste and run `supabase/migrations/20250101000000_init.sql`
2. paste and run `supabase/seed.sql` (6 demo venues; safe to re-run)

Or with the CLI linked to the project: `supabase db push` then
`psql "$DATABASE_URL" -f supabase/seed.sql`.

For the **hosted** production database this runs automatically from GitHub
Actions on every push to `main` — see [`DEPLOY-CLOUDFLARE.md`](./DEPLOY-CLOUDFLARE.md).

## 4. Auth configuration

**Authentication → URL Configuration**

- Site URL: `http://localhost:3000` (add the production URL later)
- Redirect URLs: add `http://localhost:3000/**`

**Authentication → Providers → Email** (or **Authentication → Sign In / Up** on
newer dashboards): keep the provider enabled and **turn *Confirm email* OFF** for
local testing. With it off:

- sign-up logs you straight in — no email is sent, `/auth/callback` isn't needed;
- any syntactically valid address works (`mario@test.it`, `a@b.co`, …) — Supabase
  doesn't check deliverability, so throw-away emails are fine.

Turn *Confirm email* back on for production (the app already handles the
"check your inbox" flow via `/auth/callback` when it's on).

There is no SQL for this — it's a project setting. If you must flip it without
the dashboard, use the Management API:
`PATCH https://api.supabase.com/v1/projects/<ref>/config/auth` with
`{ "mailer_autoconfirm": true }` and a personal access token.

**Authentication → Providers → Google**

1. Google Cloud Console → *APIs & Services → Credentials* → *Create OAuth client
   ID* → *Web application*.
2. Authorized redirect URI:
   `https://<ref>.supabase.co/auth/v1/callback`
3. Paste the Client ID and Client Secret into the Google provider in Supabase and
   enable it.

## 5. Make yourself a superadmin

Sign up once in the app (email or Google), then in the SQL editor:

```sql
update public.profiles
set role = 'superadmin'
where id = (select id from auth.users where email = 'you@example.com');
```

Sign out / in again. `/admin` is now reachable.

## 6. Smoke test

- **Player**: sign up at `/login` → lands on `/app`. `select * from profiles`
  shows `role = 'player'`.
- **Google**: "Continua con Google" at `/login` → `/auth/callback` → `/app`.
- **Booking**: open a venue in `/app`, submit the "Prenota un tavolo" form →
  new row in `bookings` with `status = 'pending'`.
- **Manager**: sign up at `/partner/login` → redirected to `/partner/claim` →
  submit the claim → `/dashboard` shows the "in revisione" state.
- **Approve**: as superadmin open `/admin` → *Richieste locali* → *Approva* →
  a `venues` row is created (`owner_id` = requester) and their `profiles.role`
  becomes `manager`.
- The new manager opens `/dashboard → Prenotazioni`: the player's request is
  under **Da confermare**; *Accetta* moves it to **Prossime confermate** under
  the right day; *Rifiuta* drops it into the collapsed **Rifiutate**;
  *Vedi vecchie prenotazioni* only ever loads bookings before today.

## Notes / limits (Stage 1)

- Events, community/match posts and venue ratings are still mock data (Stage 2).
- Venue editing and event creation in the manager dashboard are local-only
  previews for now — not persisted.
- Booking history stays in Postgres. A `bookings` row is ~200–300 B; the free
  tier's 500 MB holds well over a million. If it ever matters, partition
  `bookings` by month and drop old partitions — do not move rows to files.
