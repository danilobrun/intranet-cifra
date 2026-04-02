import { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/Users.service";

export function ResetPasswordForm() {
  const [isSubmiting, setIsSubmiting] = useState(false);
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
    <Form onSubmit={handleSubmit}>
      <p className="h4">Nova senha</p>
      <p className="text-muted">
        Defina uma nova senha para a conta{" "}
        <strong>{email || "selecionada"}</strong>.
      </p>
      <Form.Group controlId="reset-password-new" className="mb-3">
        <Form.Label className="m-0">Nova senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="Digite a nova senha"
          value={formData.password}
          onChange={handleChange}
          name="password"
          disabled={isSubmiting}
          required
          minLength={4}
        />
      </Form.Group>
      <Form.Group controlId="reset-password-confirm" className="mb-3">
        <Form.Label className="m-0">Confirmar nova senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="Confirme a nova senha"
          value={formData.confirmPassword}
          onChange={handleChange}
          name="confirmPassword"
          disabled={isSubmiting}
          required
          minLength={4}
        />
      </Form.Group>
      <Button type="submit" disabled={isSubmiting} className="w-100 mb-3">
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
            Salvando nova senha...
          </>
        ) : (
          "Salvar nova senha"
        )}
      </Button>
    </Form>
  );
}
