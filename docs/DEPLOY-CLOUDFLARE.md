# Deploy — Cloudflare Workers + GitHub Actions

Replaces the Vercel Git integration. On every push to `main`, GitHub Actions:

1. applies pending Supabase migrations to the **hosted** database, then
2. builds the app with [OpenNext](https://opennext.js.org/cloudflare) and deploys
   it as a **Cloudflare Worker**.

Pull requests get a Vercel-style preview URL posted as a PR comment.

---

## Why Workers + OpenNext (and not Cloudflare Pages)

`@cloudflare/next-on-pages` is in maintenance mode and forces the Edge runtime on
every route. This app uses `next/headers` cookies, Server Actions, the `proxy.ts`
session refresh and the `@supabase/*` Node libraries. `@opennextjs/cloudflare`
runs the full Next.js Node server inside a Worker (`nodejs_compat`), so all of
that keeps working. It is also the integration the Next.js 16 docs point to and
Cloudflare's own "verified adapter" is being built on top of it.

> **Known caveat:** Next.js 16 runs `proxy.ts` (middleware) on the Node runtime.
> OpenNext supports Node middleware but labels it *experimental* (you'll see a
> `WARN Node.js middleware support is experimental` line in the build). It works
> for this app's cookie-refresh + optimistic guard today; if a future OpenNext
> release breaks it, the fallback is to move the guard logic into a root layout
> Server Component (see `node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`,
> "Proxy" section).

---

## Files already added to the repo

| File | Purpose |
| --- | --- |
| `wrangler.jsonc` | Worker name, entrypoint, compat flags, static assets |
| `open-next.config.ts` | OpenNext adapter config (minimal — in-memory cache) |
| `next.config.ts` | unchanged (see the note about `initOpenNextCloudflareForDev()` if you add CF bindings later) |
| `.github/workflows/deploy.yml` | migrate → build → deploy on push to `main` |
| `.github/workflows/preview.yml` | per-PR preview version + comment |
| `.dev.vars.example` | template for local `npm run preview` env |
| `supabase/config.toml` | created by `supabase init`; lets the CLI manage migrations |
| `package.json` | `preview`, `deploy`, `cf-typegen` scripts |

The migration file was renamed `0001_init.sql` → `20250101000000_init.sql` so the
Supabase CLI recognises it as a versioned migration.

---

## Part A — Hosted Supabase

You can keep using your current Supabase project as **production**, or spin up a
fresh one. A fresh project is the clean path because CI can apply the migration
from zero (see A.4 for the "existing project" fix-up).

### A.1 Project + keys

1. <https://supabase.com/dashboard> → your project.
2. **Settings → API**: copy `Project URL`, `anon` key, `service_role` key.

### A.2 Database connection string (for CI migrations)

**Connect** (top bar) → **Session pooler** → copy the URI. It looks like:

```
postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

- Use the **Session pooler (port 5432)**, not Transaction (6543) — migrations
  need a real session.
- **Percent-encode** any special characters in the password (`@` → `%40`, etc.).
- Don't use the "Direct connection" host (`db.<ref>.supabase.co`) — it is
  IPv6-only and GitHub Actions runners can't reach it.

### A.3 Access token (for the preview/link flows, optional but recommended)

**Account → Access Tokens** → generate one. Only needed if you later switch CI to
`supabase link` instead of `--db-url`.

### A.4 If you reuse an existing project that already has the schema

CI runs `supabase db push`, which would try to re-run `20250101000000_init.sql`
and fail (`type "user_role" already exists`). Mark it as already applied, once,
from your machine:

```bash
export DBURL='postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres'
npx supabase migration list --db-url "$DBURL"      # see current state
npx supabase migration repair --status applied 20250101000000 --db-url "$DBURL"
```

### A.5 Seed data (once)

`db push` does **not** run `supabase/seed.sql`. Run it once against the hosted DB:

```bash
psql "$DBURL" -f supabase/seed.sql        # idempotent — 6 demo venues
```

(or paste it into the dashboard SQL editor).

### A.6 Auth URL configuration

**Authentication → URL Configuration**

- **Site URL:** your production URL (e.g. `https://ludonest.com`).
- **Redirect URLs:** add
  - `https://ludonest.com/**`
  - `https://*.ludonest.workers.dev/**` (preview versions)
  - keep `http://localhost:3000/**` for local dev.

Turn **Confirm email** back **on** for production (the app already handles the
`/auth/callback` "check your inbox" flow). For Google OAuth the authorized
redirect URI stays `https://<ref>.supabase.co/auth/v1/callback`.

---

## Part B — Cloudflare

### B.1 Account + Workers subdomain

1. Create/sign in at <https://dash.cloudflare.com>.
2. **Workers & Pages** → **Overview** → set your `*.workers.dev` subdomain if you
   haven't (first visit prompts for it).
3. Note your **Account ID** (Workers & Pages → Overview, right sidebar).

### B.2 API token for CI

**My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"** template.

Minimum scopes if you build a custom token:

- Account · **Workers Scripts** · Edit
- Account · **Workers R2 Storage** · Edit *(only if you add the R2 cache later)*
- Account · **Account Settings** · Read
- User · **Memberships** · Read
- Zone · **Workers Routes** · Edit *(only if you attach a custom domain via route)*

Copy the token value now — it's shown once.

### B.3 First deploy from your machine (creates the Worker)

```bash
cp .dev.vars.example .dev.vars      # fill with the same values as .env.local
npx wrangler login                  # or export CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
npm run deploy
```

This creates a Worker named `ludonest` (from `wrangler.jsonc`). Change that
`name` first if you want something else.

### B.4 Set the server-only secret on the Worker

`SUPABASE_SERVICE_ROLE_KEY` must never be in the client bundle or the repo. Set it
as a Worker secret:

```bash
echo -n "<service_role key>" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

or dashboard: **Workers & Pages → ludonest → Settings → Variables and Secrets →
Add → Secret**.

> `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are **build-time**
> (inlined by `next build`), so they live in GitHub Actions, not in Worker
> secrets. If any server code reads them at runtime too, also add them as plain
> Worker **vars** (dashboard or a `"vars"` block in `wrangler.jsonc`) — they are
> not secret.

### B.5 Custom domain

**Workers & Pages → ludonest → Settings → Domains & Routes → Add → Custom
domain** → `ludonest.com`. Cloudflare provisions the cert. If the domain's DNS is
not on Cloudflare yet, add the site under **Websites** first and switch the
nameservers.

Then set `NEXT_PUBLIC_SITE_URL` (Part C) to `https://ludonest.com` and update the
Supabase Site URL (A.6).

---

## Part C — GitHub repository configuration

**Repo → Settings → Secrets and variables → Actions.**

### Secrets

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | from B.2 |
| `CLOUDFLARE_ACCOUNT_ID` | from B.1 |
| `SUPABASE_DB_URL` | Session pooler URI from A.2 (password percent-encoded) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |

### Variables

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://ludonest.com` (or your `workers.dev` URL until the domain is live) |

`NEXT_PUBLIC_*` are not real secrets (they ship to the browser anyway); they're
kept as Actions secrets only to keep the workflow file clean. The service-role
key is deliberately **not** here — it's a Worker secret (B.4).

---

## Part D — How the automation works

### `deploy.yml` (push to `main`)

- **`migrate` job** — installs the Supabase CLI and runs
  `supabase db push --db-url "$SUPABASE_DB_URL" --include-all`. Applied versions
  are tracked in `supabase_migrations.schema_migrations` on the remote DB, so a
  push with no new migration files is a no-op.
- **`deploy` job** (`needs: migrate`) — `npm ci`, then
  `npx opennextjs-cloudflare build` (which runs `next build` with the
  `NEXT_PUBLIC_*` env in scope) and `npx wrangler deploy`.

Add a migration later with `npx supabase migration new <name>`, commit the
generated `supabase/migrations/*.sql`, push — CI applies it before the new code
goes live.

### `preview.yml` (pull requests)

Builds the branch and runs `wrangler versions upload` (a preview version, **not**
a production deploy), then comments the generated
`https://<hash>-ludonest.<subdomain>.workers.dev` URL on the PR. Previews use the
**production** Supabase project — there is no per-branch database.

---

## Part E — Disconnect Vercel

Nothing in the repo ties it to Vercel (no `vercel.json`, no `.vercel/`), so this
is all dashboard-side:

1. **Vercel dashboard → the project → Settings → Git → Disconnect** (stops
   build-on-push).
2. Optionally **Settings → Advanced → Delete Project** to tear down the
   deployments and domains.
3. **DNS:** move the domain's records to Cloudflare (Part B.5). If the registrar
   pointed `A`/`CNAME` at Vercel (`76.76.21.21` / `cname.vercel-dns.com`), those
   are replaced by the Cloudflare custom-domain records automatically once the
   zone is on Cloudflare.
4. Remove the **Vercel GitHub app** from the repo if you don't use it elsewhere:
   GitHub → Settings → Integrations → Applications → Vercel → Configure → remove
   repo access.
5. Delete any Vercel-only env vars you had duplicated there (they now live in
   GitHub Actions + Worker secrets).

`.vercel` is still in `.gitignore` — harmless to leave.

---

## Part F — Local development

- **`npm run dev`** — unchanged. Uses `.env.local`, Turbopack, fast refresh.
  Does not touch `.dev.vars`. (If you later use `getCloudflareContext()`, add
  `initOpenNextCloudflareForDev()` to `next.config.ts` — see the note there.)
- **`npm run preview`** — builds with OpenNext and serves the actual Worker
  locally via `workerd`. Reads `.dev.vars` (not `.env.local`). Use this to
  reproduce a production-only bug before pushing.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `migrate` job: `type "user_role" already exists` | Existing DB — run the `migration repair` from A.4 once. |
| `migrate` job hangs then times out | Wrong connection string — must be **Session pooler (5432)**, password percent-encoded, not the IPv6 direct host. |
| Deploy OK but 500s on every page | `SUPABASE_SERVICE_ROLE_KEY` secret not set on the Worker (B.4), or `NEXT_PUBLIC_*` missing from the build env (Part C). |
| Login redirects to `/login?error=auth` | Production URL not in Supabase **Redirect URLs** (A.6). |
| `wrangler deploy` → `nodejs_compat` error | `compatibility_date` in `wrangler.jsonc` must be ≥ `2024-09-23` (it's `2025-09-01`). |
| Build warns about experimental Node middleware | Expected — see the caveat at the top. |
| Static assets 404 | `.open-next/assets` missing — `wrangler deploy` must run *after* `opennextjs-cloudflare build` in the same job (it does). |
| `wrangler deploy` → "script too large" | The bundled Worker is ~3 MB gzipped, right at the **Workers Free** limit. Upgrade to **Workers Paid** ($5/mo, 10 MB gzip limit). Check the current size with `npx wrangler deploy --dry-run`. |

---

## Optional — shared ISR cache (R2)

Only if you add pages using ISR or `use cache` and need them consistent across
Worker instances:

1. `npx wrangler r2 bucket create ludonest-inc-cache`
2. In `wrangler.jsonc` add:
   ```jsonc
   "r2_buckets": [
     { "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "ludonest-inc-cache" }
   ]
   ```
3. In `open-next.config.ts` switch to the R2 override:
   ```ts
   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
   ```
4. Add `Account · Workers R2 Storage · Edit` to the CI API token.
