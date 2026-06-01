import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { login } from "../../services/Users.service";
import { userLogin } from "../../store/User/User.actions";

export function LoginForm({ redirectAfterLogin }) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmiting(true);
      const userData = await login(formData);
      dispatch(userLogin(userData));

      if (redirectAfterLogin) {
        navigate("/portals");
      }
    } catch (error) {
      const message =
        error.message === "Credentials invalid."
          ? "E-mail ou senha invalidos."
          : "Falha ao fazer login. Tente novamente.";

      console.error(error.message);
      toast.error(message);
      setIsSubmiting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <p className="h4">Login</p>
      <Form.Group controlId="login-email" className="mb-3">
        <Form.Label className="m-0">E-mail</Form.Label>
        <Form.Control
          type="email"
          placeholder="seunome@cifraengenharia.com.br"
          value={formData.email}
          onChange={handleChange}
          name="email"
          required
        />
      </Form.Group>
      <Form.Group controlId="login-password" className="mb-3">
        <Form.Label className="m-0">Senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="senha de acesso"
          value={formData.password}
          onChange={handleChange}
          name="password"
          required
        />
      </Form.Group>
      <HelperText className="mb-3">
        Não lembra a sua senha?{" "}
        <Link to="/recover-password">Recuperar senha</Link>
      </HelperText>
      <Button type="submit" disabled={isSubmiting} className="w-100">
        Entrar
      </Button>
    </Form>
  );
}

const HelperText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #6c757d;
  text-align: end;
`;
