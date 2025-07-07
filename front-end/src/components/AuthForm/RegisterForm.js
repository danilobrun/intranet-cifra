import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { createUser } from "../../services/Users.service";
import { useDispatch } from "react-redux";
import { userLogin } from "../../store/User/User.actions";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function RegisterForm({ redirectAfterLogin }) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
    roleCodes: ["3"],
  });
  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "number") {
      let cleanedValue = value.replace(/\D/g, "");
      if (cleanedValue.length > 11) {
        cleanedValue = cleanedValue.slice(0, 11);
      }

      let numberFormatted = cleanedValue;

      if (cleanedValue.length > 2) {
        numberFormatted = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(
          2,
          7
        )}-${cleanedValue.slice(7)}`;
      }

      setFormData({
        ...formData,
        [name]: numberFormatted,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.email.endsWith("@cifraengenharia.com.br")) {
      toast.error("Use um e-mail @cifraengenharia.com.br para se cadastrar.");
      return;
    }
    try {
      setIsSubmiting(true);
      console.log(formData);
      const userData = await createUser(formData);
      dispatch(userLogin(userData));
      if (redirectAfterLogin) {
        navigate("/portal");
      }
    } catch (error) {
      const message =
        error.message || "Falha ao fazer cadastro. Tente novamente.";
      toast.error(message);
      isSubmiting(false);
    }
  };
  return (
    <Form onSubmit={handleSubmit}>
      <p className="h4">Cadastre-se</p>
      <Form.Group controlId="register-name" className="mb-3">
        <Form.Label className="m-0">Nome</Form.Label>
        <Form.Control
          type="text"
          placeholder="Informe seu nome"
          value={formData.name}
          onChange={handleChange}
          name="name"
          required
        />
      </Form.Group>
      <Form.Group controlId="register-number" className="mb-3">
        <Form.Label className="m-0">Telefone Funcional</Form.Label>
        <Form.Control
          type="text"
          placeholder="Informe seu telefone funcional"
          value={formData.number}
          onChange={handleChange}
          name="number"
          required
        />
      </Form.Group>
      <Form.Group controlId="register-email" className="mb-3">
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
      <Form.Group controlId="register-password" className="mb-3">
        <Form.Label className="m-0">Senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="senha de acesso"
          value={formData.password}
          onChange={handleChange}
          name="password"
          required
          minLength={4}
        />
      </Form.Group>
      <Button type="submit" disabled={isSubmiting} className="w-100">
        Criar conta
      </Button>
    </Form>
  );
}
