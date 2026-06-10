import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import { UpdateUserForm } from "../../components/UpdateUserForm";
import {
  getUserById,
  updateUser,
  updateUserAvatar,
} from "../../services/Users.service";

export function AdminEditUserView() {
  const { id } = useParams();
  const [userInfo, setUserInfo] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await getUserById(id);
        setUserInfo(user);
      } catch (error) {
        toast.error("Falha ao buscar dados do usuário. Recarregue a página.");
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (formData, avatarCpfToSave) => {
    let userWasUpdated = false;

    try {
      await updateUser(id, formData);
      userWasUpdated = true;

      if (avatarCpfToSave) {
        await updateUserAvatar(id, avatarCpfToSave);
      }

      toast.success("Usuário alterado com sucesso.");
      navigate("/portal/users");
    } catch (error) {
      if (userWasUpdated) {
        toast.error(
          error.message ||
            "Dados salvos, mas a foto de perfil nao foi atualizada.",
        );
        return;
      }

      toast.error("Falha ao alterar usuário. Tente novamente.");
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <PageTitle>Editar usuário</PageTitle>
          <PageDescription>
            Atualize as informações de acesso, contato e perfil operacional do
            colaborador.
          </PageDescription>
        </PageHeader>

        {userInfo ? (
          <UpdateUserForm
            avatarConfig={{ mode: "user", userId: id }}
            initialValue={{
              name: userInfo.name,
              email: userInfo.email,
              number: userInfo.number,
              function: userInfo.function,
              state: userInfo.state,
              lotation: userInfo.lotation,
              personalNumber: userInfo.personalNumber,
              roleCodes: userInfo.roles?.map((role) => role.code) || [],
            }}
            buttonLabel="Alterar usuário"
            onSubmit={handleSubmit}
            type="edit"
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
  max-width: 700px;
  margin: 8px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 1rem;
  line-height: 1.5;
`;
