import { faBan, faGear, faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Table } from "react-bootstrap";
import styled from "styled-components";
import {
  TableActionCell,
  TableIconAction,
} from "../../components/TableActions";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";

const COLUMNS_COUNT = 7;

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
    timeStyle: "short",
  }).format(date);
};

const formatOrigem = (value = "") => {
  if (value === "Importacao CSV") {
    return "Importação CSV";
  }

  return value || "-";
};

export function FuncionariosTable({
  funcionarios = [],
  isLoading = false,
  onEditFuncionario,
  onInactivateFuncionario,
}) {
  return (
    <TableCard>
      <TableScroll>
        <FuncionariosTableStyled aria-busy={isLoading}>
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "105px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "170px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Centro de custo</th>
              <th>Status</th>
              <th>Origem</th>
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
            ) : funcionarios.length ? (
              funcionarios.map((funcionario) => {
                const isInactive = funcionario.status === "Inativo";

                return (
                  <tr key={funcionario._id}>
                    <td>
                      <StrongText>{funcionario.nome}</StrongText>
                    </td>
                    <td>{formatCpf(funcionario.cpf)}</td>
                    <td>{funcionario.centroCusto || "-"}</td>
                    <td>
                      <StatusBadge $status={funcionario.status}>
                        {funcionario.status || "-"}
                      </StatusBadge>
                    </td>
                    <td>{formatOrigem(funcionario.origem)}</td>
                    <td>{formatDate(funcionario.updatedAt)}</td>
                    <td>
                      <TableActionCell>
                        <FuncionarioAction
                          type="button"
                          title="Editar"
                          aria-label={`Editar ${funcionario.nome}`}
                          onClick={() => onEditFuncionario(funcionario)}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </FuncionarioAction>
                        <FuncionarioAction
                          type="button"
                          title={
                            isInactive
                              ? "Funcionário já está inativo"
                              : "Inativar"
                          }
                          aria-label={`Inativar ${funcionario.nome}`}
                          $variant="danger"
                          disabled={isInactive}
                          onClick={() => onInactivateFuncionario(funcionario)}
                        >
                          <FontAwesomeIcon icon={faBan} />
                        </FuncionarioAction>
                      </TableActionCell>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <EmptyCell colSpan={COLUMNS_COUNT}>
                  Nenhum funcionário encontrado.
                </EmptyCell>
              </tr>
            )}
          </tbody>
        </FuncionariosTableStyled>
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

const FuncionariosTableStyled = styled(Table)`
  min-width: 1120px;
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
    min-width: 1040px;

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

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 9px;
  border: 1px solid
    ${({ $status }) =>
      $status === "Ativo" ? "oklch(79% 0.08 152)" : "oklch(83% 0.03 35)"};
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "Ativo" ? "oklch(96% 0.03 152)" : "oklch(96% 0.018 35)"};
  color: ${({ $status }) =>
    $status === "Ativo" ? "oklch(36% 0.1 152)" : "oklch(42% 0.05 35)"};
  font-size: 0.82rem;
  font-weight: 760;
  white-space: nowrap;
`;

const FuncionarioAction = styled(TableIconAction)`
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
