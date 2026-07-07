import { useEffect, useState } from "react";
import { faCircleNotch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { STATUS_OPTIONS, VISIBILITY_OPTIONS } from "../constants";
import {
  buildAgendaEventPayload,
  getDefaultEventFormData,
  getEventFormDataFromEvent,
  validateAgendaEventForm,
} from "../utils/eventForm";

export function EventDrawer({
  show,
  initialDate,
  initialEvent,
  isSubmitting,
  mode = "create",
  onHide,
  onSubmit,
}) {
  const isEditMode = mode === "edit";
  const [formData, setFormData] = useState(() =>
    isEditMode
      ? getEventFormDataFromEvent(initialEvent)
      : getDefaultEventFormData(initialDate),
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!show) {
      return;
    }

    setFormData(
      isEditMode
        ? getEventFormDataFromEvent(initialEvent)
        : getDefaultEventFormData(initialDate),
    );
    setFormError("");
  }, [initialDate, initialEvent, isEditMode, show]);

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onHide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onHide, show]);

  if (!show) {
    return null;
  }

  const handleHide = () => {
    if (!isSubmitting) {
      onHide();
    }
  };

  const handleFieldChange = (event) => {
    const { checked, name, type, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateAgendaEventForm(formData);

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    await onSubmit(buildAgendaEventPayload(formData));
  };

  return (
    <DrawerLayer>
      <DrawerBackdrop
        type="button"
        aria-label={isEditMode ? "Fechar edição de evento" : "Fechar criação de evento"}
        onClick={handleHide}
      />

      <DrawerPanel
        role="dialog"
        aria-modal="true"
        aria-labelledby="agenda-event-drawer-title"
      >
        <DrawerHeader>
          <HeaderText>
            <DrawerTitle id="agenda-event-drawer-title">
              {isEditMode ? "Editar Evento" : "Novo Evento"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditMode
                ? "Atualize os dados da programação interna selecionada."
                : "Cadastre uma programação interna para a Agenda Corporativa."}
            </DrawerDescription>
          </HeaderText>

          <CloseButton
            type="button"
            aria-label={isEditMode ? "Fechar edição de evento" : "Fechar criação de evento"}
            onClick={handleHide}
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faXmark} />
          </CloseButton>
        </DrawerHeader>

        <DrawerForm onSubmit={handleSubmit}>
          <DrawerBody>
            {formError ? <ErrorMessage>{formError}</ErrorMessage> : null}

            <FormSection>
              <SectionTitle>Informações do evento</SectionTitle>

              <FormGrid>
                <Field $span={6}>
                  <Label htmlFor="agenda-evento-titulo">Título *</Label>
                  <Input
                    id="agenda-evento-titulo"
                    name="titulo"
                    type="text"
                    value={formData.titulo}
                    onChange={handleFieldChange}
                    placeholder="Ex.: Reunião de alinhamento"
                    maxLength={120}
                    required
                  />
                </Field>

                <Field $span={6}>
                  <Label htmlFor="agenda-evento-local">Local</Label>
                  <Input
                    id="agenda-evento-local"
                    name="local"
                    type="text"
                    value={formData.local}
                    onChange={handleFieldChange}
                    placeholder="Ex.: Sala de reunião"
                    maxLength={120}
                  />
                </Field>

                <Field $span={12}>
                  <Label htmlFor="agenda-evento-descricao">Descrição</Label>
                  <Textarea
                    id="agenda-evento-descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleFieldChange}
                    placeholder="Inclua observações relevantes para o evento"
                    rows={4}
                    maxLength={800}
                  />
                </Field>
              </FormGrid>
            </FormSection>

            <FormSection>
              <SectionTitle>Período</SectionTitle>

              <FormGrid>
                <Field $span={3}>
                  <Label htmlFor="agenda-evento-data-inicio">
                    Data inicial *
                  </Label>
                  <Input
                    id="agenda-evento-data-inicio"
                    name="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={handleFieldChange}
                    required
                  />
                </Field>

                <Field $span={3}>
                  <Label htmlFor="agenda-evento-hora-inicio">
                    Hora inicial
                  </Label>
                  <Input
                    id="agenda-evento-hora-inicio"
                    name="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={handleFieldChange}
                    disabled={formData.diaInteiro}
                  />
                </Field>

                <Field $span={3}>
                  <Label htmlFor="agenda-evento-data-fim">Data final *</Label>
                  <Input
                    id="agenda-evento-data-fim"
                    name="dataFim"
                    type="date"
                    value={formData.dataFim}
                    onChange={handleFieldChange}
                    required
                  />
                </Field>

                <Field $span={3}>
                  <Label htmlFor="agenda-evento-hora-fim">Hora final</Label>
                  <Input
                    id="agenda-evento-hora-fim"
                    name="horaFim"
                    type="time"
                    value={formData.horaFim}
                    onChange={handleFieldChange}
                    disabled={formData.diaInteiro}
                  />
                </Field>

                <CheckboxField $span={12}>
                  <Checkbox
                    id="agenda-evento-dia-inteiro"
                    name="diaInteiro"
                    type="checkbox"
                    checked={formData.diaInteiro}
                    onChange={handleFieldChange}
                  />
                  <CheckboxText>
                    <strong>Evento de dia inteiro</strong>
                    <span>Ao marcar, os horários são ignorados no envio.</span>
                  </CheckboxText>
                </CheckboxField>
              </FormGrid>
            </FormSection>

            <FormSection>
              <SectionTitle>Classificação</SectionTitle>

              <FormGrid>
                <Field $span={6}>
                  <Label htmlFor="agenda-evento-visibilidade">
                    Visibilidade
                  </Label>
                  <Select
                    id="agenda-evento-visibilidade"
                    name="visibilidade"
                    value={formData.visibilidade}
                    onChange={handleFieldChange}
                  >
                    {VISIBILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field $span={6}>
                  <Label htmlFor="agenda-evento-status">Status</Label>
                  <Select
                    id="agenda-evento-status"
                    name="status"
                    value={formData.status}
                    onChange={handleFieldChange}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </FormGrid>
            </FormSection>
          </DrawerBody>

          <DrawerFooter>
            <SecondaryButton
              type="button"
              onClick={handleHide}
              disabled={isSubmitting}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                  {isEditMode ? "Atualizando..." : "Salvando..."}
                </>
              ) : (
                isEditMode ? "Salvar alterações" : "Salvar Evento"
              )}
            </PrimaryButton>
          </DrawerFooter>
        </DrawerForm>
      </DrawerPanel>
    </DrawerLayer>
  );
}

const DrawerLayer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2050;
  display: flex;
  justify-content: flex-end;
`;

const DrawerBackdrop = styled.button`
  position: absolute;
  inset: 0;
  border: 0;
  background: oklch(20% 0.012 245 / 0.32);
`;

const DrawerPanel = styled.aside`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: min(760px, 92vw);
  height: 100vh;
  background: oklch(99% 0.004 245);
  box-shadow: -18px 0 38px oklch(18% 0.018 245 / 0.18);

  @media (max-width: 575.98px) {
    width: 100vw;
  }
`;

const DrawerHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid oklch(90% 0.009 245);
  background: oklch(99% 0.004 245);
`;

const HeaderText = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

const DrawerTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.3rem;
  font-weight: 780;
`;

const DrawerDescription = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.93rem;
  line-height: 1.45;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 9px;
  background: oklch(99% 0.004 245);
  color: oklch(34% 0.018 245);

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const DrawerForm = styled.form`
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 0;
`;

const DrawerBody = styled.div`
  display: grid;
  align-content: start;
  gap: 16px;
  min-height: 0;
  padding: 18px 24px 24px;
  overflow-y: auto;
`;

const FormSection = styled.section`
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(98.5% 0.004 245);
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 1rem;
  font-weight: 760;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
  align-items: start;

  @media (max-width: 767.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: grid;
  min-width: 0;
  gap: 7px;
  grid-column: span ${({ $span }) => $span || 1};

  @media (max-width: 767.98px) {
    grid-column: span 1;
  }

  @media (max-width: 575.98px) {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  margin: 0;
  color: oklch(31% 0.018 245);
  font-size: 0.84rem;
  font-weight: 700;
`;

const controlStyles = `
  width: 100%;
  min-height: 42px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }

  &:disabled {
    background-color: oklch(95% 0.006 245);
    color: oklch(54% 0.014 245);
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  ${controlStyles}
  padding: 9px 12px;

  &::placeholder {
    color: oklch(52% 0.018 245);
  }
`;

const Select = styled.select`
  ${controlStyles}
  padding: 9px 12px;
`;

const Textarea = styled.textarea`
  ${controlStyles}
  min-height: 112px;
  padding: 10px 12px;
  resize: vertical;

  &::placeholder {
    color: oklch(52% 0.018 245);
  }
`;

const CheckboxField = styled(Field)`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid oklch(90% 0.008 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #0d6efd;
`;

const CheckboxText = styled.label`
  display: grid;
  gap: 2px;
  margin: 0;
  color: oklch(32% 0.018 245);
  font-size: 0.9rem;
  line-height: 1.35;

  span {
    color: oklch(49% 0.018 245);
    font-size: 0.82rem;
  }
`;

const ErrorMessage = styled.div`
  padding: 10px 12px;
  border: 1px solid oklch(76% 0.1 25);
  border-radius: 8px;
  background: oklch(96% 0.024 25);
  color: oklch(38% 0.12 25);
  font-size: 0.9rem;
  font-weight: 700;
`;

const DrawerFooter = styled.footer`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid oklch(90% 0.009 245);
  background: oklch(99% 0.004 245);

  @media (max-width: 575.98px) {
    align-items: stretch;
    flex-direction: column-reverse;
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-size: 0.92rem;
  font-weight: 700;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const PrimaryButton = styled(SecondaryButton)`
  gap: 8px;
  border-color: #0d6efd;
  background: #0d6efd;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(13, 110, 253, 0.18);

  &:hover,
  &:focus {
    border-color: #0b5ed7;
    background: #0b5ed7;
    color: #ffffff;
  }
`;
