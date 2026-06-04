import { Table } from "react-bootstrap";
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

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
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

export function DeletedBoletinsTable({
  boletins = [],
  isLoading = false,
  hasActiveFilters = false,
}) {
  const columnsCount = 13;

  return (
    <TableCard>
      <TableScroll>
        <DeletedBoletinsTableStyled aria-busy={isLoading}>
          <colgroup>
            <col style={{ width: "7%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "11%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>BM</th>
              <th>Cliente</th>
              <th>Contrato</th>
              <th>Estado</th>
              <th>Gestor</th>
              <th>Mes/Ano</th>
              <th>Valor BM</th>
              <th>Faturado</th>
              <th>Pago</th>
              <th>Status Fat</th>
              <th>Status PGTO</th>
              <th>Excluído por</th>
              <th>Excluído em</th>
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
                    <td>{getUserName(contrato?.gestorId || boletim.gestor)}</td>
                    <td>{formatMonthYear(boletim.mes, boletim.ano)}</td>
                    <td>{formatCurrency(boletim.valorTotalBm)}</td>
                    <td>{formatCurrency(boletim.totalFaturado)}</td>
                    <td>{formatCurrency(boletim.totalPago)}</td>
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
                    <td>{getUserName(boletim.deletedBy)}</td>
                    <td>{formatDateTime(boletim.deletedAt)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <EmptyCell colSpan={columnsCount}>
                  {hasActiveFilters
                    ? "Nenhum boletim excluído encontrado para os filtros aplicados."
                    : "Nenhum boletim excluído encontrado."}
                </EmptyCell>
              </tr>
            )}
          </tbody>
        </DeletedBoletinsTableStyled>
      </TableScroll>
    </TableCard>
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

const DeletedBoletinsTableStyled = styled(Table)`
  min-width: 1660px;
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
    min-width: 1480px;

    thead th,
    tbody td {
      padding: 0.75rem;
      font-size: 0.82rem;
    }
  }
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

const EmptyCell = styled.td`
  padding: 28px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;
