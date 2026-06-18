import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/Button";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Member login · Imperial ABC",
  description: "Member login for Advancing Black Careers — coming soon.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-[1000px] px-5 py-12 sm:px-8 md:px-14 md:py-16">
      <div className="flex min-h-[560px] flex-col overflow-hidden rounded-[3px] border border-hairline md:flex-row">
        {/* Brand panel */}
        <div className="flex flex-1 flex-col justify-between gap-10 border-b border-hairline bg-panel-2 bg-[radial-gradient(120%_100%_at_30%_20%,rgba(201,162,75,0.14),rgba(16,13,10,0)_60%)] p-10 md:border-b-0 md:border-r md:p-12">
          <div className="font-serif text-base tracking-[0.14em] text-[#cfc7b6]">IMPERIAL ABC</div>
          <div className="flex justify-center">
            <Image
              src="/abc_logo.jpg"
              alt="Advancing Black Careers logo"
              width={220}
              height={220}
              className="w-[220px] object-contain"
            />
          </div>
          <div>
            <p className="font-serif text-[28px] leading-[1.18] sm:text-[30px]">
              Welcome to
              <br />
              the community.
            </p>
            <p className="mt-3 text-[13px] leading-[1.6] text-dim">
              Members &amp; committee will sign in here to access the internship tracker, RSVP to
              events and more.
            </p>
          </div>
        </div>

        {/* Coming soon */}
        <div className="flex flex-1 flex-col justify-center p-10 md:p-12">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-light">
            Coming soon
          </p>
          <h1 className="mb-3 font-serif text-[34px] font-semibold sm:text-[40px]">
            Member login is on the way
          </h1>
          <p className="mb-9 max-w-[420px] text-[14px] leading-[1.65] text-muted">
            We&apos;re building the member area — including the internship tracker — right now. In the
            meantime, join the society and we&apos;ll get you set up the moment it&apos;s live.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={site.membershipUrl}>Become a member</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to home
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
