import { Button, Modal } from "react-bootstrap";
import styled, { createGlobalStyle } from "styled-components";

export function EventDeleteConfirmModal({
  event,
  isSubmitting,
  show,
  onCancel,
  onConfirm,
}) {
  return (
    <>
      <DeleteModalBackdropStyle />
      <DeleteModal
        show={show}
        onHide={onCancel}
        centered
        backdropClassName="agenda-event-delete-backdrop"
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>Excluir evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tem certeza que deseja excluir este evento? Esta ação é permanente e
            não poderá ser desfeita.
          </p>
          <p className="mb-0">
            Evento: <strong>{event?.titulo || "-"}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Excluindo..." : "Excluir"}
          </Button>
        </Modal.Footer>
      </DeleteModal>
    </>
  );
}

const DeleteModalBackdropStyle = createGlobalStyle`
  .agenda-event-delete-backdrop.modal-backdrop {
    z-index: 2190;
  }
`;

const DeleteModal = styled(Modal)`
  z-index: 2200;
`;
