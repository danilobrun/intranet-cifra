import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import styled from "styled-components";

const emptyFormData = {
  nome: "",
};

const normalizeInitialValue = (value = emptyFormData) => ({
  nome: String(value?.nome || ""),
});

export function CentroCustoFormModal({
  show,
  mode = "create",
  initialValue,
  isSubmitting,
  onHide,
  onSubmit,
}) {
  const [formData, setFormData] = useState(() =>
    normalizeInitialValue(initialValue),
  );
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!show) {
      return;
    }

    setFormData(normalizeInitialValue(initialValue));
  }, [initialValue, show]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    await onSubmit({
      nome: formData.nome.trim(),
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>
          {isEditMode ? "Editar centro de custo" : "Novo centro de custo"}
        </Modal.Title>
      </Modal.Header>

      <Form id="centro-custo-form" onSubmit={handleSubmit}>
        <Modal.Body>
          <FieldGroup controlId="centro-custo-nome">
            <FieldLabel>Nome</FieldLabel>
            <FieldControl
              type="text"
              name="nome"
              value={formData.nome}
              placeholder="Ex.: 5 - ADMINISTRAÇÃO"
              onChange={handleChange}
              disabled={isSubmitting}
              required
              autoFocus
            />
          </FieldGroup>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvando..."
              : isEditMode
                ? "Salvar alterações"
                : "Cadastrar centro"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

const FieldGroup = styled(Form.Group)`
  display: grid;
  gap: 8px;
`;

const FieldLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 0.92rem;
  font-weight: 700;
`;

const FieldControl = styled(Form.Control)`
  min-height: 46px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  outline: 0;
  box-shadow: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:focus,
  &:focus-visible {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.22rem oklch(55% 0.17 253 / 0.14);
  }

  &:disabled {
    background-color: oklch(94% 0.006 240);
    color: oklch(52% 0.014 245);
  }
`;
