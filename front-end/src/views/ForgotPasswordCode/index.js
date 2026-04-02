import { ForgotPasswordCodeForm } from "../../components/AuthForm/ForgotPasswordCodeForm";
import { PublicAuthLayout } from "../../components/PublicAuthLayout";

export function ForgotPasswordCodeView() {
  return (
    <PublicAuthLayout>
      <ForgotPasswordCodeForm />
    </PublicAuthLayout>
  );
}
