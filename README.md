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

Supabase env vars are required to run the site at all. The root layout and `proxy.ts` check the
signed-in user on every page, so the marketing pages need them too. See
**[Member area setup](#member-area-setup-supabase)** below.

Developer docs:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): how the code works, plus how-tos.
- [`docs/BACKLOG.md`](docs/BACKLOG.md): known issues and the fix list.

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
2. **Add env vars.** Create `.env.local` in the repo root. It's gitignored. Fill in the values
   from your Supabase project (**Settings → API**):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # secret, server-only. Never prefix it with NEXT_PUBLIC_
   ```
3. **Run the migrations.** In the Supabase dashboard **SQL Editor**, run, in order:
   `supabase/migrations/0001_init.sql` then `supabase/migrations/0002_allowlist_hook.sql`. Optionally
   run `supabase/seed.sql` for example data.
4. **Turn on the allowlist hook.** Dashboard → **Authentication → Hooks → Before User Created** →
   choose **Postgres**, schema `public`, function `before_user_created_allowlist`. This blocks
   anyone not on the member list from creating an account.
5. **Set up email.** Auth emails (confirm sign-up, reset password) go through Resend, sent from
   `no-reply@mail.icabc.co.uk`.
   - **SMTP:** Authentication → Emails → **SMTP Settings**. Use host `smtp.resend.com`, port `465`,
     username `resend`, and a Resend API key as the password.
   - **URL Configuration:** set **Site URL** to the production URL. Under **Redirect URLs**, add
     `<production URL>/**` and `http://localhost:3000/**`.
   - **Templates:** point the "Confirm sign up" and "Reset password" links at `/auth/callback`. The
     exact HTML is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#email-delivery).
   - **Confirm email:** once email is reaching people, turn it on under Authentication →
     Sign In / Providers → Email. This stops anyone claiming someone else's allowlisted address.
6. **Add member emails.** Dashboard → **Table Editor → `allowed_members`** → add each member's
   Imperial email (set `role` to `committee`/`admin` for organisers). Only these emails can create
   an account. Removing an email blocks new sign-ups only. To revoke an existing account, also
   delete the user under **Authentication → Users**.
7. **Seed live opportunities.** Add rows to the **`opportunities`** table — they appear at the top of
   the tracker for all members.

> Managing the allowlist and opportunities is done in the Supabase dashboard for now. A built-in
> committee admin UI is future work.

### How sign-in works

Members sign in with **email + password** (magic links were removed). A member creates their own
account on `/login` → **Create account**. That only succeeds if their email is in
`allowed_members`, and the hook from step 4 enforces it. With "Confirm email" on, they first click
a link in their inbox. Forgotten passwords are handled by **Forgot password?** on `/login`. For
details, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#4-auth-email--password-with-an-allowlist-gate).

## Deploy to Vercel

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), **New Project → Import** the repo. Framework auto-detects as
   Next.js.
3. Under **Settings → Environment Variables**, add the same three variables from `.env.local`.
   Redeploy.
4. In Supabase, set **Authentication → URL Configuration**: **Site URL** to your production URL,
   and add `<production URL>/**` to **Redirect URLs**. Email links won't work without this.
5. Add a custom domain later under the project's **Domains** tab.

## Design reference

The original high-fidelity design lives in `design_handoff_abc_website/`. That folder is
gitignored, so it exists only on the original developer's machine. Content was adapted to the
society's real situation (new society, one event, no sponsors yet) rather than copying the design's
placeholder numbers.
