import { useState } from "react";
import { toast } from "react-toastify";
import { deleteUser } from "../../services/Users.service";
import { Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

export function TableUsers({ users, onDeleteUser }) {
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
      toast.error("Falha ao deleter usuário. Tente novamente.");
      setIsSubmiting(false);
    }
    hideModal();
  };
  return (
    <>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Telefone</th>
          </tr>
        </thead>
        <tbody>
          {users ? (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.number}</td>
                <td>
                  <Button size="sm" as={Link} to={`/portal/users/${user._id}`}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="ms-sm-1"
                    onClick={() => handleClick(user)}
                  >
                    Deletar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>Erro ao carregar usuários</td>
            </tr>
          )}
        </tbody>
      </Table>
      <Modal show={userToDelete} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tem certeza?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ao clicar em confirmar, o usuário{" "}
          <strong>{userToDelete?.name}</strong> será excluído. Deseja realmente
          remover o portal?
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
            Deletar Usuario
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
