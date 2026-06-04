import { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  CONTRACT_CLIENT_OPTIONS,
  CONTRACT_CODE_OPTIONS,
  CONTRACT_STATE_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
} from "./options";

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

const getUserId = (user) => user?._id || user?.id || "";

const getSelectOptions = (baseOptions, currentValue) => {
  if (!currentValue) {
    return baseOptions;
  }

  const hasCurrentValue = baseOptions.some(
    (option) => option.value === currentValue,
  );

  if (hasCurrentValue) {
    return baseOptions;
  }

  return [{ value: currentValue, label: currentValue }, ...baseOptions];
};

const emptyFormData = {
  codigo: "",
  nomeContrato: "",
  cliente: "",
  estado: "",
  descricao: "",
  gestorId: "",
  dataInicio: "",
  dataFim: "",
  status: "Ativo",
};

const normalizeInitialValue = (value, currentUser, canManageAll) => ({
  codigo: String(value?.codigo || CONTRACT_CODE_OPTIONS[0]?.value || ""),
  nomeContrato: String(value?.nomeContrato || ""),
  cliente: String(value?.cliente || CONTRACT_CLIENT_OPTIONS[0]?.value || ""),
  estado: String(value?.estado || ""),
  descricao: String(value?.descricao || ""),
  gestorId: String(
    value?.gestorId?._id ||
      value?.gestorId ||
      (!canManageAll ? getUserId(currentUser) : ""),
  ),
  dataInicio: getDateInputValue(value?.dataInicio),
  dataFim: getDateInputValue(value?.dataFim),
  status: String(value?.status || "Ativo"),
});

export function UpsertContractForm({
  initialValue = emptyFormData,
  managerOptions = [],
  currentUser,
  canManageAll = false,
  buttonLabel = "Salvar contrato",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(() =>
    normalizeInitialValue(initialValue, currentUser, canManageAll),
  );

  useEffect(() => {
    setFormData(normalizeInitialValue(initialValue, currentUser, canManageAll));
  }, [canManageAll, currentUser, initialValue]);

  const codigoOptions = useMemo(
    () => getSelectOptions(CONTRACT_CODE_OPTIONS, formData.codigo),
    [formData.codigo],
  );

  const clienteOptions = useMemo(
    () => getSelectOptions(CONTRACT_CLIENT_OPTIONS, formData.cliente),
    [formData.cliente],
  );

  const gestorOptions = useMemo(() => {
    if (canManageAll) {
      return managerOptions;
    }

    return [
      {
        _id: getUserId(currentUser),
        name: currentUser?.name || "Gestor atual",
        email: currentUser?.email,
      },
    ];
  }, [canManageAll, currentUser, managerOptions]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmiting(true);

    try {
      await onSubmit({
        codigo: formData.codigo,
        nomeContrato: formData.nomeContrato.trim(),
        cliente: formData.cliente,
        estado: formData.estado,
        descricao: formData.descricao.trim(),
        gestorId: canManageAll ? formData.gestorId : getUserId(currentUser),
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim || null,
        status: formData.status,
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
            Identificação e vínculo principal do contrato.
          </SectionDescription>
        </SectionHeader>

        <IdentityFieldsGrid>
          <FieldGroup controlId="contract-codigo">
            <FieldLabel>Código</FieldLabel>
            <FieldSelect
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
            >
              {codigoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FieldSelect>
          </FieldGroup>

          <FieldGroup controlId="contract-cliente">
            <FieldLabel>Cliente</FieldLabel>
            <FieldSelect
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              required
            >
              {clienteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FieldSelect>
          </FieldGroup>

          <FieldGroup controlId="contract-estado">
            <FieldLabel>Estado</FieldLabel>
            <FieldSelect
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              {CONTRACT_STATE_OPTIONS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </FieldSelect>
          </FieldGroup>

          <FullWidthFieldGroup controlId="contract-name">
            <FieldLabel>Nome do Contrato</FieldLabel>
            <FieldControl
              type="text"
              name="nomeContrato"
              value={formData.nomeContrato}
              onChange={handleChange}
              placeholder="Informe o nome do contrato"
              required
            />
          </FullWidthFieldGroup>
        </IdentityFieldsGrid>
      </FormSection>

      <FormSection>
        <SectionHeader>
          <SectionTitle>Gestão e período</SectionTitle>
          <SectionDescription>
            Responsável, vigência e situação operacional.
          </SectionDescription>
        </SectionHeader>

        <FieldsGrid>
          <FieldGroup controlId="contract-gestor">
            <FieldLabel>Gestor</FieldLabel>
            <FieldSelect
              name="gestorId"
              value={formData.gestorId}
              onChange={handleChange}
              disabled={!canManageAll}
              required
            >
              <option value="">Selecione</option>
              {gestorOptions.map((manager) => (
                <option key={manager._id} value={manager._id}>
                  {manager.name}
                </option>
              ))}
            </FieldSelect>
          </FieldGroup>

          <FieldGroup controlId="contract-data-inicio">
            <FieldLabel>Data Início</FieldLabel>
            <FieldControl
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleChange}
              required
            />
          </FieldGroup>

          <FieldGroup controlId="contract-data-fim">
            <FieldLabel>Data Fim</FieldLabel>
            <FieldControl
              type="date"
              name="dataFim"
              value={formData.dataFim}
              onChange={handleChange}
            />
          </FieldGroup>

          <FieldGroup controlId="contract-status">
            <FieldLabel>Status</FieldLabel>
            <FieldSelect
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              {CONTRACT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </FieldSelect>
          </FieldGroup>
        </FieldsGrid>
      </FormSection>

      <FormSection>
        <SectionHeader>
          <SectionTitle>Descrição</SectionTitle>
          <SectionDescription>Observações internas do contrato.</SectionDescription>
        </SectionHeader>

        <FieldGroup controlId="contract-description">
          <DescriptionControl
            as="textarea"
            rows={4}
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            placeholder="Opcional"
            aria-label="Descrição do contrato"
          />
        </FieldGroup>
      </FormSection>

      <ActionsBar>
        <SecondaryAction as={Link} to="/contratos">
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px 20px;

  @media (max-width: 1199.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const IdentityFieldsGrid = styled.div`
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
  max-width: ${({ $compact }) => ($compact ? "240px" : "none")};

  @media (max-width: 767.98px) {
    max-width: none;
  }
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

const DescriptionControl = styled(FieldControl)`
  padding: 12px 14px;
  line-height: 1.45;
  resize: vertical;
`;

const FieldSelect = styled(Form.Select)`
  ${controlStyles}
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
