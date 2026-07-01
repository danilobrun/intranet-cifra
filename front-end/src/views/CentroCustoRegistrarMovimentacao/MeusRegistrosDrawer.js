import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faEye,
  faFilter,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  TableActionCell,
  TableIconAction,
} from "../../components/TableActions";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";
import { listarMinhasMovimentacoes } from "../../services/CentroCustoMovimentacoes.service";
import { PaginationControls } from "../CentroCustoFuncionarios/PaginationControls";

const PAGE_LIMIT = 50;
const COLUMNS_COUNT = 7;

const initialFilters = {
  search: "",
  cpf: "",
  centroCustoAnterior: "",
  novoCentroCusto: "",
  dataInicio: "",
  dataFim: "",
};

const initialPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

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

const formatDate = (value, includeTime = false) => {
  if (!value) return "-";

  const rawValue = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
    ? new Date(`${rawValue}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
};

const getUserLabel = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  return user.name || user.nome || user.email || user.username || "-";
};

const getMovimentacaoId = (movimentacao) =>
  movimentacao?._id || movimentacao?.id;

export function MeusRegistrosDrawer({ show, onHide }) {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRegistroId, setSelectedRegistroId] = useState();

  const selectedRegistro = useMemo(() => {
    if (!selectedRegistroId) {
      return undefined;
    }

    return movimentacoes.find(
      (movimentacao) => getMovimentacaoId(movimentacao) === selectedRegistroId,
    );
  }, [movimentacoes, selectedRegistroId]);

  const fetchMinhasMovimentacoes = useCallback(async () => {
    if (!show) {
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const data = await listarMinhasMovimentacoes({
        search: filters.search.trim(),
        cpf: filters.cpf.trim(),
        centroCustoAnterior: filters.centroCustoAnterior.trim(),
        novoCentroCusto: filters.novoCentroCusto.trim(),
        dataInicio: filters.dataInicio,
        dataFim: filters.dataFim,
        page,
        limit: PAGE_LIMIT,
      });

      const nextMovimentacoes = Array.isArray(data?.movimentacoes)
        ? data.movimentacoes
        : [];

      setMovimentacoes(nextMovimentacoes);
      setPagination(data?.pagination || initialPagination);
      setSelectedRegistroId((currentId) => {
        if (!currentId) {
          return currentId;
        }

        const selectedStillVisible = nextMovimentacoes.some(
          (movimentacao) => getMovimentacaoId(movimentacao) === currentId,
        );

        return selectedStillVisible ? currentId : undefined;
      });
    } catch (error) {
      setMovimentacoes([]);
      setPagination(initialPagination);
      setSelectedRegistroId(undefined);
      setErrorMsg(
        error.message ||
          "Não foi possível carregar seus registros. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, page, show]);

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const timeoutId = setTimeout(fetchMinhasMovimentacoes, 350);

    return () => clearTimeout(timeoutId);
  }, [fetchMinhasMovimentacoes, show]);

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onHide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onHide, show]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
    setPage(1);
    setSelectedRegistroId(undefined);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    setSelectedRegistroId(undefined);
  };

  if (!show) {
    return null;
  }

  return (
    <DrawerLayer>
      <DrawerBackdrop
        type="button"
        aria-label="Fechar meus registros"
        onClick={onHide}
      />

      <DrawerPanel
        role="dialog"
        aria-modal="true"
        aria-labelledby="meus-registros-title"
      >
        <DrawerHeader>
          <HeaderText>
            <DrawerTitle id="meus-registros-title">Meus Registros</DrawerTitle>
            <DrawerDescription>
              Consulte aqui as movimentações de centro de custo registradas por
              você.
            </DrawerDescription>
          </HeaderText>

          <CloseButton
            type="button"
            aria-label="Fechar meus registros"
            onClick={onHide}
          >
            <FontAwesomeIcon icon={faXmark} />
          </CloseButton>
        </DrawerHeader>

        <DrawerBody>
          <FiltersPanel>
            <FiltersHeader>
              <FiltersTitle>
                <FontAwesomeIcon icon={faFilter} />
                Filtros
              </FiltersTitle>
              {loading ? (
                <LoadingHint>
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                  Carregando...
                </LoadingHint>
              ) : null}
            </FiltersHeader>

            <FiltersGrid>
              <FilterField $wide>
                <FilterLabel htmlFor="meus-registros-search">Busca</FilterLabel>
                <SearchField>
                  <SearchIcon icon={faMagnifyingGlass} />
                  <FilterInputWithIcon
                    id="meus-registros-search"
                    name="search"
                    type="text"
                    placeholder="Buscar por nome ou CPF"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </SearchField>
              </FilterField>

              <FilterField>
                <FilterLabel htmlFor="meus-registros-centro-anterior">
                  Centro anterior
                </FilterLabel>
                <FilterInput
                  id="meus-registros-centro-anterior"
                  name="centroCustoAnterior"
                  type="text"
                  placeholder="Centro anterior"
                  value={filters.centroCustoAnterior}
                  onChange={handleFilterChange}
                />
              </FilterField>

              <FilterField>
                <FilterLabel htmlFor="meus-registros-novo-centro">
                  Novo centro
                </FilterLabel>
                <FilterInput
                  id="meus-registros-novo-centro"
                  name="novoCentroCusto"
                  type="text"
                  placeholder="Novo centro"
                  value={filters.novoCentroCusto}
                  onChange={handleFilterChange}
                />
              </FilterField>

              <FilterField>
                <FilterLabel htmlFor="meus-registros-data-inicio">
                  Data início
                </FilterLabel>
                <FilterInput
                  id="meus-registros-data-inicio"
                  name="dataInicio"
                  type="date"
                  value={filters.dataInicio}
                  onChange={handleFilterChange}
                />
              </FilterField>

              <FilterField>
                <FilterLabel htmlFor="meus-registros-data-fim">
                  Data fim
                </FilterLabel>
                <FilterInput
                  id="meus-registros-data-fim"
                  name="dataFim"
                  type="date"
                  value={filters.dataFim}
                  onChange={handleFilterChange}
                />
              </FilterField>
            </FiltersGrid>
          </FiltersPanel>

          {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

          <TableCard>
            <TableScroll>
              <RegistrosTable aria-busy={loading}>
                <colgroup>
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "136px" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "132px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "96px" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Centro anterior</th>
                    <th>Novo centro</th>
                    <th>Data alteração</th>
                    <th>Registrado em</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableSkeletonRows columns={COLUMNS_COUNT} rows={5} />
                  ) : movimentacoes.length ? (
                    movimentacoes.map((movimentacao) => {
                      const movimentacaoId = getMovimentacaoId(movimentacao);
                      const isSelected = movimentacaoId === selectedRegistroId;

                      return (
                        <tr key={movimentacaoId} data-selected={isSelected}>
                          <td>
                            <StrongText>{movimentacao.nome || "-"}</StrongText>
                          </td>
                          <td>{formatCpf(movimentacao.cpf)}</td>
                          <td>{movimentacao.centroCustoAnterior || "-"}</td>
                          <td>{movimentacao.novoCentroCusto || "-"}</td>
                          <td>{formatDate(movimentacao.dataAlteracao)}</td>
                          <td>{formatDate(movimentacao.createdAt, true)}</td>
                          <td>
                            <TableActionCell>
                              <TableIconAction
                                type="button"
                                title="Ver detalhes"
                                aria-label={`Ver detalhes do registro de ${movimentacao.nome}`}
                                onClick={() =>
                                  setSelectedRegistroId(movimentacaoId)
                                }
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </TableIconAction>
                            </TableActionCell>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <EmptyCell colSpan={COLUMNS_COUNT}>
                        Você ainda não possui movimentações registradas.
                      </EmptyCell>
                    </tr>
                  )}
                </tbody>
              </RegistrosTable>
            </TableScroll>
          </TableCard>

          <PaginationControls
            pagination={pagination}
            isLoading={loading}
            itemLabel="registros"
            emptyLabel="Nenhum registro para paginar"
            onPageChange={handlePageChange}
          />

          {selectedRegistro ? (
            <DetailsPanel>
              <DetailsHeader>
                <DetailsTitle>Detalhes do registro</DetailsTitle>
                <Button
                  type="button"
                  variant="light"
                  onClick={() => setSelectedRegistroId(undefined)}
                >
                  Fechar detalhes
                </Button>
              </DetailsHeader>

              <DetailsGrid>
                <DetailItem>
                  <DetailLabel>Nome</DetailLabel>
                  <DetailValue>{selectedRegistro.nome || "-"}</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>CPF</DetailLabel>
                  <DetailValue>{formatCpf(selectedRegistro.cpf)}</DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Centro de custo anterior</DetailLabel>
                  <DetailValue>
                    {selectedRegistro.centroCustoAnterior || "-"}
                  </DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Novo centro de custo</DetailLabel>
                  <DetailValue>
                    {selectedRegistro.novoCentroCusto || "-"}
                  </DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Data da alteração</DetailLabel>
                  <DetailValue>
                    {formatDate(selectedRegistro.dataAlteracao)}
                  </DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Registrado por</DetailLabel>
                  <DetailValue>
                    {getUserLabel(selectedRegistro.createdBy)}
                  </DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Registrado em</DetailLabel>
                  <DetailValue>
                    {formatDate(selectedRegistro.createdAt, true)}
                  </DetailValue>
                </DetailItem>

                <DetailItem>
                  <DetailLabel>Atualizado em</DetailLabel>
                  <DetailValue>
                    {formatDate(selectedRegistro.updatedAt, true)}
                  </DetailValue>
                </DetailItem>
              </DetailsGrid>

              <ObservationGroup>
                <DetailLabel>Observação completa</DetailLabel>
                <ObservationText>
                  {selectedRegistro.observacao ||
                    "Nenhuma observação informada."}
                </ObservationText>
              </ObservationGroup>
            </DetailsPanel>
          ) : null}
        </DrawerBody>
      </DrawerPanel>
    </DrawerLayer>
  );
}

const DrawerLayer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2050;
  display: flex;
  justify-content: flex-end;
`;

const DrawerBackdrop = styled.button`
  position: absolute;
  inset: 0;
  border: 0;
  background: oklch(20% 0.012 245 / 0.32);
`;

const DrawerPanel = styled.aside`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: min(1020px, 92vw);
  height: 100vh;
  background: oklch(99% 0.004 245);
  box-shadow: -18px 0 38px oklch(18% 0.018 245 / 0.18);

  @media (max-width: 575.98px) {
    width: 100vw;
  }
`;

const DrawerHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid oklch(90% 0.009 245);
  background: oklch(99% 0.004 245);
`;

const HeaderText = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

const DrawerTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.3rem;
  font-weight: 780;
`;

const DrawerDescription = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.93rem;
  line-height: 1.45;
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 9px;
  background: oklch(99% 0.004 245);
  color: oklch(34% 0.018 245);

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    outline: none;
  }
`;

const DrawerBody = styled.div`
  display: grid;
  align-content: start;
  gap: 16px;
  min-height: 0;
  padding: 18px 24px 24px;
  overflow-y: auto;
`;

const FiltersPanel = styled.section`
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(98.5% 0.004 245);
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const FiltersTitle = styled.h3`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 1rem;
  font-weight: 760;
`;

const LoadingHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  font-weight: 650;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(240px, 1.4fr) repeat(4, minmax(140px, 1fr));
  gap: 12px;
  align-items: end;

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const FilterField = styled.div`
  display: grid;
  min-width: 0;
  gap: 7px;

  @media (max-width: 991.98px) {
    grid-column: ${({ $wide }) => ($wide ? "1 / -1" : "auto")};
  }
`;

const FilterLabel = styled.label`
  margin: 0;
  color: oklch(31% 0.018 245);
  font-size: 0.84rem;
  font-weight: 700;
`;

const SearchField = styled.div`
  position: relative;
  min-width: 0;
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 14px;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateY(-50%);
`;

const controlStyles = `
  width: 100%;
  min-height: 42px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }
`;

const FilterInput = styled.input`
  ${controlStyles}
  padding: 9px 12px;

  &::placeholder {
    color: oklch(52% 0.018 245);
  }
`;

const FilterInputWithIcon = styled(FilterInput)`
  padding-left: 38px;
`;

const TableCard = styled.section`
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  overflow: hidden;
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const RegistrosTable = styled(Table)`
  min-width: 980px;
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;

  thead th {
    padding: 0.86rem 0.78rem;
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
    padding: 0.86rem 0.78rem;
    border-top: 0;
    border-bottom: 1px solid oklch(93% 0.006 245);
    background: oklch(99% 0.004 245);
    color: oklch(28% 0.016 245);
    font-size: 0.88rem;
    vertical-align: middle;
    overflow-wrap: break-word;
    word-break: normal;
  }

  tbody tr:hover td,
  tbody tr[data-selected="true"] td {
    background: oklch(97.5% 0.006 245);
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
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

const DetailsPanel = styled.section`
  display: grid;
  gap: 16px;
  padding: 16px;
  border: 1px solid oklch(84% 0.034 253);
  border-radius: 8px;
  background: oklch(97% 0.014 253);
`;

const DetailsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const DetailsTitle = styled.h3`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 1rem;
  font-weight: 760;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 575.98px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
`;

const DetailLabel = styled.span`
  color: oklch(45% 0.018 245);
  font-size: 0.82rem;
  font-weight: 760;
`;

const DetailValue = styled.span`
  min-height: 25px;
  color: oklch(24% 0.018 245);
  font-size: 0.93rem;
  overflow-wrap: anywhere;
`;

const ObservationGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const ObservationText = styled.p`
  min-height: 72px;
  margin: 0;
  padding: 12px;
  border: 1px solid oklch(88% 0.012 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  color: oklch(28% 0.016 245);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;
