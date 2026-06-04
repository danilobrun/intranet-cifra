import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { BoletimForm } from "../../components/Boletins/BoletimForm";
import {
  getBoletimById,
  updateBoletim,
} from "../../services/Boletins.service";
import {
  createFaturamento,
  deleteFaturamento,
  getFaturamentosByBoletim,
} from "../../services/Faturamentos.service";
import {
  createPagamento,
  deletePagamento,
  getPagamentosByBoletim,
} from "../../services/Pagamentos.service";

const getId = (item) => item?._id || item?.id || "";

const sortByDateDesc = (dateKey) => (left, right) => {
  const leftDate = new Date(left?.[dateKey]).getTime();
  const rightDate = new Date(right?.[dateKey]).getTime();
  const safeLeftDate = Number.isNaN(leftDate) ? 0 : leftDate;
  const safeRightDate = Number.isNaN(rightDate) ? 0 : rightDate;

  if (safeRightDate !== safeLeftDate) {
    return safeRightDate - safeLeftDate;
  }

  return getId(right).localeCompare(getId(left));
};

const sortFaturamentos = (items = []) =>
  [...items].sort(sortByDateDesc("dataFaturamento"));

const sortPagamentos = (items = []) =>
  [...items].sort(sortByDateDesc("dataPagamento"));

export function BoletimEditorView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boletim, setBoletim] = useState();
  const [faturamentos, setFaturamentos] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchBoletimData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const boletimData = await getBoletimById(id);

      if (boletimData?.deletedAt) {
        setBoletim(undefined);
        setFaturamentos([]);
        setPagamentos([]);
        setErrorMsg("Boletim excluido nao pode ser editado.");
        return;
      }

      const [faturamentosData, pagamentosData] = await Promise.all([
        getFaturamentosByBoletim(id),
        getPagamentosByBoletim(id),
      ]);

      setBoletim(boletimData);
      setFaturamentos(Array.isArray(faturamentosData) ? faturamentosData : []);
      setPagamentos(Array.isArray(pagamentosData) ? pagamentosData : []);
    } catch (error) {
      setErrorMsg(error.message || "Falha ao carregar boletim.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBoletimData();
  }, [fetchBoletimData]);

  const handleSubmit = async (payload) => {
    try {
      await updateBoletim(id, payload);
      toast.success("Boletim atualizado com sucesso.");
      navigate("/boletins");
    } catch (error) {
      toast.error(error.message || "Falha ao salvar boletim.");
    }
  };

  const handleAddFaturamento = async (payload) => {
    try {
      const response = await createFaturamento(id, payload);

      if (response?.faturamento) {
        setFaturamentos((currentFaturamentos) =>
          sortFaturamentos([...currentFaturamentos, response.faturamento]),
        );
      } else {
        const faturamentosData = await getFaturamentosByBoletim(id);
        setFaturamentos(
          sortFaturamentos(
            Array.isArray(faturamentosData) ? faturamentosData : [],
          ),
        );
      }

      if (response?.boletim) {
        setBoletim(response.boletim);
      } else {
        const boletimData = await getBoletimById(id);
        setBoletim(boletimData);
      }

      toast.success("Faturamento lancado com sucesso.");
    } catch (error) {
      toast.error(error.message || "Falha ao lancar faturamento.");
      throw error;
    }
  };

  const handleDeleteFaturamento = async (faturamentoId) => {
    try {
      const response = await deleteFaturamento(faturamentoId);

      setFaturamentos((currentFaturamentos) =>
        currentFaturamentos.filter(
          (faturamento) => getId(faturamento) !== faturamentoId,
        ),
      );

      if (response?.boletim) {
        setBoletim(response.boletim);
      } else {
        const boletimData = await getBoletimById(id);
        setBoletim(boletimData);
      }

      toast.success("Faturamento excluido com sucesso.");
    } catch (error) {
      toast.error(error.message || "Falha ao excluir faturamento.");
      throw error;
    }
  };

  const handleAddPagamento = async (payload) => {
    try {
      const response = await createPagamento(id, payload);

      if (response?.pagamento) {
        setPagamentos((currentPagamentos) =>
          sortPagamentos([...currentPagamentos, response.pagamento]),
        );
      } else {
        const pagamentosData = await getPagamentosByBoletim(id);
        setPagamentos(
          sortPagamentos(Array.isArray(pagamentosData) ? pagamentosData : []),
        );
      }

      if (response?.boletim) {
        setBoletim(response.boletim);
      } else {
        const boletimData = await getBoletimById(id);
        setBoletim(boletimData);
      }

      toast.success("Pagamento lancado com sucesso.");
    } catch (error) {
      toast.error(error.message || "Falha ao lancar pagamento.");
      throw error;
    }
  };

  const handleDeletePagamento = async (pagamentoId) => {
    try {
      const response = await deletePagamento(pagamentoId);

      setPagamentos((currentPagamentos) =>
        currentPagamentos.filter((pagamento) => getId(pagamento) !== pagamentoId),
      );

      if (response?.boletim) {
        setBoletim(response.boletim);
      } else {
        const boletimData = await getBoletimById(id);
        setBoletim(boletimData);
      }

      toast.success("Pagamento excluido com sucesso.");
    } catch (error) {
      toast.error(error.message || "Falha ao excluir pagamento.");
      throw error;
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>Editar boletim</PageTitle>
          <PageDescription>
            Atualize os dados principais e gerencie faturamentos e pagamentos.
          </PageDescription>
        </PageHeader>

        {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

        {loading ? (
          <LoadingState>Carregando boletim...</LoadingState>
        ) : !errorMsg && boletim ? (
          <BoletimForm
            mode="edit"
            boletim={boletim}
            faturamentos={faturamentos}
            pagamentos={pagamentos}
            buttonLabel="Salvar boletim"
            onSubmit={handleSubmit}
            onAddFaturamento={handleAddFaturamento}
            onDeleteFaturamento={handleDeleteFaturamento}
            onAddPagamento={handleAddPagamento}
            onDeletePagamento={handleDeletePagamento}
          />
        ) : null}
      </PageShell>
    </LayoutPortal>
  );
}

const PageShell = styled.section`
  width: 100%;
  padding: 28px 0 40px;
`;

const PageHeader = styled.header`
  margin-bottom: 22px;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 2.35rem;
  font-weight: 760;
  line-height: 1.15;
  letter-spacing: 0;

  @media (max-width: 575.98px) {
    font-size: 1.9rem;
  }
`;

const PageDescription = styled.p`
  max-width: 720px;
  margin: 8px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 1rem;
  line-height: 1.5;
`;

const LoadingState = styled.section`
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  color: oklch(49% 0.018 245);
`;
