import { useState } from "react";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { TableUsers } from "./TableUsers";
import { useEffect } from "react";
import { getUsers } from "../../services/Users.service";
import { toast } from "react-toastify";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

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

  const normalizedSearch = input.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      user.name?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch) ||
      String(user.number || "")
        .toLowerCase()
        .includes(normalizedSearch) ||
      user.function?.toLowerCase().includes(normalizedSearch) ||
      user.state?.toLowerCase().includes(normalizedSearch) ||
      user.lotation?.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <LayoutPortal>
      <PortalHeader
        title="Usuários Cadastrados"
        buttonText="Novo usuário"
        buttonLink="/portal/admin-login"
      >
        <SearchField>
          <SearchIcon icon={faMagnifyingGlass} />
          <Input
            type="text"
            placeholder="Pesquisar usuário"
            aria-label="Pesquisar usuario"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </SearchField>
      </PortalHeader>
      <TableUsers
        users={filteredUsers}
        isLoading={loading}
        onDeleteUser={fecthUsers}
      />
    </LayoutPortal>
  );
}

const SearchField = styled.div`
  position: relative;
  width: min(340px, 100%);
  flex: 0 1 340px;

  @media (max-width: 767.98px) {
    flex: 1 1 220px;
  }
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 16px;
  color: #6c757d;
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateY(-50%);
`;

const Input = styled.input`
  width: 100%;
  padding: 9px 16px 9px 42px;
  border: 1px solid #ced4da;
  border-radius: 10px;
  background: #ffffff;
  color: #212529;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &::placeholder {
    color: #6c757d;
  }

  &:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12);
  }
`;
