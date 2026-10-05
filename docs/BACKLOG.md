# Fix-it backlog

Items come from a code review in October 2026 and are ordered by priority. Each one says where the problem is and what the fix looks like. Tick items off as they land.

## P0 — Security

- [x] **Open redirect after login.** Fixed with `safeRedirect()` in `lib/urls.ts`, which is now used by the login action, the login page and `/auth/callback`.
- [ ] **Account squatting while "Confirm email" is off.** The code side is done:
  - `signUp` sets `emailRedirectTo`;
  - `/auth/callback` handles `token_hash` and `code` links;
  - sign-in handles `email_not_confirmed`.

  Email goes through Resend SMTP on `mail.icabc.co.uk`. **Still to do in the dashboard:**
  - turn **Confirm email** on;
  - set the URL Configuration and email templates (see `ARCHITECTURE.md` §4);
  - confirm that messages actually reach Imperial (`@imperial.ac.uk`) inboxes. Resend shows "Delivered", but test emails haven't shown up yet.
- [ ] **The allowlist pre-check fails open.** `isAllowlisted()` returns `null` on error and sign-up continues, so the allowlist hook is the only real gate. If the hook isn't enabled in the dashboard, anyone can sign up.
  - Fix: either treat `null` as a hard failure in production, or add a check to the README/deploy steps that the hook is enabled.

## P1 — Bugs

- [ ] **Public pages crash without Supabase env vars.** `app/layout.tsx` and `proxy.ts` call Supabase on every request using `!`-asserted env vars, so the marketing pages can't run unless Supabase is configured. This was inferred from reading the code, not tested.
  - Fix: guard both with an `isSupabaseConfigured` check, and treat the user as signed out when it fails.
- [ ] **Saving an opportunity twice creates duplicates.** `saveOpportunity` in `app/tracker/actions.ts` doesn't dedupe, and `OpportunityCard`'s `saved` state resets on reload.
  - Fix: check for an existing `(user_id, company, position)` row first, or add an `opportunity_id` column with a unique constraint on `(user_id, opportunity_id)`.
- [ ] **Failures aren't shown.** `OpportunityCard` ignores `{ok:false}`, and `ApplicationsTable.handleDelete` ignores the result of `deleteApplication`. Surface the error to the user in both places.
- [ ] **Past events never drop off.** `upcomingEvents` in `data/events.ts` sorts but doesn't filter.
  - Fix: filter on `date >= today`, and fall back to the empty state when nothing is left. The only current event is dated 2026-06-19.
- [x] **`?error=auth` is never displayed.** `/login` now shows an "expired or already used" banner for `?error=link` or `?error=auth`.
- [x] **The proxy deleted the PKCE code-verifier cookie** for every logged-out visitor, because `AuthSessionMissingError` is a 400. Now fixed in `lib/supabase/middleware.ts`.
- [x] **Lint error in `Nav.tsx`** (`setState` inside an effect). The menu now closes on route change by adjusting state during render.
- [ ] **Tracker dates can show the previous day.** `formatDate()` and `formatShortDate()` in `data/tracker.ts` call `new Date("YYYY-MM-DD")`, which parses as UTC midnight, then format with local-time `toLocaleDateString`. In negative-offset zones (for example the Americas) a stored `2025-09-02` displays as "1 Sep 2025". This affects the applications table (`ApplicationsTable`, date applied and deadline) and the opportunity cards' "Closes …" label (`OpportunityCard`).
  - Fix: reuse `parseIso()` and `formatDisplay()` from `lib/dates.ts`, which work on plain `{y, m, d}` values and are time-zone-safe. `formatShortDate()` needs a short day-month variant built on the same helpers.
- [ ] **The seed file isn't idempotent.** In `supabase/seed.sql`, the opportunities insert uses `on conflict do nothing`, but the table has no unique constraint, so re-running the seed duplicates rows.
- [ ] **The prospectus mailto subject isn't encoded.** `app/sponsors/page.tsx` builds the subject by hand. Use `mailto()` or `encodeURIComponent`.

## P1 — Auth gaps

- [x] **No password reset.** Built: `/forgot-password` → email → `/auth/callback` → `/reset-password`. Delivery depends on the email setup above.
- [ ] **Revoking a member is manual.** Removing someone from `allowed_members` doesn't sign them out or block an account that already exists. You'd need to delete the user in Auth, or add an RLS check against `allowed_members` on the tracker tables.

## P2 — Accessibility

- [ ] **Table rows aren't keyboard-accessible.** `ApplicationsTable` rows are clickable `div`s. Make them buttons or links, or add `tabIndex`, `role` and Enter/Space handling.
- [ ] **The delete button is hard to reach.** The ✕ is `opacity-0` until hover, so keyboard and touch users can't see it. Make it visible on `focus-visible` and on touch screens.
- [ ] **The `ApplicationForm` modal needs dialog behaviour.** It has no focus trap, doesn't close on Escape, has no `aria-labelledby` and doesn't return focus to the trigger on close. The native `<dialog>` element handles most of this.
  - Note: the date picker's `CalendarPopup` already calls `stopPropagation` in its Escape handler, so pressing Escape in an open popup closes only the popup, not the modal. The popup root also stops click propagation itself, so it doesn't depend on the panel wrapper's `stopPropagation`, which this refactor may remove.
- [ ] **Committee photos will have empty alt text.** `PhotoPlaceholder` defaults `alt` to `""`, so once photos are added, pass the member's name as `alt`.

## P2 — Cleanup

- [ ] **Remove the magic-link comment in `.env.local`.** `NEXT_PUBLIC_SITE_URL` is unused. `/auth/callback` is **kept**, because it now handles the confirm and reset links.
- [ ] **Remove or use `lib/supabase/client.ts`.** Nothing imports it.
- [x] **Fix the stale comment in `lib/supabase/middleware.ts`** (it named `middleware.ts` instead of `proxy.ts`).
- [ ] **Fix the stale header comment in `data/committee.ts`.** It says the entries are "clearly-marked placeholders", but they're now real names.
- [ ] **Remove the unused `.globe-spin` CSS** in `app/globals.css`.
- [ ] **Remove the unused default SVGs** in `public/`: `file`, `globe`, `next`, `vercel` and `window`.
- [ ] **Render `Opportunity.link` as an "Apply" link** in `OpportunityCard`. It's fetched but never shown.

## P3 — Features and infrastructure

- [ ] **Build the tracker "Chart" tab.** It currently shows "Coming soon".
- [ ] **Add a committee admin UI** for the allowlist and opportunities, using `allowed_members.role` (`committee`/`admin`).
- [ ] **Add tests and CI.** Use Vitest for `data/*` helpers and action validation, Playwright for the login and tracker flows, and a GitHub Action that runs `lint` and `build`.
- [ ] **Add event RSVP persistence and capacity**, replacing the current mailto RSVP.
