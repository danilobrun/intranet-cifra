import { faCheck, faEye, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Table } from "react-bootstrap";
import styled from "styled-components";
import {
  TableActionCell,
  TableIconAction,
} from "../../components/TableActions";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";
import { MovimentacaoStatusBadge } from "./MovimentacaoStatusBadge";

const COLUMNS_COUNT = 8;

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

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(date);
};

const getUserLabel = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  return user.name || user.email || "-";
};

const getMovimentacaoId = (movimentacao) => movimentacao?._id || movimentacao?.id;

export function MovimentacoesTable({
  movimentacoes = [],
  isLoading = false,
  isApplying = false,
  onViewDetails,
  onApplyMovimentacao,
}) {
  return (
    <TableCard>
      <TableScroll>
        <MovimentacoesTableStyled aria-busy={isLoading}>
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "128px" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Centro anterior</th>
              <th>Novo centro</th>
              <th>Data da alteração</th>
              <th>Quem fez a mudança</th>
              <th>Status</th>
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
            ) : movimentacoes.length ? (
              movimentacoes.map((movimentacao) => {
                const isPending = movimentacao.status === "Pendente";
                const movimentacaoId = getMovimentacaoId(movimentacao);

                return (
                  <tr key={movimentacaoId}>
                    <td>
                      <StrongText>{movimentacao.nome || "-"}</StrongText>
                    </td>
                    <td>{formatCpf(movimentacao.cpf)}</td>
                    <td>{movimentacao.centroCustoAnterior || "-"}</td>
                    <td>{movimentacao.novoCentroCusto || "-"}</td>
                    <td>{formatDate(movimentacao.dataAlteracao)}</td>
                    <td>{getUserLabel(movimentacao.createdBy)}</td>
                    <td>
                      <MovimentacaoStatusBadge status={movimentacao.status} />
                    </td>
                    <td>
                      <TableActionCell>
                        <MovimentacaoAction
                          type="button"
                          title="Ver detalhes"
                          aria-label={`Ver detalhes da movimentação de ${movimentacao.nome}`}
                          onClick={() => onViewDetails(movimentacao)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </MovimentacaoAction>
                        <MovimentacaoAction
                          type="button"
                          title={
                            isPending
                              ? "Aplicar na folha"
                              : "Movimentação já aplicada"
                          }
                          aria-label={`Aplicar na folha a movimentação de ${movimentacao.nome}`}
                          disabled={!isPending || isApplying}
                          onClick={() => onApplyMovimentacao(movimentacao)}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </MovimentacaoAction>
                      </TableActionCell>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <EmptyCell colSpan={COLUMNS_COUNT}>
                  Nenhuma movimentação encontrada.
                </EmptyCell>
              </tr>
            )}
          </tbody>
        </MovimentacoesTableStyled>
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

const MovimentacoesTableStyled = styled(Table)`
  min-width: 1280px;
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
    min-width: 1180px;

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

const MovimentacaoAction = styled(TableIconAction)`
  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const EmptyCell = styled.td`
  padding: 28px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;
