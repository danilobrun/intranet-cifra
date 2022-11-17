import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const emptyFormData = {
  name: "",
  responsible: "",
  shortDescription: "",
  description: "",
  image: "",
  url: "",
};
export function UpsertPortalForm({
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(initialValue);
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const handlesubmit = (event) => {
    event.preventDefault();
    setIsSubmiting(true);
    onSubmit(formData);
  };
  return (
    <Form onSubmit={handlesubmit}>
      <Form.Group className="mb-3" controlId="portal-name">
        <Form.Label className="mb-0">Nome</Form.Label>
        <Form.Control
          placeholder="Nome do portal"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="portal-responsible">
        <Form.Label className="mb-0">Responsável</Form.Label>
        <Form.Control
          placeholder="Nome do responsável do portal"
          name="responsible"
          value={formData.responsible}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="portal-short-description">
        <Form.Label className="mb-0">Descrição curta</Form.Label>
        <Form.Control
          placeholder="Texto que aparece na listagem do portal"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          required
          as="textarea"
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="portal-description">
        <Form.Label className="mb-0">Descrição longa</Form.Label>
        <Form.Control
          placeholder="Texto que aparece no detalhe do portal"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          as="textarea"
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="portal-image">
        <Form.Label className="mb-0">Imagem</Form.Label>
        <Form.Control
          placeholder="Imagem que aparece na listagem dos portais"
          name="image"
          value={formData.image}
          onChange={handleChange}
          required
        />
        <Form.Text>
          Cole aqui o link da imagem hospedada no{" "}
          <a href="https://cloudinary.com/" target="_blank" rel="noreferrer">
            Cloudinary
          </a>
          .
        </Form.Text>
      </Form.Group>
      <Form.Group className="mb-3" controlId="portal-url">
        <Form.Label className="mb-0">Link do portal</Form.Label>
        <Form.Control
          placeholder="Insira o link do portal"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Button type="submit" disabled={isSubmiting}>
        {buttonLabel}
      </Button>
    </Form>
  );
}
