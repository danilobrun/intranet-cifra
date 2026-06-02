import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { UpsertPortalForm } from "../../components/UpsertPortalForm";
import { createPortal } from "../../services/Portals.service";

export function AdminAddPortalsView() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await createPortal(formData);
      toast.success("Portal cadastrado com sucesso.");
      navigate("/portal/portals");
    } catch {
      toast.error("Falha ao cadastrar portal. Tente novamente.");
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>Novo Portal</PageTitle>
          <PageDescription>
            Cadastre as informações exibidas na listagem e no detalhe do portal.
          </PageDescription>
        </PageHeader>

        <UpsertPortalForm onSubmit={handleSubmit} />
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
  max-width: 680px;
  margin: 8px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 1rem;
  line-height: 1.5;
`;
