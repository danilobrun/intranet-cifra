import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { UpsertRoleForm } from "../../components/UpsertRoleForm";
import { RoleFormSkeleton } from "../../components/UpsertRoleForm/RoleFormSkeleton";
import {
  getRoleById,
  getRolePortalOptions,
  updateRole,
} from "../../services/Roles.service";

export function AdminEditRoleView() {
  const { id } = useParams();
  const [role, setRole] = useState();
  const [portalOptions, setPortalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        const [roleData, portalOptionsData] = await Promise.all([
          getRoleById(id),
          getRolePortalOptions(),
        ]);

        setRole(roleData);
        setPortalOptions(
          Array.isArray(portalOptionsData) ? portalOptionsData : [],
        );
      } catch (error) {
        toast.error(error.message || "Falha ao carregar a role.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await updateRole(id, formData);
      toast.success("Role alterada com sucesso.");
      navigate("/portal/roles");
    } catch (error) {
      toast.error(error.message || "Falha ao alterar role. Tente novamente.");
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>Editar role</PageTitle>
          <PageDescription>
            Atualize os dados da role e revise os portais liberados para este
            perfil.
          </PageDescription>
        </PageHeader>

        {loading ? (
          <RoleFormSkeleton />
        ) : role ? (
          <UpsertRoleForm
            initialValue={{
              cargo: role.cargo,
              code: role.code,
              portalIds: role.portals?.map((portal) => portal._id) || [],
            }}
            portalOptions={portalOptions}
            buttonLabel="Alterar role"
            onSubmit={handleSubmit}
          />
        ) : (
          <EmptyState>Role não encontrada.</EmptyState>
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
  max-width: 720px;
  margin: 8px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 1rem;
  line-height: 1.5;
`;

const EmptyState = styled.section`
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 12px;
  background: oklch(99% 0.004 245);
  color: oklch(49% 0.018 245);
`;
