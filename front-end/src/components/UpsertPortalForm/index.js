import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const emptyFormData = {
  name: "",
  responsible: "",
  shortDescription: "",
  description: "",
  image: "",
  url: "",
  details: [
    {
      url: "",
      baseLink: "",
      updateSchedule: "",
      nameForm: "",
      emailResponsible: "",
    },
  ],
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

  const handleDetailChange = (index, e) => {
    const newDetails = [...formData.details];
    newDetails[index][e.target.name] = e.target.value;
    setFormData({ ...formData, details: newDetails });
  };

  const handleAddDetails = () => {
    setFormData({
      ...formData,
      details: [
        ...formData.details,
        {
          url: "",
          baseLink: "",
          updateSchedule: "",
          nameForm: "",
          emailResponsible: "",
        },
      ],
    });
  };

  const handleRemoveDetails = (index) => {
    const newDetails = [...formData.details];
    newDetails.splice(index, 1);
    setFormData({ ...formData, details: newDetails });
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
      <Form.Group className="mb-3" controlId="portal-emailResponsible">
        <Form.Label className="mb-0">Email Responsável</Form.Label>
        <Form.Control
          placeholder="Insira o email responsável"
          name="emailResponsible"
          value={formData.emailResponsible}
          onChange={handleChange}
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
          Hospede a foto no{" "}
          <a href="https://postimages.org/" target="_blank" rel="noreferrer">
            postimages
          </a>{" "}
          e cole o <strong>link direto</strong> aqui .
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
      <Form.Label className="mb-3">Adicionar dados</Form.Label>

      {formData.details.map((detail, index) => (
        <div key={index} className="px-4">
          <h6 className="mb-3">Dados {index + 1}</h6>

          <Form.Group className="mb-3" controlId="portal-details-nameForm">
            <Form.Label className="mb-0">Nome</Form.Label>
            <Form.Control
              placeholder="Insira o nome"
              name="nameForm"
              value={detail.nameForm}
              onChange={(e) => handleDetailChange(index, e)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="portal-details-url">
            <Form.Label className="mb-0">Link do portal</Form.Label>
            <Form.Control
              placeholder="Insira o link do portal"
              name="url"
              value={detail.url}
              onChange={(e) => handleDetailChange(index, e)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="portal-details-baseLink">
            <Form.Label className="mb-0">Link da base</Form.Label>
            <Form.Control
              placeholder="Insira o link da base"
              name="baseLink"
              value={detail.baseLink}
              onChange={(e) => handleDetailChange(index, e)}
            />
          </Form.Group>
          <Form.Group
            className="mb-3"
            controlId="portal-details-updateSchedule"
          >
            <Form.Label className="mb-0">Horário de atualização</Form.Label>
            <Form.Control
              placeholder="Insira o horário de atualização"
              name="updateSchedule"
              value={detail.updateSchedule}
              onChange={(e) => handleDetailChange(index, e)}
            />
          </Form.Group>
          <Form.Group
            className="mb-3"
            controlId="portal-details-emailResponsible"
          >
            <Form.Label className="mb-0">Email do responsável</Form.Label>
            <Form.Control
              placeholder="Insira o email do responsável"
              name="emailResponsible"
              value={detail.emailResponsible}
              onChange={(e) => handleDetailChange(index, e)}
            />
          </Form.Group>

          {formData.details.length > 1 && (
            <Button onClick={() => handleRemoveDetails(index)} className="my-2">
              Remover dados
            </Button>
          )}
        </div>
      ))}
      <Button onClick={handleAddDetails}>Adicionar mais dados</Button>
      <br />
      <Button type="submit" disabled={isSubmiting} className="mt-4">
        {buttonLabel}
      </Button>
    </Form>
  );
}
