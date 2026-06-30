import { Button, Modal } from "react-bootstrap";

export function RestorePlateModal({
  show,
  plate,
  isSubmiting,
  onHide,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmiting}>
        <Modal.Title>Reativar placa</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Ao confirmar, a placa <strong>{plate?.placa}</strong> voltara para a
        listagem principal de placas ativas. Deseja continuar?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmiting}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={isSubmiting}>
          Reativar placa
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
