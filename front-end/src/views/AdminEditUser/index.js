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
  const [user, setUser] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(id);
        setUser(userData);
      } catch (error) {
        toast.error("Falha ao buscar dados do usuário. Recarregue a página.");
      }
    };
    fetchUser();
  }, [id]);
  const navigate = useNavigate();
  const handleSubmit = async (formData) => {
    console.log("formData", formData);
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
      {user ? (
        <>
          <UpdateUserForm
            initialValue={{
              name: user.user.name,
              email: user.user.email,
              number: user.user.number,
            }}
            buttonLabel="Alterar"
            onSubmit={handleSubmit}
          />
        </>
      ) : (
        <Loading />
      )}
    </LayoutPortal>
  );
}
