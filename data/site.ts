/**
 * Site-wide configuration — EDIT THESE VALUES.
 * Every CTA / contact link on the site reads from here, so this is the one
 * place to update emails, social handles and the membership form.
 */
export const site = {
  name: "Advancing Black Careers",
  shortName: "Imperial ABC",
  // Society contact inbox (used by "Email us", "Become a sponsor", RSVP fallbacks)
  email: "abcsoc@ic.ac.uk",
  // Membership sign-up — Imperial College Union join page.
  membershipUrl:
    "https://www.imperialcollegeunion.org/student-group-shop?groupId=608",
  // Sponsorship enquiries
  sponsorEmail: "abcsoc@ic.ac.uk",
  socials: {
    instagram: "https://www.instagram.com/icl.abc",
    linkedin:
      "https://www.linkedin.com/in/imperial-college-advancing-black-careers-society-039863413",
  },
  address: "Imperial College Union, South Kensington, London SW7",
} as const;

/** Convenience: a mailto: link to the society inbox with an optional subject. */
export function mailto(subject?: string): string {
  const base = `mailto:${site.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
