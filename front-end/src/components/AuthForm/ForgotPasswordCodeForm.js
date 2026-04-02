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

  useEffect(() => {
    if (!email) {
      navigate("/recover-password", { replace: true });
    }
  }, [email, navigate]);

  const handleCodeChange = (index, value) => {
    const sanitizedValue = value.replace(/\D/g, "").slice(-1);
    const codeDigits = code.split("");

    codeDigits[index] = sanitizedValue;
    const updatedCode = Array.from({ length: 6 }, (_, currentIndex) =>
      codeDigits[currentIndex] || ""
    ).join("");

    setCode(updatedCode);

    if (sanitizedValue && index < 5) {
      const nextInput = document.getElementById(
        `recover-password-code-digit-${index + 1}`
      );
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      const previousInput = document.getElementById(
        `recover-password-code-digit-${index - 1}`
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
      `recover-password-code-digit-${targetIndex}`
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
      toast.error(error.message || "Falha ao validar o codigo.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <p className="h4">Digite o codigo</p>
      <p className="text-muted">
        Insira o codigo enviado para <strong>{email || "seu e-mail"}</strong>.
      </p>
      <Form.Group controlId="recover-password-code" className="mb-3">
        <Form.Label className="m-0">Codigo</Form.Label>
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
              aria-label={`Digito ${index + 1} do codigo`}
              maxLength={1}
            />
          ))}
        </CodeInputWrapper>
      </Form.Group>
      <Button
        type="submit"
        disabled={isSubmiting || code.length !== 6}
        className="w-100"
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
            Validando codigo...
          </>
        ) : (
          "Validar codigo"
        )}
      </Button>
      <DivLink>
        <Link to="/">Voltar para login</Link>
      </DivLink>
    </Form>
  );
}

const DivLink = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const CodeInputWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
`;

const CodeInput = styled.input`
  width: 3rem;
  height: 3.5rem;
  border: 1px solid #ced4da;
  border-radius: 0.85rem;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    transform 0.2s ease;

  &:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }

  @media (width < 576px) {
    width: 2.65rem;
    height: 3.2rem;
    gap: 0.5rem;
  }
`;
