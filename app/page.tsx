import Image from "next/image";
import { ButtonLink } from "@/components/Button";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import Reveal from "@/components/Reveal";
import { site } from "@/data/site";
import { featuredEvent, eventDateParts } from "@/data/events";

const stats = [
  { value: "£0", caption: "To join, always" },
  { value: "2026", caption: "Founded this year" },
  { value: "All", caption: "Imperial students welcome" },
  { value: "Day 1", caption: "Join us from the start" },
];

const pillars = [
  {
    n: "01",
    title: "Career programmes",
    body: "Mentorship circles, CV clinics and mock interviews run with professionals who've walked the path before you.",
  },
  {
    n: "02",
    title: "Employer network",
    body: "Direct lines to banks, tech firms and consultancies that want to recruit from our community — and an internship tracker built for members.",
  },
  {
    n: "03",
    title: "Community",
    body: "Socials, panels and a network of peers who understand the journey — because they're on it too.",
  },
];

export default function Home() {
  const ev = featuredEvent;
  const d = ev ? eventDateParts(ev.date) : null;

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto flex max-w-[1320px] flex-col items-center gap-12 px-5 pb-20 pt-20 sm:px-8 md:flex-row md:px-14 md:pt-24">
        <Reveal className="flex-[1.15]">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-mono-label">
            Imperial College London · Student Society
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-[0.98] tracking-[-0.015em] sm:text-6xl md:text-7xl lg:text-[86px] lg:leading-[0.96]">
            Advancing
            <br />
            Black Careers
          </h1>
          <p className="mt-8 max-w-[520px] text-[17px] leading-relaxed text-muted">
            We connect Black students at Imperial with the mentors, employers and community that turn
            ambition into offers — and keep the door open for those who follow.
          </p>
          <div className="mt-10 flex flex-wrap gap-3.5">
            <ButtonLink href={site.membershipUrl}>Become a member</ButtonLink>
            <ButtonLink href="/committee" variant="secondary">
              Meet the committee
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal className="flex justify-center md:flex-[0.85]" delay={120}>
          <div className="relative w-full max-w-[300px] sm:max-w-[340px] md:max-w-[380px]">
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(201,162,75,0.16),rgba(10,9,8,0)_65%)]" />
            <Image
              src="/abc_logo.jpg"
              alt="Advancing Black Careers — Imperial College London"
              width={760}
              height={760}
              priority
              className="relative aspect-square w-full object-contain"
            />
          </div>
        </Reveal>
      </section>

      {/* Stat strip */}
      <section className="border-y border-hairline">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.caption}
              className={`px-6 py-7 sm:px-8 md:px-14 ${
                i % 2 === 0 ? "border-r border-[rgba(201,162,75,0.12)]" : ""
              } ${i < stats.length - 1 ? "md:border-r md:border-[rgba(201,162,75,0.12)]" : ""} ${
                i < 2 ? "border-b border-[rgba(201,162,75,0.12)] md:border-b-0" : ""
              }`}
            >
              <div className="font-serif text-[46px] leading-none text-gold-light">{s.value}</div>
              <div className="mt-1.5 text-[12.5px] text-dim">{s.caption}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mx-auto flex max-w-[1320px] flex-col items-center gap-12 px-5 py-20 sm:px-8 md:flex-row md:px-14 md:py-24">
        <Reveal className="flex-1">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label">
            Who we are
          </p>
          <h2 className="mb-5 font-serif text-[32px] font-semibold leading-[1.12] sm:text-[40px]">
            Representation isn&apos;t the finish line. It&apos;s the starting point.
          </h2>
          <p className="mb-4 text-[15.5px] leading-[1.7] text-muted">
            Advancing Black Careers is a student-led society at Imperial College London. We exist to
            close the gap between talented Black students and the industries that need them — through
            mentorship, employer access and a community that has your back.
          </p>
          <p className="text-[15.5px] leading-[1.7] text-muted">
            From first-year insight days to final-round interview prep, we walk the whole journey with
            you.
          </p>
        </Reveal>
        <Reveal className="w-full flex-1" delay={120}>
          <PhotoPlaceholder
            label="photo — committee / members, candid"
            className="h-[280px] w-full sm:h-[360px] md:h-[380px]"
          />
        </Reveal>
      </section>

      {/* What we do */}
      <section className="mx-auto max-w-[1320px] px-5 pb-20 sm:px-8 md:px-14 md:pb-24">
        <Reveal>
          <p className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label">
            What we do
          </p>
          <h2 className="mb-10 max-w-[620px] font-serif text-[32px] font-semibold leading-[1.1] sm:text-[40px]">
            Three ways we move careers forward
          </h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.n} delay={i * 90}>
              <div className="h-full rounded-[3px] border border-card bg-panel p-8 transition-colors hover:border-gold/40">
                <div className="mb-6 font-serif text-[34px] text-gold-light">{p.n}</div>
                <h3 className="mb-3.5 font-serif text-2xl">{p.title}</h3>
                <p className="text-sm leading-[1.65] text-[#a39c8f]">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured event band */}
      {ev && d && (
        <section className="relative border-y border-hairline bg-panel bg-[radial-gradient(100%_140%_at_80%_0%,rgba(201,162,75,0.18),rgba(7,6,5,0)_55%)]">
          <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:px-14 md:py-20">
            <Reveal className="max-w-[560px]">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-gold-light">
                Featured · {d.day} {d.month}
              </p>
              <h2 className="mb-4 font-serif text-[34px] font-semibold leading-[1.05] sm:text-[46px]">
                {ev.title}
              </h2>
              <p className="mb-7 text-[15px] leading-[1.65] text-muted">{ev.description}</p>
              <ButtonLink href="/events">RSVP now</ButtonLink>
            </Reveal>
          </div>
        </section>
      )}

      {/* Mission statement (honest — replaces fabricated alumni quote) */}
      <section className="mx-auto max-w-[1320px] px-5 py-20 text-center sm:px-8 md:px-14 md:py-24">
        <Reveal>
          <p className="mx-auto max-w-[840px] font-serif text-[28px] italic leading-[1.32] text-[#e9e2d3] sm:text-[38px]">
            “We&apos;re building the society we wish we&apos;d had in first year — one that turns a room
            full of ambition into mentors, offers and a community that lasts.”
          </p>
          <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-mono-label">
            The ABC founding committee
          </p>
        </Reveal>
      </section>

      {/* CTA band */}
      <section className="border-t border-hairline bg-panel-2">
        <div className="mx-auto max-w-[1320px] px-5 py-20 text-center sm:px-8 md:px-14">
          <Reveal>
            <h2 className="mb-3.5 font-serif text-[36px] font-semibold sm:text-[48px]">
              Ready to advance?
            </h2>
            <p className="mb-8 text-[15px] text-muted">
              Membership is free for all Imperial students. Be part of it from the very beginning.
            </p>
            <ButtonLink href={site.membershipUrl}>Become a member</ButtonLink>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
