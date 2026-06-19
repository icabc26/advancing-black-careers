import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Member login · Imperial ABC",
  description: "Sign in to the Advancing Black Careers member area and internship tracker.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  // Already signed in? Skip straight to the member area.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(redirectTo || "/tracker");

  return (
    <section className="mx-auto max-w-[1000px] px-5 py-12 sm:px-8 md:px-14 md:py-16">
      <div className="flex min-h-[560px] flex-col overflow-hidden rounded-[3px] border border-hairline md:flex-row">
        {/* Brand panel */}
        <div className="flex flex-1 flex-col justify-between gap-10 border-b border-hairline bg-panel-2 bg-[radial-gradient(120%_100%_at_30%_20%,rgba(201,162,75,0.14),rgba(16,13,10,0)_60%)] p-10 md:border-b-0 md:border-r md:p-12">
          <div className="font-serif text-base tracking-[0.14em] text-[#cfc7b6]">IMPERIAL ABC</div>
          <div className="flex justify-center">
            <Image
              src="/abc_logo.jpg"
              alt="Advancing Black Careers logo"
              width={220}
              height={220}
              className="w-[220px] object-contain"
            />
          </div>
          <div>
            <p className="font-serif text-[28px] leading-[1.18] sm:text-[30px]">
              Welcome back to
              <br />
              the community.
            </p>
            <p className="mt-3 text-[13px] leading-[1.6] text-dim">
              Members &amp; committee sign in here to access the internship tracker, RSVP to events
              and more.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-1 flex-col justify-center p-10 md:p-12">
          <LoginForm redirect={redirectTo || "/tracker"} />
        </div>
      </div>
    </section>
  );
}
