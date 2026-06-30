import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faChevronDown,
  faClockRotateLeft,
  faFilter,
  faPen,
  faPlus,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import styled, { css } from "styled-components";
import { Loading } from "../../components/Loading";

const MOVEMENTS_PAGE_SIZE = 8;
const ALL_ACTIONS_FILTER = "ALL";

const actionConfig = {
  CREATE: {
    label: "Cadastro",
    tone: "create",
    icon: faPlus,
  },
  UPDATE: {
    label: "Atualização",
    tone: "update",
    icon: faPen,
  },
  DELETE: {
    label: "Inativação",
    tone: "delete",
    icon: faBan,
  },
  RESTORE: {
    label: "Reativação",
    tone: "restore",
    icon: faRotateLeft,
  },
};

const actionOrder = ["CREATE", "UPDATE", "DELETE", "RESTORE"];

const fieldLabels = {
  placa: "Placa",
  condutor: "Condutor",
  contrato: "Contrato",
  estado: "Estado",
  crlv: "Número do CRLV",
  status: "Status",
  responsavel: "Responsável",
  deletedAt: "Inativado em",
  deletedBy: "Inativado por",
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatStatus = (status) => {
  if (!status) return "-";

  const normalizedStatus = String(status).toLowerCase();

  return `${normalizedStatus.charAt(0).toUpperCase()}${normalizedStatus.slice(1)}`;
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  return String(value);
};

const getUserLabel = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  return user.name || user.email || "-";
};

const getFieldLabel = (field) => fieldLabels[field] || field;

const getActionConfig = (action) =>
  actionConfig[action] || {
    label: action || "Movimentação",
    tone: "neutral",
    icon: faClockRotateLeft,
  };

const getMovementId = (movement, index) =>
  String(movement?._id || `${movement?.action || "movement"}-${index}`);

const getSafeDomId = (value) =>
  String(value || "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-");

const getVisibleChanges = (movement) => {
  const changes = Array.isArray(movement?.changes) ? movement.changes : [];

  if (movement?.action === "RESTORE") {
    return changes.filter((change) => change.field === "status");
  }

  return changes;
};

const formatChangeValue = (change, movement, value) => {
  if (change.field === "deletedAt") {
    return formatDate(value);
  }

  if (change.field === "deletedBy") {
    return value ? getUserLabel(movement.changedBy) : "-";
  }

  if (change.field === "status") {
    return formatStatus(value);
  }

  return formatValue(value);
};

const getMovementSummary = (movement) => {
  const changes = getVisibleChanges(movement);

  if (movement.action === "CREATE") {
    return "Placa cadastrada no sistema.";
  }

  if (movement.action === "DELETE") {
    return "Status alterado para Inativa.";
  }

  if (movement.action === "RESTORE") {
    return "Status alterado para Ativa.";
  }

  if (changes.length === 1) {
    return `${getFieldLabel(changes[0].field)} alterado.`;
  }

  if (changes.length > 1) {
    return `${changes.length} campos alterados.`;
  }

  return "Sem alterações detalhadas.";
};

export function PlateMovementsModal({
  show,
  plate,
  movements = [],
  isLoading,
  onHide,
}) {
  const [actionFilter, setActionFilter] = useState(ALL_ACTIONS_FILTER);
  const [visibleCount, setVisibleCount] = useState(MOVEMENTS_PAGE_SIZE);
  const [expandedMovementIds, setExpandedMovementIds] = useState(() => new Set());

  const actionCounts = useMemo(() => {
    return movements.reduce(
      (counts, movement) => ({
        ...counts,
        [movement.action]: (counts[movement.action] || 0) + 1,
      }),
      {},
    );
  }, [movements]);

  const filteredMovements = useMemo(() => {
    if (actionFilter === ALL_ACTIONS_FILTER) {
      return movements;
    }

    return movements.filter((movement) => movement.action === actionFilter);
  }, [actionFilter, movements]);

  const visibleMovements = filteredMovements.slice(0, visibleCount);
  const hasMoreMovements = visibleCount < filteredMovements.length;

  useEffect(() => {
    if (!show) {
      return;
    }

    setActionFilter(ALL_ACTIONS_FILTER);
    setVisibleCount(MOVEMENTS_PAGE_SIZE);
    setExpandedMovementIds(new Set());
  }, [plate?._id, show]);

  useEffect(() => {
    setVisibleCount(MOVEMENTS_PAGE_SIZE);
    setExpandedMovementIds(new Set());
  }, [actionFilter, movements]);

  const handleToggleMovement = (movementId) => {
    setExpandedMovementIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(movementId)) {
        nextIds.delete(movementId);
      } else {
        nextIds.add(movementId);
      }

      return nextIds;
    });
  };

  const filterOptions = [
    {
      value: ALL_ACTIONS_FILTER,
      label: "Todos",
      count: movements.length,
    },
    ...actionOrder.map((action) => ({
      value: action,
      label: actionConfig[action].label,
      count: actionCounts[action] || 0,
    })),
  ];

  return (
    <HistoryModal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton={!isLoading}>
        <TitleBlock>
          <Modal.Title>Histórico da placa {plate?.placa}</Modal.Title>
          <TitleDescription>
            Consulte as movimentações registradas para esta placa.
          </TitleDescription>
        </TitleBlock>
      </Modal.Header>

      <HistoryBody>
        {isLoading ? (
          <LoadingState>
            <Loading />
            <LoadingText>Carregando histórico...</LoadingText>
          </LoadingState>
        ) : (
          <>
            <PlateSummary aria-label="Resumo da placa">
              <SummaryItem>
                <SummaryLabel>Status</SummaryLabel>
                <StatusValue $status={plate?.status}>
                  {formatStatus(plate?.status)}
                </StatusValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Condutor atual</SummaryLabel>
                <SummaryValue>{formatValue(plate?.condutor)}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Contrato</SummaryLabel>
                <SummaryValue>{formatValue(plate?.contrato)}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Estado</SummaryLabel>
                <SummaryValue>{formatValue(plate?.estado)}</SummaryValue>
              </SummaryItem>
            </PlateSummary>

            <Toolbar>
              <ToolbarTitle>
                <FontAwesomeIcon icon={faFilter} />
                Filtrar movimentações
              </ToolbarTitle>
              <FilterGroup aria-label="Filtrar histórico por ação">
                {filterOptions.map((option) => (
                  <FilterButton
                    key={option.value}
                    type="button"
                    disabled={option.count === 0 && option.value !== ALL_ACTIONS_FILTER}
                    $active={actionFilter === option.value}
                    aria-pressed={actionFilter === option.value}
                    onClick={() => setActionFilter(option.value)}
                  >
                    {option.label}
                    <FilterCount>{option.count}</FilterCount>
                  </FilterButton>
                ))}
              </FilterGroup>
            </Toolbar>

            <TimelineStatus>
              {filteredMovements.length
                ? `Mostrando ${visibleMovements.length} de ${filteredMovements.length} movimentação(ões).`
                : "Nenhuma movimentação encontrada para este filtro."}
            </TimelineStatus>

            {visibleMovements.length ? (
              <TimelineList>
                {visibleMovements.map((movement, index) => {
                  const movementId = getMovementId(movement, index);
                  const detailsId = `plate-history-${getSafeDomId(movementId)}`;
                  const isExpanded = expandedMovementIds.has(movementId);
                  const config = getActionConfig(movement.action);
                  const visibleChanges = getVisibleChanges(movement);

                  return (
                    <TimelineItem key={movementId}>
                      <TimelineMarker $tone={config.tone}>
                        <FontAwesomeIcon icon={config.icon} />
                      </TimelineMarker>

                      <MovementCard>
                        <MovementToggle
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={detailsId}
                          onClick={() => handleToggleMovement(movementId)}
                        >
                          <MovementHeader>
                            <ActionBadge $tone={config.tone}>
                              {config.label}
                            </ActionBadge>
                            <MovementSummary>
                              {getMovementSummary(movement)}
                            </MovementSummary>
                          </MovementHeader>

                          <MovementMeta>
                            <MetaItem>
                              <MetaLabel>Responsável</MetaLabel>
                              <MetaValue>{getUserLabel(movement.changedBy)}</MetaValue>
                            </MetaItem>
                            <MetaItem>
                              <MetaLabel>Data</MetaLabel>
                              <MetaValue>{formatDate(movement.changedAt)}</MetaValue>
                            </MetaItem>
                            <DetailsHint>
                              {isExpanded ? "Ocultar detalhes" : "Ver detalhes"}
                              <ChevronIcon icon={faChevronDown} $expanded={isExpanded} />
                            </DetailsHint>
                          </MovementMeta>
                        </MovementToggle>

                        {isExpanded ? (
                          <MovementDetails id={detailsId}>
                            {visibleChanges.length ? (
                              <ChangesList>
                                {visibleChanges.map((change, changeIndex) => (
                                  <ChangeItem key={`${change.field}-${changeIndex}`}>
                                    <ChangeField>{getFieldLabel(change.field)}</ChangeField>
                                    <ChangeValues>
                                      <ChangeValueGroup>
                                        <ChangeLabel>Antes</ChangeLabel>
                                        <ChangeValue>
                                          {formatChangeValue(change, movement, change.from)}
                                        </ChangeValue>
                                      </ChangeValueGroup>
                                      <ChangeValueGroup>
                                        <ChangeLabel>Depois</ChangeLabel>
                                        <ChangeValue $highlight>
                                          {formatChangeValue(change, movement, change.to)}
                                        </ChangeValue>
                                      </ChangeValueGroup>
                                    </ChangeValues>
                                  </ChangeItem>
                                ))}
                              </ChangesList>
                            ) : (
                              <NoDetails>Sem alterações detalhadas para exibir.</NoDetails>
                            )}
                          </MovementDetails>
                        ) : null}
                      </MovementCard>
                    </TimelineItem>
                  );
                })}
              </TimelineList>
            ) : (
              <EmptyState>
                Nenhuma movimentação registrada para esta placa neste filtro.
              </EmptyState>
            )}

            {hasMoreMovements ? (
              <LoadMoreRow>
                <LoadMoreButton
                  type="button"
                  variant="light"
                  onClick={() =>
                    setVisibleCount((currentCount) =>
                      currentCount + MOVEMENTS_PAGE_SIZE,
                    )
                  }
                >
                  Carregar mais movimentações
                </LoadMoreButton>
              </LoadMoreRow>
            ) : null}
          </>
        )}
      </HistoryBody>
    </HistoryModal>
  );
}

const HistoryModal = styled(Modal)`
  .modal-content {
    overflow: hidden;
    border: 1px solid oklch(89% 0.009 245);
    border-radius: 14px;
    background: oklch(99% 0.004 245);
    box-shadow: 0 22px 54px oklch(22% 0.018 245 / 0.18);
  }

  .modal-header {
    align-items: flex-start;
    border-bottom: 1px solid oklch(90% 0.008 245);
    background: oklch(99% 0.004 245);
  }
`;

const TitleBlock = styled.div`
  display: grid;
  gap: 5px;
`;

const TitleDescription = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.92rem;
  line-height: 1.4;
`;

const HistoryBody = styled(Modal.Body)`
  display: grid;
  gap: 18px;
  max-height: min(74vh, 760px);
  overflow-y: auto;
  padding: 18px;
  background: oklch(98.5% 0.004 245);
`;

const LoadingState = styled.div`
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 18px;
`;

const LoadingText = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.92rem;
`;

const PlateSummary = styled.section`
  display: grid;
  grid-template-columns: minmax(140px, 180px) repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 14px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  display: grid;
  min-width: 0;
  gap: 4px;
`;

const SummaryLabel = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const SummaryValue = styled.span`
  min-width: 0;
  color: oklch(24% 0.018 245);
  font-size: 0.94rem;
  font-weight: 720;
  overflow-wrap: anywhere;
`;

const StatusValue = styled(SummaryValue)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: start;
  min-height: 27px;
  padding: 0 10px;
  border: 1px solid
    ${({ $status }) =>
      $status === "ATIVA" ? "oklch(79% 0.08 152)" : "oklch(83% 0.03 35)"};
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "ATIVA" ? "oklch(96% 0.03 152)" : "oklch(96% 0.018 35)"};
  color: ${({ $status }) =>
    $status === "ATIVA" ? "oklch(36% 0.1 152)" : "oklch(42% 0.05 35)"};
  font-size: 0.82rem;
`;

const Toolbar = styled.section`
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
`;

const ToolbarTitle = styled.h3`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: oklch(31% 0.018 245);
  font-size: 0.95rem;
  font-weight: 760;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "oklch(76% 0.07 253)" : "oklch(86% 0.012 245)"};
  border-radius: 999px;
  background: ${({ $active }) =>
    $active ? "oklch(96% 0.018 253)" : "oklch(99% 0.004 245)"};
  color: ${({ $active }) =>
    $active ? "oklch(36% 0.12 253)" : "oklch(36% 0.018 245)"};
  font-size: 0.86rem;
  font-weight: 720;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    outline: none;
  }

  &:focus-visible {
    box-shadow: 0 0 0 0.18rem oklch(55% 0.17 253 / 0.14);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.48;
  }
`;

const FilterCount = styled.span`
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: oklch(93% 0.008 245);
  color: oklch(42% 0.018 245);
  font-size: 0.76rem;
  font-weight: 780;
`;

const TimelineStatus = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
`;

const TimelineList = styled.div`
  position: relative;
  display: grid;
  gap: 12px;

  &::before {
    content: "";
    position: absolute;
    top: 14px;
    bottom: 14px;
    left: 18px;
    width: 1px;
    background: oklch(88% 0.012 245);
  }
`;

const TimelineItem = styled.article`
  position: relative;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
`;

const toneStyles = ({ $tone }) => {
  if ($tone === "delete") {
    return css`
      border-color: oklch(84% 0.06 25);
      background: oklch(97% 0.018 25);
      color: oklch(45% 0.16 25);
    `;
  }

  if ($tone === "restore") {
    return css`
      border-color: oklch(79% 0.08 152);
      background: oklch(96% 0.03 152);
      color: oklch(36% 0.1 152);
    `;
  }

  if ($tone === "update") {
    return css`
      border-color: oklch(78% 0.07 253);
      background: oklch(96% 0.018 253);
      color: oklch(36% 0.12 253);
    `;
  }

  return css`
    border-color: oklch(84% 0.016 245);
    background: oklch(96% 0.007 245);
    color: oklch(34% 0.026 245);
  `;
};

const TimelineMarker = styled.span`
  position: relative;
  z-index: 1;
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid;
  border-radius: 999px;
  ${toneStyles}
`;

const MovementCard = styled.div`
  min-width: 0;
  overflow: hidden;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
`;

const MovementToggle = styled.button`
  display: grid;
  width: 100%;
  gap: 12px;
  padding: 14px;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;

  &:hover,
  &:focus {
    background: oklch(97.5% 0.006 245);
    outline: none;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 0.18rem oklch(55% 0.17 253 / 0.14);
  }
`;

const MovementHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 27px;
  padding: 0 10px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 780;
  ${toneStyles}
`;

const MovementSummary = styled.span`
  min-width: 0;
  color: oklch(25% 0.018 245);
  font-size: 0.95rem;
  font-weight: 720;
  overflow-wrap: anywhere;
`;

const MovementMeta = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 1fr) minmax(150px, 0.8fr) auto;
  gap: 12px;
  align-items: end;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const MetaItem = styled.span`
  display: grid;
  min-width: 0;
  gap: 3px;
`;

const MetaLabel = styled.span`
  color: oklch(52% 0.018 245);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const MetaValue = styled.span`
  min-width: 0;
  color: oklch(32% 0.018 245);
  font-size: 0.88rem;
  overflow-wrap: anywhere;
`;

const DetailsHint = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  color: oklch(39% 0.12 253);
  font-size: 0.86rem;
  font-weight: 760;
  white-space: nowrap;

  @media (max-width: 767.98px) {
    justify-content: flex-start;
  }
`;

const ChevronIcon = styled(FontAwesomeIcon)`
  transform: rotate(${({ $expanded }) => ($expanded ? "180deg" : "0deg")});
  transition: transform 160ms ease;
`;

const MovementDetails = styled.div`
  padding: 0 14px 14px;
`;

const ChangesList = styled.div`
  display: grid;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid oklch(91% 0.008 245);
`;

const ChangeItem = styled.div`
  display: grid;
  grid-template-columns: minmax(140px, 0.65fr) minmax(0, 1.35fr);
  gap: 12px;
  align-items: start;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const ChangeField = styled.strong`
  color: oklch(28% 0.016 245);
  font-size: 0.9rem;
`;

const ChangeValues = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const ChangeValueGroup = styled.span`
  display: grid;
  min-width: 0;
  gap: 4px;
`;

const ChangeLabel = styled.span`
  color: oklch(52% 0.018 245);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const ChangeValue = styled.span`
  min-height: 34px;
  padding: 8px 10px;
  border: 1px solid
    ${({ $highlight }) =>
      $highlight ? "oklch(83% 0.04 253)" : "oklch(89% 0.009 245)"};
  border-radius: 8px;
  background: ${({ $highlight }) =>
    $highlight ? "oklch(97% 0.014 253)" : "oklch(98% 0.004 245)"};
  color: oklch(26% 0.018 245);
  font-size: 0.88rem;
  overflow-wrap: anywhere;
`;

const NoDetails = styled.p`
  margin: 0;
  padding-top: 14px;
  border-top: 1px solid oklch(91% 0.008 245);
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
`;

const EmptyState = styled.section`
  padding: 24px;
  border: 1px dashed oklch(84% 0.014 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(49% 0.018 245);
  text-align: center;
`;

const LoadMoreRow = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 2px;
`;

const LoadMoreButton = styled(Button)`
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-weight: 720;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
  }
`;
