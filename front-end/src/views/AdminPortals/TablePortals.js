import { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { deletePortal } from "../../services/Portals.service";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faTag, faUser } from "@fortawesome/free-solid-svg-icons";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";

export function TablePortals({ portals, isLoading = false, onDeletePortal }) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [portalToDelete, setPortalToDelete] =
    useState(); /*guarda o estado valor do portal a ser deletado*/
  const hideModal = () => setPortalToDelete(undefined); /*esconder o modal*/
  const handleClick = (portal) => {
    /*fun para guardar os dados do portal*/
    setPortalToDelete(portal); /*recebe o portal clicado*/
  };
  const handleDelete = async () => {
    /*deleta o portal via API REST*/
    try {
      setIsSubmiting(true);
      await deletePortal(portalToDelete._id);
      await onDeletePortal();
      toast.success("Portal deletado com sucesso.");
      setIsSubmiting(false);
    } catch {
      toast.error("Falha ao deleter portal. Tente novamente.");
      setIsSubmiting(false);
    }
    hideModal();
  };
  return (
    <>
      <TableCard>
        <TableScroll>
          <PortalsTable aria-busy={isLoading}>
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "40%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faTag} />
                    Nome
                  </ColumnTitle>
                </th>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faUser} />
                    Responsável
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
                <TableSkeletonRows columns={3} />
              ) : portals.length ? (
                portals.map((portal) => (
                  <tr key={portal._id}>
                    <td>{portal.name}</td>
                    <td>{portal.responsible}</td>
                    <td>
                      <ActionGroup>
                        <Button
                          size="sm"
                          as={Link}
                          to={`/portal/portals/${portal._id}`}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleClick(portal)}
                        >
                          Deletar
                        </Button>
                      </ActionGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <EmptyCell colSpan={3}>Nenhum portal encontrado.</EmptyCell>
                </tr>
              )}
            </tbody>
          </PortalsTable>
        </TableScroll>
      </TableCard>
      <Modal show={portalToDelete} onHide={hideModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tem certeza?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ao clicar em confirmar, o portal{" "}
          <strong>{portalToDelete?.name}</strong> será excluído. Deseja
          realmente remover o portal?
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
            Deletar portal
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

const PortalsTable = styled(Table)`
  width: 100%;
  min-width: 720px;
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
    min-width: 640px;

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
