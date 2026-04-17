import { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { deleteRole } from "../../services/Roles.service";

const formatRolePortalPreview = (portals = []) => {
  if (!portals.length) {
    return "Nenhum portal liberado";
  }

  const portalNames = portals.slice(0, 3).map((portal) => portal.name);
  const remainingCount = portals.length - portalNames.length;

  if (remainingCount > 0) {
    return `${portalNames.join(", ")} +${remainingCount}`;
  }

  return portalNames.join(", ");
};

export function TableRoles({
  roles,
  onManageRole,
  onEditRole,
  onDeleteRole,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState();

  const hideModal = () => setRoleToDelete(undefined);

  const handleDelete = async () => {
    try {
      setIsSubmiting(true);
      await deleteRole(roleToDelete._id);
      await onDeleteRole();
      toast.success("Role deletada com sucesso.");
    } catch (error) {
      toast.error(error.message || "Falha ao deletar role. Tente novamente.");
    }

    setIsSubmiting(false);
    hideModal();
  };

  return (
    <>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Cargo</th>
            <th>Code</th>
            <th>Portais liberados</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {roles.length ? (
            roles.map((role) => (
              <tr key={role._id}>
                <td>{role.cargo}</td>
                <td>{role.code}</td>
                <td>{formatRolePortalPreview(role.portals)}</td>
                <td className="d-grid gap-1 d-sm-table-cell">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="me-sm-1"
                    onClick={() => onManageRole(role)}
                  >
                    Configurar portais
                  </Button>
                  <Button size="sm" onClick={() => onEditRole(role)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="ms-sm-1"
                    onClick={() => setRoleToDelete(role)}
                  >
                    Deletar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>Nenhuma role encontrada.</td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal show={Boolean(roleToDelete)} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tem certeza?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ao clicar em confirmar, a role <strong>{roleToDelete?.cargo}</strong>{" "}
          sera excluida. Deseja realmente remover essa role?
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
            Deletar role
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
