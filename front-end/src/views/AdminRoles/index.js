import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { getRoles } from "../../services/Roles.service";
import { TableRoles } from "./TableRoles";

export function AdminRolesView() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");

  const fetchRoles = useCallback(async () => {
    const data = await getRoles();
    setRoles(data);
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await fetchRoles();
      } catch {
        toast.error("Falha ao buscar roles. Recarregue a pagina.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchRoles]);

  const filteredRoles = roles.filter((role) => {
    const normalizedSearch = input.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return (
      role.cargo?.toLowerCase().includes(normalizedSearch) ||
      role.code?.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <LayoutPortal>
      <PortalHeader
        title="Roles e portais liberados"
        description="Gerencie roles e defina quais portais cada perfil pode acessar."
        buttonText="Nova role"
        buttonLink="/portal/roles/cadastro"
      >
        <SearchField>
          <SearchIcon icon={faMagnifyingGlass} />
          <SearchInput
            type="text"
            placeholder="Pesquisar role"
            aria-label="Pesquisar role"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </SearchField>
      </PortalHeader>

      <TableRoles
        roles={filteredRoles}
        isLoading={loading}
        onDeleteRole={fetchRoles}
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

const SearchInput = styled.input`
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
