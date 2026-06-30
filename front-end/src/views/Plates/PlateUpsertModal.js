import { Button, Modal } from "react-bootstrap";
import { Loading } from "../../components/Loading";
import { PlateForm } from "./PlateForm";

const titleByMode = {
  create: "Nova placa",
  edit: "Editar placa",
};

const buttonLabelByMode = {
  create: "Cadastrar",
  edit: "Salvar alterações",
};

export function PlateUpsertModal({
  show,
  mode,
  initialValue,
  isLoading,
  isSubmiting,
  onHide,
  onSubmit,
}) {
  const isEditMode = mode === "edit";
  const title = isEditMode ? titleByMode.edit : titleByMode.create;
  const buttonLabel = isEditMode
    ? buttonLabelByMode.edit
    : buttonLabelByMode.create;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmiting && !isLoading}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <Loading />
        ) : (
          <PlateForm
            mode={mode}
            initialValue={initialValue}
            buttonLabel={buttonLabel}
            isSubmittingExternal={isSubmiting}
            onSubmit={onSubmit}
          />
        )}
      </Modal.Body>
      {!isLoading ? (
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={onHide}
            disabled={isSubmiting || isLoading}
          >
            Cancelar
          </Button>
        </Modal.Footer>
      ) : null}
    </Modal>
  );
}
