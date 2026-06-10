import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import { UpsertPortalForm } from "../../components/UpsertPortalForm";
import { getPortalById, updatePortal } from "../../services/Portals.service";

export function AdminEditPortalView() {
  const { id } = useParams();
  const [portal, setPortal] = useState();
  useEffect(() => {
    const fetchPortal = async () => {
      try {
        const portalData = await getPortalById(id);
        setPortal(portalData);
      } catch {
        toast.error("Falha ao buscar dados do portal. Recarregue a página.");
      }
    };
    fetchPortal();
  }, [id]);
  const navigate = useNavigate();
  const handleSubmit = async (formData) => {
    try {
      await updatePortal(id, formData);
      toast.success("Portal alterado com sucesso.");
      navigate("/portal/portals");
    } catch {
      toast.error("Falha ao alterar portal. Tente novamente.");
    }
  };
  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>Editar portal</PageTitle>
          <PageDescription>
            Atualize as informações exibidas na listagem e no detalhe do portal.
          </PageDescription>
        </PageHeader>

        {portal ? (
          <UpsertPortalForm
            initialValue={{
              name: portal.name,
              responsible: portal.responsible,
              shortDescription: portal.shortDescription,
              description: portal.description,
              emailResponsible: portal.emailResponsible,
              image: portal.image,
              url: portal.url,
              details:
                portal.details?.length > 0
                  ? portal.details
                  : [
                      {
                        url: "",
                        baseLink: "",
                        updateSchedule: "",
                        nameForm: "",
                        emailResponsible: "",
                      },
                    ],
            }}
            buttonLabel="Alterar"
            onSubmit={handleSubmit}
          />
        ) : (
          <Loading />
        )}
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
