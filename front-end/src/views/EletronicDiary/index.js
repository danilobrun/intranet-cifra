import { useEffect } from "react";
import { LayoutPortal } from "../../components/LayoutPortal";
import { getUsers } from "../../services/Users.service";
import { useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";
import styled from "styled-components";
import { selectUser } from "../../store/User/User.selectors";
import { useSelector } from "react-redux";

export function EletronicDiary() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState();
  const userToken = useSelector(selectUser);
  const isAdmin = userToken?.roles?.[0]?.code === "1";
  const visibleColumnCount = isAdmin ? 7 : 6;
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.number?.includes(search.toLowerCase()) ||
      user.personalNumber?.includes(search.toLowerCase()) ||
      user.function?.toLowerCase().includes(search.toLowerCase()) ||
      user.state?.toLowerCase().includes(search.toLowerCase()) ||
      user.lotation?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        const filteredUsers = data.filter(
          (user) => user.name?.toLowerCase() !== "admin"
        );
        setUsers(filteredUsers);
      } catch {
        setErrorMsg(
          "Falha ao buscar agenda. Recarregue a pagina. Caso o erro persista entre em contato com administrador Danilo Brun."
        );
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);
  return (
    <LayoutPortal>
      <DivContainer>
        {errorMsg ? (
          <Alert variant="danger" className="mt-3">
            {errorMsg}
          </Alert>
        ) : (
          <>
            <DivHeader>
              <h2>☎️ Agenda Eletrônica</h2>
              <Input
                type="text"
                placeholder="Pesquisar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </DivHeader>
            <Table striped responsive className="mt-3">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone Funcional</th>
                  {isAdmin && <th>Telefone Pessoal</th>}
                  <th>Função</th>
                  <th>Estado</th>
                  <th>Lotação</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={visibleColumnCount} className="text-center">
                      <Spinner animation="border" />
                    </td>
                  </tr>
                ) : filteredUsers.length ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.number}</td>
                      {isAdmin && <td>{user.personalNumber}</td>}
                      <td>{user.function}</td>
                      <td>{user.state}</td>
                      <td>{user.lotation}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumnCount} className="text-center">
                      Nenhum contato encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </DivContainer>
    </LayoutPortal>
  );
}

const DivContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 72px);
  padding: 1.5rem 0 2rem;
`;

const DivHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Input = styled.input`
  width: min(320px, 100%);
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 0.375rem;
  border: 1px solid #ced4da;
  outline: none;

  &:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
  }
`;
