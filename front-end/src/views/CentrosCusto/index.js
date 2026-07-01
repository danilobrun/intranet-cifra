import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faMagnifyingGlass,
  faSitemap,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import {
  atualizarCentroCusto,
  criarCentroCusto,
  excluirCentroCusto,
  listarCentrosCusto,
} from "../../services/CentrosCusto.service";
import { PaginationControls } from "../CentroCustoFuncionarios/PaginationControls";
import { CentroCustoFormModal } from "./CentroCustoFormModal";
import { CentrosCustoTable } from "./CentrosCustoTable";
import { DeleteCentroCustoModal } from "./DeleteCentroCustoModal";

const PAGE_LIMIT = 50;

const initialPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

export function CentrosCustoView() {
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [modalMode, setModalMode] = useState();
  const [selectedCentroCusto, setSelectedCentroCusto] = useState();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [centroCustoToDelete, setCentroCustoToDelete] = useState();
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [deleteBlockReason, setDeleteBlockReason] = useState();

  const fetchCentrosCusto = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = await listarCentrosCusto({
        search: search.trim(),
        page,
        limit: PAGE_LIMIT,
      });

      setCentrosCusto(
        Array.isArray(data?.centrosCusto) ? data.centrosCusto : [],
      );
      setPagination(data?.pagination || initialPagination);
    } catch (error) {
      setCentrosCusto([]);
      setPagination(initialPagination);
      setErrorMsg(error.message || "Falha ao buscar centros de custo.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchCentrosCusto, 350);

    return () => clearTimeout(timeoutId);
  }, [fetchCentrosCusto]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setSelectedCentroCusto(undefined);
    setModalMode("create");
  };

  const handleOpenEditModal = (centroCusto) => {
    setSelectedCentroCusto(centroCusto);
    setModalMode("edit");
  };

  const handleCloseFormModal = () => {
    if (isFormSubmitting) {
      return;
    }

    setModalMode(undefined);
    setSelectedCentroCusto(undefined);
  };

  const handleSubmitCentroCusto = async (payload) => {
    try {
      setIsFormSubmitting(true);

      if (modalMode === "edit" && selectedCentroCusto?._id) {
        const result = await atualizarCentroCusto(
          selectedCentroCusto._id,
          payload,
        );

        toast.success(
          result?.funcionariosAtualizados
            ? `Centro de custo atualizado. ${result.funcionariosAtualizados} funcionário(s) foram atualizados.`
            : "Centro de custo atualizado com sucesso.",
        );
      } else {
        await criarCentroCusto(payload);
        toast.success("Centro de custo cadastrado com sucesso.");
      }

      setModalMode(undefined);
      setSelectedCentroCusto(undefined);
      await fetchCentrosCusto();
    } catch (error) {
      toast.error(
        error.message ||
          "Falha ao salvar centro de custo. Verifique os dados e tente novamente.",
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (centroCusto) => {
    setDeleteBlockReason(undefined);
    setCentroCustoToDelete(centroCusto);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleteSubmitting) {
      return;
    }

    setDeleteBlockReason(undefined);
    setCentroCustoToDelete(undefined);
  };

  const handleConfirmDelete = async () => {
    if (!centroCustoToDelete?._id) {
      return;
    }

    try {
      setIsDeleteSubmitting(true);
      setDeleteBlockReason(undefined);

      await excluirCentroCusto(centroCustoToDelete._id);
      toast.success("Centro de custo excluído com sucesso.");
      setCentroCustoToDelete(undefined);
      await fetchCentrosCusto();
    } catch (error) {
      if (error?.data?.motivoBloqueio) {
        setDeleteBlockReason(error.data.motivoBloqueio);
      }

      toast.error(error.message || "Falha ao excluir centro de custo.");
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  return (
    <LayoutPortal>
      <PortalHeader
        title="Centros de Custo"
        icon={faSitemap}
        description="Cadastre e mantenha a lista oficial usada nos funcionários e nas movimentações."
        buttonText="Novo centro"
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
              : `${pagination.total || 0} centro(s) de custo`}
          </ResultCount>
        </FiltersHeader>

        <FiltersGrid>
          <FilterField>
            <FilterLabel htmlFor="centro-custo-search">Busca</FilterLabel>
            <SearchField>
              <SearchIcon icon={faMagnifyingGlass} />
              <SearchInput
                id="centro-custo-search"
                type="text"
                placeholder="Buscar por nome"
                aria-label="Buscar centro de custo por nome"
                value={search}
                onChange={handleSearchChange}
              />
            </SearchField>
          </FilterField>
        </FiltersGrid>
      </FiltersPanel>

      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      <CentrosCustoTable
        centrosCusto={centrosCusto}
        isLoading={loading}
        onEditCentroCusto={handleOpenEditModal}
        onDeleteCentroCusto={handleOpenDeleteModal}
      />

      <PaginationControls
        pagination={pagination}
        isLoading={loading}
        itemLabel="centro(s) de custo"
        emptyLabel="Nenhum centro de custo para paginar"
        onPageChange={setPage}
      />

      <CentroCustoFormModal
        show={Boolean(modalMode)}
        mode={modalMode}
        initialValue={selectedCentroCusto}
        isSubmitting={isFormSubmitting}
        onHide={handleCloseFormModal}
        onSubmit={handleSubmitCentroCusto}
      />

      <DeleteCentroCustoModal
        show={Boolean(centroCustoToDelete)}
        centroCusto={centroCustoToDelete}
        isSubmitting={isDeleteSubmitting}
        blockReason={deleteBlockReason}
        onHide={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
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
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  align-items: end;
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

const SearchInput = styled.input`
  width: 100%;
  min-height: 42px;
  padding: 9px 14px 9px 38px;
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

  &::placeholder {
    color: oklch(52% 0.018 245);
  }
`;
