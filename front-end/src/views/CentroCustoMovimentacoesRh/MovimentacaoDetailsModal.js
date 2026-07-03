import { Button, Modal } from "react-bootstrap";
import styled from "styled-components";
import { MovimentacaoStatusBadge } from "./MovimentacaoStatusBadge";

const formatCpf = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length !== 11) {
    return value || "-";
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
};

const formatDate = (value, includeTime = false) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
};

const getUserLabel = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  return user.name || user.email || "-";
};

export function MovimentacaoDetailsModal({
  show,
  movimentacao,
  isLoading,
  onHide,
}) {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>Detalhes da movimentação</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {isLoading ? (
          <LoadingState>Carregando detalhes da movimentação...</LoadingState>
        ) : movimentacao ? (
          <DetailsContent>
            <DetailsGrid>
              <DetailItem>
                <DetailLabel>Nome</DetailLabel>
                <DetailValue>{movimentacao.nome || "-"}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>CPF</DetailLabel>
                <DetailValue>{formatCpf(movimentacao.cpf)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Centro anterior</DetailLabel>
                <DetailValue>
                  {movimentacao.centroCustoAnterior || "-"}
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Novo centro</DetailLabel>
                <DetailValue>{movimentacao.novoCentroCusto || "-"}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Data da alteração</DetailLabel>
                <DetailValue>
                  {formatDate(movimentacao.dataAlteracao)}
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Quem fez a mudança</DetailLabel>
                <DetailValue>{getUserLabel(movimentacao.createdBy)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Status</DetailLabel>
                <DetailValue>
                  <MovimentacaoStatusBadge status={movimentacao.status} />
                </DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Criado em</DetailLabel>
                <DetailValue>{formatDate(movimentacao.createdAt, true)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Atualizado em</DetailLabel>
                <DetailValue>{formatDate(movimentacao.updatedAt, true)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Aplicado por</DetailLabel>
                <DetailValue>{getUserLabel(movimentacao.appliedBy)}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Aplicado em</DetailLabel>
                <DetailValue>{formatDate(movimentacao.appliedAt, true)}</DetailValue>
              </DetailItem>
            </DetailsGrid>

            <ObservationGroup>
              <DetailLabel>Observação</DetailLabel>
              <ObservationText>
                {movimentacao.observacao || "Nenhuma observação informada."}
              </ObservationText>
            </ObservationGroup>
          </DetailsContent>
        ) : (
          <LoadingState>Não foi possível carregar os detalhes.</LoadingState>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const DetailsContent = styled.div`
  display: grid;
  gap: 18px;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
`;

const DetailLabel = styled.span`
  color: oklch(45% 0.018 245);
  font-size: 0.82rem;
  font-weight: 760;
`;

const DetailValue = styled.span`
  min-height: 26px;
  color: oklch(24% 0.018 245);
  font-size: 0.95rem;
  overflow-wrap: anywhere;
`;

const ObservationGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const ObservationText = styled.p`
  min-height: 72px;
  margin: 0;
  padding: 12px;
  border: 1px solid oklch(88% 0.012 245);
  border-radius: 8px;
  background: oklch(98% 0.004 245);
  color: oklch(28% 0.016 245);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const LoadingState = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-weight: 650;
`;
