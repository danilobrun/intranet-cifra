import { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import {
  createPlate,
  getPlateById,
  updatePlate,
} from "../../services/Plates.service";
import { PlateForm } from "../Plates/PlateForm";

export function PlateCreateView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [plate, setPlate] = useState();
  const [loading, setLoading] = useState(isEditing);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isEditing) {
      setPlate(undefined);
      setLoading(false);
      setErrorMsg("");
      return;
    }

    const fetchPlate = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const data = await getPlateById(id);
        setPlate(data);
      } catch (error) {
        setPlate(undefined);
        setErrorMsg(error.message || "Falha ao carregar placa.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlate();
  }, [id, isEditing]);

  const handleSubmit = async (formData) => {
    try {
      if (isEditing) {
        await updatePlate(id, formData);
        toast.success("Placa atualizada com sucesso.");
      } else {
        await createPlate(formData);
        toast.success("Placa cadastrada com sucesso.");
      }

      navigate("/portal/plates");
    } catch (error) {
      toast.error(error.message || "Falha ao salvar placa. Tente novamente.");
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>{isEditing ? "Editar placa" : "Nova placa"}</PageTitle>
          <PageDescription>
            {isEditing
              ? "Atualize os dados de condutor, contrato, estado e CRLV da placa."
              : "Cadastre uma placa ativa da frota com os dados de condutor, contrato, estado e CRLV."}
          </PageDescription>
        </PageHeader>

        {errorMsg ? (
          <Alert variant="danger">
            <ErrorContent>
              <span>{errorMsg}</span>
              <Button
                as={Link}
                to="/portal/plates"
                variant="outline-danger"
                size="sm"
              >
                Voltar para placas
              </Button>
            </ErrorContent>
          </Alert>
        ) : null}

        {loading ? (
          <LoadingState>Carregando placa...</LoadingState>
        ) : !errorMsg && (!isEditing || plate) ? (
          <PlateForm
            layout="page"
            mode={isEditing ? "edit" : "create"}
            initialValue={plate}
            buttonLabel={isEditing ? "Salvar alterações" : "Cadastrar placa"}
            submittingLabel={isEditing ? "Salvando..." : "Cadastrando..."}
            cancelTo="/portal/plates"
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
