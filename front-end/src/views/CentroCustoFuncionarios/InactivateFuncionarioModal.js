import { Button, Modal } from "react-bootstrap";

export function InactivateFuncionarioModal({
  show,
  funcionario,
  isSubmitting,
  onHide,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>Inativar funcionário</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Ao confirmar, <strong>{funcionario?.nome}</strong> não será excluído do
        sistema, apenas inativado e deixará de aparecer na listagem de ativos.
        Deseja continuar?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Inativando..." : "Inativar funcionário"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
