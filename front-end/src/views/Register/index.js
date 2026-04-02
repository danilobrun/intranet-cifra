import { Link } from "react-router-dom";
import { RegisterForm } from "../../components/AuthForm/RegisterForm";
import { PublicAuthLayout } from "../../components/PublicAuthLayout";

export function RegisterView() {
  return (
    <PublicAuthLayout>
      <RegisterForm redirectAfterLogin={true} />
      <p className="text-center mt-3">
        Ja possui uma conta? <Link to="/">Entrar</Link>
      </p>
    </PublicAuthLayout>
  );
}
