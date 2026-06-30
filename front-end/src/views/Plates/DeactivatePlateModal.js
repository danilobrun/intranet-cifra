import { Button, Modal } from "react-bootstrap";

export function DeactivatePlateModal({
  show,
  plate,
  isSubmiting,
  onHide,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmiting}>
        <Modal.Title>Inativar placa</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Ao confirmar, a placa <strong>{plate?.placa}</strong> será inativada e
        deixará de aparecer na listagem principal. Deseja continuar?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmiting}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isSubmiting}>
          Inativar placa
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
