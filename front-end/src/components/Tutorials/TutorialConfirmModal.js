import { Button, Modal } from "react-bootstrap";

const configByType = {
  archive: {
    title: "Arquivar tutorial",
    description:
      "Este tutorial sairá da listagem pública e ficará disponível apenas no filtro de arquivados.",
    buttonLabel: "Arquivar",
    variant: "danger",
  },
  deletePermanent: {
    title: "Excluir definitivamente",
    description:
      "Esta ação remove o tutorial do banco de dados e nao pode ser desfeita.",
    buttonLabel: "Excluir definitivamente",
    variant: "danger",
  },
};

export function TutorialConfirmModal({
  action,
  isSubmiting,
  onCancel,
  onConfirm,
}) {
  const config = configByType[action?.type] || configByType.archive;

  return (
    <Modal show={Boolean(action)} onHide={onCancel} centered>
      <Modal.Header closeButton={!isSubmiting}>
        <Modal.Title>{config.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Tutorial: <strong>{action?.tutorial?.title}</strong>
        </p>
        <p className="mb-0">{config.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={isSubmiting}>
          Cancelar
        </Button>
        <Button
          variant={config.variant}
          onClick={onConfirm}
          disabled={isSubmiting}
        >
          {config.buttonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
