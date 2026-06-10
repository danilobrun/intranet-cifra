import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { LancarBmModal } from "../../components/ResumoContratos/LancarBmModal";
import { ResumoContratosSummaryCards } from "../../components/ResumoContratos/ResumoContratosSummaryCards";
import { ResumoContratosTable } from "../../components/ResumoContratos/ResumoContratosTable";
import {
  buildEmptyBmsPorMes,
  getResumoContratoId,
} from "../../components/ResumoContratos/utils";
import {
  deleteResumoContrato,
  getResumoContratoById,
  getResumoContratos,
  updateResumoContratoBms,
} from "../../services/ResumoContratos.service";
import { useDailyRefresh } from "../../hooks/useDailyRefresh";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: 5 },
  (_, index) => currentYear - 2 + index,
);

const defaultCards = {
  saldo: 0,
  bm: 0,
  orcamento: 0,
};

export function ResumoContratos() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [cards, setCards] = useState(defaultCards);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isBmModalOpen, setIsBmModalOpen] = useState(false);
  const [isSavingBm, setIsSavingBm] = useState(false);

  const hasContratos = contratos.length > 0;
  const availableYearOptions = useMemo(
    () =>
      Array.from(new Set([...yearOptions, selectedYear])).sort(
        (left, right) => left - right,
      ),
    [selectedYear],
  );

  const fetchResumoContratos = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getResumoContratos({ ano: selectedYear });

      setCards(data?.cards || defaultCards);
      setContratos(Array.isArray(data?.contratos) ? data.contratos : []);
    } catch (error) {
      setErrorMsg(error.message || "Falha ao buscar resumo de contratos.");
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchResumoContratos();
  }, [fetchResumoContratos]);

  useDailyRefresh(fetchResumoContratos, !isBmModalOpen);

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };

  const handleDeleteContrato = async (contrato) => {
    const contratoId = getResumoContratoId(contrato);

    if (!contratoId) {
      toast.error("Contrato inválido para exclusão.");
      return;
    }

    try {
      await deleteResumoContrato(contratoId);
      toast.success("Contrato excluído permanentemente.");
      await fetchResumoContratos();
    } catch (error) {
      toast.error(error.message || "Falha ao excluir contrato.");
    }
  };

  const handleSubmitBm = async ({ contratoId, mes, ano, valorBm }) => {
    try {
      setIsSavingBm(true);

      const detail = await getResumoContratoById(contratoId, { ano });
      const bmsPorMes = {
        ...buildEmptyBmsPorMes(),
        ...(detail?.bmsPorMes || {}),
      };

      bmsPorMes[String(mes)] = valorBm;

      await updateResumoContratoBms(contratoId, {
        ano,
        bmsPorMes,
      });

      toast.success("BM lançado com sucesso.");
      setIsBmModalOpen(false);

      if (ano !== selectedYear) {
        setSelectedYear(ano);
      } else {
        await fetchResumoContratos();
      }
    } catch (error) {
      toast.error(error.message || "Falha ao lançar BM.");
    } finally {
      setIsSavingBm(false);
    }
  };

  const headerActions = useMemo(
    () => (
      <>
        <YearField controlId="resumo-contratos-ano">
          <Form.Label>Ano</Form.Label>
          <Form.Select value={selectedYear} onChange={handleYearChange}>
            {availableYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Form.Select>
        </YearField>

        <PrimaryAction to="/resumo-contratos/novo">
          <FontAwesomeIcon icon={faPlus} />
          Novo Contrato
        </PrimaryAction>

        <SecondaryAction
          type="button"
          onClick={() => setIsBmModalOpen(true)}
          disabled={!hasContratos}
        >
          <FontAwesomeIcon icon={faSackDollar} />
          Lançar BM
        </SecondaryAction>
      </>
    ),
    [availableYearOptions, hasContratos, selectedYear],
  );

  return (
    <LayoutPortal>
      <PortalHeader
        title="Resumo Contratos"
        description="Acompanhe orçamento, BM e saldo dos contratos."
      >
        {headerActions}
      </PortalHeader>

      <ResumoContratosSummaryCards cards={cards} />

      {errorMsg ? (
        <Alert variant="danger">
          <ErrorRow>
            <span>{errorMsg}</span>
            <Button
              type="button"
              variant="outline-danger"
              size="sm"
              onClick={fetchResumoContratos}
            >
              Recarregar
            </Button>
          </ErrorRow>
        </Alert>
      ) : null}

      <ResumoContratosTable
        contratos={contratos}
        isLoading={loading}
        onDeleteContrato={handleDeleteContrato}
      />

      <LancarBmModal
        show={isBmModalOpen}
        selectedYear={selectedYear}
        contratos={contratos}
        isSubmiting={isSavingBm}
        onHide={() => setIsBmModalOpen(false)}
        onSubmit={handleSubmitBm}
      />
    </LayoutPortal>
  );
}

const YearField = styled(Form.Group)`
  display: grid;
  min-width: 118px;
  gap: 5px;

  label {
    margin: 0;
    color: oklch(40% 0.016 245);
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1;
  }

  select {
    min-height: 40px;
    border-radius: 10px;
    border-color: oklch(87% 0.014 245);
    font-weight: 650;
  }

  @media (max-width: 767.98px) {
    flex: 1 1 130px;
  }
`;

const actionButtonStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
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
    margin-top: 0;
  }
`;

const PrimaryAction = styled(Link)`
  ${actionButtonStyles}
  border: 1px solid #0d6efd;
  background: #0d6efd;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(13, 110, 253, 0.18);

  &:hover,
  &:focus {
    border-color: #0b5ed7;
    background: #0b5ed7;
    color: #ffffff;
    text-decoration: none;
    transform: translateY(-1px);
  }
`;

const SecondaryAction = styled.button`
  ${actionButtonStyles}
  border: 1px solid oklch(86% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
  }

  &:disabled {
    opacity: 0.58;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;
