import { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faGear,
  faPen,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { TableSkeletonRows } from "../TableSkeletonRows";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

const getUserName = (user) => user?.name || "-";

export function ContractsTable({
  contracts = [],
  isLoading = false,
  showCreatedBy = false,
  onStatusChange,
}) {
  const [action, setAction] = useState();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const columnsCount = showCreatedBy ? 10 : 9;

  const hideModal = () => setAction(undefined);

  const handleConfirm = async () => {
    if (!action?.contract?._id) {
      return;
    }

    try {
      setIsSubmiting(true);
      await onStatusChange(action.contract, action.nextStatus);
      hideModal();
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <>
      <TableCard>
        <TableScroll>
          <ContractsTableStyled
            aria-busy={isLoading}
            $showCreatedBy={showCreatedBy}
          >
            <colgroup>
              <col style={{ width: "12%" }} />
              <col style={{ width: showCreatedBy ? "19%" : "22%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
              {showCreatedBy ? <col style={{ width: "12%" }} /> : null}
              <col style={{ width: showCreatedBy ? "13%" : "8%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome do Contrato</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Gestor</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>Status</th>
                {showCreatedBy ? <th>Criado por</th> : null}
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
              ) : contracts.length ? (
                contracts.map((contract) => (
                  <tr key={contract._id}>
                    <td>{contract.codigo}</td>
                    <td>
                      <StrongText>{contract.nomeContrato}</StrongText>
                    </td>
                    <td>{contract.cliente}</td>
                    <td>{contract.estado}</td>
                    <td>{getUserName(contract.gestorId)}</td>
                    <td>{formatDate(contract.dataInicio)}</td>
                    <td>{formatDate(contract.dataFim)}</td>
                    <td>
                      <StatusBadge $status={contract.status}>
                        {contract.status}
                      </StatusBadge>
                    </td>
                    {showCreatedBy ? (
                      <td>{getUserName(contract.createdBy)}</td>
                    ) : null}
                    <td>
                      <ActionCell>
                        <IconAction
                          as={Link}
                          to={`/contratos/${contract._id}/editar`}
                          title="Editar"
                          aria-label={`Editar contrato ${contract.nomeContrato}`}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </IconAction>

                        {contract.status === "Ativo" ? (
                          <IconAction
                            type="button"
                            title="Inativar"
                            aria-label={`Inativar contrato ${contract.nomeContrato}`}
                            $variant="danger"
                            onClick={() =>
                              setAction({
                                contract,
                                nextStatus: "Inativo",
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faBan} />
                          </IconAction>
                        ) : (
                          <IconAction
                            type="button"
                            title="Reativar"
                            aria-label={`Reativar contrato ${contract.nomeContrato}`}
                            onClick={() =>
                              setAction({
                                contract,
                                nextStatus: "Ativo",
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faRotateLeft} />
                          </IconAction>
                        )}
                      </ActionCell>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <EmptyCell colSpan={columnsCount}>
                    Nenhum contrato encontrado.
                  </EmptyCell>
                </tr>
              )}
            </tbody>
          </ContractsTableStyled>
        </TableScroll>
      </TableCard>

      <Modal show={Boolean(action)} onHide={hideModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {action?.nextStatus === "Inativo"
              ? "Inativar contrato"
              : "Reativar contrato"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Confirma alterar o contrato{" "}
          <strong>{action?.contract?.nomeContrato}</strong> para{" "}
          <strong>{action?.nextStatus}</strong>?
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
            variant={action?.nextStatus === "Inativo" ? "danger" : "primary"}
            disabled={isSubmiting}
            onClick={handleConfirm}
          >
            {isSubmiting ? "Salvando..." : "Confirmar"}
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

const ContractsTableStyled = styled(Table)`
  min-width: ${({ $showCreatedBy }) => ($showCreatedBy ? "1280px" : "1160px")};
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;

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
  }

  tbody tr:hover td {
    background: oklch(97.5% 0.006 245);
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 575.98px) {
    min-width: ${({ $showCreatedBy }) =>
      $showCreatedBy ? "1160px" : "1040px"};

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
    ${({ $status }) =>
      $status === "Ativo" ? "oklch(79% 0.08 152)" : "oklch(83% 0.03 35)"};
  background: ${({ $status }) =>
    $status === "Ativo" ? "oklch(96% 0.03 152)" : "oklch(96% 0.018 35)"};
  color: ${({ $status }) =>
    $status === "Ativo" ? "oklch(36% 0.1 152)" : "oklch(42% 0.05 35)"};
  font-size: 0.82rem;
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
  color: ${({ $variant }) =>
    $variant === "danger" ? "oklch(50% 0.18 25)" : "oklch(38% 0.018 245)"};
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;

  &:hover,
  &:focus {
    border-color: ${({ $variant }) =>
      $variant === "danger" ? "oklch(76% 0.11 25)" : "oklch(78% 0.018 245)"};
    background: ${({ $variant }) =>
      $variant === "danger" ? "oklch(96% 0.018 25)" : "oklch(96% 0.006 245)"};
    color: ${({ $variant }) =>
      $variant === "danger" ? "oklch(45% 0.18 25)" : "oklch(22% 0.018 245)"};
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
