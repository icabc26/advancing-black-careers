"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset, type AuthResult } from "@/app/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[2px] bg-gold px-7 py-[15px] text-sm font-semibold text-base transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send reset link"}
    </button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState<AuthResult, FormData>(requestPasswordReset, null);

  return (
    <form action={formAction} className="max-w-[420px]">
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

      <div aria-live="polite">
        {state && !state.ok && (
          <p className="mb-4 text-[13px] leading-[1.55] text-[#e0a0a0]">{state.error}</p>
        )}
        {state && state.ok && (
          <p className="mb-4 text-[13px] leading-[1.55] text-gold-light">{state.notice}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <SubmitButton />
        <Link
          href="/login"
          className="text-[13px] text-gold-light underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
