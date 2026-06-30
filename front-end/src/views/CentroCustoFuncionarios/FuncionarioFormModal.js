import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import styled from "styled-components";

const emptyFormData = {
  nome: "",
  cpf: "",
  centroCusto: "",
};

const getCpfDigits = (value = "") => String(value || "").replace(/\D/g, "");

const formatCpf = (value = "") => {
  const digits = getCpfDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
};

const normalizeInitialValue = (value = emptyFormData) => ({
  nome: String(value?.nome || ""),
  cpf: formatCpf(value?.cpf || ""),
  centroCusto: String(value?.centroCusto || ""),
});

export function FuncionarioFormModal({
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
  const [cpfError, setCpfError] = useState("");
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!show) {
      return;
    }

    setFormData(normalizeInitialValue(initialValue));
    setCpfError("");
  }, [initialValue, show]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "cpf" ? formatCpf(value) : value;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: nextValue,
    }));

    if (name === "cpf" && cpfError && getCpfDigits(nextValue).length === 11) {
      setCpfError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const cpf = getCpfDigits(formData.cpf);

    if (cpf.length !== 11) {
      setCpfError("Informe um CPF valido com 11 digitos.");
      return;
    }

    await onSubmit({
      nome: formData.nome.trim(),
      cpf,
      centroCusto: formData.centroCusto.trim(),
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>
          {isEditMode ? "Editar funcionario" : "Novo funcionario"}
        </Modal.Title>
      </Modal.Header>

      <Form id="funcionario-form" onSubmit={handleSubmit}>
        <Modal.Body>
          <FieldsGrid>
            <FieldGroup controlId="funcionario-nome">
              <FieldLabel>Nome</FieldLabel>
              <FieldControl
                type="text"
                name="nome"
                value={formData.nome}
                placeholder="Nome completo"
                onChange={handleChange}
                disabled={isSubmitting}
                required
                autoFocus
              />
            </FieldGroup>

            <FieldGroup controlId="funcionario-cpf">
              <FieldLabel>CPF</FieldLabel>
              <FieldControl
                type="text"
                name="cpf"
                value={formData.cpf}
                placeholder="000.000.000-00"
                onChange={handleChange}
                disabled={isSubmitting}
                required
                maxLength={14}
                inputMode="numeric"
                aria-invalid={cpfError ? "true" : undefined}
                aria-describedby="funcionario-cpf-help"
              />
              {cpfError ? (
                <FieldError id="funcionario-cpf-help">{cpfError}</FieldError>
              ) : null}
            </FieldGroup>

            <FieldGroup controlId="funcionario-centro-custo">
              <FieldLabel>Centro de custo</FieldLabel>
              <FieldControl
                type="text"
                name="centroCusto"
                value={formData.centroCusto}
                placeholder="Centro de custo"
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </FieldGroup>
          </FieldsGrid>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvando..."
              : isEditMode
                ? "Salvar alteracoes"
                : "Cadastrar funcionario"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

const FieldsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

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

const FieldError = styled.p`
  margin: 0;
  color: oklch(45% 0.18 25);
  font-size: 0.88rem;
  font-weight: 650;
`;
