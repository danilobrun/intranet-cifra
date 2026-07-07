import { useEffect } from "react";
import {
  faPenToSquare,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import {
  formatAuditDate,
  formatEventPeriod,
  getStatusLabel,
  getVisibilityLabel,
} from "../utils/eventDetails";

export function EventDetailsDrawer({
  canDelete,
  canEdit,
  event,
  show,
  onDelete,
  onEdit,
  onHide,
}) {
  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const handleKeyDown = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        onHide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onHide, show]);

  if (!show || !event) {
    return null;
  }

  const description = event.descricao?.trim();

  return (
    <DrawerLayer>
      <DrawerBackdrop
        type="button"
        aria-label="Fechar detalhes do evento"
        onClick={onHide}
      />

      <DrawerPanel
        role="dialog"
        aria-modal="true"
        aria-labelledby="agenda-event-details-title"
      >
        <DrawerHeader>
          <HeaderText>
            <DrawerEyebrow>Detalhes do evento</DrawerEyebrow>
            <DrawerTitle id="agenda-event-details-title">
              {event.titulo}
            </DrawerTitle>
          </HeaderText>

          <CloseButton
            type="button"
            aria-label="Fechar detalhes do evento"
            onClick={onHide}
          >
            <FontAwesomeIcon icon={faXmark} />
          </CloseButton>
        </DrawerHeader>

        <DrawerBody>
          <DetailsSection>
            <SectionTitle>Resumo</SectionTitle>

            <DetailsGrid>
              <DetailItem $span={2}>
                <DetailLabel>Data e horário</DetailLabel>
                <DetailValue>{formatEventPeriod(event)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Dia inteiro</DetailLabel>
                <DetailValue>{event.diaInteiro ? "Sim" : "Não"}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Local</DetailLabel>
                <DetailValue>{event.local || "-"}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Visibilidade</DetailLabel>
                <DetailValue>{getVisibilityLabel(event.visibilidade)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Status</DetailLabel>
                <DetailValue>{getStatusLabel(event.status)}</DetailValue>
              </DetailItem>
            </DetailsGrid>
          </DetailsSection>

          <DetailsSection>
            <SectionTitle>Observações</SectionTitle>
            <DescriptionText>
              {description || "Nenhuma observação informada."}
            </DescriptionText>
          </DetailsSection>

          <DetailsSection>
            <SectionTitle>Registro</SectionTitle>

            <DetailsGrid>
              <DetailItem>
                <DetailLabel>Criado em</DetailLabel>
                <DetailValue>{formatAuditDate(event.createdAt)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Atualizado em</DetailLabel>
                <DetailValue>{formatAuditDate(event.updatedAt)}</DetailValue>
              </DetailItem>
            </DetailsGrid>
          </DetailsSection>
        </DrawerBody>

        <DrawerFooter>
          <SecondaryButton type="button" onClick={onHide}>
            Fechar
          </SecondaryButton>
          {canEdit ? (
            <PrimaryButton type="button" onClick={() => onEdit?.(event)}>
              <FontAwesomeIcon icon={faPenToSquare} />
              Editar
            </PrimaryButton>
          ) : null}
          {canDelete ? (
            <DangerButton type="button" onClick={() => onDelete?.(event)}>
              <FontAwesomeIcon icon={faTrashCan} />
              Excluir
            </DangerButton>
          ) : null}
        </DrawerFooter>
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
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(680px, 92vw);
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

const DrawerEyebrow = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.82rem;
  font-weight: 760;
  text-transform: uppercase;
`;

const DrawerTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.3rem;
  font-weight: 780;
  line-height: 1.25;
  overflow-wrap: anywhere;
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
`;

const DrawerBody = styled.div`
  display: grid;
  align-content: start;
  gap: 16px;
  min-height: 0;
  padding: 18px 24px 24px;
  overflow-y: auto;
`;

const DetailsSection = styled.section`
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

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
  grid-column: span ${({ $span }) => $span || 1};

  @media (max-width: 575.98px) {
    grid-column: 1 / -1;
  }
`;

const DetailLabel = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.78rem;
  font-weight: 760;
  text-transform: uppercase;
`;

const DetailValue = styled.span`
  color: oklch(25% 0.018 245);
  font-size: 0.95rem;
  font-weight: 650;
  line-height: 1.35;
  overflow-wrap: anywhere;
`;

const DescriptionText = styled.p`
  min-height: 74px;
  margin: 0;
  padding: 12px;
  border: 1px solid oklch(90% 0.008 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  color: oklch(30% 0.016 245);
  font-size: 0.94rem;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const DrawerFooter = styled.footer`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
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
`;

const PrimaryButton = styled(SecondaryButton)`
  gap: 8px;
  padding: 0 16px;
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

const DangerButton = styled(SecondaryButton)`
  gap: 8px;
  padding: 0 16px;
  border-color: #dc3545;
  background: #dc3545;
  color: #ffffff;

  &:hover,
  &:focus {
    border-color: #bb2d3b;
    background: #bb2d3b;
    color: #ffffff;
  }
`;
