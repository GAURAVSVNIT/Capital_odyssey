# Capital Odyssey

Event management app for **Capital Odyssey** — an admin registers teams and moderator accounts; each of the 6 (+1 Lender) station moderators runs a shared 45-minute team timer and records cash adjustments as teams make decisions at their station. The admin dashboard shows a live leaderboard sorted by net worth.

## Stack

Next.js (App Router, TypeScript) · Prisma 7 (`@prisma/adapter-pg`) · Postgres via [Neon](https://neon.tech) · Auth.js v5 (Credentials) · SWR for live polling · Tailwind CSS.

## How it works

- Every team starts with **₹1,00,000**. Every cash change (station outcome, investment reveal, loan, penalty, final settlement) is recorded as a signed **transaction**; balance and final net worth are just `100000 + sum(transactions)`.
- Each team has **one shared 45-minute timer** for the whole event. Any moderator (or the admin) can start it once, then pause/resume it while working with the team at any station. The server always computes elapsed time itself — client-sent durations are never trusted.
- Roles: **ADMIN** (registers teams, manages moderator accounts, can adjust any team from `/admin/teams/[id]` — used for the final settlement) and **MODERATOR** (locked to one station's page, e.g. `/station/3`).

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in values. For a quick local Postgres, Prisma can run one for you:

   ```bash
   npx prisma dev
   ```

   This prints a `DATABASE_URL` — paste it into `.env`. Generate a real `AUTH_SECRET`/`NEXTAUTH_SECRET` with:

   ```bash
   npx auth secret
   ```

3. Apply the schema and seed the 7 stations + bootstrap admin account (from `ADMIN_USERNAME`/`ADMIN_PASSWORD` in `.env`):

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

   Sign in at `/login` with your admin credentials, register teams under **Teams**, and create one moderator account per station under **Moderators** (each moderator is locked to their assigned station).

## Deploying (Neon + Vercel)

These steps involve creating accounts/cloud resources, so they're for you to run — not something this assistant does on your behalf.

1. **Push this repo to GitHub** (or your git host of choice).
2. **Create a Neon project** at [neon.tech](https://neon.tech) (or use the Neon integration from the Vercel Marketplace when importing the project below). Copy the pooled connection string it gives you — that's your production `DATABASE_URL`.
3. **Import the repo into Vercel** ([vercel.com/new](https://vercel.com/new)).
4. In the Vercel project's **Environment Variables**, set:
   - `DATABASE_URL` — the Neon connection string
   - `AUTH_SECRET` and `NEXTAUTH_SECRET` — output of `npx auth secret`
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — your real admin login for the event
5. **Run the migration + seed against the production database** before first deploy (from your machine, with `DATABASE_URL` temporarily set to the Neon URL):

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

6. Deploy. Once live, log in as admin, register teams, and create one moderator login per station for event day.

## Project structure

- `prisma/schema.prisma` — data model (`User`, `Station`, `Team`, `Transaction`)
- `prisma/seed.ts` — seeds the 7 stations + bootstrap admin
- `src/auth.ts` / `src/middleware.ts` — Auth.js config and role-based route gating
- `src/app/api/*` — REST endpoints backing the UI (teams, timer actions, transactions, stations, users)
- `src/app/admin/*` — admin dashboard, team registration/ledger, moderator management
- `src/app/station/[stationNumber]` — per-station moderator view
