import { useState } from "react";
import { toast } from "react-toastify";
import { deleteUser } from "../../services/Users.service";
import { Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faGear,
  faPen,
  faPhone,
  faTrash,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";
import {
  TableActionCell,
  TableIconAction,
} from "../../components/TableActions";

export function TableUsers({ users, isLoading = false, onDeleteUser }) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [userToDelete, setUserToDelete] = useState();

  const hideModal = () => setUserToDelete(undefined);

  const handleClick = (user) => {
    setUserToDelete(user);
  };

  const handleDelete = async () => {
    try {
      setIsSubmiting(true);
      await deleteUser(userToDelete._id);
      await onDeleteUser();
      toast.success("Usuário deletado com sucesso.");
      setIsSubmiting(false);
    } catch {
      toast.error("Falha ao deletar usuário. Tente novamente.");
      setIsSubmiting(false);
    }
    hideModal();
  };

  return (
    <>
      <TableCard>
        <TableScroll>
          <UsersTable aria-busy={isLoading}>
            <colgroup>
              <col style={{ width: "28%" }} />
              <col style={{ width: "34%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
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
                    E-mail
                  </ColumnTitle>
                </th>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faPhone} />
                    Telefone
                  </ColumnTitle>
                </th>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faGear} />
                    Ações
                  </ColumnTitle>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows columns={4} />
              ) : users.length ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.number}</td>
                    <td>
                      <TableActionCell>
                        <TableIconAction
                          as={Link}
                          to={`/portal/users/${user._id}`}
                          title="Editar"
                          aria-label={`Editar ${user.name}`}
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </TableIconAction>
                        <TableIconAction
                          type="button"
                          title="Excluir"
                          aria-label={`Excluir ${user.name}`}
                          $variant="danger"
                          onClick={() => handleClick(user)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </TableIconAction>
                      </TableActionCell>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <EmptyCell colSpan={4}>Nenhum usuário encontrado.</EmptyCell>
                </tr>
              )}
            </tbody>
          </UsersTable>
        </TableScroll>
      </TableCard>
      <Modal show={Boolean(userToDelete)} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tem certeza?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ao clicar em confirmar, o usuário{" "}
          <strong>{userToDelete?.name}</strong> será excluído. Deseja realmente
          remover esse usuário?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideModal}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={isSubmiting}
            onClick={handleDelete}
          >
            Deletar usuário
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

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

const UsersTable = styled(Table)`
  width: 100%;
  min-width: 760px;
  margin-bottom: 0;
  table-layout: fixed;
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
    overflow: hidden;
    text-overflow: ellipsis;
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
    overflow-wrap: anywhere;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover td {
    background: #f8f9fa;
  }

  @media (max-width: 575.98px) {
    min-width: 680px;

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

const EmptyCell = styled.td`
  color: #6c757d;
  text-align: center;
`;
