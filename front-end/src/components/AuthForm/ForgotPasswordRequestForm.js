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
      toast.error(error.message || "Falha ao enviar o codigo de recuperacao.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <p className="h4">Recuperar senha</p>
      <p className="text-muted">
        Informe seu e-mail para receber um codigo de verificacao.
      </p>
      <Form.Group controlId="recover-password-email" className="mb-3">
        <Form.Label className="m-0">E-mail</Form.Label>
        <Form.Control
          type="email"
          placeholder="seunome@cifraengenharia.com.br"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmiting}
          required
        />
      </Form.Group>
      <Button type="submit" disabled={isSubmiting} className="w-100">
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
            Enviando codigo...
          </>
        ) : (
          "Enviar codigo"
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
