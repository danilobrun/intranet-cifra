import {
  faBan,
  faClockRotateLeft,
  faGear,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Table } from "react-bootstrap";
import styled from "styled-components";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";
import {
  TableActionCell,
  TableIconAction,
} from "../../components/TableActions";

const COLUMNS_COUNT = 9;

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

const getUserLabel = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  return user.name || user.email || "-";
};

const formatStatus = (status) => {
  if (!status) return "-";

  const normalizedStatus = String(status).toLowerCase();

  return `${normalizedStatus.charAt(0).toUpperCase()}${normalizedStatus.slice(1)}`;
};

export function PlatesTable({
  plates = [],
  isLoading = false,
  onViewMovements,
  onEditPlate,
  onDeactivatePlate,
  canDeactivatePlate = false,
}) {
  return (
    <TableCard>
      <TableScroll>
        <PlatesTableStyled aria-busy={isLoading}>
          <colgroup>
            <col style={{ width: "105px" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "82px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "176px" }} />
            <col style={{ width: "145px" }} />
            <col style={{ width: "145px" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Placa</th>
              <th>Condutor</th>
              <th>Contrato</th>
              <th>Estado</th>
              <th>CRLV</th>
              <th>Status</th>
              <th>Última atualização</th>
              <th>Responsável</th>
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
              <TableSkeletonRows columns={COLUMNS_COUNT} rows={5} />
            ) : plates.length ? (
              plates.map((plate) => (
                <tr key={plate._id}>
                  <td>
                    <PlateCode>{plate.placa}</PlateCode>
                  </td>
                  <td>{plate.condutor || "-"}</td>
                  <td>{plate.contrato || "-"}</td>
                  <td>{plate.estado || "-"}</td>
                  <td>{plate.crlv || "-"}</td>
                  <td>
                    <StatusBadge $status={plate.status}>
                      {formatStatus(plate.status)}
                    </StatusBadge>
                  </td>
                  <td>{formatDate(plate.updatedAt)}</td>
                  <td>{getUserLabel(plate.responsavel)}</td>
                  <td>
                    <TableActionCell>
                      <TableIconAction
                        type="button"
                        title="Histórico"
                        aria-label={`Ver histórico da placa ${plate.placa}`}
                        onClick={() => onViewMovements(plate)}
                      >
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                      </TableIconAction>

                      <TableIconAction
                        type="button"
                        title="Editar"
                        aria-label={`Editar placa ${plate.placa}`}
                        onClick={() => onEditPlate(plate)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </TableIconAction>

                      {canDeactivatePlate ? (
                        <TableIconAction
                          type="button"
                          title="Inativar"
                          aria-label={`Inativar placa ${plate.placa}`}
                          $variant="danger"
                          onClick={() => onDeactivatePlate(plate)}
                        >
                          <FontAwesomeIcon icon={faBan} />
                        </TableIconAction>
                      ) : null}
                    </TableActionCell>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <EmptyCell colSpan={COLUMNS_COUNT}>
                  Nenhuma placa ativa encontrada.
                </EmptyCell>
              </tr>
            )}
          </tbody>
        </PlatesTableStyled>
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

const PlatesTableStyled = styled(Table)`
  min-width: 1160px;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;

  thead th {
    padding: 0.92rem 0.85rem;
    border: 0;
    background: linear-gradient(
      180deg,
      oklch(58% 0.012 245),
      oklch(51% 0.014 245)
    );
    color: oklch(98% 0.004 245);
    font-size: 0.82rem;
    font-weight: 760;
    line-height: 1.25;
    white-space: nowrap;
    vertical-align: middle;
  }

  tbody td {
    padding: 0.9rem 0.85rem;
    border-top: 0;
    border-bottom: 1px solid oklch(93% 0.006 245);
    background: oklch(99% 0.004 245);
    color: oklch(28% 0.016 245);
    font-size: 0.9rem;
    vertical-align: middle;
    overflow-wrap: anywhere;
  }

  tbody tr:hover td {
    background: oklch(97.5% 0.006 245);
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 575.98px) {
    min-width: 1080px;

    thead th,
    tbody td {
      padding: 0.75rem;
      font-size: 0.84rem;
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

const PlateCode = styled.strong`
  color: oklch(22% 0.018 245);
  font-weight: 780;
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border: 1px solid
    ${({ $status }) =>
      $status === "ATIVA" ? "oklch(79% 0.08 152)" : "oklch(83% 0.03 35)"};
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "ATIVA" ? "oklch(96% 0.03 152)" : "oklch(96% 0.018 35)"};
  color: ${({ $status }) =>
    $status === "ATIVA" ? "oklch(36% 0.1 152)" : "oklch(42% 0.05 35)"};
  font-size: 0.82rem;
  font-weight: 760;
  white-space: nowrap;
`;

const EmptyCell = styled.td`
  padding: 28px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;
