import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { verifyPasswordResetCode } from "../../services/Users.service";

export function ForgotPasswordCodeForm() {
  const [code, setCode] = useState("");
  const [isSubmiting, setIsSubmiting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const codeIsComplete = /^\d{6}$/.test(code);

  useEffect(() => {
    if (!email) {
      navigate("/recover-password", { replace: true });
    }
  }, [email, navigate]);

  const handleCodeChange = (index, value) => {
    const sanitizedValue = value.replace(/\D/g, "").slice(-1);
    const codeDigits = code.split("");

    codeDigits[index] = sanitizedValue;
    const updatedCode = Array.from(
      { length: 6 },
      (_, currentIndex) => codeDigits[currentIndex] || "",
    ).join("");

    setCode(updatedCode);

    if (sanitizedValue && index < 5) {
      const nextInput = document.getElementById(
        `recover-password-code-digit-${index + 1}`,
      );
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      const previousInput = document.getElementById(
        `recover-password-code-digit-${index - 1}`,
      );
      previousInput?.focus();
    }
  };

  const handleCodePaste = (event) => {
    event.preventDefault();
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    setCode(pastedCode);

    const targetIndex = Math.min(pastedCode.length, 5);
    const targetInput = document.getElementById(
      `recover-password-code-digit-${targetIndex}`,
    );
    targetInput?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmiting(true);
      const response = await verifyPasswordResetCode(email, code);
      toast.success(response.msg);
      navigate("/recover-password/reset", {
        state: {
          email,
          code,
        },
      });
    } catch (error) {
      toast.error(error.message || "Falha ao validar o código.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <CodeForm onSubmit={handleSubmit}>
      <FormHeader>
        <FormTitle>Digite o código</FormTitle>
        <FormSubtitle>
          Enviamos um código para <strong>{email || "seu e-mail"}</strong>.
        </FormSubtitle>
      </FormHeader>

      <FieldGroup controlId="recover-password-code">
        <FieldLabel>Código de verificação</FieldLabel>
        <CodeInputWrapper onPaste={handleCodePaste}>
          {Array.from({ length: 6 }, (_, index) => (
            <CodeInput
              key={index}
              id={`recover-password-code-digit-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code[index] || ""}
              onChange={(event) => handleCodeChange(index, event.target.value)}
              onKeyDown={(event) => handleCodeKeyDown(index, event)}
              disabled={isSubmiting}
              aria-label={`Dígito ${index + 1} do código`}
              maxLength={1}
            />
          ))}
        </CodeInputWrapper>
      </FieldGroup>

      <SubmitButton
        type="submit"
        disabled={isSubmiting || !codeIsComplete}
      >
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
            Validando código...
          </>
        ) : (
          "Validar código"
        )}
      </SubmitButton>

      <BackText>
        Não recebeu? <Link to="/recover-password">Enviar novamente</Link>
      </BackText>
    </CodeForm>
  );
}

const CodeForm = styled(Form)`
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

  strong {
    color: oklch(31% 0.018 245);
    font-weight: 700;
  }
`;

const FieldGroup = styled(Form.Group)`
  margin-bottom: 22px;
`;

const FieldLabel = styled(Form.Label)`
  margin: 0 0 9px;
  color: oklch(28% 0.016 245);
  font-size: 0.92rem;
  font-weight: 650;
`;

const CodeInputWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
`;

const CodeInput = styled.input`
  width: 100%;
  aspect-ratio: 1 / 1.08;
  min-height: 48px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  text-align: center;
  font-size: 1.35rem;
  font-weight: 720;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;

  &:focus {
    border-color: oklch(55% 0.17 253);
    background-color: oklch(99.2% 0.004 240);
    box-shadow: 0 0 0 0.22rem oklch(55% 0.17 253 / 0.14);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: oklch(94% 0.006 240);
    color: oklch(52% 0.014 245);
    cursor: not-allowed;
  }

  @media (max-width: 575.98px) {
    min-height: 42px;
    font-size: 1.15rem;
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
