import { ForgotPasswordRequestForm } from "../../components/AuthForm/ForgotPasswordRequestForm";
import { PublicAuthLayout } from "../../components/PublicAuthLayout";

export function ForgotPasswordView() {
  return (
    <PublicAuthLayout>
      <ForgotPasswordRequestForm />
    </PublicAuthLayout>
  );
}
