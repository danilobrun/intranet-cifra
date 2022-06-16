import { useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { deletePortal } from "../../services/Portals.service";

export function TablePortals ({ portals, onDeletePortal }) {
    const [portalToDelete, setPortalToDelete] = useState() /*guarda o estado valor do portal a ser deletado*/
    const hideModal = () => setPortalToDelete(undefined) /*esconder o modal*/
    const handleClick = (portal) => { /*fun para guardar os dados do portal*/
        setPortalToDelete(portal) /*recebe o portal clicado*/
    }
    const handleDelete = async () => { /*deleta o portal via API REST*/
        try {
            await deletePortal(portalToDelete.id)
            await onDeletePortal()
            toast.success('Portal deletado com sucesso.')
        } catch {
            toast.error('Falha ao deleter portal. Tente novamente.')
        }
        hideModal()
    }
    return (
        <>
            <Table striped hover responsive>
                <thead>
                    <tr>
                        <th>*</th>
                        <th>Nome</th>
                        <th>Responável</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {portals.map(portal => (
                        <tr key={portal.id}>
                            <td>{portal.id}</td>
                            <td>{portal.name}</td>
                            <td>{portal.responsible}</td>
                            <td className="d-grid gap-1 d-sm-table-cell">
                                <Button
                                    size="sm"
                                    as={Link}
                                    to={`/portal/portals/${portal.id}`}
                                >Editar</Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    className="ms-sm-1"
                                    onClick={() => handleClick(portal)}
                                >Deletar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal show={portalToDelete} onHide={hideModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Tem certeza?</Modal.Title>
                </Modal.Header>
                <Modal.Body>Ao clicar em confirmar, o portal <strong>{portalToDelete?.name}</strong> será excluído.
                Deseja realmente remover o portal?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModal}>Cancelar</Button>
                    <Button variant="danger" onClick={handleDelete}>Deletar portal</Button>
                </Modal.Footer>
            </Modal>
        </>
    )

}