import { Modal, Table } from "react-bootstrap";
import { Loading } from "../../components/Loading";

const actionLabels = {
  CREATE: "Cadastro",
  UPDATE: "Atualização",
  DELETE: "Inativação",
  RESTORE: "Reativação",
};

const fieldLabels = {
  deletedAt: "inativadoEm",
  deletedBy: "inativadoPor",
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  return String(value);
};

const getUserLabel = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  return user.name || user.email || "-";
};

const getFieldLabel = (field) => fieldLabels[field] || field;

const formatChangeValue = (change, movement, value) => {
  if (change.field === "deletedAt") {
    return formatDate(value);
  }

  if (change.field === "deletedBy") {
    return value ? getUserLabel(movement.changedBy) : "-";
  }

  return formatValue(value);
};

const formatChanges = (movement) => {
  const changes = Array.isArray(movement.changes) ? movement.changes : [];
  const visibleChanges =
    movement.action === "RESTORE"
      ? changes.filter((change) => change.field === "status")
      : changes;

  if (!visibleChanges.length) {
    return "Sem alterações detalhadas.";
  }

  return (
    <div className="d-grid gap-1">
      {visibleChanges.map((change, index) => (
        <div key={`${change.field}-${index}`}>
          <strong>{getFieldLabel(change.field)}:</strong>{" "}
          {formatChangeValue(change, movement, change.from)} {" -> "}
          {formatChangeValue(change, movement, change.to)}
        </div>
      ))}
    </div>
  );
};

export function PlateMovementsModal({
  show,
  plate,
  movements,
  isLoading,
  onHide,
}) {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton={!isLoading}>
        <Modal.Title>Histórico da placa {plate?.placa}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <Loading />
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Ação</th>
                <th>Responsável</th>
                <th>Data</th>
                <th>Alterações</th>
              </tr>
            </thead>
            <tbody>
              {movements.length ? (
                movements.map((movement) => (
                  <tr key={movement._id}>
                    <td>{actionLabels[movement.action] || movement.action}</td>
                    <td>{getUserLabel(movement.changedBy)}</td>
                    <td>{formatDate(movement.changedAt)}</td>
                    <td>{formatChanges(movement)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>Nenhuma movimentação encontrada.</td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
}
