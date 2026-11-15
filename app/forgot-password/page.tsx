import AuthRecoveryLayout from "./_components/auth-recovery";
import ForgotPasswordForm from "./_components/forgot-password-form";

const ForgotPasswordPage = () => {
  return (
    <AuthRecoveryLayout
      title="Esqueceu sua senha?"
      description="Informe seu e-mail e enviaremos as instruções para redefinir sua senha."
    >
      <ForgotPasswordForm />
    </AuthRecoveryLayout>
  );
};

export default ForgotPasswordPage;
