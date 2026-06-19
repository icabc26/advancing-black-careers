"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate, type AuthResult } from "@/app/login/actions";
import { site } from "@/data/site";

type Mode = "signin" | "signup";

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  const idle = mode === "signin" ? "Sign in" : "Create account";
  const busy = mode === "signin" ? "Signing in…" : "Creating account…";
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[2px] bg-gold px-7 py-[15px] text-sm font-semibold text-base transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? busy : idle}
    </button>
  );
}

export default function LoginForm({ redirect }: { redirect: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [state, formAction] = useActionState<AuthResult, FormData>(authenticate, null);

  return (
    <div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-light">
        Members &amp; committee
      </p>
      <h1 className="mb-3 font-serif text-[34px] font-semibold sm:text-[40px]">Log in or sign up</h1>
      <p className="mb-6 max-w-[420px] text-[14px] leading-[1.65] text-muted">
        {mode === "signin"
          ? "Sign in with your Imperial email and password."
          : "First time here? Create an account with your Imperial email — if you're an ABC member, you're in."}
      </p>

      {/* Mode toggle */}
      <div className="mb-6 inline-flex rounded-[2px] border border-gold/30 p-[3px] text-[13px]">
        {(["signin", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-[2px] px-4 py-2 font-medium transition-colors ${
              mode === m ? "bg-gold text-base" : "text-dim hover:text-cream"
            }`}
          >
            {m === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form action={formAction} className="max-w-[420px]">
        <input type="hidden" name="redirect" value={redirect} />
        <input type="hidden" name="intent" value={mode} />

        <label
          htmlFor="email"
          className="mb-2 block font-mono text-[11px] uppercase tracking-[0.1em] text-dim"
        >
          Imperial email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@ic.ac.uk"
          className="mb-4 h-12 w-full rounded-[2px] border border-gold/30 bg-transparent px-4 text-[14px] text-cream placeholder:text-faint focus:border-gold focus:outline-none"
        />

        <label
          htmlFor="password"
          className="mb-2 block font-mono text-[11px] uppercase tracking-[0.1em] text-dim"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder={mode === "signin" ? "Your password" : "At least 8 characters"}
          className="mb-4 h-12 w-full rounded-[2px] border border-gold/30 bg-transparent px-4 text-[14px] text-cream placeholder:text-faint focus:border-gold focus:outline-none"
        />

        {state && !state.ok && (
          <p className="mb-4 text-[13px] leading-[1.55] text-[#e0a0a0]">{state.error}</p>
        )}
        {state && state.ok && (
          <p className="mb-4 text-[13px] leading-[1.55] text-gold-light">{state.notice}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SubmitButton mode={mode} />
        </div>
      </form>

      <p className="mt-8 text-[13px] text-dim">
        Not a member yet?{" "}
        <a
          href={site.membershipUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-light underline-offset-2 hover:underline"
        >
          Apply to join
        </a>
      </p>
    </div>
  );
}
