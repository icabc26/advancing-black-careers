"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getRequestOrigin, safeRedirect } from "@/lib/urls";

export type AuthResult = { ok: false; error: string } | { ok: true; notice: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const NOT_ON_LIST =
  "This email isn't on the ABC member list yet. Join the society or contact the committee to be added.";

function readEmail(formData: FormData): string {
  return String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
}

/** Link target for auth emails: /auth/callback, then on to `next`. */
async function callbackUrl(next: string): Promise<string> {
  const origin = await getRequestOrigin();
  return `${origin}/auth/callback?redirect=${encodeURIComponent(next)}`;
}

/**
 * Check the member allowlist (service role bypasses RLS).
 * Returns true/false, or null if the check itself failed (env not configured) —
 * in which case we let the "Before User Created" auth hook be the hard gate.
 */
async function isAllowlisted(email: string): Promise<boolean | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("allowed_members")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  } catch {
    return null;
  }
}

/**
 * Email + password auth. `intent` ("signin" | "signup") decides the branch.
 * The member allowlist still gates account creation: a friendly pre-check here,
 * plus the hard "Before User Created" hook server-side.
 * With "Confirm email" on, sign-up sends a confirmation link instead of
 * signing in; the link lands on /auth/callback.
 */
export async function authenticate(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const intent = String(formData.get("intent") ?? "signin");
  const email = readEmail(formData);
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirect(formData.get("redirect"));

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const supabase = await createClient();

  if (intent === "signup") {
    const allowed = await isAllowlisted(email);
    if (allowed === false) return { ok: false, error: NOT_ON_LIST };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: await callbackUrl(redirectTo) },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (error.code === "user_already_exists" || msg.includes("already registered")) {
        return { ok: false, error: "An account with this email already exists — sign in instead." };
      }
      if (error.code === "over_email_send_rate_limit" || error.status === 429) {
        return {
          ok: false,
          error: "We've sent too many emails just now. Please wait a few minutes and try again.",
        };
      }
      if (msg.includes("not allowed") || error.status === 403) {
        return { ok: false, error: NOT_ON_LIST };
      }
      return { ok: false, error: "Couldn't create your account just now — please try again." };
    }

    // With confirmation on, Supabase hides "already exists" by returning a user
    // with no identities rather than an error.
    if (data.user && data.user.identities?.length === 0) {
      return { ok: false, error: "An account with this email already exists — sign in instead." };
    }

    // Confirmation on → no session yet; the member must click the email link.
    if (!data.session) {
      return {
        ok: true,
        notice:
          "Account created. We've emailed you a confirmation link — check your junk folder if it isn't in your inbox. Once confirmed, you'll be signed in.",
      };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.code === "email_not_confirmed") {
        return {
          ok: false,
          error:
            "Please confirm your email first — check your inbox (and junk folder) for the link. Need a new one? Switch to “Create account” and submit again.",
        };
      }
      return {
        ok: false,
        error:
          "Incorrect email or password. If you haven't set a password yet, switch to “Create account” above.",
      };
    }
  }

  redirect(redirectTo);
}

/**
 * Send a password-reset email. Always gives the same answer so the form
 * can't be used to find out which emails have accounts.
 */
export async function requestPasswordReset(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  const email = readEmail(formData);
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await callbackUrl("/reset-password"),
  });

  if (error && (error.code === "over_email_send_rate_limit" || error.status === 429)) {
    return {
      ok: false,
      error: "We've sent too many emails just now. Please wait a few minutes and try again.",
    };
  }

  return {
    ok: true,
    notice:
      "If there's an account for that email, we've sent a reset link. It expires in an hour — check your junk folder too.",
  };
}

/** Set a new password for the signed-in member (arrived via a reset link). */
export async function updatePassword(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== confirm) {
    return { ok: false, error: "Those passwords don't match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Your reset link has expired. Request a new one and try again." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { ok: false, error: "Choose a password different from your current one." };
    }
    if (error.code === "weak_password") {
      return { ok: false, error: "That password is too weak — try a longer one." };
    }
    return { ok: false, error: "Couldn't update your password just now — please try again." };
  }

  redirect("/tracker");
}
