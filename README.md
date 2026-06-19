# Advancing Black Careers (ABC) — Imperial College London

Marketing website for the ABC student society. Built with **Next.js (App Router) + React +
TypeScript + Tailwind CSS v4**. Dark-and-gold editorial design.

Public pages: **Landing (`/`)**, **Events (`/events`)**, **Sponsors (`/sponsors`)**,
**Committee (`/committee`)**. The member area — **Login (`/login`)** and the **Internship Tracker
(`/tracker`)** — is powered by [Supabase](https://supabase.com) (Postgres + Auth + Row-Level
Security). Sign-in is **Imperial email + password**, restricted to a committee-managed **member
allowlist** (only emails on the list can create an account).

## Run locally

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
npm run build    # production build
```

The marketing pages work without any setup. The login + tracker need Supabase configured — see
**[Member area setup](#member-area-setup-supabase)** below.

## Editing content — everything you'll change lives in `/data`

| File | What to edit |
|------|--------------|
| `data/site.ts` | Society **email**, **Instagram/LinkedIn** links, and the **membership sign-up URL** (paste your Google Form / union join link). Every button on the site reads from here. |
| `data/events.ts` | Your **events**. Replace the placeholder launch event with real details (title, date, time, location, description). Add more objects to the array as you run more — the page updates automatically. |
| `data/committee.ts` | Your **committee** members (name, role, course). |

### Adding photos
Drop image files in `/public` (e.g. `public/events/launch.jpg`, `public/committee/jane.jpg`) and set
the matching `photo: "/events/launch.jpg"` field in the data file. Until then, tasteful gold-glow
placeholders show.

## Member area setup (Supabase)

One-time setup to enable login + the internship tracker.

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is plenty for ≤150
   members).
2. **Add env vars.** Copy `.env.local.example` to `.env.local` and fill in the values from your
   Supabase project (**Settings → API**): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL`
   (`http://localhost:3000` locally; your real domain in production).
3. **Run the migrations.** In the Supabase dashboard **SQL Editor**, run, in order:
   `supabase/migrations/0001_init.sql` then `supabase/migrations/0002_allowlist_hook.sql`. Optionally
   run `supabase/seed.sql` for example data.
4. **Turn on the allowlist hook.** Dashboard → **Authentication → Hooks → Before User Created** →
   choose **Postgres**, schema `public`, function `before_user_created_allowlist`. This blocks
   anyone not on the member list from creating an account.
5. **Turn off email confirmation.** Dashboard → **Authentication → Sign In / Providers → Email** →
   disable **Confirm email**. Members are gated by the allowlist hook, so they can sign up with a
   password and use the tracker immediately without waiting on a confirmation email.
6. **Add member emails.** Dashboard → **Table Editor → `allowed_members`** → add each member's
   Imperial email (set `role` to `committee`/`admin` for organisers). Only these emails can sign in.
7. **Seed live opportunities.** Add rows to the **`opportunities`** table — they appear at the top of
   the tracker for all members.

> Managing the allowlist and opportunities is done in the Supabase dashboard for now; a built-in
> committee admin UI is future work.

## Deploy to Vercel

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), **New Project → Import** the repo. Framework auto-detects as
   Next.js.
3. Under **Settings → Environment Variables**, add the same four variables from `.env.local`
   (set `NEXT_PUBLIC_SITE_URL` to your production URL). Redeploy.
4. In Supabase, add your production URL to **Authentication → URL Configuration → Redirect URLs**
   (e.g. `https://your-domain/auth/callback`).
5. Add a custom domain later under the project's **Domains** tab.

## Design reference

The original high-fidelity design lives in `design_handoff_abc_website/`. Content was adapted to the
society's real situation (new society, one event, no sponsors yet) rather than copying the design's
placeholder numbers.
