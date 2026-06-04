import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { ContractFilters } from "../../components/Contracts/ContractFilters";
import { ContractsTable } from "../../components/Contracts/ContractsTable";
import {
  getContractManagers,
  getContracts,
  updateContractStatus,
} from "../../services/Contracts.service";
import { selectUser } from "../../store/User/User.selectors";
import { canManageAllContracts } from "../../helpers/contractsPermissions";

const initialFilters = {
  search: "",
  codigo: "",
  cliente: "",
  estado: "",
  gestorId: "",
  status: "Ativo",
};

export function Contracts() {
  const user = useSelector(selectUser);
  const canManageAll = canManageAllContracts(user);
  const [contracts, setContracts] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getContracts(filters);
      setContracts(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMsg(error.message || "Falha ao buscar contratos.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchContracts, 250);

    return () => clearTimeout(timeout);
  }, [fetchContracts]);

  useEffect(() => {
    if (!canManageAll) {
      setManagerOptions([]);
      return;
    }

    const fetchManagers = async () => {
      try {
        const data = await getContractManagers();
        setManagerOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message || "Falha ao carregar gestores.");
      }
    };

    fetchManagers();
  }, [canManageAll]);

  const handleStatusChange = async (contract, nextStatus) => {
    try {
      await updateContractStatus(contract._id, nextStatus);
      toast.success(
        nextStatus === "Ativo"
          ? "Contrato reativado com sucesso."
          : "Contrato inativado com sucesso.",
      );
      await fetchContracts();
    } catch (error) {
      toast.error(error.message || "Falha ao alterar status do contrato.");
    }
  };

  return (
    <LayoutPortal>
      <PortalHeader
        title="📃 Contratos"
        description="Gerencie os contratos usados no controle de BMs."
        buttonText="Novo contrato"
        buttonLink="/contratos/novo"
      />

      <ContractFilters
        filters={filters}
        managerOptions={managerOptions}
        canManageAll={canManageAll}
        isLoading={loading}
        total={contracts.length}
        onChange={setFilters}
      />

      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      <ContractsTable
        contracts={contracts}
        isLoading={loading}
        showCreatedBy={canManageAll}
        onStatusChange={handleStatusChange}
      />
    </LayoutPortal>
  );
}
