import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import Reveal from "@/components/Reveal";
import { site, mailto } from "@/data/site";

export const metadata: Metadata = {
  title: "Sponsors · Imperial ABC",
  description:
    "Partner with Advancing Black Careers — reach high-achieving Black talent at Imperial College London.",
};

const reasons = [
  {
    n: "01",
    title: "Reach the pipeline",
    body: "A direct line to high-achieving Black students across STEM and business at Imperial.",
  },
  {
    n: "02",
    title: "Brand on campus",
    body: "Headline our events and put your firm in front of the talent you want to hire.",
  },
  {
    n: "03",
    title: "Real impact",
    body: "Your support funds mentorship and programmes that change career trajectories.",
  },
];

export default function SponsorsPage() {
  return (
    <div>
      {/* Header */}
      <section className="mx-auto max-w-[1320px] px-5 pt-16 sm:px-8 md:px-14 md:pt-20">
        <Reveal className="max-w-[760px]">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label">
            Our partners
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-[1.02] sm:text-6xl md:text-[64px]">
            Partner with ABC
          </h1>
          <p className="mt-4 text-base leading-[1.65] text-muted">
            We&apos;re a new society with ambitious plans — and we&apos;re looking for founding
            partners to build them with us. Our partners don&apos;t just fund us; they mentor, recruit
            and open doors for the next generation of Black talent at Imperial.
          </p>
        </Reveal>
      </section>

      {/* Founding-partner invitation (in place of empty logo grids) */}
      <section className="mx-auto max-w-[1320px] px-5 pt-12 sm:px-8 md:px-14 md:pt-16">
        <Reveal>
          <div className="rounded-[3px] border border-card bg-panel px-6 py-10 text-center sm:px-10 md:py-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold-light">
              Founding partners
            </p>
            <h2 className="mx-auto mt-4 max-w-[640px] font-serif text-[28px] font-semibold leading-[1.15] sm:text-[36px]">
              This is where your firm&apos;s logo goes.
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[14.5px] leading-[1.65] text-muted">
              Be one of the first names behind Advancing Black Careers and help shape the society from
              day one.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href={mailto("Becoming a founding partner of ABC")}>
                Become a founding partner
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Why partner */}
      <section className="mx-auto max-w-[1320px] px-5 pt-16 sm:px-8 md:px-14 md:pt-20">
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {reasons.map((r, i) => (
            <Reveal key={r.n} delay={i * 90}>
              <div className="font-serif text-[40px] text-gold-light">{r.n}</div>
              <h3 className="mb-2.5 mt-2.5 font-serif text-[22px]">{r.title}</h3>
              <p className="text-sm leading-[1.6] text-[#a39c8f]">{r.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA panel */}
      <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:px-14 md:py-20">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 rounded-[3px] border border-card bg-panel-2 bg-[radial-gradient(120%_140%_at_85%_0%,rgba(201,162,75,0.16),rgba(16,13,10,0)_55%)] p-8 md:flex-row md:items-center md:p-12">
            <div>
              <h2 className="mb-2.5 font-serif text-[30px] sm:text-[36px]">Let&apos;s talk</h2>
              <p className="max-w-[440px] text-[14.5px] leading-[1.6] text-muted">
                Tell us about your goals and we&apos;ll design a partnership that works for your firm —
                from event headlines to mentorship and recruitment.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={mailto("Sponsoring ABC")}>Become a sponsor</ButtonLink>
              <ButtonLink href={`mailto:${site.sponsorEmail}?subject=Request the ABC prospectus`} variant="secondary">
                Request prospectus
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
