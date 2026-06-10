import { RegisterForm } from "../../components/AuthForm/RegisterForm";
import { PublicAuthLayout } from "../../components/PublicAuthLayout";

export function RegisterView() {
  return (
    <PublicAuthLayout>
      <RegisterForm redirectAfterLogin={true} />
    </PublicAuthLayout>
  );
}
