import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faMagnifyingGlass,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import {
  createFuncionario,
  getFuncionarios,
  inactivateFuncionario,
  updateFuncionario,
} from "../../services/Funcionarios.service";
import { FuncionarioFormModal } from "./FuncionarioFormModal";
import { FuncionariosTable } from "./FuncionariosTable";
import { InactivateFuncionarioModal } from "./InactivateFuncionarioModal";
import { PaginationControls } from "./PaginationControls";

const PAGE_LIMIT = 50;

const initialFilters = {
  search: "",
  status: "Ativo",
  centroCusto: "",
};

const initialPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

export function CentroCustoFuncionariosView() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [modalMode, setModalMode] = useState();
  const [selectedFuncionario, setSelectedFuncionario] = useState();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [funcionarioToInactivate, setFuncionarioToInactivate] = useState();
  const [isInactivateSubmitting, setIsInactivateSubmitting] = useState(false);

  const fetchFuncionarios = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = await getFuncionarios({
        search: filters.search.trim(),
        status: filters.status,
        centroCusto: filters.centroCusto.trim(),
        page,
        limit: PAGE_LIMIT,
      });

      setFuncionarios(Array.isArray(data?.funcionarios) ? data.funcionarios : []);
      setPagination(data?.pagination || initialPagination);
    } catch (error) {
      setFuncionarios([]);
      setPagination(initialPagination);
      setErrorMsg(error.message || "Falha ao buscar funcionarios.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchFuncionarios, 350);

    return () => clearTimeout(timeoutId);
  }, [fetchFuncionarios]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setSelectedFuncionario(undefined);
    setModalMode("create");
  };

  const handleOpenEditModal = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setModalMode("edit");
  };

  const handleCloseFormModal = () => {
    if (isFormSubmitting) {
      return;
    }

    setModalMode(undefined);
    setSelectedFuncionario(undefined);
  };

  const handleSubmitFuncionario = async (payload) => {
    try {
      setIsFormSubmitting(true);

      if (modalMode === "edit" && selectedFuncionario?._id) {
        await updateFuncionario(selectedFuncionario._id, payload);
        toast.success("Funcionario atualizado com sucesso.");
      } else {
        await createFuncionario(payload);
        toast.success("Funcionario cadastrado com sucesso.");
      }

      setModalMode(undefined);
      setSelectedFuncionario(undefined);
      await fetchFuncionarios();
    } catch (error) {
      toast.error(
        error.message ||
          "Falha ao salvar funcionario. Verifique os dados e tente novamente.",
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleOpenInactivateModal = (funcionario) => {
    if (funcionario?.status === "Inativo" || isInactivateSubmitting) {
      return;
    }

    setFuncionarioToInactivate(funcionario);
  };

  const handleCloseInactivateModal = () => {
    if (isInactivateSubmitting) {
      return;
    }

    setFuncionarioToInactivate(undefined);
  };

  const handleConfirmInactivate = async () => {
    if (!funcionarioToInactivate?._id) {
      return;
    }

    try {
      setIsInactivateSubmitting(true);
      await inactivateFuncionario(funcionarioToInactivate._id);
      toast.success("Funcionario inativado com sucesso.");
      setFuncionarioToInactivate(undefined);
      await fetchFuncionarios();
    } catch (error) {
      toast.error(error.message || "Falha ao inativar funcionario.");
    } finally {
      setIsInactivateSubmitting(false);
    }
  };

  return (
    <LayoutPortal>
      <PortalHeader
        title="Funcionarios"
        icon={faUsers}
        description="Cadastre e mantenha a base de funcionarios usada nas movimentacoes de centro de custo."
        buttonText="Novo funcionario"
        onButtonClick={handleOpenCreateModal}
      />

      <FiltersPanel>
        <FiltersHeader>
          <FiltersTitle>
            <FontAwesomeIcon icon={faFilter} />
            Filtros
          </FiltersTitle>
          <ResultCount>
            {loading
              ? "Carregando..."
              : `${pagination.total || 0} funcionario(s)`}
          </ResultCount>
        </FiltersHeader>

        <FiltersGrid>
          <FilterField>
            <FilterLabel htmlFor="funcionario-search">Busca</FilterLabel>
            <SearchField>
              <SearchIcon icon={faMagnifyingGlass} />
              <SearchInput
                id="funcionario-search"
                name="search"
                type="text"
                placeholder="Buscar por nome ou CPF"
                aria-label="Buscar funcionario por nome ou CPF"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </SearchField>
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="funcionario-status">Status</FilterLabel>
            <FilterSelect
              id="funcionario-status"
              name="status"
              value={filters.status}
              aria-label="Filtrar funcionarios por status"
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </FilterSelect>
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="funcionario-centro-custo">
              Centro de custo
            </FilterLabel>
            <FilterInput
              id="funcionario-centro-custo"
              name="centroCusto"
              type="text"
              placeholder="Todos"
              aria-label="Filtrar funcionarios por centro de custo"
              value={filters.centroCusto}
              onChange={handleFilterChange}
            />
          </FilterField>
        </FiltersGrid>
      </FiltersPanel>

      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      <FuncionariosTable
        funcionarios={funcionarios}
        isLoading={loading}
        onEditFuncionario={handleOpenEditModal}
        onInactivateFuncionario={handleOpenInactivateModal}
      />

      <PaginationControls
        pagination={pagination}
        isLoading={loading}
        onPageChange={setPage}
      />

      <FuncionarioFormModal
        show={Boolean(modalMode)}
        mode={modalMode}
        initialValue={selectedFuncionario}
        isSubmitting={isFormSubmitting}
        onHide={handleCloseFormModal}
        onSubmit={handleSubmitFuncionario}
      />

      <InactivateFuncionarioModal
        show={Boolean(funcionarioToInactivate)}
        funcionario={funcionarioToInactivate}
        isSubmitting={isInactivateSubmitting}
        onHide={handleCloseInactivateModal}
        onConfirm={handleConfirmInactivate}
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
  grid-template-columns: minmax(260px, 1fr) minmax(150px, 210px) minmax(
      190px,
      260px
    );
  gap: 14px;
  align-items: end;

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  &::placeholder {
    color: oklch(52% 0.018 245);
  }
`;

const FilterSelect = styled.select`
  ${controlStyles}
  padding: 9px 12px;
`;
