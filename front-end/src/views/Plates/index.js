import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faDownload,
  faFilter,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import styled, { css } from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { exportActivePlatesCsv } from "../../helpers/platesCsvExport";
import {
  desactivatePlate,
  getInactivePlates,
  getPlateMovements,
  getPlates,
} from "../../services/Plates.service";
import { selectUser } from "../../store/User/User.selectors";
import { PlatesTable } from "./PlatesTable";
import { PlateMovementsModal } from "./PlateMovementsModal";
import { DeactivatePlateModal } from "./DeactivatePlateModal";

const INACTIVE_PLATES_ROLES = [
  "1",
  "admin",
  "gerente_frota",
  "auxiliar_frota",
  "frota",
];

const userHasRole = (user, allowedRoles) => {
  const roleCodes = Array.isArray(user?.roles)
    ? user.roles.map((role) => role.code)
    : [];

  return allowedRoles.some((roleCode) => roleCodes.includes(roleCode));
};

export function PlatesView() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [selectedMovementPlate, setSelectedMovementPlate] = useState();
  const [plateMovements, setPlateMovements] = useState([]);
  const [plateMovementsLoading, setPlateMovementsLoading] = useState(false);
  const [plateToDeactivate, setPlateToDeactivate] = useState();
  const [isDeactivateSubmiting, setIsDeactivateSubmiting] = useState(false);
  const [inactivePlatesCount, setInactivePlatesCount] = useState(0);
  const [isInactivePlatesCountLoading, setIsInactivePlatesCountLoading] =
    useState(false);

  const canViewInactivePlates = userHasRole(user, INACTIVE_PLATES_ROLES);

  const fetchPlates = async (filters = {}) => {
    try {
      const data = await getPlates(filters);
      setPlates(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Falha ao buscar placas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInactivePlatesCount = useCallback(async () => {
    if (!canViewInactivePlates) {
      setInactivePlatesCount(0);
      setIsInactivePlatesCountLoading(false);
      return;
    }

    try {
      setIsInactivePlatesCountLoading(true);
      const data = await getInactivePlates();
      setInactivePlatesCount(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      setInactivePlatesCount(0);
    } finally {
      setIsInactivePlatesCountLoading(false);
    }
  }, [canViewInactivePlates]);

  useEffect(() => {
    fetchPlates();
  }, []);

  useEffect(() => {
    fetchInactivePlatesCount();
  }, [fetchInactivePlatesCount]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      fetchPlates({ search: input.trim(), estado: estadoFilter });
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

  const handleEditPlate = (plate) => {
    if (!plate?._id) {
      return;
    }

    navigate(`/portal/plates/${plate._id}/editar`);
  };

  const handleDeactivatePlate = (plate) => {
    if (isDeactivateSubmiting) {
      return;
    }

    setPlateToDeactivate(plate);
  };

  const handleExportCsv = () => {
    exportActivePlatesCsv(plates);
  };

  const handleCloseMovementsModal = () => {
    if (plateMovementsLoading) {
      return;
    }

    setSelectedMovementPlate(undefined);
    setPlateMovements([]);
  };

  const handleCloseDeactivateModal = () => {
    if (isDeactivateSubmiting) {
      return;
    }

    setPlateToDeactivate(undefined);
  };

  const handleConfirmDeactivatePlate = async () => {
    if (!plateToDeactivate?._id) {
      return;
    }

    try {
      setIsDeactivateSubmiting(true);
      await desactivatePlate(plateToDeactivate._id);
      await fetchPlates({ search: input.trim(), estado: estadoFilter });
      await fetchInactivePlatesCount();
      toast.success("Placa inativada com sucesso.");
      setPlateToDeactivate(undefined);
    } catch (error) {
      toast.error(error.message || "Falha ao inativar placa.");
    } finally {
      setIsDeactivateSubmiting(false);
    }
  };

  return (
    <LayoutPortal>
      <PortalHeader
        title="Gestão de Placas"
        description="Consulte as placas ativas da frota e filtre por condutor, contrato ou estado."
        buttonText="Nova placa"
        buttonLink="/portal/plates/novo"
      >
        <ExportHeaderAction
          type="button"
          disabled={loading || !plates.length}
          onClick={handleExportCsv}
          title={
            plates.length
              ? "Exportar placas ativas em CSV"
              : "Nenhuma placa ativa para exportar"
          }
        >
          <FontAwesomeIcon icon={faDownload} />
          Exportar CSV
        </ExportHeaderAction>
        {canViewInactivePlates ? (
          <SecondaryHeaderAction to="/portal/plates/inactive">
            <FontAwesomeIcon icon={faBoxArchive} />
            Placas inativas
            <HeaderActionCount>
              {isInactivePlatesCountLoading ? "..." : inactivePlatesCount}
            </HeaderActionCount>
          </SecondaryHeaderAction>
        ) : null}
      </PortalHeader>

      <FiltersPanel>
        <FiltersHeader>
          <FiltersTitle>
            <FontAwesomeIcon icon={faFilter} />
            Filtros
          </FiltersTitle>
          <ResultCount>
            {loading ? "Carregando..." : `${plates.length} placa(s)`}
          </ResultCount>
        </FiltersHeader>

        <FiltersGrid>
          <FilterField>
            <FilterLabel htmlFor="plate-search">Busca</FilterLabel>
            <SearchField>
              <SearchIcon icon={faMagnifyingGlass} />
              <SearchInput
                id="plate-search"
                type="text"
                placeholder="Buscar por placa, condutor ou contrato"
                aria-label="Buscar placa por placa, condutor ou contrato"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
            </SearchField>
          </FilterField>

          <FilterField>
            <FilterLabel htmlFor="plate-state">Estado</FilterLabel>
            <StateSelect
              id="plate-state"
              value={estadoFilter}
              aria-label="Filtrar placas por estado"
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

      <PlatesTable
        plates={plates}
        isLoading={loading}
        onViewMovements={handleViewMovements}
        onEditPlate={handleEditPlate}
        onDeactivatePlate={handleDeactivatePlate}
        canDeactivatePlate={canViewInactivePlates}
      />

      <PlateMovementsModal
        show={Boolean(selectedMovementPlate)}
        plate={selectedMovementPlate}
        movements={plateMovements}
        isLoading={plateMovementsLoading}
        onHide={handleCloseMovementsModal}
      />

      <DeactivatePlateModal
        show={Boolean(plateToDeactivate)}
        plate={plateToDeactivate}
        isSubmiting={isDeactivateSubmiting}
        onHide={handleCloseDeactivateModal}
        onConfirm={handleConfirmDeactivatePlate}
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

const HeaderActionCount = styled.span`
  display: inline-grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  border-radius: 999px;
  background: oklch(93% 0.008 245);
  color: oklch(36% 0.018 245);
  font-size: 0.78rem;
  font-weight: 780;
  line-height: 1;
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
