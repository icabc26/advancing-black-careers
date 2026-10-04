import type { Metadata } from "next";
import { ButtonLink } from "@/components/Button";
import AuthCard from "@/components/AuthCard";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Choose a new password · Imperial ABC",
  description: "Set a new password for your Advancing Black Careers member account.",
};

/**
 * Reached from a password-reset email: /auth/callback signs the member in
 * with the recovery link, then forwards here so they can set a new password.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AuthCard
        eyebrow="Members & committee"
        title="This link has expired"
        intro="Password reset links only work once and expire after an hour. Request a new one and use the latest email."
      >
        <ButtonLink href="/forgot-password">Request a new link</ButtonLink>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Members & committee"
      title="Choose a new password"
      intro={
        <>
          Setting a new password for <span className="text-cream">{user.email}</span>.
        </>
      }
    >
      <ResetPasswordForm email={user.email ?? ""} />
    </AuthCard>
  );
}
