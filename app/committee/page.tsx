import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import PhotoPlaceholder from "@/components/PhotoPlaceholder";
import Reveal from "@/components/Reveal";
import { committee } from "@/data/committee";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Committee · Imperial ABC",
  description: "Meet the committee running Advancing Black Careers at Imperial College London.",
};

export default function CommitteePage() {
  return (
    <div>
      {/* Header */}
      <section className="mx-auto max-w-[1320px] px-5 pt-16 sm:px-8 md:px-14 md:pt-20">
        <Reveal className="max-w-[720px]">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label">
            The people
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-[1.02] sm:text-6xl md:text-[64px]">
            Meet the committee
          </h1>
          <p className="mt-4 text-base leading-[1.65] text-muted">
            The students founding and running ABC this year — building the society from the ground up.
          </p>
        </Reveal>
      </section>

      {/* Committee grid */}
      <section className="mx-auto max-w-[1320px] px-5 pt-12 sm:px-8 md:px-14 md:pt-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {committee.map((m, i) => (
            <Reveal key={`${m.name}-${m.role}`} delay={(i % 4) * 80}>
              <div>
                <PhotoPlaceholder src={m.photo} className="mb-3.5 aspect-square w-full" />
                <div className="font-serif text-xl sm:text-[21px]">{m.name}</div>
                <div className="mt-0.5 text-[12.5px] text-gold-light">{m.role}</div>
                {m.course && <div className="mt-1 text-[12px] text-dim">{m.course}</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Founder's note (honest — replaces fabricated alumni spotlight) */}
      <section className="mt-16 border-y border-hairline bg-panel-2 md:mt-20">
        <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 md:px-14 md:py-20">
          <Reveal>
            <p className="mb-9 font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label">
              Why we started ABC
            </p>
            <div className="flex flex-col items-start gap-10 md:flex-row md:items-center md:gap-12">
              <PhotoPlaceholder
                label="photo — founders"
                className="h-[320px] w-full flex-none md:h-[360px] md:w-[300px]"
              />
              <div className="flex-1">
                <p className="mb-7 font-serif text-[24px] italic leading-[1.34] text-[#e9e2d3] sm:text-[32px]">
                  “We started ABC because talent is everywhere, but access isn&apos;t. We&apos;re
                  building the network, the mentorship and the community we wish we&apos;d had — and
                  we&apos;re opening it up to everyone who comes after us.”
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold-light">
                  The ABC founding committee
                </p>
                <p className="mt-4 max-w-[560px] text-[14px] leading-[1.65] text-[#a39c8f]">
                  This is year one. Every member shapes what ABC becomes — and the founding cohort gets
                  to build it with us.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Join CTA */}
      <section className="mx-auto max-w-[1320px] px-5 py-20 text-center sm:px-8 md:px-14">
        <Reveal>
          <h2 className="mb-3.5 font-serif text-[34px] font-semibold sm:text-[44px]">
            Your story starts here
          </h2>
          <p className="mb-8 text-[15px] text-muted">Become one of our founding members.</p>
          <ButtonLink href={site.membershipUrl}>Become a member</ButtonLink>
        </Reveal>
      </section>
    </div>
  );
}
