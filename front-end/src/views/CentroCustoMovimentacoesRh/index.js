import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faFilter,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import {
  aplicarMovimentacaoNaFolha,
  buscarMovimentacaoPorId,
  listarMovimentacoes,
} from "../../services/CentroCustoMovimentacoes.service";
import { PaginationControls } from "../CentroCustoFuncionarios/PaginationControls";
import { ApplyMovimentacaoModal } from "./ApplyMovimentacaoModal";
import { MovimentacaoDetailsModal } from "./MovimentacaoDetailsModal";
import { MovimentacoesTable } from "./MovimentacoesTable";

const PAGE_LIMIT = 50;

const initialFilters = {
  search: "",
  status: "Pendente",
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

const getMovimentacaoId = (movimentacao) => movimentacao?._id || movimentacao?.id;

const getTotalLabel = (total = 0) =>
  total === 1 ? "1 movimentação" : `${total} movimentações`;

export function CentroCustoMovimentacoesRhView() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedMovimentacao, setSelectedMovimentacao] = useState();
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [movimentacaoToApply, setMovimentacaoToApply] = useState();
  const [isApplying, setIsApplying] = useState(false);

  const fetchMovimentacoes = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = await listarMovimentacoes({
        search: filters.search.trim(),
        status: filters.status,
        centroCustoAnterior: filters.centroCustoAnterior.trim(),
        novoCentroCusto: filters.novoCentroCusto.trim(),
        dataInicio: filters.dataInicio,
        dataFim: filters.dataFim,
        page,
        limit: PAGE_LIMIT,
      });

      setMovimentacoes(
        Array.isArray(data?.movimentacoes) ? data.movimentacoes : [],
      );
      setPagination(data?.pagination || initialPagination);
    } catch (error) {
      setMovimentacoes([]);
      setPagination(initialPagination);
      setErrorMsg(error.message || "Falha ao buscar movimentações.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchMovimentacoes, 350);

    return () => clearTimeout(timeoutId);
  }, [fetchMovimentacoes]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
    setPage(1);
  };

  const handleOpenDetails = async (movimentacao) => {
    const movimentacaoId = getMovimentacaoId(movimentacao);

    if (!movimentacaoId) {
      return;
    }

    try {
      setDetailsOpen(true);
      setSelectedMovimentacao(undefined);
      setIsDetailsLoading(true);

      const details = await buscarMovimentacaoPorId(movimentacaoId);

      setSelectedMovimentacao(details);
    } catch (error) {
      setDetailsOpen(false);
      toast.error(
        error.message || "Não foi possível carregar os detalhes da movimentação.",
      );
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    if (isDetailsLoading) {
      return;
    }

    setDetailsOpen(false);
    setSelectedMovimentacao(undefined);
  };

  const handleOpenApplyModal = (movimentacao) => {
    if (movimentacao?.status !== "Pendente" || isApplying) {
      return;
    }

    setMovimentacaoToApply(movimentacao);
  };

  const handleCloseApplyModal = () => {
    if (isApplying) {
      return;
    }

    setMovimentacaoToApply(undefined);
  };

  const handleConfirmApply = async () => {
    const movimentacaoId = getMovimentacaoId(movimentacaoToApply);

    if (!movimentacaoId) {
      return;
    }

    try {
      setIsApplying(true);

      const response = await aplicarMovimentacaoNaFolha(movimentacaoId);

      toast.success(
        "Movimentação aplicada na folha com sucesso. O centro de custo do funcionário foi atualizado.",
      );
      setMovimentacaoToApply(undefined);

      if (
        getMovimentacaoId(selectedMovimentacao) === movimentacaoId &&
        response?.movimentacao
      ) {
        setSelectedMovimentacao(response.movimentacao);
      }

      await fetchMovimentacoes();
    } catch (error) {
      toast.error(
        error.message ||
          "Não foi possível aplicar a movimentação na folha. Revise os dados e tente novamente.",
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <LayoutPortal>
      <PortalHeader
        title="Movimentações RH"
        icon={faClipboardList}
        description="Acompanhe as mudanças de centro de custo registradas pelas obras e aplique na folha após conferência."
      />

      <FiltersPanel>
        <FiltersHeader>
          <FiltersTitle>
            <FontAwesomeIcon icon={faFilter} />
            Filtros
          </FiltersTitle>
          <ResultCount>
            {loading ? "Carregando..." : getTotalLabel(pagination.total || 0)}
          </ResultCount>
        </FiltersHeader>

        <FiltersGrid>
          <FilterField>
            <FilterLabel htmlFor="movimentacao-search">Busca</FilterLabel>
            <SearchField>
              <SearchIcon icon={faMagnifyingGlass} />
              <SearchInput
                id="movimentacao-search"
                name="search"
                type="text"
                placeholder="Buscar por nome ou CPF"
                aria-label="Buscar movimentação por nome ou CPF"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </SearchField>
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="movimentacao-status">Status</FilterLabel>
            <FilterSelect
              id="movimentacao-status"
              name="status"
              value={filters.status}
              aria-label="Filtrar movimentações por status"
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Aplicado na Folha">Aplicado na Folha</option>
            </FilterSelect>
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="centro-custo-anterior">
              Centro anterior
            </FilterLabel>
            <FilterInput
              id="centro-custo-anterior"
              name="centroCustoAnterior"
              type="text"
              placeholder="Centro anterior"
              value={filters.centroCustoAnterior}
              onChange={handleFilterChange}
            />
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="novo-centro-custo">Novo centro</FilterLabel>
            <FilterInput
              id="novo-centro-custo"
              name="novoCentroCusto"
              type="text"
              placeholder="Novo centro"
              value={filters.novoCentroCusto}
              onChange={handleFilterChange}
            />
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="movimentacao-data-inicio">
              Data início
            </FilterLabel>
            <FilterInput
              id="movimentacao-data-inicio"
              name="dataInicio"
              type="date"
              value={filters.dataInicio}
              onChange={handleFilterChange}
            />
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="movimentacao-data-fim">Data fim</FilterLabel>
            <FilterInput
              id="movimentacao-data-fim"
              name="dataFim"
              type="date"
              value={filters.dataFim}
              onChange={handleFilterChange}
            />
          </FilterField>
        </FiltersGrid>
      </FiltersPanel>

      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      <MovimentacoesTable
        movimentacoes={movimentacoes}
        isLoading={loading}
        isApplying={isApplying}
        onViewDetails={handleOpenDetails}
        onApplyMovimentacao={handleOpenApplyModal}
      />

      <PaginationControls
        pagination={pagination}
        isLoading={loading}
        itemLabel="movimentações"
        emptyLabel="Nenhuma movimentação para paginar"
        onPageChange={setPage}
      />

      <MovimentacaoDetailsModal
        show={detailsOpen}
        movimentacao={selectedMovimentacao}
        isLoading={isDetailsLoading}
        onHide={handleCloseDetails}
      />

      <ApplyMovimentacaoModal
        show={Boolean(movimentacaoToApply)}
        movimentacao={movimentacaoToApply}
        isSubmitting={isApplying}
        onHide={handleCloseApplyModal}
        onConfirm={handleConfirmApply}
      />
    </LayoutPortal>
  );
}

const FiltersPanel = styled.section`
  display: grid;
  gap: 16px;
  margin: 18px 0;
  padding: 18px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const FiltersTitle = styled.h2`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 1rem;
  font-weight: 760;
`;

const ResultCount = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.92rem;
  font-weight: 650;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 1.4fr) minmax(170px, 210px) repeat(
      4,
      minmax(160px, 1fr)
    );
  gap: 14px;
  align-items: end;

  @media (max-width: 1199.98px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const FilterField = styled.div`
  display: grid;
  min-width: 0;
  gap: 7px;
`;

const FilterLabel = styled.label`
  margin: 0;
  color: oklch(31% 0.018 245);
  font-size: 0.88rem;
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

const SearchInput = styled.input`
  ${controlStyles}
  padding: 9px 14px 9px 38px;

  &::placeholder {
    color: oklch(52% 0.018 245);
  }
`;

const FilterInput = styled.input`
  ${controlStyles}
  padding: 9px 12px;
`;

const FilterSelect = styled.select`
  ${controlStyles}
  padding: 9px 12px;
`;
