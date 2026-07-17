import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBuilding,
  faFileContract,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import styled, { css } from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";
import {
  getInactiveClientes,
  reactivateCliente,
} from "../../services/Clientes.service";
import {
  getInactiveResumoContratos,
  reactivateResumoContrato,
} from "../../services/ResumoContratos.service";

const getItemId = (item) => String(item?.id || item?._id || "");

const getContratoName = (contrato) =>
  contrato?.nomeContrato || contrato?.name || "Contrato";

const getClienteLabel = (contrato) => {
  if (contrato?.cliente?.nome) {
    return contrato.cliente.nome;
  }

  return contrato?.clienteId
    ? "Cliente não encontrado"
    : "Sem cliente definido";
};

const getClienteStatus = (contrato) => {
  if (!contrato?.clienteId) {
    return { label: "Sem cliente", tone: "neutral" };
  }

  if (contrato?.clienteExists === false) {
    return { label: "Cliente não encontrado", tone: "danger" };
  }

  if (contrato?.cliente?.active === false) {
    return { label: "Cliente excluído", tone: "warning" };
  }

  return { label: "Cliente ativo", tone: "success" };
};

export function ResumoContratosInactiveView() {
  const [clientes, setClientes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [restoreAction, setRestoreAction] = useState();
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchInactiveRecords = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const [clientesData, contratosData] = await Promise.all([
        getInactiveClientes(),
        getInactiveResumoContratos(),
      ]);

      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setContratos(Array.isArray(contratosData) ? contratosData : []);
    } catch (error) {
      setClientes([]);
      setContratos([]);
      setErrorMsg(error.message || "Falha ao buscar registros excluídos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInactiveRecords();
  }, [fetchInactiveRecords]);

  const closeRestoreModal = () => {
    if (isRestoring) {
      return;
    }

    setRestoreAction(undefined);
  };

  const handleRestore = async () => {
    const item = restoreAction?.item;
    const itemId = getItemId(item);

    if (!itemId) {
      return;
    }

    try {
      setIsRestoring(true);

      if (restoreAction.type === "cliente") {
        await reactivateCliente(itemId);
        toast.success("Cliente reativado com sucesso.");
      } else {
        await reactivateResumoContrato(itemId);
        toast.success("Contrato reativado com sucesso.");
      }

      setRestoreAction(undefined);
      await fetchInactiveRecords();
    } catch (error) {
      toast.error(error.message || "Falha ao reativar registro.");
    } finally {
      setIsRestoring(false);
    }
  };

  const restoreItemName =
    restoreAction?.type === "cliente"
      ? restoreAction?.item?.nome || "Cliente"
      : getContratoName(restoreAction?.item);

  return (
    <LayoutPortal>
      <PortalHeader
        title="Clientes e contratos excluídos"
        description="Consulte registros preservados e reative quando necessário."
      >
        <HeaderAction to="/resumo-contratos">
          <FontAwesomeIcon icon={faArrowLeft} />
          Resumo Contratos
        </HeaderAction>
      </PortalHeader>

      {errorMsg ? (
        <Alert variant="danger">
          <ErrorRow>
            <span>{errorMsg}</span>
            <Button
              type="button"
              variant="outline-danger"
              size="sm"
              onClick={fetchInactiveRecords}
            >
              Recarregar
            </Button>
          </ErrorRow>
        </Alert>
      ) : null}

      <CountsBar aria-label="Totais de registros excluídos">
        <CountItem>
          <FontAwesomeIcon icon={faBuilding} />
          {loading ? "..." : clientes.length} cliente(s)
        </CountItem>
        <CountItem>
          <FontAwesomeIcon icon={faFileContract} />
          {loading ? "..." : contratos.length} contrato(s)
        </CountItem>
      </CountsBar>

      <PageSection>
        <SectionHeader>
          <div>
            <SectionTitle>Clientes excluídos</SectionTitle>
            <SectionDescription>
              Ao reativar um cliente, seus contratos ativos e BMs voltam a
              aparecer.
            </SectionDescription>
          </div>
        </SectionHeader>

        <TableCard>
          <TableScroll>
            <RecordsTable aria-busy={loading}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contratos preservados</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeletonRows columns={3} rows={3} />
                ) : clientes.length ? (
                  clientes.map((cliente) => (
                    <tr key={getItemId(cliente)}>
                      <td>
                        <StrongValue>{cliente.nome || "Cliente"}</StrongValue>
                      </td>
                      <td>{cliente.totalContratos || 0}</td>
                      <td>
                        <RestoreButton
                          type="button"
                          onClick={() =>
                            setRestoreAction({ type: "cliente", item: cliente })
                          }
                        >
                          <FontAwesomeIcon icon={faRotateLeft} />
                          Reativar
                        </RestoreButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <EmptyCell colSpan={3}>
                      Nenhum cliente excluído.
                    </EmptyCell>
                  </tr>
                )}
              </tbody>
            </RecordsTable>
          </TableScroll>
        </TableCard>
      </PageSection>

      <PageSection>
        <SectionHeader>
          <div>
            <SectionTitle>Contratos excluídos</SectionTitle>
            <SectionDescription>
              Contratos de clientes excluídos só podem ser reativados depois
              do cliente.
            </SectionDescription>
          </div>
        </SectionHeader>

        <TableCard>
          <TableScroll>
            <RecordsTable aria-busy={loading}>
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Cliente</th>
                  <th>Situação do cliente</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeletonRows columns={4} rows={4} />
                ) : contratos.length ? (
                  contratos.map((contrato) => {
                    const clienteStatus = getClienteStatus(contrato);
                    const canReactivate = contrato.canReactivate !== false;

                    return (
                      <tr key={getItemId(contrato)}>
                        <td>
                          <StrongValue>{getContratoName(contrato)}</StrongValue>
                        </td>
                        <td>{getClienteLabel(contrato)}</td>
                        <td>
                          <StatusBadge $tone={clienteStatus.tone}>
                            {clienteStatus.label}
                          </StatusBadge>
                        </td>
                        <td>
                          <RestoreButton
                            type="button"
                            disabled={!canReactivate}
                            title={
                              canReactivate
                                ? "Reativar contrato"
                                : "Reative o cliente antes deste contrato"
                            }
                            onClick={() =>
                              setRestoreAction({
                                type: "contrato",
                                item: contrato,
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faRotateLeft} />
                            Reativar
                          </RestoreButton>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <EmptyCell colSpan={4}>
                      Nenhum contrato excluído.
                    </EmptyCell>
                  </tr>
                )}
              </tbody>
            </RecordsTable>
          </TableScroll>
        </TableCard>
      </PageSection>

      <Modal show={Boolean(restoreAction)} onHide={closeRestoreModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Reativar {restoreAction?.type === "cliente" ? "cliente" : "contrato"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Confirma reativar <strong>{restoreItemName}</strong>? O registro
          voltará a aparecer nas telas operacionais.
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            disabled={isRestoring}
            onClick={closeRestoreModal}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isRestoring}
            onClick={handleRestore}
          >
            {isRestoring ? "Reativando..." : "Reativar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </LayoutPortal>
  );
}

const headerActionStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
`;

const HeaderAction = styled(Link)`
  ${headerActionStyles}
  border: 1px solid oklch(86% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
  }
`;

const CountsBar = styled.section`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 22px;
  flex-wrap: wrap;
`;

const CountItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 999px;
  background: oklch(99% 0.004 245);
  color: oklch(38% 0.018 245);
  font-size: 0.9rem;
  font-weight: 700;
`;

const PageSection = styled.section`
  display: grid;
  gap: 12px;
  margin: 0 0 26px;
`;

const SectionHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.16rem;
  font-weight: 780;
  line-height: 1.25;
`;

const SectionDescription = styled.p`
  margin: 5px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 0.92rem;
`;

const TableCard = styled.section`
  overflow: hidden;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const RecordsTable = styled(Table)`
  min-width: 700px;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    padding: 0.88rem;
    border: 0;
    background: oklch(52% 0.014 245);
    color: oklch(98% 0.004 245);
    font-size: 0.82rem;
    font-weight: 760;
    white-space: nowrap;
  }

  tbody td {
    padding: 0.86rem;
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
`;

const StrongValue = styled.strong`
  color: oklch(22% 0.018 245);
  font-weight: 740;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === "success"
        ? "oklch(79% 0.08 152)"
        : $tone === "warning"
          ? "oklch(82% 0.08 85)"
          : $tone === "danger"
            ? "oklch(82% 0.07 25)"
            : "oklch(86% 0.012 245)"};
  border-radius: 999px;
  background: ${({ $tone }) =>
    $tone === "success"
      ? "oklch(96% 0.03 152)"
      : $tone === "warning"
        ? "oklch(97% 0.035 85)"
        : $tone === "danger"
          ? "oklch(97% 0.018 25)"
          : "oklch(96% 0.006 245)"};
  color: ${({ $tone }) =>
    $tone === "success"
      ? "oklch(36% 0.1 152)"
      : $tone === "warning"
        ? "oklch(40% 0.09 85)"
        : $tone === "danger"
          ? "oklch(43% 0.13 25)"
          : "oklch(43% 0.018 245)"};
  font-size: 0.8rem;
  font-weight: 760;
  white-space: nowrap;
`;

const RestoreButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid oklch(78% 0.06 253);
  border-radius: 8px;
  background: oklch(96% 0.018 253);
  color: oklch(38% 0.12 253);
  font-size: 0.84rem;
  font-weight: 740;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    border-color: oklch(65% 0.11 253);
    background: oklch(93% 0.035 253);
  }

  &:disabled {
    border-color: oklch(88% 0.009 245);
    background: oklch(95% 0.006 245);
    color: oklch(57% 0.014 245);
    cursor: not-allowed;
  }
`;

const EmptyCell = styled.td`
  padding: 28px !important;
  color: oklch(49% 0.018 245) !important;
  text-align: center;
`;

const ErrorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;
