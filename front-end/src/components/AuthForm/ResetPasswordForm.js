import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { resetPassword } from "../../services/Users.service";

export function ResetPasswordForm() {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const code = location.state?.code || "";

  useEffect(() => {
    if (!email || !code) {
      navigate("/recover-password", { replace: true });
    }
  }, [code, email, navigate]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas precisam ser iguais.");
      return;
    }

    try {
      setIsSubmiting(true);
      const response = await resetPassword({
        email,
        code,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      toast.success(response.msg);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.message || "Falha ao redefinir a senha.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <ResetForm onSubmit={handleSubmit}>
      <FormHeader>
        <FormTitle>Redefina sua senha</FormTitle>
        <FormSubtitle>
          Crie uma nova senha de acesso para{" "}
          <strong>{email || "sua conta"}</strong>
        </FormSubtitle>
      </FormHeader>

      <FieldGroup controlId="reset-password-new">
        <FieldLabel>Nova senha</FieldLabel>
        <PasswordField>
          <FieldControl
            type={showPassword ? "text" : "password"}
            placeholder="Digite a nova senha"
            value={formData.password}
            onChange={handleChange}
            name="password"
            autoComplete="new-password"
            disabled={isSubmiting}
            required
            minLength={4}
          />
          <PasswordToggle
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            disabled={isSubmiting}
            onClick={() => setShowPassword((currentValue) => !currentValue)}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </PasswordToggle>
        </PasswordField>
      </FieldGroup>

      <FieldGroup controlId="reset-password-confirm">
        <FieldLabel>Confirmar senha</FieldLabel>
        <PasswordField>
          <FieldControl
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirme a nova senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            autoComplete="new-password"
            disabled={isSubmiting}
            required
            minLength={4}
          />
          <PasswordToggle
            type="button"
            aria-label={
              showConfirmPassword
                ? "Ocultar confirmacao de senha"
                : "Mostrar confirmacao de senha"
            }
            disabled={isSubmiting}
            onClick={() =>
              setShowConfirmPassword((currentValue) => !currentValue)
            }
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
          </PasswordToggle>
        </PasswordField>
      </FieldGroup>

      <SubmitButton type="submit" disabled={isSubmiting}>
        {isSubmiting ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Atualizando senha...
          </>
        ) : (
          "Atualizar senha"
        )}
      </SubmitButton>

      <BackText>
        Lembrou a senha? <Link to="/">Entrar</Link>
      </BackText>
    </ResetForm>
  );
}

const ResetForm = styled(Form)`
  width: 100%;
`;

const FormHeader = styled.div`
  margin-bottom: 32px;
`;

const FormTitle = styled.h1`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 760;
  line-height: 1.08;
`;

const FormSubtitle = styled.p`
  max-width: 38ch;
  margin: 12px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 0.98rem;
  line-height: 1.5;

  strong {
    color: oklch(31% 0.018 245);
    font-weight: 700;
    overflow-wrap: anywhere;
  }
`;

const FieldGroup = styled(Form.Group)`
  margin-bottom: 18px;
`;

const FieldLabel = styled(Form.Label)`
  margin: 0 0 7px;
  color: oklch(28% 0.016 245);
  font-size: 0.92rem;
  font-weight: 650;
`;

const FieldControl = styled(Form.Control)`
  height: 50px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  font-size: 0.98rem;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  &::placeholder {
    color: oklch(58% 0.018 245);
  }

  &:focus {
    border-color: oklch(55% 0.17 253);
    background-color: oklch(99.2% 0.004 240);
    box-shadow: 0 0 0 0.22rem oklch(55% 0.17 253 / 0.14);
  }

  &:disabled {
    background-color: oklch(94% 0.006 240);
    color: oklch(52% 0.014 245);
  }
`;

const PasswordField = styled.div`
  position: relative;

  ${FieldControl} {
    padding-right: 48px;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  top: 50%;
  right: 12px;
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: oklch(45% 0.018 245);
  transform: translateY(-50%);
  transition:
    background-color 160ms ease,
    color 160ms ease;

  &:hover,
  &:focus {
    background-color: oklch(94% 0.012 245);
    color: oklch(34% 0.04 253);
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    color: oklch(62% 0.012 245);
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  min-height: 50px;
  margin-top: 6px;
  border: 0;
  border-radius: 10px;
  background-color: oklch(54% 0.19 253);
  color: oklch(98% 0.004 240);
  font-weight: 720;
  letter-spacing: 0;
  transition:
    background-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;

  &:hover,
  &:focus {
    background-color: oklch(48% 0.2 253);
    box-shadow: 0 12px 24px oklch(42% 0.18 253 / 0.24);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: oklch(68% 0.06 250);
    box-shadow: none;
  }
`;

const BackText = styled.p`
  margin: 0;
  padding-top: 24px;
  color: oklch(49% 0.018 245);
  font-size: 0.92rem;
  text-align: center;

  a {
    color: oklch(48% 0.16 253);
    font-weight: 650;
    text-decoration: none;

    &:hover,
    &:focus {
      color: oklch(42% 0.17 253);
      text-decoration: underline;
    }
  }
`;
