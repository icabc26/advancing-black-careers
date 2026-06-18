import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import Reveal from "@/components/Reveal";
import { upcomingEvents, featuredEvent, eventDateParts, type Event } from "@/data/events";
import { mailto } from "@/data/site";

export const metadata: Metadata = {
  title: "Events · Imperial ABC",
  description: "Upcoming events from Advancing Black Careers at Imperial College London.",
};

function rsvpHref(ev: Event) {
  return ev.rsvpUrl ?? mailto(`RSVP: ${ev.title}`);
}

export default function EventsPage() {
  const featured = featuredEvent;
  const rest = upcomingEvents.filter((e) => e.slug !== featured?.slug);
  const fd = featured ? eventDateParts(featured.date) : null;

  return (
    <div>
      {/* Header */}
      <section className="mx-auto max-w-[1320px] px-5 pt-16 sm:px-8 md:px-14 md:pt-20">
        <Reveal>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label">
            What&apos;s on
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-none sm:text-6xl md:text-[64px]">
            Upcoming Events
          </h1>
          <p className="mt-4 max-w-[560px] text-base leading-relaxed text-muted">
            From insight evenings to socials — here&apos;s where the community is headed next.
          </p>
        </Reveal>
      </section>

      {/* Featured event */}
      {featured && fd && (
        <section className="mx-auto max-w-[1320px] px-5 pt-11 sm:px-8 md:px-14">
          <Reveal>
            <div className="flex flex-col overflow-hidden rounded-[3px] border border-card md:flex-row">
              <PhotoPlaceholder
                src={featured.photo}
                label="event photo"
                className="h-56 w-full md:h-auto md:w-[380px] md:flex-none"
              />
              <div className="flex flex-1 flex-col justify-center bg-panel p-8 md:p-10">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-gold-light">
                  Featured · {fd.weekday} {fd.day} {fd.month} · {featured.time}
                </p>
                <h2 className="mb-3.5 font-serif text-[30px] leading-[1.05] sm:text-[38px]">
                  {featured.title}
                </h2>
                <p className="mb-6 max-w-[520px] text-[14.5px] leading-[1.65] text-[#a39c8f]">
                  {featured.description}
                </p>
                <div className="mb-6 flex flex-wrap items-center gap-5 text-[13px] text-dim">
                  <span>📍 {featured.location}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href={rsvpHref(featured)}>RSVP</ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* All upcoming */}
      <section className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 md:px-14 md:py-20">
        <Reveal>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
            All upcoming
          </p>
        </Reveal>

        {rest.length > 0 ? (
          <div>
            {rest.map((ev) => {
              const d = eventDateParts(ev.date);
              return (
                <Reveal key={ev.slug}>
                  <div className="flex flex-col gap-4 border-t border-hairline py-6 sm:flex-row sm:items-center sm:gap-7">
                    <div className="w-[70px] flex-none text-center">
                      <div className="font-serif text-[34px] leading-none text-gold-light">
                        {d.day}
                      </div>
                      <div className="mt-0.5 text-[11px] tracking-[0.1em] text-dim">{d.month}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-serif text-2xl">{ev.title}</div>
                      <div className="mt-1 text-[13px] text-dim">
                        {ev.location} · {ev.time}
                      </div>
                    </div>
                    <ButtonLink href={rsvpHref(ev)} variant="secondary" className="px-5 py-2.5 text-[12.5px]">
                      RSVP
                    </ButtonLink>
                  </div>
                </Reveal>
              );
            })}
            <div className="border-t border-hairline" />
          </div>
        ) : (
          // Honest empty state — only one event for now.
          <Reveal>
            <div className="rounded-[3px] border border-hairline bg-panel px-6 py-12 text-center sm:px-8">
              <p className="mx-auto max-w-[440px] font-serif text-2xl leading-[1.3] text-cream">
                More events are on the way this term.
              </p>
              <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-[1.6] text-muted">
                We&apos;re a brand-new society — become a member and you&apos;ll be the first to hear
                when the next one drops.
              </p>
              <div className="mt-7 flex justify-center">
                <ButtonLink href={mailto("Keep me posted on ABC events")} variant="secondary">
                  Get notified
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </div>
  );
}
