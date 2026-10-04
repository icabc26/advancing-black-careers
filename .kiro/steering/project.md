---
inclusion: always
---

# ABC website: project context

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 site for the Advancing Black Careers society at Imperial College London. There is a public marketing site, plus a members-only internship tracker built on Supabase (Auth, Postgres and RLS).

Full reference: `docs/ARCHITECTURE.md`. Known issues and the planned fix list: `docs/BACKLOG.md`. Read these before any non-trivial change, and update them when the architecture changes or a backlog item is completed.

## Key facts

- **Auth is email + password only.** Magic links were dropped on purpose; don't reintroduce them. Sign-up is gated by the `allowed_members` allowlist:
  - a friendly pre-check in `app/login/actions.ts`;
  - the hard gate, a Postgres "Before User Created" hook in `supabase/migrations/0002_allowlist_hook.sql`.
  - Auth emails (confirm sign-up, password reset) go through Resend SMTP from `no-reply@mail.icabc.co.uk`. Their links land on `/auth/callback`, which handles `token_hash` and `code` (but not `magiclink`). The aim is to have "Confirm email" on.
  - The password reset flow is `/forgot-password` → email → `/auth/callback` → `/reset-password`.
- `proxy.ts` is Next 16's renamed middleware. It calls `updateSession()` in `lib/supabase/middleware.ts`, which also guards `/tracker`.
- **Supabase clients** (`lib/supabase/server.ts`):
  - `createClient()` is cookie-bound and subject to RLS. Use it by default.
  - `createAdminClient()` uses the service role and bypasses RLS. Server-only.
- Mutations are Server Actions that return `{ ok: true } | { ok: false, error }`. They call `revalidatePath`, and the client then calls `router.refresh()`. There is no client store.
- **Content lives in `/data`** (`site.ts`, `events.ts`, `committee.ts`). Tracker types and the status enum live in `data/tracker.ts`. Keep `STATUSES` in sync with the `application_status` enum in SQL.
- **Schema changes go in a new numbered file** in `supabase/migrations/`. Never edit an applied migration.

## Conventions

- Use the `@/` import alias.
- Mark client components with `"use client"`. Server Components are the default.
- Styling uses the Tailwind tokens from `app/globals.css` (`base`, `panel`, `gold`, `gold-light`, `cream`, `muted`, `dim`, `hairline`, and so on). Don't introduce new raw hex values when a token exists.
- `text-base` is the **near-black colour token**, not a font size. Use `text-[16px]` for size.
- Container: `mx-auto max-w-[1320px] px-5 sm:px-8 md:px-14`. Eyebrows: `font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label`.
- Use the `ButtonLink` named export from `components/Button.tsx` for CTA links, and `mailto()` from `data/site.ts` for email links.
- Validate any user-supplied redirect target with `safeRedirect()` from `lib/urls.ts`. It must be a same-origin path.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client, and never read or echo values from `.env.local`.
- There's no test suite yet. Verify changes with `npm run lint` and `npm run build`.
