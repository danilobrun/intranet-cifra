import { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { deleteRole } from "../../services/Roles.service";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faCode,
  faGear,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";

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
  isLoading = false,
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
      <TableCard>
        <TableScroll>
          <RolesTable aria-busy={isLoading}>
            <thead>
              <tr>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faBriefcase} />
                    Cargo
                  </ColumnTitle>
                </th>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faCode} />
                    Code
                  </ColumnTitle>
                </th>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faLink} />
                    Portais liberados
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
              ) : roles.length ? (
                roles.map((role) => (
                  <tr key={role._id}>
                    <td>{role.cargo}</td>
                    <td>{role.code}</td>
                    <td>{formatRolePortalPreview(role.portals)}</td>
                    <td>
                      <ActionGroup>
                        <Button
                          size="sm"
                          variant="secondary"
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
                          onClick={() => setRoleToDelete(role)}
                        >
                          Deletar
                        </Button>
                      </ActionGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <EmptyCell colSpan={4}>Nenhuma role encontrada.</EmptyCell>
                </tr>
              )}
            </tbody>
          </RolesTable>
        </TableScroll>
      </TableCard>

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

const RolesTable = styled(Table)`
  width: 100%;
  min-width: 920px;
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
    min-width: 840px;

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

const ActionGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const EmptyCell = styled.td`
  color: #6c757d;
  text-align: center;
`;
