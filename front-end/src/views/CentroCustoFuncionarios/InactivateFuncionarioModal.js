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
        <Modal.Title>Inativar funcionario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Ao confirmar, <strong>{funcionario?.nome}</strong> nao sera excluido do
        sistema, apenas inativado e deixara de aparecer na listagem de ativos.
        Deseja continuar?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Inativando..." : "Inativar funcionario"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
