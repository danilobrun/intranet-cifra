import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCarSide } from "@fortawesome/free-solid-svg-icons";

const emptyFormData = {
  placa: "",
  condutor: "",
  contrato: "",
  estado: "",
  crlv: "",
};

const STATE_OPTIONS = ["Alagoas", "Pernambuco", "Sergipe", "Piauí"];

const normalizeFormData = (value = emptyFormData) => ({
  placa: String(value.placa || ""),
  condutor: String(value.condutor || ""),
  contrato: String(value.contrato || ""),
  estado: String(value.estado || ""),
  crlv: String(value.crlv || ""),
});

const normalizePlateValue = (value) =>
  String(value || "")
    .replace(/[\s-]/g, "")
    .toUpperCase();

export function PlateForm({
  initialValue = emptyFormData,
  mode = "create",
  layout = "default",
  buttonLabel = "Cadastrar placa",
  submittingLabel = "Salvando...",
  cancelLabel = "Cancelar",
  cancelTo,
  formId = "plate-upsert-form",
  isSubmittingExternal = false,
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(() =>
    normalizeFormData(initialValue),
  );
  const [plateError, setPlateError] = useState("");
  const isEditMode = mode === "edit";
  const isSubmitting = isSubmiting || isSubmittingExternal;
  const isPageLayout = layout === "page";

  useEffect(() => {
    setFormData(normalizeFormData(initialValue));
    setPlateError("");
  }, [initialValue]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "placa" ? normalizePlateValue(value) : value;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: nextValue,
    }));

    if (name === "placa" && plateError && nextValue.length === 7) {
      setPlateError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedPlate = normalizePlateValue(formData.placa);

    const payload = {
      condutor: formData.condutor.trim(),
      contrato: formData.contrato.trim(),
      estado: formData.estado.trim(),
      crlv: formData.crlv.trim(),
    };

    if (!isEditMode) {
      if (normalizedPlate.length !== 7) {
        setPlateError("Informe uma placa com 7 caracteres, sem espaços ou traços.");
        return;
      }

      payload.placa = normalizedPlate;
    }

    try {
      setIsSubmiting(true);
      await onSubmit(payload);
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <FormCard id={formId} onSubmit={handleSubmit}>
      <FormGrid $layout={layout}>
        <FieldGroup controlId="plate-placa">
          <FieldLabel>Placa</FieldLabel>
          <PlateControl
            type="text"
            placeholder="ABC1D23"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            disabled={isEditMode || isSubmitting}
            required={!isEditMode}
            minLength={7}
            maxLength={7}
            pattern="[A-Z0-9]{7}"
            autoFocus={!isEditMode}
            aria-invalid={plateError ? "true" : undefined}
            aria-describedby="plate-placa-help"
          />
          {plateError ? (
            <FieldError id="plate-placa-help">{plateError}</FieldError>
          ) : (
            <FieldHelp id="plate-placa-help">
              {isEditMode
                ? "A placa não pode ser alterada depois de criada."
                : "Use 7 caracteres, sem espaços ou traços."}
            </FieldHelp>
          )}
        </FieldGroup>

        <FieldGroup controlId="plate-estado">
          <FieldLabel>Estado</FieldLabel>
          <FieldSelect
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">Selecione o estado</option>
            {STATE_OPTIONS.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        <FieldGroup controlId="plate-crlv">
          <FieldLabel>Número do CRLV</FieldLabel>
          <FieldControl
            type="text"
            placeholder="Número do CRLV"
            name="crlv"
            value={formData.crlv}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </FieldGroup>

        <FieldGroup controlId="plate-condutor" $span={isPageLayout ? 2 : 1}>
          <FieldLabel>Condutor</FieldLabel>
          <FieldControl
            type="text"
            placeholder="Nome do condutor"
            name="condutor"
            value={formData.condutor}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </FieldGroup>

        <FieldGroup controlId="plate-contrato">
          <FieldLabel>Contrato</FieldLabel>
          <FieldControl
            type="text"
            placeholder="Contrato vinculado"
            name="contrato"
            value={formData.contrato}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </FieldGroup>
      </FormGrid>

      <FormActions>
        {cancelTo ? (
          <SecondaryAction
            forwardedAs={Link}
            to={cancelTo}
            variant="light"
            aria-disabled={isSubmitting}
          >
            {cancelLabel}
          </SecondaryAction>
        ) : null}
        <PrimaryAction type="submit" disabled={isSubmitting}>
          <FontAwesomeIcon icon={faCarSide} />
          {isSubmitting ? submittingLabel : buttonLabel}
        </PrimaryAction>
      </FormActions>
    </FormCard>
  );
}

const FormCard = styled(Form)`
  display: grid;
  gap: 22px;
  width: 100%;
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.06);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${({ $layout }) =>
    $layout === "page"
      ? "repeat(3, minmax(0, 1fr))"
      : "repeat(2, minmax(0, 1fr))"};
  gap: 16px;

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled(Form.Group)`
  display: grid;
  align-content: start;
  min-width: 0;
  gap: 8px;
  grid-column: span ${({ $span }) => $span || 1};

  @media (max-width: 767.98px) {
    grid-column: span 1;
  }
`;

const FieldLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 0.92rem;
  font-weight: 700;
`;

const controlStyles = `
  min-height: 46px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  font-size: 0.98rem;
  outline: 0;
  box-shadow: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  &:focus,
  &:focus-visible {
    outline: 0;
    border-color: oklch(55% 0.17 253);
    background-color: oklch(99.2% 0.004 240);
    box-shadow: 0 0 0 0.22rem oklch(55% 0.17 253 / 0.14);
  }

  &:disabled {
    background-color: oklch(94% 0.006 240);
    color: oklch(52% 0.014 245);
  }
`;

const FieldControl = styled(Form.Control)`
  ${controlStyles}
`;

const PlateControl = styled(FieldControl)`
  font-weight: 760;
  letter-spacing: 0.04em;
`;

const FieldSelect = styled(Form.Select)`
  ${controlStyles}
`;

const FieldHelp = styled(Form.Text)`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.86rem;
`;

const FieldError = styled.p`
  margin: 0;
  color: oklch(45% 0.18 25);
  font-size: 0.88rem;
  font-weight: 650;
`;

const FormActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 2px;
`;

const SecondaryAction = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  color: oklch(31% 0.018 245);
  background: oklch(99% 0.004 245);
  font-weight: 700;
  text-decoration: none;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
  }

  &[aria-disabled="true"] {
    pointer-events: none;
    opacity: 0.65;
  }
`;

const PrimaryAction = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 22px;
  border: 0;
  border-radius: 10px;
  background-color: oklch(54% 0.19 253);
  color: oklch(98% 0.004 240);
  font-weight: 760;

  &:hover,
  &:focus {
    background-color: oklch(48% 0.2 253);
    box-shadow: 0 12px 24px oklch(42% 0.18 253 / 0.24);
  }

  &:disabled {
    background-color: oklch(68% 0.06 250);
    box-shadow: none;
  }
`;
