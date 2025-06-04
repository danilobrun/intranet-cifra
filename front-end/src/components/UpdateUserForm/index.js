import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const emptyFormData = {
  name: "",
  email: "",
  number: "",
};

export function UpdateUserForm({
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(initialValue);

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
      <Button type="submit" disabled={isSubmiting}>
        {buttonLabel}
      </Button>
    </Form>
  );
}
