import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center rounded-[2px] text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-base";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-base px-7 py-[15px] hover:brightness-110 hover:-translate-y-px shadow-sm",
  secondary:
    "border border-gold/50 text-gold-light px-7 py-[15px] hover:bg-gold/10 hover:border-gold",
};

type BaseProps = {
  variant?: Variant;
  className?: string;
};

/** A link styled as a button. Use `href` for navigation / mailto / external. */
export function ButtonLink({
  variant = "primary",
  className = "",
  href,
  children,
  ...rest
}: BaseProps & ComponentProps<typeof Link>) {
  const external = typeof href === "string" && /^(https?:|mailto:)/.test(href);
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...(external ? { target: href.startsWith("mailto:") ? undefined : "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </Link>
  );
}
