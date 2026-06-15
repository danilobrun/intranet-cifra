import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarDays,
  faHourglassHalf,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { ResumoContratoBmsTable } from "../../components/ResumoContratos/ResumoContratoBmsTable";
import { ResumoContratosSummaryCards } from "../../components/ResumoContratos/ResumoContratosSummaryCards";
import {
  formatDate,
  formatGap,
  getResumoContratoName,
} from "../../components/ResumoContratos/utils";
import {
  createResumoContratoBm,
  deleteResumoContratoBm,
  getResumoContratoById,
  updateResumoContratoBm,
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

const getErrorMessage = (error) => {
  const message = error?.message || "Falha ao carregar contrato.";
  const normalizedMessage = message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedMessage.includes("nao encontrado")) {
    return "Contrato não encontrado";
  }

  return message;
};

export function ResumoContratoDetailView() {
  const { id } = useParams();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [contrato, setContrato] = useState();
  const [cards, setCards] = useState(defaultCards);
  const [bms, setBms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSavingBms, setIsSavingBms] = useState(false);

  const availableYearOptions = useMemo(
    () =>
      Array.from(new Set([...yearOptions, selectedYear])).sort(
        (left, right) => left - right,
      ),
    [selectedYear],
  );

  const fetchContratoDetail = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getResumoContratoById(id, { ano: selectedYear });

      setContrato(data?.contrato);
      setCards(data?.cards || defaultCards);
      setBms(Array.isArray(data?.bms) ? data.bms : []);
    } catch (error) {
      setContrato(undefined);
      setCards(defaultCards);
      setBms([]);
      setErrorMsg(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id, selectedYear]);

  useEffect(() => {
    fetchContratoDetail();
  }, [fetchContratoDetail]);

  useDailyRefresh(fetchContratoDetail);

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
  };

  const syncDetailResponse = (data) => {
    setContrato(data?.contrato);
    setCards(data?.cards || defaultCards);
    setBms(Array.isArray(data?.bms) ? data.bms : []);
  };

  const handleCreateBm = async (payload) => {
    try {
      setIsSavingBms(true);
      const data = await createResumoContratoBm(id, payload);
      syncDetailResponse(data);
      toast.success("BM lançado com sucesso.");
    } catch (error) {
      toast.error(error.message || "Falha ao lançar BM.");
      throw error;
    } finally {
      setIsSavingBms(false);
    }
  };

  const handleUpdateBm = async (bmId, payload) => {
    try {
      setIsSavingBms(true);
      const data = await updateResumoContratoBm(id, bmId, payload);
      syncDetailResponse(data);
      toast.success("BM atualizado com sucesso.");
    } catch (error) {
      toast.error(error.message || "Falha ao atualizar BM.");
      throw error;
    } finally {
      setIsSavingBms(false);
    }
  };

  const handleDeleteBm = async (bmId) => {
    try {
      setIsSavingBms(true);
      const data = await deleteResumoContratoBm(id, bmId);
      syncDetailResponse(data);
      toast.success("BM excluído com sucesso.");
    } catch (error) {
      toast.error(error.message || "Falha ao excluir BM.");
      throw error;
    } finally {
      setIsSavingBms(false);
    }
  };

  const contratoName = getResumoContratoName(contrato);

  const headerActions = useMemo(
    () => (
      <>
        <YearField controlId="resumo-contrato-detail-ano">
          <Form.Label>Ano</Form.Label>
          <Form.Select value={selectedYear} onChange={handleYearChange}>
            {availableYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Form.Select>
        </YearField>

        <SecondaryAction as={Link} to={`/resumo-contratos/${id}/editar`}>
          <FontAwesomeIcon icon={faPen} />
          Editar contrato
        </SecondaryAction>

        <SecondaryAction as={Link} to="/resumo-contratos">
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar
        </SecondaryAction>
      </>
    ),
    [availableYearOptions, id, selectedYear],
  );

  return (
    <LayoutPortal>
      <PortalHeader
        title={loading && !contrato ? "Carregando contrato..." : contratoName}
        description="Acompanhe orçamento, lançamentos de BM e saldo do contrato."
      >
        {headerActions}
      </PortalHeader>

      {errorMsg ? (
        <Alert variant="danger">
          <ErrorRow>
            <span>{errorMsg}</span>
            <Button
              as={Link}
              to="/resumo-contratos"
              variant="outline-danger"
              size="sm"
            >
              Voltar para Resumo Contratos
            </Button>
          </ErrorRow>
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState>Carregando contrato...</LoadingState>
      ) : !errorMsg ? (
        <>
          <ResumoContratosSummaryCards
            cards={cards}
            ariaLabel="Resumo micro do contrato"
          />

          <ContractInfoBar aria-label="Informações do contrato">
            <InfoItem>
              <InfoIcon icon={faCalendarDays} />
              <InfoContent>
                <InfoLabel>Data início</InfoLabel>
                <InfoValue>{formatDate(contrato?.dataInicio)}</InfoValue>
              </InfoContent>
            </InfoItem>
            <InfoItem>
              <InfoIcon icon={faCalendarDays} />
              <InfoContent>
                <InfoLabel>Data fim</InfoLabel>
                <InfoValue>{formatDate(contrato?.dataFim)}</InfoValue>
              </InfoContent>
            </InfoItem>
            <InfoItem>
              <InfoIcon icon={faHourglassHalf} />
              <InfoContent>
                <InfoLabel>GAP</InfoLabel>
                <InfoValue>{formatGap(contrato?.gap)}</InfoValue>
              </InfoContent>
            </InfoItem>
          </ContractInfoBar>

          <ResumoContratoBmsTable
            bms={bms}
            selectedYear={selectedYear}
            isSubmiting={isSavingBms}
            onCreateBm={handleCreateBm}
            onUpdateBm={handleUpdateBm}
            onDeleteBm={handleDeleteBm}
          />
        </>
      ) : null}
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
`;

const LoadingState = styled.section`
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(49% 0.018 245);
`;

const ErrorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const ContractInfoBar = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 8px;
  margin: 18px 0;
  padding: 8px 14px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 8px 18px oklch(22% 0.018 245 / 0.04);

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    padding: 10px;
  }
`;

const InfoItem = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 34px;
  gap: 8px;
  padding: 4px 8px;

  @media (max-width: 767.98px) {
    justify-content: flex-start;
  }
`;

const InfoIcon = styled(FontAwesomeIcon)`
  flex: 0 0 auto;
  color: oklch(50% 0.018 245);
  font-size: 0.88rem;
`;

const InfoContent = styled.span`
  display: inline-flex;
  align-items: baseline;
  min-width: 0;
  gap: 8px;
  flex-wrap: wrap;
`;

const InfoLabel = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.2;
`;

const InfoValue = styled.strong`
  color: oklch(24% 0.018 245);
  font-size: 0.88rem;
  font-weight: 760;
  line-height: 1.2;
  white-space: nowrap;
`;
