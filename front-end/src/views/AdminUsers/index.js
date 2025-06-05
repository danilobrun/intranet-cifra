import { useState } from "react";
import { LayoutPortal } from "../../components/LayoutPortal";
import { UsersHeader } from "../../components/UsersHeader";
import { TableUsers } from "./TableUsers";
import { useEffect } from "react";
import { getUsers } from "../../services/Users.service";
import { toast } from "react-toastify";
import { Loading } from "../../components/Loading";
import styled from "styled-components";

export function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
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
      <div className="d-flex align-items-center justify-content-between">
        <UsersHeader
          title="Usuários Cadastrados"
          buttonText="Novo usuário"
          buttonLink="/portal/admin-login"
        />
        <Input
          type="text"
          placeholder="Pesquisar usuário"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      {loading && <Loading />}
      <TableUsers
        users={users.filter(
          (user) =>
            user.name?.toLowerCase().includes(input) ||
            user.email?.toLowerCase().includes(input) ||
            user.number?.includes(input)
        )}
        onDeleteUser={fecthUsers}
      />
    </LayoutPortal>
  );
}

const Input = styled.input`
  padding: 5px 15px;
  width: 300px;
  outline: none;
`;
