import { Alert, Button, Modal } from "react-bootstrap";

export function ApplyMovimentacaoModal({
  show,
  movimentacao,
  isSubmitting,
  onHide,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>Aplicar movimentação na folha</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Ao confirmar, a movimentação de{" "}
          <strong>{movimentacao?.nome || "funcionário"}</strong> será marcada
          como <strong>Aplicado na Folha</strong>.
        </p>

        <Alert variant="warning" className="mb-0">
          Essa ação também atualiza o centro de custo do funcionário na base de
          funcionários. Revise os dados antes de continuar.
        </Alert>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Aplicando..." : "Aplicar na folha"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
