"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updatePassword, type AuthResult } from "@/app/login/actions";

const inputClass =
  "mb-4 h-12 w-full rounded-[2px] border border-gold/30 bg-transparent px-4 text-[14px] text-cream placeholder:text-faint focus:border-gold focus:outline-none";
const labelClass = "mb-2 block font-mono text-[11px] uppercase tracking-[0.1em] text-dim";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[2px] bg-gold px-7 py-[15px] text-sm font-semibold text-base transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save new password"}
    </button>
  );
}

export default function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction] = useActionState<AuthResult, FormData>(updatePassword, null);

  return (
    <form action={formAction} className="max-w-[420px]">
      {/* Lets password managers attach the new password to the right account. */}
      <input type="hidden" name="username" autoComplete="username" value={email} readOnly />

      <label htmlFor="password" className={labelClass}>
        New password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        className={inputClass}
      />

      <label htmlFor="confirm" className={labelClass}>
        Confirm new password
      </label>
      <input
        id="confirm"
        name="confirm"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Type it again"
        className={inputClass}
      />

      <div aria-live="polite">
        {state && !state.ok && (
          <p className="mb-4 text-[13px] leading-[1.55] text-[#e0a0a0]">{state.error}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
