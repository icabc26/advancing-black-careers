import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password · Imperial ABC",
  description: "Reset the password for your Advancing Black Careers member account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Members & committee"
      title="Forgot your password?"
      intro="Enter the email you signed up with and we'll send you a link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
