import Image from "next/image";
import Link from "next/link";
import { site, mailto } from "@/data/site";

const explore = [
  { href: "/events", label: "Events" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/committee", label: "Committee" },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-deep px-5 py-12 sm:px-8 md:px-14">
      <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-10 sm:flex-row">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/abc_logo.jpg"
              alt={`${site.name} logo`}
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            <span className="font-serif text-xl tracking-[0.12em] text-[#cfc7b6]">IMPERIAL ABC</span>
          </div>
          <p className="mt-3 max-w-[280px] text-[12.5px] leading-relaxed text-[#7a746a]">
            Advancing Black Careers · {site.address}
          </p>
        </div>
        <div className="flex gap-14">
          <div className="flex flex-col gap-2.5 text-[13px] text-dim">
            <span className="font-mono text-[11px] tracking-[0.1em] text-[#cfc7b6]">EXPLORE</span>
            {explore.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-cream">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 text-[13px] text-dim">
            <span className="font-mono text-[11px] tracking-[0.1em] text-[#cfc7b6]">CONNECT</span>
            <a
              href={site.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cream"
            >
              Instagram
            </a>
            <a
              href={site.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cream"
            >
              LinkedIn
            </a>
            <a href={mailto()} className="transition-colors hover:text-cream">
              Email us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
