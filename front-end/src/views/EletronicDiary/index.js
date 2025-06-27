import { useEffect } from "react";
import { Layout } from "../../components/Layout";
import { getUsers } from "../../services/Users.service";
import { useState } from "react";
import { Alert, Container, Spinner, Table } from "react-bootstrap";
import styled from "styled-components";
import { selectUser } from "../../store/User/User.selectors";
import { useSelector } from "react-redux";

export function EletronicDiary() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState();
  const userToken = useSelector(selectUser);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        console.log(data);
        const filteredUsers = data.filter(
          (user) => user.name?.toLowerCase() !== "admin"
        );
        setUsers(filteredUsers);
      } catch {
        setErrorMsg(
          "Falha ao buscar portais. Recarregue a página. Caso o erro persista entre em contato com administrador Danilo Brun."
        );
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);
  return (
    <Layout>
      <Container>
        {errorMsg ? (
          <Alert variant="danger" className="mt-3">
            {errorMsg}
          </Alert>
        ) : (
          <>
            <DivContainer>
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
                    {userToken.roles[0].code === "1" && (
                      <th>Telefone Pessoal</th>
                    )}
                    <th>Função</th>
                    <th>Estado</th>
                    <th>Lotação</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        <Spinner animation="border" />
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter(
                        (user) =>
                          user.name
                            ?.toLowerCase()
                            .includes(search.toLowerCase()) ||
                          user.email
                            ?.toLowerCase()
                            .includes(search.toLowerCase()) ||
                          user.number?.includes(search.toLowerCase()) ||
                          user.personalNumber?.includes(search.toLowerCase()) ||
                          user.function
                            ?.toLowerCase()
                            .includes(search.toLowerCase()) ||
                          user.state
                            ?.toLowerCase()
                            .includes(search.toLowerCase()) ||
                          user.lotation
                            ?.toLowerCase()
                            .includes(search.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.number}</td>
                          {userToken.roles[0].code === "1" && (
                            <td>{user.personalNumber}</td>
                          )}
                          <td>{user.function}</td>
                          <td>{user.state}</td>
                          <td>{user.lotation}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </Table>
            </DivContainer>
          </>
        )}
      </Container>
    </Layout>
  );
}

const DivContainer = styled.div`
  padding: 2rem 0;
`;

const DivHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Input = styled.input`
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid black;
  outline: none;
  width: 300px;
`;
