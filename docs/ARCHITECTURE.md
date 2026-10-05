# ABC website — architecture & developer reference

Website for **Advancing Black Careers (ABC)**, a student society at Imperial College London.
It has two halves:

1. **Public pages** (`/`, `/events`, `/sponsors`, `/committee`). Content comes from TypeScript files in `/data`. There is no CMS.
2. **Members' area** (`/login`, `/tracker`). This is an internship application tracker built on Supabase (Auth, Postgres and Row-Level Security). Only emails on a committee-managed allowlist can create an account.

Known issues and planned fixes live in [`BACKLOG.md`](./BACKLOG.md).

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js **16.2.9**, App Router, Turbopack |
| UI | React **19.2.4**, TypeScript 5 (`strict`) |
| Styling | Tailwind CSS **v4**, configured in CSS (`@theme` in `app/globals.css`). There is **no** `tailwind.config.*` |
| Backend | Supabase via `@supabase/ssr` + `@supabase/supabase-js` |
| Fonts | `next/font/google`: Cormorant Garamond (serif), Hanken Grotesk (body), JetBrains Mono (mono) |
| Lint | ESLint 9 flat config (`eslint-config-next` core-web-vitals + typescript) |
| Tests | Vitest **5.0.3** + fast-check **4.10.2** (exact-pinned devDependencies), unit and property tests for `lib/dates.ts` only. `@types/node` is `^22` to meet Vitest's peer requirement |
| CI | None |
| Hosting | Vercel (documented in the README; no `vercel.json`) |

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm test` (`vitest run`, one pass, no watch). Verify changes with `npm test`, `npm run lint` and `npm run build`.

`vitest.config.mts` runs tests in the `node` environment and mirrors the `@/` alias. It's `.mts` rather than `.ts` so Vite loads it as ESM and doesn't print its CJS deprecation warning.

Path alias: `@/*` maps to the repo root, e.g. `@/lib/supabase/server`.

`next.config.ts` only sets `turbopack.root`. A stray lockfile in the home directory was confusing Next's workspace-root detection.

---

## 2. Directory map

```
app/
  layout.tsx            Root layout: fonts, getUser() → <Nav userEmail>, <main>, <Footer>
  globals.css           Tailwind import + design tokens + reveal animation
  page.tsx              Landing
  events/page.tsx       Events (featured card + list)
  sponsors/page.tsx     Sponsors (founding-partner pitch)
  committee/page.tsx    Committee grid + founders' note
  login/page.tsx        Login screen (redirects away if already signed in)
  login/actions.ts      authenticate(): sign-in / sign-up server action
  tracker/page.tsx      Members' tracker (protected)
  tracker/actions.ts    CRUD server actions for applications + saveOpportunity
  auth/actions.ts       signOut() server action
  auth/callback/route.ts  Landing route for auth emails (confirm sign-up, reset password)
  forgot-password/page.tsx  Request a password-reset email
  reset-password/page.tsx   Set a new password (after following the reset link)
components/
  Button.tsx            ButtonLink (named export): next/link styled as a button
  Nav.tsx               Client: sticky header, mobile menu, sign in/out
  Footer.tsx            Logo, address, links
  LoginForm.tsx         Client: sign-in / create-account toggle + "Forgot password?" link
  AuthCard.tsx          Single-panel card layout for forgot / reset password pages
  ForgotPasswordForm.tsx, ResetPasswordForm.tsx  Client forms for the reset flow
  PhotoPlaceholder.tsx  next/image or gold-glow placeholder
  Reveal.tsx            Client: IntersectionObserver scroll-reveal wrapper
  tracker/              Tracker UI (see §6)
data/
  site.ts               Emails, socials, membership URL, address, mailto() helper
  events.ts             Events array + sorting/date helpers
  committee.ts          Committee members
  tracker.ts            Status enum, types, pill/board colour maps, date formatters
lib/supabase/
  server.ts             createClient() (cookie-bound, RLS applies) + createAdminClient() (service role)
  middleware.ts         updateSession(): token refresh, stale-cookie cleanup, /tracker guard
  client.ts             Browser client (currently unused)
lib/urls.ts             safeRedirect() (same-origin path only) + getRequestOrigin() for email links
lib/dates.ts            Pure, time-zone-safe {y, m, d} calendar helpers for the tracker date picker
lib/dates.test.ts       Vitest unit + fast-check property tests for lib/dates.ts
vitest.config.mts       Vitest config (node env, @/ alias)
proxy.ts                Next 16 "proxy" (formerly middleware.ts) → updateSession()
supabase/
  migrations/0001_init.sql            Tables, enum, triggers, RLS
  migrations/0002_allowlist_hook.sql  "Before User Created" auth hook (the hard gate)
  seed.sql                            Example allowlist row + opportunities
public/abc_logo.jpg     Logo used by Nav, Footer, landing, login
design_handoff_abc_website/  Original design HTML + token README (gitignored, local only)
```

---

## 3. Request lifecycle

1. **`proxy.ts`** runs on every route except static assets and images, and calls `updateSession()` in `lib/supabase/middleware.ts`. That function:
   - creates a Supabase server client bound to the request/response cookies;
   - calls `auth.getUser()`, which refreshes the access token if needed;
   - on `refresh_token_not_found` or a 400 error, deletes the `sb-*` cookies so a dead session self-heals. It skips plain logged-out visitors (`AuthSessionMissingError`) and keeps the PKCE `-code-verifier` cookie that email links rely on;
   - for paths starting with `/tracker` with no user, redirects to `/login?redirect=<path>`.
2. **`app/layout.tsx`** calls `getUser()` again and passes `userEmail` to `<Nav>`. Nav uses it to show **Tracker** and **Sign out**, or **Log in**.
   - Because the layout reads cookies, **every page renders dynamically**.
   - Every page also needs the Supabase env vars to be set.
3. The page renders. Public pages import from `/data`. `/tracker` queries Supabase.

---

## 4. Auth: email + password with an allowlist gate

The flow is **email + password only**. Magic-link sign-in was removed on purpose (commit `d56f715`). `/auth/callback` now only handles **email links**: sign-up confirmation and password reset. It deliberately doesn't accept `magiclink`.

All redirect targets (`?redirect=` on `/login`, the hidden form field, and the callback's `redirect`) go through `safeRedirect()` in `lib/urls.ts`. It only accepts same-origin paths, which closes the open redirect.

### Sign-up (`intent = "signup"`)

`components/LoginForm.tsx` submits the form to `authenticate()` in `app/login/actions.ts` through `useActionState`. `authenticate()` then:

1. Normalises the email (trim + lowercase).
2. Validates it with `EMAIL_RE` and requires a password of at least 8 characters.
3. **Friendly pre-check:** `isAllowlisted(email)` queries `allowed_members` with the service-role client.
   - `false` returns "This email isn't on the ABC member list yet…".
   - `null` means the check itself failed (e.g. env misconfigured). Sign-up continues and the hook decides.
4. Calls `supabase.auth.signUp({ email, password, options: { emailRedirectTo } })`. `emailRedirectTo` is `<origin>/auth/callback?redirect=<next>`.
5. **Hard gate:** Supabase Auth runs `public.before_user_created_allowlist`, the Postgres hook from `0002_allowlist_hook.sql`. If the email isn't in `allowed_members`, the hook returns 403 and no user is created.
   - **This only works if the hook is enabled in the dashboard** (Authentication → Hooks → Before User Created).
6. With "Confirm email" **on**, no session comes back. The member is told to check their inbox and junk folder.
   - If the email already has an account, Supabase hides that by returning a user with an empty `identities` array. The action spots this and says "sign in instead".
   - Rate-limit errors (`over_email_send_rate_limit` / 429) get their own message.
7. With confirmation off, a session comes back and the action calls `redirect(redirectTo)` (default `/tracker`).

### Confirming the email

The member clicks the link in the email, which goes to `GET /auth/callback` (`app/auth/callback/route.ts`). The route supports two link shapes:

- `?token_hash=…&type=…`, from the **customised templates** below. It calls `verifyOtp`, and works even when the link is opened on another device or in another browser.
- `?code=…`, from Supabase's default templates (PKCE). It calls `exchangeCodeForSession`, and only works in the browser that made the request, because it needs the `sb-…-code-verifier` cookie.

On success the member is signed in and sent to `redirect`, which is sanitised. On failure they land on `/login?error=link`, which shows an "expired or already used" banner.

### Sign-in (`intent = "signin"`)

`authenticate()` calls `signInWithPassword`:

- `email_not_confirmed` tells the member to confirm first. Resubmitting "Create account" resends the link.
- Any other failure shows a generic "Incorrect email or password" error that hints at "Create account".
- On success it redirects.

### Password reset

1. `/login` → **Forgot password?** → `/forgot-password` → `requestPasswordReset()`.
2. That calls `resetPasswordForEmail(email, { redirectTo: <origin>/auth/callback?redirect=/reset-password })`. It **always gives the same answer**, so the form can't be used to find out which emails have accounts. Only rate-limit errors are shown.
3. The email link goes to `/auth/callback` (`type=recovery`), which signs the member in and sends them to `/reset-password`.
4. `/reset-password` checks `getUser()`. With no session it shows "link expired". Otherwise it renders `ResetPasswordForm`, which calls `updatePassword()`. That action checks the password is at least 8 characters and matches the confirmation, then calls `auth.updateUser({ password })` and `redirect("/tracker")`.

### Email delivery

Auth emails go through **Resend SMTP**, sent from `no-reply@mail.icabc.co.uk`. The setup is in the Supabase dashboard (Authentication → Emails → SMTP Settings), not in code. DNS for `mail.icabc.co.uk` (DKIM, SPF / return path) is managed at GoDaddy (`domaincontrol.com`).

Custom templates (Authentication → Emails → Templates) make the links point at our own site rather than `supabase.co`. That works across devices and looks less like phishing:

```html
<!-- Confirm sign up -->
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>

<!-- Reset password -->
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&redirect=/reset-password">Reset password</a>
```

URL configuration (Authentication → URL Configuration):

- **Site URL:** the production URL.
- **Redirect URLs:** `<production>/**` and `http://localhost:3000/**`. Supabase ignores any `emailRedirectTo` / `redirectTo` that isn't on this list. That also makes `getRequestOrigin()` in `lib/urls.ts` safe against a spoofed `Host` header.

### Proxy and the PKCE cookie

`updateSession()` clears stale `sb-*` cookies after a refresh failure, with two exceptions:

- It **skips** `AuthSessionMissingError`, which just means a logged-out visitor.
- It **keeps** the `-code-verifier` cookie.

Before this fix, it wiped the verifier on every logged-out request, so `?code=` links could never complete.

### Sign-out

`app/auth/actions.ts` → `signOut()` calls `auth.signOut()`, then `revalidatePath("/", "layout")`, then `redirect("/")`.

### Supabase dashboard settings this relies on

- **Before User Created** hook → Postgres → `public.before_user_created_allowlist`.
- **Custom SMTP** (Resend), as above. Supabase's built-in sender is capped at about 2 emails an hour.
- **Email provider → Confirm email: ON** (the target setup). This proves the person signing up owns the inbox, so nobody can claim someone else's allowlisted address first. The code also still works with it off.
- **URL Configuration** and the **email templates**, as above.
- **Rate Limits → emails per hour**: raise it from the default once custom SMTP is on.

### Supabase clients

| Function | File | Key | RLS | Use |
|---|---|---|---|---|
| `createClient()` | `lib/supabase/server.ts` | anon + user cookies | **applies** | Server Components, Server Actions, Route Handlers |
| `createAdminClient()` | `lib/supabase/server.ts` | `SUPABASE_SERVICE_ROLE_KEY` | **bypassed** | Server-only admin reads (allowlist check). Never import into client code |
| `updateSession()` | `lib/supabase/middleware.ts` | anon | applies | Proxy only |
| `createClient()` | `lib/supabase/client.ts` | anon | applies | Browser. **Currently unused** |

---

## 5. Database (`supabase/migrations/0001_init.sql`)

| Table | Columns | RLS |
|---|---|---|
| `allowed_members` | `email` PK (a trigger lowercases and trims it), `role` (`member`/`committee`/`admin`), `added_by`, `created_at` | Enabled with **no policies**, so only the service role and the auth hook can read it |
| `applications` | `id` uuid, `user_id` → `auth.users` (cascade delete), `company` (required), `position`, `date_applied`, `status` (enum), `deadline`, `notes`, `created_at`, `updated_at` (touch trigger) | select/insert/update/delete all `auth.uid() = user_id` |
| `opportunities` | `id`, `role_title`, `employer`, `location`, `season` (`Spring`/`Summer`/`Off-cycle`/`Graduate`), `closes_on`, `link`, `created_at` | `select` for `authenticated` only. Write from the dashboard |

Enum `application_status`: `Submitted`, `OA completed`, `HV completed`, `Interview sent`, `Successful`, `Rejected`. It **must stay in sync** with `STATUSES` in `data/tracker.ts`.

`allowed_members.role` exists, but the app doesn't use it yet.

---

## 6. Members' tracker

**`app/tracker/page.tsx`** (Server Component):

- Re-checks `getUser()`.
- Runs two queries with `Promise.all`:
  - `opportunities`, ordered by `closes_on` ascending;
  - `applications`, ordered by `created_at` descending. RLS limits these to the user's own rows.
- Renders an `OpportunityCard` grid, then `<Tracker>`.

**Server actions** (`app/tracker/actions.ts`):

- All of them return `ActionResult = {ok:true} | {ok:false,error}` and call `revalidatePath("/tracker")`.
- `createApplication(formData)` and `updateApplication(formData)` require `company`. The status goes through `parseStatus` (falls back to `Submitted`), and blank dates become `null`.
- `deleteApplication(id)`.
- `saveOpportunity(opportunityId)` copies an opportunity into a new `Submitted` application dated today.
- Ownership is enforced by RLS, not by app code.

**Components** (`components/tracker/`):

| Component | Props | Role |
|---|---|---|
| `Tracker` | `applications` | Tabs (`table` / `board` / `chart`, where chart is "Coming soon"), the "＋ New" button, and modal state |
| `ApplicationsTable` | `applications, onEdit, onNew` | Clicking a row edits it. ✕ asks for confirmation, then calls `deleteApplication` and `router.refresh()` |
| `StatusBoard` | `applications, onEdit` | Kanban built from `BOARD_COLUMNS` (5 columns; HV + Interview share one) |
| `ApplicationForm` | `application?, onClose` | Modal for create/edit using `useTransition`, then `router.refresh()`. Owns `openField` for the two date fields |
| `DateField` | `id, name, label, defaultValue, open, onOpenChange` | Date applied / Deadline: button trigger, Clear button, hidden input, and the popup when open |
| `CalendarPopup` | `id, label, selected, triggerRef, onSelect, onClose` | Month-grid calendar dialog rendered in a portal |
| `OpportunityCard` | `opportunity` | Card plus a Save button (`saveOpportunity`) |
| `StatusPill` | `status` | Coloured pill from `STATUS_PILL` |

`formStyles.ts` exports the shared `fieldClass` and `labelClass` used by `ApplicationForm` and `DateField`. It's a separate module so `DateField` doesn't import `ApplicationForm` (which would be a cycle).

After a mutation the client calls `router.refresh()`, and the server re-reads the data. There is no client-side store.

### Date fields

The two date inputs are a custom picker, not `<input type="date">`. **No date-picker package was added**: it's a small month grid, and building it keeps token-only styling and the exact ARIA wording.

- **Form contract is unchanged.** Each `DateField` renders one `<input type="hidden" name="date_applied|deadline">` holding `YYYY-MM-DD` or `""`. That's the only named element, so the server actions, `data/tracker.ts` and the schema didn't change. The trigger, Clear and popup controls are all `type="button"` with no `name`.
- **`DateField`.** The trigger is a `<button>` (so no on-screen keyboard on mobile) showing "2 Sep 2025" or "No date chosen", with `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`. Clear sits inside the field's right edge, after the trigger in tab order, and refocuses the trigger. `selected` only changes when a day is picked or Clear is pressed; month and year navigation never touch it. Initial state comes from `parseIso(application?.date_applied)`, and because `Tracker` mounts the form per open, state resets for free.
- **Single-open.** `ApplicationForm` holds `openField: "date_applied" | "deadline" | null` and passes `open` / `onOpenChange` down, so opening one popup closes the other.
- **`CalendarPopup`** is rendered with `createPortal(…, document.body)` and `position: fixed` (`z-[70]`, above the modal's `z-[60]`), so the modal panel never clips it. A layout effect places it under the trigger, flips it above when there's no room below, and clamps it inside the viewport (width `min(320, innerWidth − 16)`). It has a header (prev/next month, month heading, year `<select>` from `yearOptions`), a Monday-first `role="grid"` table with a roving tabindex, arrow-key navigation across month boundaries, and a polite live region that announces month changes.
- **Closing.** Escape closes only the popup (`stopPropagation`) and refocuses the trigger. A document `pointerdown` outside the popup and trigger closes it, as does focus moving out (a `null` `relatedTarget` is ignored, for Safari). The popup root stops `click` propagation: React events from a portal bubble through the **React** tree, so without it a day click would reach the modal backdrop and close the form.
- **Backdrop rule.** A backdrop click with a popup open closes only the popup; the next click closes the form. The document `pointerdown` listener has already closed the popup by the time `click` fires, so the backdrop's React `onPointerDown` (which runs first) records `popupOpenAtPress`, and `onClick` uses that.

**`lib/dates.ts`** holds all the date logic, with no React. Dates are plain `CalDate = { y, m, d }` (1-based month) and `YearMonth = { y, m }`. Nothing passes a `YYYY-MM-DD` string to `new Date()` or reads local getters on a stored date. Day and weekday maths go through UTC (`setUTCFullYear` / `getUTC*`), so values never shift a day in negative-offset time zones. `todayLocal()` is the one deliberate local-time call. Month and weekday names are hard-coded en-GB arrays, not `Intl`. Exports: `parseIso`, `formatIso`, `formatDisplay`, `formatAccessibleName`, `formatMonthHeading`, `todayLocal`, `addDays`, `addMonths`, `sameDay`, `daysInMonth`, `weekdayMon0`, `monthGrid`, `yearOptions`. Its tests (`lib/dates.test.ts`) include property tests for the ISO round trip, time-zone independence (by switching `process.env.TZ`), grid completeness, and month/day navigation.

`formatDate()` / `formatShortDate()` in `data/tracker.ts` (used to display stored dates and opportunity deadlines) don't use these helpers yet and still parse `YYYY-MM-DD` as UTC midnight, so they show the previous day in negative-offset zones. That's logged in [`BACKLOG.md`](./BACKLOG.md).

---

## 7. Public pages

- **`/`**:
  - hero with "Become a member" (`site.membershipUrl`) and "Meet the committee";
  - an inline `stats` strip and an About section;
  - three "pillars";
  - a featured-event band (`featuredEvent`);
  - a mission quote and a CTA.
- **`/events`**:
  - a big card for `featuredEvent`, then the rest of `upcomingEvents`;
  - an empty state with a "Get notified" mailto;
  - RSVP uses `ev.rsvpUrl ?? mailto("RSVP: <title>")`.
- **`/sponsors`**: a founding-partners invitation, three reasons, then "Become a sponsor" and "Request prospectus" mailto buttons.
- **`/committee`**: a 4-column grid built from `data/committee.ts`, then a founders' note.

Shared helpers:

- `ButtonLink` adds `rel="noopener noreferrer"` to external and `mailto:` links, and also `target="_blank"` to external ones.
- `Reveal` fades and lifts content into view. It respects `prefers-reduced-motion`.
- `PhotoPlaceholder` renders `next/image` when given `src`, and a gold-glow box otherwise.

---

## 8. Design system (`app/globals.css`)

The theme is dark and luxe: black and gold. Tailwind v4 turns each token into utilities automatically, e.g. `bg-panel`, `text-gold-light`, `border-hairline`.

| Group | Tokens |
|---|---|
| Surfaces | `base` #0a0908 (page), `panel` #0c0a08, `panel-2` #100d0a, `deep` #070605 (footer), `glow` #14110d |
| Gold | `gold` #c9a24b, `gold-light` #e6c878, `gold-pale` #f0e2bf, `mono-label` #8a6d2f |
| Text | `cream` #f3eee2, `muted` #bdb5a7, `dim` #9a948a, `faint` #6b6459 |
| Lines | `hairline` rgba(201,162,75,.16), `card` rgba(201,162,75,.2) |
| Fonts | `font-serif` (Cormorant), `font-body` (Hanken), `font-mono` (JetBrains) |

Conventions:

- Container: `mx-auto max-w-[1320px] px-5 sm:px-8 md:px-14`.
- Eyebrow labels: `font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label`.
- Radius: 2px on buttons and inputs, 3px on cards.
- Primary button: `bg-gold text-base`.
- ⚠️ **`text-base` is a colour here**, the near-black `--color-base`. The `--color-base` token overrides Tailwind's font-size `text-base` (checked in the compiled CSS). For 16px text, use `text-[16px]`, not `text-base`.
- Status colours are inline styles from `STATUS_PILL` and `BOARD_COLUMNS` in `data/tracker.ts`.
- Utilities: `glow-fill` (`@utility`) and `.reveal` / `.is-visible`. `.globe-spin` is defined but unused.

---

## 9. Environment variables (`.env.local`, gitignored)

| Name | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | server.ts, middleware.ts, client.ts | Required on every page (the layout and proxy call Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same | Public by design. RLS protects the data |
| `SUPABASE_SERVICE_ROLE_KEY` | server.ts `createAdminClient` | **Secret.** Server-only. Never prefix it with `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | nowhere | Not needed. Email-link origins come from the request (`getRequestOrigin()`) and are checked against Supabase's Redirect URLs |

---

## 10. How-tos

### Add or edit an event

Edit the `events` array in `data/events.ts`:

```ts
{
  slug: "spring-insight-night",
  title: "Spring Insight Night",
  date: "2026-11-12",          // ISO date: drives sorting + date block
  time: "6:30pm",
  location: "SAF G28",
  description: "…",
  featured: true,              // first featured event = hero card + landing band
  rsvpUrl: "https://…",        // optional; defaults to a mailto RSVP
  photo: "/events/insight.jpg" // optional; file in /public/events/
}
```

Past events are **not** hidden automatically. Remove them or set a different `featured` event.

### Add a committee member

Add `{ name, role, course?, photo? }` to `data/committee.ts`. Put photos in `public/committee/`.

### Change contact emails, socials or the join link

Edit `data/site.ts`. Every CTA reads from it.

### Approve a member (allowlist)

In Supabase, go to Table Editor → `allowed_members` → Insert row → `email` (any case; it's lowercased), plus `role` and `added_by` if you like. To do several at once, use the SQL editor:

```sql
insert into public.allowed_members (email, role, added_by) values
  ('a.student@ic.ac.uk', 'member', 'chude'),
  ('b.student@ic.ac.uk', 'member', 'chude')
on conflict (email) do nothing;
```

Removing a row stops **new** sign-ups only. To revoke an existing account, delete the user too: Authentication → Users.

### A member forgot their password

They use **Forgot password?** on `/login`. Committee can also trigger it from Authentication → Users → the user → **Send password recovery**, which uses the same template and link.

If emails aren't arriving, check the email in the Resend dashboard:

- **Delivered** means the recipient's server accepted it. The member should check Junk, Outlook's "Other" tab, and a search across all folders.
- **Bounced** or **Suppressed**: the event details give the reason.

Imperial's Microsoft 365 can accept a message and then hide it. Admin-only quarantine isn't visible to students.

### Test auth emails with a non-Imperial inbox

1. Add a personal email to `allowed_members` (`role = 'member'`, `added_by = 'test'`).
2. Sign up with it on `/login` → Create account. This sends the confirmation email.
3. Use `/forgot-password` with it to test a reset.
4. Afterwards, delete the user (Authentication → Users) and the allowlist row.

### Add a live opportunity

Table Editor → `opportunities` → insert `role_title`, `employer`, and optionally `location`, `season` (`Spring`/`Summer`/`Off-cycle`/`Graduate`), `closes_on` and `link`. It shows up for every signed-in member.

### Add a tracker status

Do all of these together:

1. `alter type public.application_status add value '…';` in a new migration.
2. `STATUSES` in `data/tracker.ts`.
3. `STATUS_PILL`.
4. The right `BOARD_COLUMNS` entry.

### Add a new protected route

Extend the `isProtected` check in `lib/supabase/middleware.ts`, and also re-check `getUser()` in the page itself.

### Set up Supabase from scratch

See the README → "Member area setup". In short:

1. Create the project.
2. Set the env vars.
3. Run `0001`, then `0002`, then optionally `seed.sql`.
4. Enable the hook.
5. Disable Confirm email.
6. Add the allowlist emails.
