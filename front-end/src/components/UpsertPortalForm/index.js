import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const emptyFormData = {
  name: "",
  responsible: "",
  shortDescription: "",
  description: "",
  image: "",
  url: "",
  baseLink: "",
  updateSchedule: "",
  nameBi: "",
  emailResponsible: "",
};
export function UpsertPortalForm({
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(initialValue);
  const [isBi, setIsBi] = useState(false);

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
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Marque se o portal for um BI"
          name="isBi"
          checked={isBi}
          onChange={(e) => setIsBi(e.target.checked)}
        />
      </Form.Group>
      {isBi && (
        <>
          <Form.Group className="mb-3" controlId="portal-nameBi">
            <Form.Label className="mb-0">Nome do BI</Form.Label>
            <Form.Control
              placeholder="Insira o nome do BI"
              name="nameBi"
              value={formData.nameBi}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="portal-emailResponsible">
            <Form.Label className="mb-0">Email Responsável</Form.Label>
            <Form.Control
              placeholder="Insira o email responsável pelo BI"
              name="emailResponsible"
              value={formData.emailResponsible}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="portal-baseLink">
            <Form.Label className="mb-0">Link da Base</Form.Label>
            <Form.Control
              placeholder="Insira o link da base"
              name="baseLink"
              value={formData.baseLink}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="portal-updateSchedule">
            <Form.Label className="mb-0">Horários de Atualização</Form.Label>
            <Form.Control
              placeholder="Insira os horários de atualização"
              name="updateSchedule"
              value={formData.updateSchedule}
              onChange={handleChange}
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
