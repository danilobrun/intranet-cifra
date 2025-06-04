import { useState } from "react";
import { LayoutPortal } from "../../components/LayoutPortal";
import { UsersHeader } from "../../components/UsersHeader";
import { TableUsers } from "./TableUsers";
import { useEffect } from "react";
import { getUsers } from "../../services/Users.service";
import { toast } from "react-toastify";
import { Loading } from "../../components/Loading";

export function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const fecthUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      toast.error("Falha ao buscar portais. Recarregue a página.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fecthUsers();
  }, []);
  return (
    <LayoutPortal>
      <UsersHeader
        title="Usuários Cadastrados"
        buttonText="Novo usuário"
        buttonLink="/portal/admin-login"
      />
      {loading && <Loading />}
      <TableUsers users={users} onDeleteUser={fecthUsers} />
    </LayoutPortal>
  );
}
