import { ResetPasswordForm } from "../../components/AuthForm/ResetPasswordForm";
import { PublicAuthLayout } from "../../components/PublicAuthLayout";

export function ResetPasswordView() {
  return (
    <PublicAuthLayout>
      <ResetPasswordForm />
    </PublicAuthLayout>
  );
}
