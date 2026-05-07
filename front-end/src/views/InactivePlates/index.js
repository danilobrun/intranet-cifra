import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
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
      <HeaderRow>
        <HeaderContent>
          <TitleRow>
            <h1 className="mb-0">Placas Inativas</h1>
            <Button
              as={Link}
              to="/portal/plates"
              size="sm"
              variant="outline-secondary"
              className="mt-2"
            >
              Voltar para placas ativas
            </Button>
          </TitleRow>
          <HelperText>
            Consulte placas inativadas e reative quando necessario.
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
            <option value="Piaui">Piaui</option>
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
        <InactivePlatesTable
          plates={plates}
          onViewMovements={handleViewMovements}
          onRestorePlate={handleOpenRestorePlate}
        />
      )}

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
  padding: 8px 36px 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  outline: none;
  background: #ffffff;
  background-position: right 12px center;

  @media (max-width: 767px) {
    width: 100%;
  }
`;
