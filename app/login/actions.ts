"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type AuthResult = { ok: false; error: string } | { ok: true; notice: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

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
 * On success we redirect into the member area; cookies are set by the server client.
 */
export async function authenticate(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const intent = String(formData.get("intent") ?? "signin");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/tracker");

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const supabase = await createClient();

  if (intent === "signup") {
    const allowed = await isAllowlisted(email);
    if (allowed === false) {
      return {
        ok: false,
        error:
          "This email isn't on the ABC member list yet. Join the society or contact the committee to be added.",
      };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return { ok: false, error: "An account with this email already exists — sign in instead." };
      }
      if (msg.includes("not allowed") || error.status === 403) {
        return {
          ok: false,
          error:
            "This email isn't on the ABC member list yet. Join the society or contact the committee to be added.",
        };
      }
      return { ok: false, error: "Couldn't create your account just now — please try again." };
    }

    // If email confirmation is still enabled in Supabase, no session is returned.
    if (!data.session) {
      return {
        ok: true,
        notice:
          "Account created. Check your inbox to confirm your email, then come back and sign in.",
      };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return {
        ok: false,
        error:
          "Incorrect email or password. If you haven't set a password yet, switch to “Create account” above.",
      };
    }
  }

  redirect(redirectTo);
}
