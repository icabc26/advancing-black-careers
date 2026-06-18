/**
 * Events — EDIT THIS LIST.
 * The first event with `featured: true` is shown in the big card on /events and
 * in the band on the landing page. Add more objects to this array as you run
 * more events; the "All upcoming" list and empty state update automatically.
 */
export type Event = {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-10-28". Drives the date block + sorting. */
  date: string;
  /** Free text, e.g. "18:30 – 21:00". */
  time: string;
  location: string;
  description: string;
  featured?: boolean;
  /** Optional override for the RSVP link; defaults to a mailto. */
  rsvpUrl?: string;
  /** Optional image in /public, e.g. "/events/launch.jpg". */
  photo?: string;
};

export const events: Event[] = [
  {
    slug: "ahead-of-the-curve",
    title: "Ahead of the Curve",
    date: "2026-06-19",
    time: "6:15pm",
    location: "SAF G28",
    description:
      "A workshop designed to get you application season ready — sharpen your applications and get ahead before the rush. All Imperial students welcome.",
    featured: true,
  },
];

/** Events sorted soonest-first. */
export const upcomingEvents = [...events].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
);

export const featuredEvent = upcomingEvents.find((e) => e.featured) ?? upcomingEvents[0];

/** Parts of a date useful for the day/month block and full label. */
export function eventDateParts(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(),
    full: d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
  };
}
