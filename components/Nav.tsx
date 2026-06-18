"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/data/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/committee", label: "Committee" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label={`${site.name} — home`}>
      <Image
        src="/abc_logo.jpg"
        alt={`${site.name} logo`}
        width={56}
        height={56}
        priority
        className="h-12 w-12 object-contain"
      />
      <span className="font-serif text-base tracking-[0.14em] text-[#cfc7b6]">IMPERIAL ABC</span>
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-hairline backdrop-blur-md transition-colors ${
        scrolled ? "bg-base/90" : "bg-base/70"
      }`}
    >
      <nav className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-8 md:px-14">
        <Logo />

        {/* Desktop links */}
        <div className="hidden items-center gap-8 text-sm text-[#b8b0a2] lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors hover:text-cream ${
                isActive(l.href) ? "text-cream" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-[2px] border border-gold px-5 py-2 text-gold-light transition-colors hover:bg-gold/10"
          >
            Log in
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center text-gold-light lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 block h-px w-6 bg-current transition-transform ${
                open ? "top-2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-2 block h-px w-6 bg-current transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-6 bg-current transition-transform ${
                open ? "top-2 -rotate-45" : "top-4"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-hairline bg-base/95 px-5 py-4 sm:px-8 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-[2px] px-2 py-3 text-base transition-colors hover:text-cream ${
                  isActive(l.href) ? "text-cream" : "text-[#b8b0a2]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-2 rounded-[2px] border border-gold px-4 py-3 text-center text-gold-light"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
