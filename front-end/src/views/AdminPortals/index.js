import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { getAdminPortals } from "../../services/Portals.service";
import { Loading } from "../../components/Loading";
import { TablePortals } from "./TablePortals";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export function AdminPortalsView() {
  const [portals, setPortals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const fecthPortals = async () => {
    try {
      const data = await getAdminPortals();
      console.log(data);
      setPortals(data);
    } catch {
      toast.error("Falha ao buscar portais. Recarregue a página.");
    }
    setLoading(false);
  };
  useEffect(() => {
    fecthPortals();
  }, []);

  const normalizedSearch = input.trim().toLowerCase();
  const filteredPortals = portals.filter((portal) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      portal.name?.toLowerCase().includes(normalizedSearch) ||
      portal.responsible?.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <LayoutPortal>
      <div className="d-flex align-items-center justify-content-between">
        <PortalHeader
          title="🌐 Portais Cadastrados"
          buttonText="Novo portal"
          buttonLink="/portal/portals/cadastro"
        />
        <SearchField>
          <SearchIcon icon={faMagnifyingGlass} />
          <Input
            type="text"
            placeholder="Pesquisar portal"
            aria-label="Pesquisar portal"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </SearchField>
      </div>
      {loading && <Loading />}
      <TablePortals portals={filteredPortals} onDeletePortal={fecthPortals} />
    </LayoutPortal>
  );
}

const SearchField = styled.div`
  position: relative;
  width: min(340px, 100%);
  margin-left: 16px;

  @media (max-width: 767.98px) {
    width: 100%;
    margin-left: 0;
    margin-top: 12px;
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
