import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { BoletinsFilters } from "../../components/Boletins/BoletinsFilters";
import { DeletedBoletinsTable } from "../../components/Boletins/DeletedBoletinsTable";
import { getDeletedBoletins } from "../../services/Boletins.service";
import {
  getContractManagers,
  getContracts,
} from "../../services/Contracts.service";
import { selectUser } from "../../store/User/User.selectors";
import { canManageAllBoletins } from "../../helpers/boletinsPermissions";

const initialFilters = {
  numeroBm: "",
  cliente: "",
  contratoId: "",
  estado: "",
  gestorId: "",
  mes: "",
  ano: "",
  statusFaturamento: "",
  statusPagamento: "",
};

export function BoletinsDeletedView() {
  const user = useSelector(selectUser);
  const canManageAll = canManageAllBoletins(user);
  const [boletins, setBoletins] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== ""),
    [filters],
  );

  const fetchDeletedBoletins = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getDeletedBoletins(filters);
      setBoletins(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMsg(error.message || "Falha ao buscar boletins excluidos.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchDeletedBoletins, 250);

    return () => clearTimeout(timeout);
  }, [fetchDeletedBoletins]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [contractsData, managersData] = await Promise.all([
          getContracts({ status: "todos" }),
          canManageAll ? getContractManagers() : Promise.resolve([]),
        ]);

        setContractOptions(Array.isArray(contractsData) ? contractsData : []);
        setManagerOptions(Array.isArray(managersData) ? managersData : []);
      } catch (error) {
        toast.error(error.message || "Falha ao carregar filtros de boletins.");
      }
    };

    fetchFilterOptions();
  }, [canManageAll]);

  return (
    <LayoutPortal>
      <PortalHeader
        title="Boletins Excluídos"
        description="Histórico de boletins removidos logicamente."
      >
        <BackButton to="/boletins">
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar para Boletins
        </BackButton>
      </PortalHeader>

      <BoletinsFilters
        filters={filters}
        contractOptions={contractOptions}
        managerOptions={managerOptions}
        canManageAll={canManageAll}
        isLoading={loading}
        showValueSort={false}
        total={boletins.length}
        onChange={setFilters}
      />

      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      <DeletedBoletinsTable
        boletins={boletins}
        isLoading={loading}
        hasActiveFilters={hasActiveFilters}
      />
    </LayoutPortal>
  );
}

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 16px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
  }

  @media (max-width: 767.98px) {
    flex: 1 1 180px;
  }
`;
