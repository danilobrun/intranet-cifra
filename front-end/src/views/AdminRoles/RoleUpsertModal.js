import { Button, Modal } from "react-bootstrap";
import { UpsertRoleForm } from "../../components/UpsertRoleForm";
import { Loading } from "../../components/Loading";

const helperTextByMode = {
  create:
    "Apos criar a role, você poderá liberar ou bloquear portais na listagem de roles.",
  edit: "As permissões de portais atuais serão mantidas. Para ajusta-las, você também pode usar a ação Configurar portais na listagem.",
};

const titleByMode = {
  create: "Nova role",
  edit: "Editar role",
};

const buttonLabelByMode = {
  create: "Cadastrar",
  edit: "Salvar alteracoes",
};

export function RoleUpsertModal({
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
  const helperText = isEditMode
    ? helperTextByMode.edit
    : helperTextByMode.create;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton={!isSubmiting && !isLoading}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <Loading />
        ) : (
          <UpsertRoleForm
            initialValue={initialValue}
            buttonLabel={buttonLabel}
            helperText={helperText}
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
