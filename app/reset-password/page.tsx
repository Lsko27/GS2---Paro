import type { Metadata } from "next";
import AuthRecoveryLayout from "../forgot-password/_components/auth-recovery";
import ResetPasswordForm from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha | Parô",
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
  }>;
};

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <AuthRecoveryLayout
      title="Redefinir senha"
      description="Crie uma nova senha para recuperar o acesso à sua conta."
    >
      <ResetPasswordForm token={token} />
    </AuthRecoveryLayout>
  );
};

export default ResetPasswordPage;
