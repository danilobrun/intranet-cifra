import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../services/Users.service";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import { UpdateUserForm } from "../../components/UpdateUserForm";
import { toast } from "react-toastify";

export function EditProfile() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { user } = await getUserById(id);
        console.log(user);
        setUserData(user);
      } catch (error) {
        toast.error("Falha ao buscar dados do usuário. Recarregue a página.");
      }
    };

    loadUser();
  }, [id]);

  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await updateUser(id, formData);
      toast.success("Dados alterado com sucesso.");
      navigate("/portal");
    } catch {
      toast.error("Falha ao alterar usuário. Tente novamente.");
    }
  };

  return (
    <LayoutPortal>
      <h1 className="mt-4">Editar Perfil</h1>
      {!userData ? (
        <Loading />
      ) : (
        <>
          <UpdateUserForm
            initialValue={{
              name: userData.name || "",
              email: userData.email || "",
              number: userData.number || "",
              personalNumber: userData.personalNumber || "",
              function: userData.function || "",
              state: userData.state || "",
              lotation: userData.lotation || "",
              roleCodes: Array.isArray(userData.roles)
                ? userData.roles.map((role) => role.code)
                : [],
            }}
            buttonLabel="Editar dados"
            onSubmit={handleSubmit}
          />
        </>
      )}
    </LayoutPortal>
  );
}
