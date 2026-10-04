import { headers } from "next/headers";

/**
 * Sanitise a user-supplied redirect target. Only same-origin paths are allowed
 * ("/tracker", "/reset-password?x=1"). Anything absolute, protocol-relative
 * ("//evil.com"), backslash-tricked ("/\evil.com") or otherwise odd falls back.
 */
export function safeRedirect(value: unknown, fallback = "/tracker"): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  try {
    const base = "http://localhost";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Origin of the current request (e.g. "https://icabc.co.uk"), used to build
 * links in auth emails. Supabase only honours redirect URLs on its allowlist
 * (Authentication → URL Configuration), so a spoofed host can't redirect off-site.
 */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
