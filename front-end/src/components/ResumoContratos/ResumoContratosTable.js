import { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faGear, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { TableSkeletonRows } from "../TableSkeletonRows";
import {
  formatCurrency,
  formatDate,
  formatGap,
  getResumoContratoId,
  getResumoContratoName,
} from "./utils";

export function ResumoContratosTable({
  contratos = [],
  isLoading = false,
  onDeleteContrato,
}) {
  const [action, setAction] = useState();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const columnsCount = 8;

  const hideModal = () => setAction(undefined);

  const handleConfirmDelete = async () => {
    if (!action?.contrato) {
      return;
    }

    try {
      setIsSubmiting(true);
      await onDeleteContrato(action.contrato);
      hideModal();
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <>
      <TableCard>
        <TableScroll>
          <ResumoTableStyled aria-busy={isLoading}>
            <colgroup>
              <col style={{ width: "23%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Orçamento</th>
                <th>Saldo</th>
                <th>BM</th>
                <th>Data Início</th>
                <th>Data Fim</th>
                <th>GAP</th>
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
              ) : contratos.length ? (
                contratos.map((contrato) => {
                  const contratoId = getResumoContratoId(contrato);
                  const contratoName = getResumoContratoName(contrato);

                  return (
                    <tr key={contratoId}>
                      <td>
                        <StrongText>{contratoName}</StrongText>
                      </td>
                      <td>{formatCurrency(contrato.orcamento)}</td>
                      <td>
                        <MoneyTone $tone="saldo">
                          {formatCurrency(contrato.saldo)}
                        </MoneyTone>
                      </td>
                      <td>
                        <MoneyTone $tone="bm">
                          {formatCurrency(contrato.bm)}
                        </MoneyTone>
                      </td>
                      <td>{formatDate(contrato.dataInicio)}</td>
                      <td>{formatDate(contrato.dataFim)}</td>
                      <td>{formatGap(contrato.gap)}</td>
                      <td>
                        <ActionCell>
                          <IconAction
                            as={Link}
                            to={`/resumo-contratos/${contratoId}`}
                            title="Ver detalhes"
                            aria-label={`Ver detalhes de ${contratoName}`}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </IconAction>

                          <IconAction
                            as={Link}
                            to={`/resumo-contratos/${contratoId}/editar`}
                            title="Editar"
                            aria-label={`Editar ${contratoName}`}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </IconAction>

                          <IconAction
                            type="button"
                            title="Excluir"
                            aria-label={`Excluir ${contratoName}`}
                            $variant="danger"
                            onClick={() => setAction({ contrato })}
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
                    Nenhum contrato cadastrado.
                  </EmptyCell>
                </tr>
              )}
            </tbody>
          </ResumoTableStyled>
        </TableScroll>
      </TableCard>

      <Modal show={Boolean(action)} onHide={hideModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir contrato</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Confirma excluir{" "}
            <strong>{getResumoContratoName(action?.contrato)}</strong>?
          </p>
          <WarningText>
            Atenção: ao excluir este contrato, todos os lançamentos de BM
            vinculados a ele também serão excluídos permanentemente. Essa ação
            não poderá ser desfeita.
          </WarningText>
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
            {isSubmiting ? "Excluindo..." : "Excluir permanentemente"}
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

const ResumoTableStyled = styled(Table)`
  min-width: 1180px;
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

const StrongText = styled.span`
  color: oklch(22% 0.018 245);
  font-weight: 700;
`;

const MoneyTone = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === "saldo" ? "oklch(86% 0.055 152)" : "oklch(88% 0.045 25)"};
  background: ${({ $tone }) =>
    $tone === "saldo" ? "oklch(97% 0.018 152)" : "oklch(97% 0.014 25)"};
  color: ${({ $tone }) =>
    $tone === "saldo" ? "oklch(36% 0.09 152)" : "oklch(43% 0.11 25)"};
  font-weight: 760;
  line-height: 1.2;
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

const WarningText = styled.p`
  margin: 12px 0 0;
  color: oklch(36% 0.07 25);
  font-weight: 650;
`;
