import { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { TableSkeletonRows } from "../TableSkeletonRows";

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getContrato = (boletim) => {
  if (boletim?.contrato) {
    return boletim.contrato;
  }

  return typeof boletim?.contratoId === "object" ? boletim.contratoId : null;
};

const getUserName = (user) => {
  if (!user) {
    return "-";
  }

  return typeof user === "string" ? user : user.name || "-";
};

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "-";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
};

const formatMonthYear = (month, year) => {
  if (!month || !year) {
    return "-";
  }

  return `${String(month).padStart(2, "0")}/${year}`;
};

const getStatusTone = (status) => {
  const normalizedStatus = normalizeText(status);

  if (normalizedStatus === "faturado" || normalizedStatus === "pago") {
    return "success";
  }

  if (normalizedStatus.includes("parcial")) {
    return "warning";
  }

  if (normalizedStatus === "nao pago") {
    return "danger";
  }

  return "muted";
};

export function BoletinsTable({
  boletins = [],
  isLoading = false,
  hasActiveFilters = false,
  onDeleteBoletim,
}) {
  const [action, setAction] = useState();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const columnsCount = 14;

  const hideModal = () => setAction(undefined);

  const handleConfirmDelete = async () => {
    if (!action?.boletim) {
      return;
    }

    try {
      setIsSubmiting(true);
      await onDeleteBoletim(action.boletim);
      hideModal();
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <>
      <TableCard>
        <TableScroll>
          <BoletinsTableStyled aria-busy={isLoading}>
            <colgroup>
              <col style={{ width: "7%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "7%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>BM</th>
                <th>Cliente</th>
                <th>Contrato</th>
                <th>Estado</th>
                <th>Gestor</th>
                <th>Mês/Ano</th>
                <th>Valor BM</th>
                <th>Faturado</th>
                <th>Pend. Fat</th>
                <th>Pago</th>
                <th>Pend. PGTO</th>
                <th>Status Fat</th>
                <th>Status PGTO</th>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faGear} />
                    Ações
                  </ColumnTitle>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows columns={columnsCount} rows={5} />
              ) : boletins.length ? (
                boletins.map((boletim) => {
                  const contrato = getContrato(boletim);
                  const boletimId = boletim._id || boletim.id;

                  return (
                    <tr key={boletimId}>
                      <td>
                        <StrongText>{boletim.numeroBm || "-"}</StrongText>
                      </td>
                      <td>{contrato?.cliente || boletim.cliente || "-"}</td>
                      <td>{contrato?.nomeContrato || "-"}</td>
                      <td>{contrato?.estado || boletim.estado || "-"}</td>
                      <td>
                        {getUserName(contrato?.gestorId || boletim.gestor)}
                      </td>
                      <td>{formatMonthYear(boletim.mes, boletim.ano)}</td>
                      <td>{formatCurrency(boletim.valorTotalBm)}</td>
                      <td>{formatCurrency(boletim.totalFaturado)}</td>
                      <td>{formatCurrency(boletim.pendenteFaturamento)}</td>
                      <td>{formatCurrency(boletim.totalPago)}</td>
                      <td>{formatCurrency(boletim.pendentePagamento)}</td>
                      <td>
                        <StatusBadge
                          $tone={getStatusTone(boletim.statusFaturamento)}
                        >
                          {boletim.statusFaturamento || "-"}
                        </StatusBadge>
                      </td>
                      <td>
                        <StatusBadge
                          $tone={getStatusTone(boletim.statusPagamento)}
                        >
                          {boletim.statusPagamento || "-"}
                        </StatusBadge>
                      </td>
                      <td>
                        <ActionCell>
                          <IconAction
                            as={Link}
                            to={`/boletins/${boletimId}/editar`}
                            title="Editar"
                            aria-label={`Editar boletim ${boletim.numeroBm || ""}`}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </IconAction>

                          <IconAction
                            type="button"
                            title="Excluir"
                            aria-label={`Excluir boletim ${boletim.numeroBm || ""}`}
                            $variant="danger"
                            onClick={() => setAction({ boletim })}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </IconAction>
                        </ActionCell>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <EmptyCell colSpan={columnsCount}>
                    {hasActiveFilters
                      ? "Nenhum boletim encontrado para os filtros aplicados."
                      : "Nenhum boletim cadastrado."}
                  </EmptyCell>
                </tr>
              )}
            </tbody>
          </BoletinsTableStyled>
        </TableScroll>
      </TableCard>

      <Modal show={Boolean(action)} onHide={hideModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir boletim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Confirma excluir o BM{" "}
          <strong>{action?.boletim?.numeroBm || "selecionado"}</strong>?
          <br />
          Ele deixara a lista principal e ficara disponivel no historico de
          boletins excluidos.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={hideModal}
            disabled={isSubmiting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={isSubmiting}
            onClick={handleConfirmDelete}
          >
            {isSubmiting ? "Excluindo..." : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

const TableCard = styled.section`
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.06);
  overflow: hidden;
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const BoletinsTableStyled = styled(Table)`
  min-width: 1760px;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    padding: 0.92rem 0.78rem;
    border: 0;
    background: linear-gradient(
      180deg,
      oklch(58% 0.012 245),
      oklch(51% 0.014 245)
    );
    color: oklch(98% 0.004 245);
    font-size: 0.8rem;
    font-weight: 760;
    line-height: 1.25;
    white-space: nowrap;
    vertical-align: middle;
  }

  tbody td {
    padding: 0.88rem 0.78rem;
    border-top: 0;
    border-bottom: 1px solid oklch(93% 0.006 245);
    background: oklch(99% 0.004 245);
    color: oklch(28% 0.016 245);
    font-size: 0.88rem;
    vertical-align: middle;
  }

  tbody tr:hover td {
    background: oklch(97.5% 0.006 245);
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 575.98px) {
    min-width: 1580px;

    thead th,
    tbody td {
      padding: 0.75rem;
      font-size: 0.82rem;
    }
  }
`;

const ColumnTitle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const HeaderIcon = styled(FontAwesomeIcon)`
  color: oklch(95% 0.006 245);
`;

const StrongText = styled.span`
  color: oklch(22% 0.018 245);
  font-weight: 700;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) =>
      ({
        success: "oklch(79% 0.08 152)",
        warning: "oklch(84% 0.08 75)",
        danger: "oklch(80% 0.09 25)",
        muted: "oklch(84% 0.012 245)",
      })[$tone] || "oklch(84% 0.012 245)"};
  background: ${({ $tone }) =>
    ({
      success: "oklch(96% 0.03 152)",
      warning: "oklch(97% 0.035 75)",
      danger: "oklch(96% 0.018 25)",
      muted: "oklch(96% 0.006 245)",
    })[$tone] || "oklch(96% 0.006 245)"};
  color: ${({ $tone }) =>
    ({
      success: "oklch(36% 0.1 152)",
      warning: "oklch(43% 0.08 75)",
      danger: "oklch(45% 0.18 25)",
      muted: "oklch(42% 0.018 245)",
    })[$tone] || "oklch(42% 0.018 245)"};
  font-size: 0.78rem;
  font-weight: 760;
  white-space: nowrap;
`;

const ActionCell = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const IconAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 9px;
  background: oklch(99% 0.004 245);
  color: ${({ $variant, $disabled }) =>
    $disabled
      ? "oklch(63% 0.012 245)"
      : $variant === "danger"
        ? "oklch(50% 0.18 25)"
        : "oklch(38% 0.018 245)"};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  text-decoration: none;
  opacity: ${({ $disabled }) => ($disabled ? 0.72 : 1)};
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;

  &:hover,
  &:focus {
    border-color: ${({ $variant, $disabled }) =>
      $disabled
        ? "oklch(86% 0.012 245)"
        : $variant === "danger"
          ? "oklch(76% 0.11 25)"
          : "oklch(78% 0.018 245)"};
    background: ${({ $variant, $disabled }) =>
      $disabled
        ? "oklch(99% 0.004 245)"
        : $variant === "danger"
          ? "oklch(96% 0.018 25)"
          : "oklch(96% 0.006 245)"};
    color: ${({ $variant, $disabled }) =>
      $disabled
        ? "oklch(63% 0.012 245)"
        : $variant === "danger"
          ? "oklch(45% 0.18 25)"
          : "oklch(22% 0.018 245)"};
    outline: none;
    text-decoration: none;
  }

  &:focus-visible {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.14);
  }
`;

const EmptyCell = styled.td`
  padding: 28px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;
