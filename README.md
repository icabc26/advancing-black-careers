# Advancing Black Careers (ABC) — Imperial College London

Marketing website for the ABC student society. Built with **Next.js (App Router) + React +
TypeScript + Tailwind CSS v4**. Dark-and-gold editorial design.

Public pages: **Landing (`/`)**, **Events (`/events`)**, **Sponsors (`/sponsors`)**,
**Committee (`/committee`)**, and a coming-soon **Login (`/login`)**. The member portal and
internship tracker are intentionally not built yet.

## Run locally

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
npm run build    # production build
```

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

## Deploy to Vercel

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), **New Project → Import** the repo. Framework auto-detects as
   Next.js; no settings needed. Deploy.
3. Add a custom domain later under the project's **Domains** tab.

## Design reference

The original high-fidelity design lives in `design_handoff_abc_website/`. Content was adapted to the
society's real situation (new society, one event, no sponsors yet) rather than copying the design's
placeholder numbers.
