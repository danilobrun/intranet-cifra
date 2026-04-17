import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../services/Users.service";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import { UpdateUserForm } from "../../components/UpdateUserForm";

export function AdminEditUserView() {
  const { id } = useParams();
  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await getUserById(id);
        console.log(user);
        setUserInfo(user);
      } catch (error) {
        toast.error("Falha ao buscar dados do usuário. Recarregue a página.");
      }
    };
    fetchUser();
  }, [id]);
  const navigate = useNavigate();
  const handleSubmit = async (formData) => {
    try {
      await updateUser(id, formData);
      toast.success("Usuário alterado com sucesso.");
      navigate("/portal/users");
    } catch {
      toast.error("Falha ao alterar usuário. Tente novamente.");
    }
  };

  return (
    <LayoutPortal>
      <h1 className="mt-4">Editar usuário</h1>
      {userInfo ? (
        <>
          <UpdateUserForm
            initialValue={{
              name: userInfo.name,
              email: userInfo.email,
              number: userInfo.number,
              function: userInfo.function,
              state: userInfo.state,
              lotation: userInfo.lotation,
              personalNumber: userInfo.personalNumber,
              roleCodes: userInfo.roles?.map((r) => r.code) || [],
            }}
            buttonLabel="Alterar"
            onSubmit={handleSubmit}
            type="edit"
          />
        </>
      ) : (
        <Loading />
      )}
    </LayoutPortal>
  );
}
