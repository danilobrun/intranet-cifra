import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { BoletimForm } from "../../components/Boletins/BoletimForm";
import { createBoletim } from "../../services/Boletins.service";
import { createFaturamento } from "../../services/Faturamentos.service";
import { createPagamento } from "../../services/Pagamentos.service";
import { getContracts } from "../../services/Contracts.service";

const getCreatedBoletimId = (response) =>
  response?.boletim?._id || response?.boletim?.id || "";

export function BoletimCreateView() {
  const navigate = useNavigate();
  const [contractOptions, setContractOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const data = await getContracts({ status: "Ativo" });
        setContractOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorMsg(error.message || "Falha ao carregar contratos ativos.");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const handleSubmit = async ({ boletim, faturamentos, pagamentos }) => {
    let createdBoletimId = "";

    try {
      const response = await createBoletim(boletim);
      createdBoletimId = getCreatedBoletimId(response);

      if (!createdBoletimId) {
        throw new Error("A API nao retornou o identificador do boletim criado.");
      }
    } catch (error) {
      toast.error(error.message || "Falha ao criar boletim.");
      return;
    }

    try {
      for (const faturamento of faturamentos) {
        await createFaturamento(createdBoletimId, faturamento);
      }

      for (const pagamento of pagamentos) {
        await createPagamento(createdBoletimId, pagamento);
      }

      toast.success("Boletim criado com sucesso.");
      navigate("/boletins");
    } catch (error) {
      toast.error(
        error.message
          ? `Boletim criado, mas houve falha nos lancamentos: ${error.message}`
          : "Boletim criado, mas houve falha nos lancamentos.",
      );
      navigate("/boletins");
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>Novo boletim</PageTitle>
          <PageDescription>
            Cadastre o BM e, se necessario, inclua faturamentos e pagamentos
            antes de salvar.
          </PageDescription>
        </PageHeader>

        {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

        {!errorMsg ? (
          <BoletimForm
            mode="create"
            contractOptions={contractOptions}
            isLoadingContracts={loading}
            buttonLabel="Cadastrar boletim"
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
