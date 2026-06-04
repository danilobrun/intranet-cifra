import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { BoletinsFilters } from "../../components/Boletins/BoletinsFilters";
import { BoletinsSummaryCards } from "../../components/Boletins/BoletinsSummaryCards";
import { BoletinsTable } from "../../components/Boletins/BoletinsTable";
import { deleteBoletim, getBoletins } from "../../services/Boletins.service";
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
  valorTotalBmOrder: "",
};

const toNumber = (value) => {
  const numberValue = Number(value || 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
};

export function Boletins() {
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

  const summary = useMemo(() => {
    const totals = boletins.reduce(
      (accumulator, boletim) => {
        const valorTotalBm = toNumber(boletim.valorTotalBm);
        const totalFaturado = toNumber(boletim.totalFaturado);
        const totalPago = toNumber(boletim.totalPago);

        return {
          valorTotalBm: accumulator.valorTotalBm + valorTotalBm,
          valorFaturado: accumulator.valorFaturado + totalFaturado,
          valorPago: accumulator.valorPago + totalPago,
        };
      },
      {
        valorTotalBm: 0,
        valorFaturado: 0,
        valorPago: 0,
      },
    );

    return {
      ...totals,
      pendenteFaturamento: totals.valorTotalBm - totals.valorFaturado,
      pendentePagamento: totals.valorFaturado - totals.valorPago,
    };
  }, [boletins]);

  const fetchBoletins = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getBoletins(filters);
      setBoletins(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMsg(error.message || "Falha ao buscar boletins.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchBoletins, 250);

    return () => clearTimeout(timeout);
  }, [fetchBoletins]);

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

  const handleDeleteBoletim = async (boletim) => {
    const boletimId = boletim?._id || boletim?.id;

    if (!boletimId) {
      toast.error("Boletim inválido para exclusão.");
      return;
    }

    try {
      await deleteBoletim(boletimId);
      toast.success("Boletim excluído com sucesso.");
      await fetchBoletins();
    } catch (error) {
      toast.error(error.message || "Falha ao excluir boletim.");
    }
  };

  return (
    <LayoutPortal>
      <PortalHeader
        title="💰 Boletins"
        description="Acompanhe BMs, faturamentos e pagamentos vinculados aos contratos."
        buttonText="Novo Boletim"
        buttonLink="/boletins/novo"
      >
        <HistoryButton to="/boletins/excluidos">
          <FontAwesomeIcon icon={faTrash} />
          Boletins excluídos
        </HistoryButton>
      </PortalHeader>

      <BoletinsSummaryCards summary={summary} />

      <BoletinsFilters
        filters={filters}
        contractOptions={contractOptions}
        managerOptions={managerOptions}
        canManageAll={canManageAll}
        isLoading={loading}
        total={boletins.length}
        onChange={setFilters}
      />

      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      <BoletinsTable
        boletins={boletins}
        isLoading={loading}
        hasActiveFilters={hasActiveFilters}
        onDeleteBoletim={handleDeleteBoletim}
      />
    </LayoutPortal>
  );
}

const HistoryButton = styled(Link)`
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
