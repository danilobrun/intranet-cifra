import { useEffect } from "react";
import { LayoutPortal } from "../../components/LayoutPortal";
import { getUsers } from "../../services/Users.service";
import { useState } from "react";
import { Alert, Table } from "react-bootstrap";
import styled from "styled-components";
import { selectUser } from "../../store/User/User.selectors";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";
import {
  faBriefcase,
  faBuilding,
  faEnvelope,
  faMagnifyingGlass,
  faMapMarkerAlt,
  faPhone,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const getWhatsappLink = (phoneNumber) => {
  const digits = String(phoneNumber || "").replace(/\D/g, "");
  const normalizedDigits = digits.startsWith("0") ? digits.slice(1) : digits;

  if (!normalizedDigits) {
    return "";
  }

  const hasCountryCode =
    normalizedDigits.startsWith("55") && normalizedDigits.length >= 12;
  const hasBrazilianAreaCode =
    normalizedDigits.length === 10 || normalizedDigits.length === 11;

  if (!hasCountryCode && !hasBrazilianAreaCode) {
    return "";
  }

  const phoneWithCountryCode = hasCountryCode
    ? normalizedDigits
    : `55${normalizedDigits}`;

  return `https://wa.me/${phoneWithCountryCode}`;
};

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
      user.lotation?.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        const filteredUsers = data.filter(
          (user) => user.name?.toLowerCase() !== "admin",
        );
        setUsers(filteredUsers);
      } catch {
        setErrorMsg(
          "Falha ao buscar agenda. Recarregue a pagina. Caso o erro persista entre em contato com administrador Danilo Brun.",
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
              <SearchField>
                <SearchIcon icon={faMagnifyingGlass} />
                <Input
                  type="text"
                  placeholder="Pesquisar"
                  aria-label="Pesquisar contatos da agenda"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </SearchField>
            </DivHeader>
            <TableCard>
              <TableScroll>
                <DiaryTable $wide={isAdmin} aria-busy={loading}>
                  <thead>
                    <tr>
                      <th>
                        <ColumnTitle>
                          <HeaderIcon icon={faUser} />
                          Nome
                        </ColumnTitle>
                      </th>
                      <th>
                        <ColumnTitle>
                          <HeaderIcon icon={faEnvelope} />
                          Email
                        </ColumnTitle>
                      </th>
                      <th>
                        <ColumnTitle>
                          <HeaderIcon icon={faPhone} />
                          Telefone Funcional
                        </ColumnTitle>
                      </th>
                      {isAdmin && (
                        <th>
                          <ColumnTitle>
                            <HeaderIcon icon={faPhone} />
                            Telefone Pessoal
                          </ColumnTitle>
                        </th>
                      )}
                      <th>
                        <ColumnTitle>
                          <HeaderIcon icon={faBriefcase} />
                          Função
                        </ColumnTitle>
                      </th>
                      <th>
                        <ColumnTitle>
                          <HeaderIcon icon={faMapMarkerAlt} />
                          Estado
                        </ColumnTitle>
                      </th>
                      <th>
                        <ColumnTitle>
                          <HeaderIcon icon={faBuilding} />
                          Lotação
                        </ColumnTitle>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <TableSkeletonRows
                        columns={visibleColumnCount}
                        rows={5}
                        actionColumnIndex={null}
                      />
                    ) : filteredUsers.length ? (
                      filteredUsers.map((user) => {
                        const whatsappLink = getWhatsappLink(user.number);

                        return (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              {whatsappLink ? (
                                <WhatsappLink
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Iniciar conversa no WhatsApp com ${user.name}`}
                                >
                                  {user.number}
                                </WhatsappLink>
                              ) : (
                                user.number
                              )}
                            </td>
                            {isAdmin && <td>{user.personalNumber}</td>}
                            <td>{user.function}</td>
                            <td>{user.state}</td>
                            <td>{user.lotation}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <EmptyCell colSpan={visibleColumnCount}>
                          Nenhum contato encontrado.
                        </EmptyCell>
                      </tr>
                    )}
                  </tbody>
                </DiaryTable>
              </TableScroll>
            </TableCard>
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
  margin-bottom: 12px;
`;

const SearchField = styled.div`
  position: relative;
  width: min(340px, 100%);
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
  min-height: 40px;
  padding: 9px 16px 9px 42px;
  border-radius: 10px;
  border: 1px solid #ced4da;
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

const TableCard = styled.section`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(33, 37, 41, 0.08);
  overflow: hidden;
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const DiaryTable = styled(Table)`
  width: 100%;
  min-width: ${(props) => (props.$wide ? "1120px" : "960px")};
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    background: linear-gradient(180deg, #7b838a 0%, #6c757d 100%);
    color: #ffffff;
    border: 0;
    padding: 0.95rem 0.9rem;
    font-size: 0.86rem;
    font-weight: 700;
    vertical-align: middle;
    white-space: nowrap;
  }

  thead th:first-child {
    border-top-left-radius: 6px;
  }

  thead th:last-child {
    border-top-right-radius: 6px;
  }

  tbody td {
    padding: 1rem 0.9rem;
    color: #343a40;
    border-top: 0;
    border-bottom: 1px solid #edf0f2;
    vertical-align: middle;
    background: #ffffff;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover td {
    background: #f8f9fa;
  }

  @media (max-width: 575.98px) {
    min-width: ${(props) => (props.$wide ? "1040px" : "880px")};

    thead th,
    tbody td {
      padding: 0.75rem;
      font-size: 0.86rem;
      line-height: 1.35;
    }
  }
`;

const ColumnTitle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  line-height: 1.2;
`;

const HeaderIcon = styled(FontAwesomeIcon)`
  color: #ffffff;
  font-size: 0.85rem;
  opacity: 0.9;
`;

const WhatsappLink = styled.a`
  color: #198754;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    color: #146c43;
    text-decoration: underline;
  }

  &:focus {
    border-radius: 4px;
    outline: 2px solid rgba(25, 135, 84, 0.35);
    outline-offset: 2px;
  }
`;

const EmptyCell = styled.td`
  color: #6c757d;
  text-align: center;
`;
