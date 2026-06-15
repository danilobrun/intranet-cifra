import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faEye,
  faFileContract,
  faPen,
  faPlus,
  faTrash,
  faTriangleExclamation,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import styled, { css, keyframes } from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import {
  createCliente,
  deleteCliente,
  updateCliente,
} from "../../services/Clientes.service";
import { getResumoContratos } from "../../services/ResumoContratos.service";
import { useDailyRefresh } from "../../hooks/useDailyRefresh";

const getItemId = (item) => String(item?.id || item?._id || "");

const getContratoClienteId = (contrato) =>
  String(
    contrato?.clienteId?.id ||
      contrato?.clienteId?._id ||
      contrato?.clienteId ||
      contrato?.cliente?.id ||
      contrato?.cliente?._id ||
      "",
  );

const getPluralLabel = (value, singular, plural) =>
  `${value} ${value === 1 ? singular : plural}`;

const getContratoName = (contrato) =>
  contrato?.nomeContrato || contrato?.name || "Contrato";

export function ResumoContratos() {
  const [clientes, setClientes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [clienteModal, setClienteModal] = useState();
  const [clienteName, setClienteName] = useState("");
  const [clienteErrorMsg, setClienteErrorMsg] = useState("");
  const [isSavingCliente, setIsSavingCliente] = useState(false);
  const [deleteAction, setDeleteAction] = useState();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingCliente, setIsDeletingCliente] = useState(false);

  const fetchResumoContratos = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getResumoContratos();

      setClientes(Array.isArray(data?.clientes) ? data.clientes : []);
      setContratos(Array.isArray(data?.contratos) ? data.contratos : []);
    } catch (error) {
      setClientes([]);
      setContratos([]);
      setErrorMsg(error.message || "Falha ao buscar contratos por cliente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumoContratos();
  }, [fetchResumoContratos]);

  useDailyRefresh(fetchResumoContratos);

  useEffect(() => {
    if (!selectedClienteId) {
      return;
    }

    const selectedClienteStillExists = clientes.some(
      (cliente) => getItemId(cliente) === selectedClienteId,
    );

    if (!selectedClienteStillExists) {
      setSelectedClienteId("");
    }
  }, [clientes, selectedClienteId]);

  const selectedCliente = useMemo(
    () => clientes.find((cliente) => getItemId(cliente) === selectedClienteId),
    [clientes, selectedClienteId],
  );

  const contratosDoCliente = useMemo(() => {
    if (!selectedCliente) {
      return [];
    }

    if (selectedCliente.isUnassigned) {
      return contratos.filter((contrato) => !getContratoClienteId(contrato));
    }

    return contratos.filter(
      (contrato) => getContratoClienteId(contrato) === selectedClienteId,
    );
  }, [contratos, selectedCliente, selectedClienteId]);

  const realClientesCount = clientes.filter(
    (cliente) => !cliente.isUnassigned,
  ).length;
  const hasClientes = clientes.length > 0;
  const clienteCountLabel = getPluralLabel(
    realClientesCount,
    "cliente",
    "clientes",
  );

  const openCreateClienteModal = () => {
    setClienteModal({ mode: "create" });
    setClienteName("");
    setClienteErrorMsg("");
  };

  const openEditClienteModal = (cliente) => {
    setClienteModal({ mode: "edit", cliente });
    setClienteName(cliente?.nome || "");
    setClienteErrorMsg("");
  };

  const closeClienteModal = () => {
    if (isSavingCliente) {
      return;
    }

    setClienteModal(undefined);
    setClienteName("");
    setClienteErrorMsg("");
  };

  const handleSubmitCliente = async (event) => {
    event.preventDefault();

    const nome = clienteName.trim();

    if (!nome) {
      setClienteErrorMsg("Informe o nome do cliente.");
      return;
    }

    try {
      setIsSavingCliente(true);
      setClienteErrorMsg("");

      if (clienteModal?.mode === "edit") {
        await updateCliente(getItemId(clienteModal.cliente), { nome });
        toast.success("Cliente atualizado com sucesso.");
      } else {
        await createCliente({ nome });
        toast.success("Cliente criado com sucesso.");
      }

      setClienteModal(undefined);
      setClienteName("");
      setClienteErrorMsg("");
      await fetchResumoContratos();
    } catch (error) {
      setClienteErrorMsg(error.message || "Falha ao salvar cliente.");
    } finally {
      setIsSavingCliente(false);
    }
  };

  const openDeleteClienteModal = (cliente) => {
    setDeleteAction({ cliente });
    setDeleteConfirmText("");
  };

  const closeDeleteClienteModal = () => {
    if (isDeletingCliente) {
      return;
    }

    setDeleteAction(undefined);
    setDeleteConfirmText("");
  };

  const handleDeleteCliente = async () => {
    const cliente = deleteAction?.cliente;

    if (!cliente) {
      return;
    }

    try {
      setIsDeletingCliente(true);
      const data = await deleteCliente(getItemId(cliente));

      if (selectedClienteId === getItemId(cliente)) {
        setSelectedClienteId("");
      }

      toast.success(
        `Cliente excluído. ${getPluralLabel(
          data?.deletedContracts || 0,
          "contrato removido",
          "contratos removidos",
        )} e ${getPluralLabel(
          data?.deletedBms || 0,
          "BM removido",
          "BMs removidos",
        )}.`,
      );
      setDeleteAction(undefined);
      setDeleteConfirmText("");
      await fetchResumoContratos();
    } catch (error) {
      toast.error(error.message || "Falha ao excluir cliente.");
    } finally {
      setIsDeletingCliente(false);
    }
  };

  const toggleCliente = (cliente) => {
    const clienteId = getItemId(cliente);
    setSelectedClienteId((currentClienteId) =>
      currentClienteId === clienteId ? "" : clienteId,
    );
  };

  const canDeleteCliente =
    deleteConfirmText.trim() === (deleteAction?.cliente?.nome || "");

  return (
    <LayoutPortal>
      <PortalHeader
        title="Clientes"
        description="Acompanhe os contratos organizados por cliente."
      >
        <ClienteCount aria-label={clienteCountLabel}>
          {clienteCountLabel}
        </ClienteCount>

        <SecondaryAction type="button" onClick={openCreateClienteModal}>
          <FontAwesomeIcon icon={faUserPlus} />
          Novo cliente
        </SecondaryAction>

        <PrimaryAction to="/resumo-contratos/novo">
          <FontAwesomeIcon icon={faPlus} />
          Novo contrato
        </PrimaryAction>
      </PortalHeader>

      {errorMsg ? (
        <Alert variant="danger">
          <ErrorRow>
            <span>{errorMsg}</span>
            <Button
              type="button"
              variant="outline-danger"
              size="sm"
              onClick={fetchResumoContratos}
            >
              Recarregar
            </Button>
          </ErrorRow>
        </Alert>
      ) : null}

      <SectionBlock>
        {loading ? (
          <ClientGrid aria-label="Carregando clientes">
            {Array.from({ length: 6 }, (_, index) => (
              <ClientSkeleton key={`cliente-skeleton-${index}`} />
            ))}
          </ClientGrid>
        ) : null}

        {!loading && !errorMsg && !hasClientes ? (
          <EmptyState>
            <strong>Nenhum cliente cadastrado.</strong>
            <span>Crie um cliente para começar a vincular contratos.</span>
          </EmptyState>
        ) : null}

        {!loading && !errorMsg && hasClientes ? (
          <ClientGrid aria-label="Clientes">
            {clientes.map((cliente) => {
              const clienteId = getItemId(cliente);
              const isSelected = clienteId === selectedClienteId;
              const contractCount = cliente.totalContratos || 0;

              return (
                <ClientCard key={clienteId} $selected={isSelected}>
                  <ClientSelectButton
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleCliente(cliente)}
                  >
                    <ClientIcon $selected={isSelected}>
                      <FontAwesomeIcon icon={faBuilding} />
                    </ClientIcon>
                    <ClientText>
                      <ClientName>{cliente.nome}</ClientName>
                      <ClientMeta>
                        {getPluralLabel(contractCount, "contrato", "contratos")}
                      </ClientMeta>
                    </ClientText>
                  </ClientSelectButton>

                  {!cliente.isUnassigned ? (
                    <ClientActions>
                      <IconAction
                        type="button"
                        title="Editar cliente"
                        aria-label={`Editar cliente ${cliente.nome}`}
                        onClick={() => openEditClienteModal(cliente)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </IconAction>

                      <IconAction
                        type="button"
                        title="Excluir cliente"
                        aria-label={`Excluir cliente ${cliente.nome}`}
                        $variant="danger"
                        onClick={() => openDeleteClienteModal(cliente)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </IconAction>
                    </ClientActions>
                  ) : null}
                </ClientCard>
              );
            })}
          </ClientGrid>
        ) : null}
      </SectionBlock>

      {selectedCliente ? (
        <ContractsSection>
          <ContractsHeader>
            <div>
              <SectionTitle>Contratos de {selectedCliente.nome}</SectionTitle>
              <SectionDescription>
                {getPluralLabel(
                  contratosDoCliente.length,
                  "contrato vinculado",
                  "contratos vinculados",
                )}
              </SectionDescription>
            </div>
          </ContractsHeader>

          {contratosDoCliente.length ? (
            <ContractGrid aria-label={`Contratos de ${selectedCliente.nome}`}>
              {contratosDoCliente.map((contrato) => {
                const contratoId = getItemId(contrato);
                const contratoName = getContratoName(contrato);

                return (
                  <ContractCard key={contratoId}>
                    <ContractMain>
                      <ContractIcon>
                        <FontAwesomeIcon icon={faFileContract} />
                      </ContractIcon>
                      <ContractName>{contratoName}</ContractName>
                    </ContractMain>

                    <ContractActions>
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
                        title="Editar contrato"
                        aria-label={`Editar contrato ${contratoName}`}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </IconAction>
                    </ContractActions>
                  </ContractCard>
                );
              })}
            </ContractGrid>
          ) : (
            <EmptyState>
              <strong>Nenhum contrato vinculado.</strong>
              <span>
                Crie um contrato e selecione este cliente no cadastro.
              </span>
            </EmptyState>
          )}
        </ContractsSection>
      ) : null}

      <Modal show={Boolean(clienteModal)} onHide={closeClienteModal} centered>
        <Form onSubmit={handleSubmitCliente}>
          <Modal.Header closeButton>
            <Modal.Title>
              {clienteModal?.mode === "edit"
                ? "Editar cliente"
                : "Novo cliente"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ModalField controlId="cliente-nome">
              <ModalLabel>Nome do cliente</ModalLabel>
              <ModalControl
                type="text"
                value={clienteName}
                onChange={(event) => setClienteName(event.target.value)}
                placeholder="Ex.: Compesa"
                autoFocus
              />
            </ModalField>
            {clienteErrorMsg ? <FormError>{clienteErrorMsg}</FormError> : null}
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={closeClienteModal}
              disabled={isSavingCliente}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSavingCliente}>
              {isSavingCliente ? "Salvando..." : "Salvar cliente"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={Boolean(deleteAction)}
        onHide={closeDeleteClienteModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Excluir cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DeleteIntro>
            Tem certeza que deseja excluir{" "}
            <strong>{deleteAction?.cliente?.nome}</strong>?
          </DeleteIntro>

          <DangerNotice>
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>
              Esta ação excluirá permanentemente o cliente, os{" "}
              {getPluralLabel(
                deleteAction?.cliente?.totalContratos || 0,
                "contrato vinculado",
                "contratos vinculados",
              )}{" "}
              e todos os lançamentos de BM desses contratos. Essa ação não
              poderá ser desfeita.
            </span>
          </DangerNotice>

          <ModalField controlId="cliente-delete-confirm">
            <ModalLabel>
              Digite "{deleteAction?.cliente?.nome || ""}" para confirmar
            </ModalLabel>
            <ModalControl
              type="text"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
            />
          </ModalField>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={closeDeleteClienteModal}
            disabled={isDeletingCliente}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={!canDeleteCliente || isDeletingCliente}
            onClick={handleDeleteCliente}
          >
            {isDeletingCliente ? "Excluindo..." : "Excluir permanentemente"}
          </Button>
        </Modal.Footer>
      </Modal>
    </LayoutPortal>
  );
}

const ClienteCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 999px;
  background: oklch(99% 0.004 245);
  color: oklch(42% 0.018 245);
  font-weight: 700;
  white-space: nowrap;
`;

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
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  @media (max-width: 767.98px) {
    flex: 1 1 170px;
  }
`;

const PrimaryAction = styled(Link)`
  ${headerActionStyles}
  border: 1px solid #0d6efd;
  background: #0d6efd;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(13, 110, 253, 0.18);

  &:hover,
  &:focus {
    border-color: #0b5ed7;
    background: #0b5ed7;
    color: #ffffff;
    text-decoration: none;
    transform: translateY(-1px);
  }
`;

const SecondaryAction = styled.button`
  ${headerActionStyles}
  border: 1px solid oklch(86% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
  }
`;

const SectionBlock = styled.section`
  margin-top: 18px;
`;

const ClientGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1199.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const ClientCard = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 96px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "oklch(64% 0.16 253)" : "oklch(89% 0.009 245)"};
  border-radius: 8px;
  background: ${({ $selected }) =>
    $selected ? "oklch(97.5% 0.022 253)" : "oklch(99% 0.004 245)"};
  box-shadow: ${({ $selected }) =>
    $selected
      ? "0 12px 26px oklch(42% 0.12 253 / 0.12)"
      : "0 10px 24px oklch(22% 0.018 245 / 0.06)"};
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: ${({ $selected }) =>
      $selected ? "oklch(58% 0.18 253)" : "oklch(82% 0.014 245)"};
    transform: translateY(-1px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const ClientSelectButton = styled.button`
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
  width: 100%;
  min-height: 94px;
  padding: 16px;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;

  &:focus-visible {
    outline: 3px solid oklch(55% 0.17 253 / 0.28);
    outline-offset: -4px;
  }
`;

const ClientIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "oklch(76% 0.11 253)" : "oklch(88% 0.012 245)"};
  border-radius: 8px;
  background: ${({ $selected }) =>
    $selected ? "oklch(94% 0.04 253)" : "oklch(96% 0.006 245)"};
  color: ${({ $selected }) =>
    $selected ? "oklch(42% 0.16 253)" : "oklch(43% 0.018 245)"};
`;

const ClientText = styled.span`
  display: grid;
  min-width: 0;
  gap: 5px;
`;

const ClientName = styled.strong`
  color: oklch(23% 0.018 245);
  font-size: 1.03rem;
  font-weight: 760;
  line-height: 1.25;
  overflow-wrap: anywhere;
`;

const ClientMeta = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  font-weight: 650;
`;

const ClientActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding-right: 12px;
`;

const IconAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 8px;
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

const ContractsSection = styled.section`
  display: grid;
  gap: 14px;
  margin: 26px 0;
`;

const ContractsHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.2rem;
  font-weight: 780;
  line-height: 1.25;
`;

const SectionDescription = styled.p`
  margin: 4px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 0.94rem;
`;

const ContractGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const ContractCard = styled.article`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 12px;
  min-height: 74px;
  padding: 14px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 8px 18px oklch(22% 0.018 245 / 0.045);
`;

const ContractMain = styled.div`
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 11px;
`;

const ContractIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border: 1px solid oklch(87% 0.012 245);
  border-radius: 8px;
  background: oklch(96.5% 0.006 245);
  color: oklch(43% 0.018 245);
`;

const ContractName = styled.strong`
  min-width: 0;
  color: oklch(24% 0.018 245);
  font-size: 0.98rem;
  font-weight: 740;
  line-height: 1.3;
  overflow-wrap: anywhere;
`;

const ContractActions = styled.div`
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 8px;
`;

const EmptyState = styled.section`
  display: grid;
  gap: 4px;
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  color: oklch(49% 0.018 245);

  strong {
    color: oklch(24% 0.018 245);
    font-size: 1.02rem;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
`;

const ClientSkeleton = styled.article`
  min-height: 96px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    oklch(93% 0.006 245) 0%,
    oklch(97% 0.004 245) 45%,
    oklch(93% 0.006 245) 90%
  );
  background-size: 220% 100%;
  animation: ${shimmer} 1.25s ease-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ErrorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const ModalField = styled(Form.Group)`
  display: grid;
  gap: 8px;
`;

const ModalLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(31% 0.018 245);
  font-weight: 700;
`;

const ModalControl = styled(Form.Control)`
  min-height: 44px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }
`;

const FormError = styled.p`
  margin: 12px 0 0;
  color: oklch(45% 0.18 25);
  font-size: 0.92rem;
  font-weight: 650;
`;

const DeleteIntro = styled.p`
  margin: 0 0 14px;
  color: oklch(28% 0.016 245);
`;

const DangerNotice = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 16px;
  padding: 13px;
  border: 1px solid oklch(82% 0.07 25);
  border-radius: 8px;
  background: oklch(97% 0.018 25);
  color: oklch(39% 0.12 25);
  font-weight: 650;
  line-height: 1.45;

  svg {
    margin-top: 3px;
  }
`;
