import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { requestPasswordResetCode } from "../../services/Users.service";

export function ForgotPasswordRequestForm() {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@cifraengenharia.com.br")) {
      toast.error(
        "O site só aceita e-mails com o domínio @cifraengenharia.com.br.",
      );
      return;
    }

    try {
      setIsSubmiting(true);
      const response = await requestPasswordResetCode(normalizedEmail);
      toast.success(response.msg);
      navigate("/recover-password/code", {
        state: {
          email: normalizedEmail,
        },
      });
    } catch (error) {
      toast.error(error.message || "Falha ao enviar o código de recuperação.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <RecoverForm onSubmit={handleSubmit}>
      <FormHeader>
        <FormTitle>Recuperar senha</FormTitle>
        <FormSubtitle>
          Informe seu e-mail corporativo para receber o código.
        </FormSubtitle>
      </FormHeader>

      <FieldGroup controlId="recover-password-email">
        <FieldLabel>E-mail</FieldLabel>
        <FieldControl
          type="email"
          placeholder="seunome@cifraengenharia.com.br"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          disabled={isSubmiting}
          required
        />
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
            Enviando código...
          </>
        ) : (
          "Enviar código"
        )}
      </SubmitButton>

      <BackText>
        Lembrou a senha? <Link to="/">Entrar</Link>
      </BackText>
    </RecoverForm>
  );
}

const RecoverForm = styled(Form)`
  width: 100%;
`;

const FormHeader = styled.div`
  margin-bottom: 34px;
`;

const FormTitle = styled.h1`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 760;
  line-height: 1.08;
`;

const FormSubtitle = styled.p`
  max-width: 34ch;
  margin: 12px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 0.98rem;
  line-height: 1.5;
`;

const FieldGroup = styled(Form.Group)`
  margin-bottom: 22px;
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

const SubmitButton = styled(Button)`
  width: 100%;
  min-height: 50px;
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
