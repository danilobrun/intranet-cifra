import { Alert, Button, Modal } from "react-bootstrap";

const getBlockMessage = (blockReason) => {
  if (!blockReason) {
    return "";
  }

  const funcionariosEmUso = Number(blockReason.funcionariosEmUso || 0);
  const movimentacoesEmUso = Number(blockReason.movimentacoesEmUso || 0);
  const messages = [];

  if (funcionariosEmUso) {
    messages.push(`${funcionariosEmUso} funcionário(s) vinculado(s)`);
  }

  if (movimentacoesEmUso) {
    messages.push(`${movimentacoesEmUso} movimentação(ões) vinculada(s)`);
  }

  return messages.length
    ? `Motivo do bloqueio: ${messages.join(" e ")}.`
    : "O centro de custo está em uso.";
};

export function DeleteCentroCustoModal({
  show,
  centroCusto,
  isSubmitting,
  blockReason,
  onHide,
  onConfirm,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmitting}>
        <Modal.Title>Excluir centro de custo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          Ao confirmar, <strong>{centroCusto?.nome}</strong> será excluído
          fisicamente do cadastro de centros de custo.
        </p>
        <Alert variant="warning" className="mb-0">
          A exclusão será bloqueada se houver funcionários ou movimentações
          vinculadas a este centro.
        </Alert>
        {blockReason ? (
          <Alert variant="danger" className="mt-3 mb-0">
            {getBlockMessage(blockReason)}
          </Alert>
        ) : null}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Excluindo..." : "Excluir centro"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
