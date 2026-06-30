import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import {
  createPlate,
  desactivatePlate,
  getPlateMovements,
  getPlates,
  updatePlate,
} from "../../services/Plates.service";
import { selectUser } from "../../store/User/User.selectors";
import { PlatesTable } from "./PlatesTable";
import { PlateUpsertModal } from "./PlateUpsertModal";
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

const getEmptyPlateForm = () => ({
  placa: "",
  condutor: "",
  contrato: "",
  estado: "",
  crlv: "",
});

export function PlatesView() {
  const user = useSelector(selectUser);
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [plateModalMode, setPlateModalMode] = useState();
  const [plateModalInitialValue, setPlateModalInitialValue] =
    useState(getEmptyPlateForm);
  const [editingPlateId, setEditingPlateId] = useState();
  const [isPlateModalSubmiting, setIsPlateModalSubmiting] = useState(false);
  const [selectedMovementPlate, setSelectedMovementPlate] = useState();
  const [plateMovements, setPlateMovements] = useState([]);
  const [plateMovementsLoading, setPlateMovementsLoading] = useState(false);
  const [plateToDeactivate, setPlateToDeactivate] = useState();
  const [isDeactivateSubmiting, setIsDeactivateSubmiting] = useState(false);

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

  useEffect(() => {
    fetchPlates();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true);
      fetchPlates({ search: input.trim(), estado: estadoFilter });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [input, estadoFilter]);

  const resetPlateModal = () => {
    setPlateModalMode(undefined);
    setPlateModalInitialValue(getEmptyPlateForm());
    setEditingPlateId(undefined);
    setIsPlateModalSubmiting(false);
  };

  const handleOpenCreatePlate = () => {
    if (isPlateModalSubmiting) {
      return;
    }

    setEditingPlateId(undefined);
    setPlateModalInitialValue(getEmptyPlateForm());
    setPlateModalMode("create");
  };

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
    if (isPlateModalSubmiting) {
      return;
    }

    setEditingPlateId(plate._id);
    setPlateModalInitialValue({
      placa: plate.placa,
      condutor: plate.condutor,
      contrato: plate.contrato,
      estado: plate.estado,
      crlv: plate.crlv,
    });
    setPlateModalMode("edit");
  };

  const handleDeactivatePlate = (plate) => {
    if (isDeactivateSubmiting) {
      return;
    }

    setPlateToDeactivate(plate);
  };

  const handleClosePlateModal = () => {
    if (isPlateModalSubmiting) {
      return;
    }

    resetPlateModal();
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
      toast.success("Placa inativada com sucesso.");
      setPlateToDeactivate(undefined);
    } catch (error) {
      toast.error(error.message || "Falha ao inativar placa.");
    } finally {
      setIsDeactivateSubmiting(false);
    }
  };

  const handlePlateSubmit = async (formData) => {
    const isEditMode = plateModalMode === "edit";

    if (isEditMode && !editingPlateId) {
      return;
    }

    try {
      setIsPlateModalSubmiting(true);

      if (isEditMode) {
        await updatePlate(editingPlateId, formData);
      } else {
        await createPlate(formData);
      }

      await fetchPlates({ search: input.trim() });
      toast.success(
        isEditMode
          ? "Placa atualizada com sucesso."
          : "Placa cadastrada com sucesso.",
      );
      resetPlateModal();
    } catch (error) {
      toast.error(
        error.message ||
          (isEditMode
            ? "Falha ao atualizar placa. Tente novamente."
            : "Falha ao cadastrar placa. Tente novamente."),
      );
    } finally {
      setIsPlateModalSubmiting(false);
    }
  };

  return (
    <LayoutPortal>
      <HeaderRow>
        <HeaderContent>
          <TitleRow>
            <h1 className="mb-0">📂 Gestão de Placas</h1>
            <Button size="sm" className="mt-2" onClick={handleOpenCreatePlate}>
              Nova placa
            </Button>
            {canViewInactivePlates ? (
              <Button
                as={Link}
                to="/portal/plates/inactive"
                size="sm"
                variant="outline-secondary"
                className="mt-2"
              >
                Placas inativas
              </Button>
            ) : null}
          </TitleRow>
          <HelperText>
            Consulte as placas ativas da frota e filtre por condutor, contrato
            ou estado.
          </HelperText>
        </HeaderContent>
        <FiltersWrapper>
          <StateSelect
            value={estadoFilter}
            onChange={(event) => setEstadoFilter(event.target.value)}
          >
            <option value="">Todos os estados</option>
            <option value="Alagoas">Alagoas</option>
            <option value="Pernambuco">Pernambuco</option>
            <option value="Sergipe">Sergipe</option>
            <option value="Piaui">Piauí</option>
          </StateSelect>
          <SearchInput
            type="text"
            placeholder="Pesquisar placa"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </FiltersWrapper>
      </HeaderRow>

      {loading ? (
        <Loading />
      ) : (
        <PlatesTable
          plates={plates}
          onViewMovements={handleViewMovements}
          onEditPlate={handleEditPlate}
          onDeactivatePlate={handleDeactivatePlate}
          canDeactivatePlate={canViewInactivePlates}
        />
      )}

      <PlateUpsertModal
        show={Boolean(plateModalMode)}
        mode={plateModalMode}
        initialValue={plateModalInitialValue}
        isLoading={false}
        isSubmiting={isPlateModalSubmiting}
        onHide={handleClosePlateModal}
        onSubmit={handlePlateSubmit}
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

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0;
  flex-wrap: wrap;
`;

const HeaderContent = styled.div`
  flex: 1 1 420px;
  min-width: 0;
`;

const HelperText = styled.p`
  margin: 8px 0 0;
  color: #6c757d;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FiltersWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 0 0 520px;
  margin-top: 0;

  @media (max-width: 767px) {
    flex-basis: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
`;

const SearchInput = styled.input`
  width: 320px;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  outline: none;

  @media (max-width: 767px) {
    width: 100%;
  }
`;

const StateSelect = styled.select`
  width: 190px;
  padding: 8px 12px 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  outline: none;
  background: #ffffff;
  background-position: right 12px center;

  @media (max-width: 767px) {
    width: 100%;
  }
`;
