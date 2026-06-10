import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const emptyFormData = {
  nomeContrato: "",
  orcamento: "",
  dataInicio: "",
  dataFim: "",
};

const getDateInputValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const formatCurrencyInputValue = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return formatCurrency(Number(digits) / 100);
};

const getBudgetInputValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "";
  }

  return formatCurrency(numberValue);
};

const parseMoneyInput = (value) => {
  const text = String(value ?? "").trim();

  if (!text) {
    return {
      ok: true,
      value: 0,
    };
  }

  const cleaned = text.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/\.(?=\d{3}(?:\.|$))/g, "");
  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    return {
      ok: false,
      msg: "Orçamento precisa ser numérico.",
    };
  }

  return {
    ok: true,
    value: Number(numberValue.toFixed(2)),
  };
};

const normalizeInitialValue = (value) => ({
  nomeContrato: String(value?.nomeContrato || ""),
  orcamento: getBudgetInputValue(value?.orcamento),
  dataInicio: getDateInputValue(value?.dataInicio),
  dataFim: getDateInputValue(value?.dataFim),
});

export function ResumoContratoForm({
  initialValue = emptyFormData,
  buttonLabel = "Salvar contrato",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState(() =>
    normalizeInitialValue(initialValue),
  );

  useEffect(() => {
    setFormData(normalizeInitialValue(initialValue));
  }, [initialValue]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "orcamento" ? formatCurrencyInputValue(value) : value;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const budgetResult = parseMoneyInput(formData.orcamento);

    if (!budgetResult.ok) {
      setErrorMsg(budgetResult.msg);
      return;
    }

    setIsSubmiting(true);
    setErrorMsg("");

    try {
      await onSubmit({
        nomeContrato: formData.nomeContrato.trim(),
        orcamento: budgetResult.value,
        dataInicio: formData.dataInicio || null,
        dataFim: formData.dataFim || null,
      });
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <ContractForm onSubmit={handleSubmit}>
      <FormSection>
        <SectionHeader>
          <SectionTitle>Dados do contrato</SectionTitle>
          <SectionDescription>
            Campos cadastrais usados no resumo macro de orçamento, BM e saldo.
          </SectionDescription>
        </SectionHeader>

        <FieldsGrid>
          <FullWidthFieldGroup controlId="resumo-contrato-name">
            <FieldLabel>Nome do contrato</FieldLabel>
            <FieldControl
              type="text"
              name="nomeContrato"
              value={formData.nomeContrato}
              onChange={handleChange}
              placeholder="Ex.: Contrato BRK Pernambuco"
            />
          </FullWidthFieldGroup>

          <FieldGroup controlId="resumo-contrato-orcamento">
            <FieldLabel>Orçamento</FieldLabel>
            <FieldControl
              type="text"
              name="orcamento"
              value={formData.orcamento}
              onChange={handleChange}
              placeholder="R$ 0,00"
              inputMode="decimal"
            />
          </FieldGroup>

          <FieldGroup controlId="resumo-contrato-data-inicio">
            <FieldLabel>Data início</FieldLabel>
            <FieldControl
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup controlId="resumo-contrato-data-fim">
            <FieldLabel>Data fim</FieldLabel>
            <FieldControl
              type="date"
              name="dataFim"
              value={formData.dataFim}
              onChange={handleChange}
            />
          </FieldGroup>
        </FieldsGrid>

        {errorMsg ? <FormError>{errorMsg}</FormError> : null}
      </FormSection>

      <ActionsBar>
        <SecondaryAction as={Link} to="/resumo-contratos">
          Cancelar
        </SecondaryAction>
        <PrimaryAction type="submit" disabled={isSubmiting}>
          <FontAwesomeIcon icon={faFileContract} />
          {isSubmiting ? "Salvando..." : buttonLabel}
        </PrimaryAction>
      </ActionsBar>
    </ContractForm>
  );
}

const ContractForm = styled(Form)`
  display: grid;
  gap: 20px;
  padding-bottom: 34px;
`;

const FormSection = styled.section`
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.06);

  @media (max-width: 575.98px) {
    padding: 18px;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.08rem;
  font-weight: 760;
  line-height: 1.25;
`;

const SectionDescription = styled.p`
  margin: 6px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 0.93rem;
  line-height: 1.45;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px 20px;

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled(Form.Group)`
  display: grid;
  min-width: 0;
  gap: 8px;
`;

const FullWidthFieldGroup = styled(FieldGroup)`
  grid-column: 1 / -1;
`;

const FieldLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 0.92rem;
  font-weight: 700;
`;

const controlStyles = `
  min-height: 50px;
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

const FormError = styled.p`
  margin: 16px 0 0;
  color: oklch(45% 0.18 25);
  font-size: 0.92rem;
  font-weight: 650;
`;

const ActionsBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0;
  background: linear-gradient(
    180deg,
    oklch(98.5% 0.004 245 / 0),
    oklch(98.5% 0.004 245) 38%
  );

  @media (max-width: 575.98px) {
    flex-direction: column-reverse;
  }
`;

const SecondaryAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-weight: 700;
  text-decoration: none;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
  }
`;

const PrimaryAction = styled.button`
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
