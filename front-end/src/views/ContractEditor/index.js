import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { UpsertContractForm } from "../../components/Contracts/UpsertContractForm";
import {
  createContract,
  getContractById,
  getContractManagers,
  updateContract,
  updateContractStatus,
} from "../../services/Contracts.service";
import { canManageAllContracts } from "../../helpers/contractsPermissions";
import { selectUser } from "../../store/User/User.selectors";

const getContractPayload = (formData) => ({
  codigo: formData.codigo,
  nomeContrato: formData.nomeContrato,
  cliente: formData.cliente,
  estado: formData.estado,
  descricao: formData.descricao,
  gestorId: formData.gestorId,
  dataInicio: formData.dataInicio,
  dataFim: formData.dataFim,
});

export function ContractEditorView() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const user = useSelector(selectUser);
  const canManageAll = canManageAllContracts(user);
  const navigate = useNavigate();
  const [contract, setContract] = useState();
  const [managerOptions, setManagerOptions] = useState([]);
  const [loading, setLoading] = useState(isEditing || canManageAll);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const requests = [];

        if (isEditing) {
          requests.push(getContractById(id));
        } else {
          requests.push(Promise.resolve(null));
        }

        if (canManageAll) {
          requests.push(getContractManagers());
        } else {
          requests.push(Promise.resolve([]));
        }

        const [contractData, managersData] = await Promise.all(requests);

        setContract(contractData || undefined);
        setManagerOptions(Array.isArray(managersData) ? managersData : []);
      } catch (error) {
        setErrorMsg(error.message || "Falha ao carregar contrato.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [canManageAll, id, isEditing]);

  const handleSubmit = async (formData) => {
    const payload = getContractPayload(formData);

    try {
      if (isEditing) {
        await updateContract(id, payload);

        if (formData.status !== contract?.status) {
          await updateContractStatus(id, formData.status);
        }

        toast.success("Contrato atualizado com sucesso.");
      } else {
        const response = await createContract({
          ...payload,
          status: "Ativo",
        });
        const createdContractId = response?.contrato?._id;

        if (createdContractId && formData.status === "Inativo") {
          await updateContractStatus(createdContractId, "Inativo");
        }

        toast.success("Contrato criado com sucesso.");
      }

      navigate("/contratos");
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
              : "Cadastre um contrato para uso no controle de BMs."}
          </PageDescription>
        </PageHeader>

        {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

        {loading ? (
          <LoadingState>Carregando contrato...</LoadingState>
        ) : !errorMsg && (!isEditing || contract) ? (
          <UpsertContractForm
            initialValue={contract}
            managerOptions={managerOptions}
            currentUser={user}
            canManageAll={canManageAll}
            buttonLabel={isEditing ? "Salvar alterações" : "Cadastrar contrato"}
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
