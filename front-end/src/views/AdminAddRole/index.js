import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import { UpsertRoleForm } from "../../components/UpsertRoleForm";
import {
  createRole,
  getRolePortalOptions,
} from "../../services/Roles.service";

export function AdminAddRoleView() {
  const [portalOptions, setPortalOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortalOptions = async () => {
      try {
        const data = await getRolePortalOptions();
        setPortalOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message || "Falha ao carregar portais.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortalOptions();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      await createRole(formData);
      toast.success("Role cadastrada com sucesso.");
      navigate("/portal/roles");
    } catch (error) {
      toast.error(error.message || "Falha ao cadastrar role. Tente novamente.");
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>Nova role</PageTitle>
          <PageDescription>
            Cadastre uma role e defina quais portais poderão ser acessados por
            ela.
          </PageDescription>
        </PageHeader>

        {loading ? (
          <Loading />
        ) : (
          <UpsertRoleForm
            portalOptions={portalOptions}
            buttonLabel="Cadastrar role"
            onSubmit={handleSubmit}
          />
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
