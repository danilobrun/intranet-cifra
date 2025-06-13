import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const emptyFormData = {
  name: "",
  email: "",
  number: "",
  function: "",
  state: "",
  lotation: "",
  password: "",
  type: 2,
};

export function UpdateUserForm({
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(initialValue);
  const { pathname } = useLocation();

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
  const handlesubmit = (event) => {
    event.preventDefault();
    setIsSubmiting(true);
    onSubmit(formData);
  };
  return (
    <Form onSubmit={handlesubmit}>
      <Form.Group className="mb-3" controlId="user-name">
        <Form.Label className="mb-0">Nome</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nome do usuário"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-email">
        <Form.Label className="mb-0">Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Email do usuário"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-number">
        <Form.Label className="mb-0">Telefone</Form.Label>
        <Form.Control
          type="text"
          placeholder="Telefone do usuário"
          name="number"
          value={formData.number}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-function">
        <Form.Label className="mb-0">Função</Form.Label>
        <Form.Control
          type="text"
          placeholder="Função do usuário"
          name="function"
          value={formData.function}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-state">
        <Form.Label className="mb-0">Estado</Form.Label>
        <Form.Control
          type="text"
          placeholder="Estado do usuário"
          name="state"
          value={formData.state}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-lotation">
        <Form.Label className="mb-0">Lotação</Form.Label>
        <Form.Control
          type="text"
          placeholder="Lotação do usuário"
          name="lotation"
          value={formData.lotation}
          onChange={handleChange}
        />
      </Form.Group>
      {pathname === "/portal/admin-login" && (
        <>
          <Form.Group className="mb-3" controlId="user-type">
            <Form.Label className="mb-0">Tipo</Form.Label>
            <Form.Control
              type="number"
              placeholder="Insira o tipo"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="user-password">
            <Form.Label className="mb-0">Senha</Form.Label>
            <Form.Control
              type="password"
              placeholder="Insira a senha"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </>
      )}
      <Button type="submit" disabled={isSubmiting}>
        {buttonLabel}
      </Button>
    </Form>
  );
}
