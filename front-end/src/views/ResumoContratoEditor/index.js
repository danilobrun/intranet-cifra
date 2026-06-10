import { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { ResumoContratoForm } from "../../components/ResumoContratos/ResumoContratoForm";
import {
  createResumoContrato,
  getResumoContratoById,
  updateResumoContrato,
} from "../../services/ResumoContratos.service";

const getCurrentYear = () => new Date().getFullYear();

const getContratoFromResponse = (data) => data?.contrato || data;

export function ResumoContratoEditorView() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [contrato, setContrato] = useState();
  const [loading, setLoading] = useState(isEditing);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isEditing) {
      setContrato(undefined);
      setLoading(false);
      setErrorMsg("");
      return;
    }

    const fetchContrato = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const data = await getResumoContratoById(id, { ano: getCurrentYear() });
        setContrato(getContratoFromResponse(data));
      } catch (error) {
        setContrato(undefined);
        setErrorMsg(error.message || "Falha ao carregar contrato.");
      } finally {
        setLoading(false);
      }
    };

    fetchContrato();
  }, [id, isEditing]);

  const handleSubmit = async (payload) => {
    try {
      if (isEditing) {
        await updateResumoContrato(id, payload);
        toast.success("Contrato atualizado com sucesso.");
      } else {
        await createResumoContrato(payload);
        toast.success("Contrato criado com sucesso.");
      }

      navigate("/resumo-contratos");
    } catch (error) {
      toast.error(error.message || "Falha ao salvar contrato.");
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>{isEditing ? "Editar contrato" : "Novo contrato"}</PageTitle>
          <PageDescription>
            {isEditing
              ? "Atualize os dados cadastrais do contrato."
              : "Cadastre um contrato para acompanhar orçamento, BM e saldo."}
          </PageDescription>
        </PageHeader>

        {errorMsg ? (
          <Alert variant="danger">
            <ErrorContent>
              <span>{errorMsg}</span>
              <Button
                as={Link}
                to="/resumo-contratos"
                variant="outline-danger"
                size="sm"
              >
                Voltar para Resumo Contratos
              </Button>
            </ErrorContent>
          </Alert>
        ) : null}

        {loading ? (
          <LoadingState>Carregando contrato...</LoadingState>
        ) : !errorMsg && (!isEditing || contrato) ? (
          <ResumoContratoForm
            initialValue={contrato}
            buttonLabel={isEditing ? "Salvar alterações" : "Salvar contrato"}
            onSubmit={handleSubmit}
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

const ErrorContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;
