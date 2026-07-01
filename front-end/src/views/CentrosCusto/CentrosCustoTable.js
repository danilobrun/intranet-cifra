import { faGear, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Table } from "react-bootstrap";
import styled from "styled-components";
import {
  TableActionCell,
  TableIconAction,
} from "../../components/TableActions";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";

const COLUMNS_COUNT = 6;

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

export function CentrosCustoTable({
  centrosCusto = [],
  isLoading = false,
  onEditCentroCusto,
  onDeleteCentroCusto,
}) {
  return (
    <TableCard>
      <TableScroll>
        <CentrosCustoTableStyled aria-busy={isLoading}>
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "170px" }} />
            <col style={{ width: "170px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Criado por</th>
              <th>Atualizado por</th>
              <th>Criado em</th>
              <th>Atualizado em</th>
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
            ) : centrosCusto.length ? (
              centrosCusto.map((centroCusto) => (
                <tr key={centroCusto._id}>
                  <td>
                    <StrongText>{centroCusto.nome || "-"}</StrongText>
                  </td>
                  <td>{getUserLabel(centroCusto.createdBy)}</td>
                  <td>{getUserLabel(centroCusto.updatedBy)}</td>
                  <td>{formatDate(centroCusto.createdAt)}</td>
                  <td>{formatDate(centroCusto.updatedAt)}</td>
                  <td>
                    <TableActionCell>
                      <TableIconAction
                        type="button"
                        title="Editar"
                        aria-label={`Editar centro de custo ${centroCusto.nome}`}
                        onClick={() => onEditCentroCusto(centroCusto)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </TableIconAction>
                      <TableIconAction
                        type="button"
                        title="Excluir"
                        aria-label={`Excluir centro de custo ${centroCusto.nome}`}
                        $variant="danger"
                        onClick={() => onDeleteCentroCusto(centroCusto)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </TableIconAction>
                    </TableActionCell>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <EmptyCell colSpan={COLUMNS_COUNT}>
                  Nenhum centro de custo encontrado.
                </EmptyCell>
              </tr>
            )}
          </tbody>
        </CentrosCustoTableStyled>
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

const CentrosCustoTableStyled = styled(Table)`
  min-width: 1060px;
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
    overflow-wrap: break-word;
    word-break: normal;
  }

  tbody tr:hover td {
    background: oklch(97.5% 0.006 245);
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 575.98px) {
    min-width: 980px;

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

const StrongText = styled.strong`
  color: oklch(22% 0.018 245);
  font-weight: 760;
`;

const EmptyCell = styled.td`
  padding: 28px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;
