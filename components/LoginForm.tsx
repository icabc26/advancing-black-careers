"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestMagicLink, type MagicLinkResult } from "@/app/login/actions";
import { site } from "@/data/site";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-[2px] bg-gold px-7 py-[15px] text-sm font-semibold text-base transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send me a magic link"}
    </button>
  );
}

export default function LoginForm({ redirect }: { redirect: string }) {
  const [state, formAction] = useActionState<MagicLinkResult | null, FormData>(
    requestMagicLink,
    null
  );

  if (state?.ok) {
    return (
      <div>
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-light">
          Check your inbox
        </p>
        <h1 className="mb-3 font-serif text-[34px] font-semibold sm:text-[40px]">
          Your magic link is on the way
        </h1>
        <p className="max-w-[420px] text-[14px] leading-[1.65] text-muted">
          We&apos;ve emailed you a secure sign-in link. Open it on this device to access the
          internship tracker. The link expires shortly, so use it soon — and check your spam folder
          if it doesn&apos;t arrive.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-light">
        Members &amp; committee
      </p>
      <h1 className="mb-3 font-serif text-[34px] font-semibold sm:text-[40px]">Log in or sign up</h1>
      <p className="mb-3 max-w-[420px] text-[14px] leading-[1.65] text-muted">
        Use your Imperial email to continue. We&apos;ll send you a one-time sign-in link — no
        password needed.
      </p>
      <p className="mb-8 max-w-[420px] text-[13px] leading-[1.6] text-dim">
        First time here? Just enter your Imperial email below — if you&apos;re an ABC member,
        we&apos;ll create your account automatically when you open the link.
      </p>

      <form action={formAction} className="max-w-[420px]">
        <input type="hidden" name="redirect" value={redirect} />
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

        {state && !state.ok && (
          <p className="mb-4 text-[13px] leading-[1.55] text-[#e0a0a0]">{state.error}</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SubmitButton />
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
