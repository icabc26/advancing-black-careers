"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export type MagicLinkResult =
  | { ok: true }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Request a passwordless magic link.
 * 1. Friendly pre-check against the member allowlist (nice UX).
 * 2. Send the OTP link. The "Before User Created" auth hook is the hard gate
 *    that ultimately blocks non-allowlisted sign-ups.
 */
export async function requestMagicLink(
  _prev: MagicLinkResult | null,
  formData: FormData
): Promise<MagicLinkResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const redirect = String(formData.get("redirect") ?? "/tracker");

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  // Friendly allowlist pre-check (service role bypasses RLS).
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("allowed_members")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return {
        ok: false,
        error:
          "This email isn't on the ABC member list yet. Join the society or contact the committee to be added.",
      };
    }
  } catch {
    // If the pre-check fails (e.g. env not configured), fall through — the
    // auth hook still enforces the allowlist server-side.
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
    },
  });

  if (error) {
    return { ok: false, error: "Couldn't send the link just now — please try again." };
  }
  return { ok: true };
}
