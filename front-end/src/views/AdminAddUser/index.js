import { useNavigate } from "react-router-dom";
import { createUser } from "../../services/Users.service";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { UpdateUserForm } from "../../components/UpdateUserForm";

export function AdminAddUserView() {
  const navigate = useNavigate();
  const handlesubmit = async (formData) => {
    try {
      await createUser(formData);
      toast.success("Usuário cadastrado com sucesso.");
      navigate("/portal/users");
    } catch (error) {
      toast.error(
        error.message || "Falha ao cadastrar usuário. Tente novamente.",
      );
    }
  };
  return (
    <LayoutPortal>
      <h1 className="mt-4">Novo Usuário</h1>
      <UpdateUserForm
        onSubmit={handlesubmit}
        buttonLabel="Cadastrar"
        type="create"
      />
    </LayoutPortal>
  );
}
