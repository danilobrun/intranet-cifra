import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCarSide,
  faDownload,
  faFilter,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import styled, { css } from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { exportInactivePlatesCsv } from "../../helpers/platesCsvExport";
import {
  getInactivePlates,
  getPlateMovements,
  restorePlate,
} from "../../services/Plates.service";
import { PlateMovementsModal } from "../Plates/PlateMovementsModal";
import { InactivePlatesTable } from "./InactivePlatesTable";
import { RestorePlateModal } from "./RestorePlateModal";

export function InactivePlatesView() {
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [selectedMovementPlate, setSelectedMovementPlate] = useState();
  const [plateMovements, setPlateMovements] = useState([]);
  const [plateMovementsLoading, setPlateMovementsLoading] = useState(false);
  const [plateToRestore, setPlateToRestore] = useState();
  const [isRestoreSubmiting, setIsRestoreSubmiting] = useState(false);

  const fetchInactivePlates = async (filters = {}) => {
    try {
      const data = await getInactivePlates(filters);
      setPlates(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Falha ao buscar placas inativas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInactivePlates();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      fetchInactivePlates({ search: input.trim(), estado: estadoFilter });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input, estadoFilter]);

  const handleViewMovements = async (plate) => {
    try {
      setSelectedMovementPlate(plate);
      setPlateMovements([]);
      setPlateMovementsLoading(true);

      const data = await getPlateMovements(plate._id);
      setPlateMovements(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Falha ao carregar historico da placa.");
      setSelectedMovementPlate(undefined);
    } finally {
      setPlateMovementsLoading(false);
    }
  };

  const handleCloseMovementsModal = () => {
    if (plateMovementsLoading) {
      return;
    }

    setSelectedMovementPlate(undefined);
    setPlateMovements([]);
  };

  const handleOpenRestorePlate = (plate) => {
    if (isRestoreSubmiting) {
      return;
    }

    setPlateToRestore(plate);
  };

  const handleCloseRestoreModal = () => {
    if (isRestoreSubmiting) {
      return;
    }

    setPlateToRestore(undefined);
  };

  const handleExportCsv = () => {
    exportInactivePlatesCsv(plates);
  };

  const handleConfirmRestorePlate = async () => {
    if (!plateToRestore?._id) {
      return;
    }

    try {
      setIsRestoreSubmiting(true);
      await restorePlate(plateToRestore._id);
      await fetchInactivePlates({ search: input.trim(), estado: estadoFilter });
      toast.success("Placa reativada com sucesso.");
      setPlateToRestore(undefined);
    } catch (error) {
      toast.error(error.message || "Falha ao reativar placa.");
    } finally {
      setIsRestoreSubmiting(false);
    }
  };

  return (
    <LayoutPortal>
      <PortalHeader
        title="Placas Inativas"
        description="Consulte placas inativadas e reative quando necessário."
      >
        <SecondaryHeaderAction to="/portal/plates">
          <FontAwesomeIcon icon={faCarSide} />
          Placas ativas
        </SecondaryHeaderAction>
        <ExportHeaderAction
          type="button"
          disabled={loading || !plates.length}
          onClick={handleExportCsv}
          title={
            plates.length
              ? "Exportar placas inativas em CSV"
              : "Nenhuma placa inativa para exportar"
          }
        >
          <FontAwesomeIcon icon={faDownload} />
          Exportar CSV
        </ExportHeaderAction>
      </PortalHeader>

      <FiltersPanel>
        <FiltersHeader>
          <FiltersTitle>
            <FontAwesomeIcon icon={faFilter} />
            Filtros
          </FiltersTitle>
          <ResultCount>
            {loading ? "Carregando..." : `${plates.length} placa(s) inativa(s)`}
          </ResultCount>
        </FiltersHeader>

        <FiltersGrid>
          <FilterField>
            <FilterLabel htmlFor="inactive-plate-search">Busca</FilterLabel>
            <SearchField>
              <SearchIcon icon={faMagnifyingGlass} />
              <SearchInput
                id="inactive-plate-search"
                type="text"
                placeholder="Buscar por placa, condutor ou contrato"
                aria-label="Buscar placa inativa por placa, condutor ou contrato"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </SearchField>
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="inactive-plate-state">Estado</FilterLabel>
            <StateSelect
              id="inactive-plate-state"
              value={estadoFilter}
              aria-label="Filtrar placas inativas por estado"
              onChange={(event) => setEstadoFilter(event.target.value)}
            >
              <option value="">Todos os estados</option>
              <option value="Alagoas">Alagoas</option>
              <option value="Pernambuco">Pernambuco</option>
              <option value="Sergipe">Sergipe</option>
              <option value="Piaui">Piauí</option>
            </StateSelect>
          </FilterField>
        </FiltersGrid>
      </FiltersPanel>

      <InactivePlatesTable
        plates={plates}
        isLoading={loading}
        onViewMovements={handleViewMovements}
        onRestorePlate={handleOpenRestorePlate}
      />

      <PlateMovementsModal
        show={Boolean(selectedMovementPlate)}
        plate={selectedMovementPlate}
        movements={plateMovements}
        isLoading={plateMovementsLoading}
        onHide={handleCloseMovementsModal}
      />

      <RestorePlateModal
        show={Boolean(plateToRestore)}
        plate={plateToRestore}
        isSubmiting={isRestoreSubmiting}
        onHide={handleCloseRestoreModal}
        onConfirm={handleConfirmRestorePlate}
      />
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

const SecondaryHeaderAction = styled(Link)`
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
    transform: translateY(-1px);
  }
`;

const ExportHeaderAction = styled.button`
  ${headerActionStyles}
  border: 1px solid oklch(86% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.56;
    transform: none;
  }
`;

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
  grid-template-columns: minmax(260px, 1fr) minmax(180px, 240px);
  gap: 14px;
  align-items: end;

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

  &::placeholder {
    color: oklch(52% 0.018 245);
  }

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }
`;

const StateSelect = styled.select`
  width: 100%;
  min-height: 42px;
  padding: 9px 12px;
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
