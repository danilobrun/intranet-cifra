import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { login } from "../../services/Users.service";
import { userLogin } from "../../store/User/User.actions";

export function LoginForm({ redirectAfterLogin }) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <LoginFormWrapper onSubmit={handleSubmit}>
      <FormHeader>
        <FormTitle>Acesso à Intranet Cifra</FormTitle>
        <FormSubtitle>
          Entre com seu e-mail corporativo para acessar seus portais.
        </FormSubtitle>
      </FormHeader>

      <FieldGroup controlId="login-email">
        <FieldLabel>E-mail</FieldLabel>
        <FieldControl
          type="email"
          placeholder="seunome@cifraengenharia.com.br"
          value={formData.email}
          onChange={handleChange}
          name="email"
          autoComplete="email"
          disabled={isSubmiting}
          required
        />
      </FieldGroup>

      <FieldGroup controlId="login-password">
        <FieldLabel>Senha</FieldLabel>
        <PasswordField>
          <FieldControl
            type={showPassword ? "text" : "password"}
            placeholder="senha de acesso"
            value={formData.password}
            onChange={handleChange}
            name="password"
            autoComplete="current-password"
            disabled={isSubmiting}
            required
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

      <RecoverLink to="/recover-password">Recuperar senha</RecoverLink>

      <SubmitButton type="submit" disabled={isSubmiting}>
        {isSubmiting ? "Entrando..." : "Entrar"}
      </SubmitButton>

      <RegisterText>
        Ainda não possui uma conta? <Link to="/register">Cadastre-se</Link>
      </RegisterText>
    </LoginFormWrapper>
  );
}

const LoginFormWrapper = styled(Form)`
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

const RecoverLink = styled(Link)`
  width: fit-content;
  display: block;
  margin: -4px 0 22px auto;
  color: oklch(48% 0.16 253);
  font-size: 0.92rem;
  font-weight: 650;
  text-decoration: none;

  &:hover,
  &:focus {
    color: oklch(42% 0.17 253);
    text-decoration: underline;
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

const RegisterText = styled.p`
  margin: 0;
  padding-top: 26px;
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
