import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
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
      <h1 className="mt-4">Editar portal</h1>
      {portal ? (
        <UpsertPortalForm
          initialValue={{
            name: portal.name,
            responsible: portal.responsible,
            shortDescription: portal.shortDescription,
            description: portal.description,
            image: portal.image,
            url: portal.url,
          }}
          buttonLabel="Alterar"
          onSubmit={handleSubmit}
        />
      ) : (
        <Loading />
      )}
    </LayoutPortal>
  );
}
