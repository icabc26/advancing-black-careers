import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/urls";

/** Email link types we accept here (no magic-link sign-in, on purpose). */
const ALLOWED_TYPES: EmailOtpType[] = ["signup", "email", "recovery", "email_change", "invite"];

/**
 * Landing route for auth emails (sign-up confirmation + password reset).
 *
 * Two link shapes are supported:
 *  - `?token_hash=…&type=…` — from the customised email templates (see
 *    docs/ARCHITECTURE.md). Works even if the link is opened on another device.
 *  - `?code=…` — from Supabase's default templates (PKCE). Only works in the
 *    same browser the request was made from.
 *
 * On success the member is signed in and sent to `?redirect` (same-origin only).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const type = ALLOWED_TYPES.find((t) => t === typeParam);

  const fallback = type === "recovery" ? "/reset-password" : "/tracker";
  const redirectTo = safeRedirect(searchParams.get("redirect"), fallback);

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  if (ok) return NextResponse.redirect(new URL(redirectTo, origin));
  return NextResponse.redirect(new URL("/login?error=link", origin));
}
