import { Button, Table } from "react-bootstrap";

const formatDate = (value) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const getUserLabel = (user) => {
  if (!user) return "-";
  if (typeof user === "string") return user;

  return user.name || user.email || "-";
};

export function InactivePlatesTable({
  plates,
  onViewMovements,
  onRestorePlate,
}) {
  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>Placa</th>
          <th>Condutor</th>
          <th>Contrato</th>
          <th>Estado</th>
          <th>Inativada em</th>
          <th>Inativada por</th>
          <th>Responsavel pela ultima alteracao</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {plates.length ? (
          plates.map((plate) => (
            <tr key={plate._id}>
              <td>{plate.placa}</td>
              <td>{plate.condutor || "-"}</td>
              <td>{plate.contrato || "-"}</td>
              <td>{plate.estado || "-"}</td>
              <td>{formatDate(plate.deletedAt)}</td>
              <td>{getUserLabel(plate.deletedBy)}</td>
              <td>{getUserLabel(plate.responsavel)}</td>
              <td className="d-grid gap-1 d-xl-table-cell">
                <Button
                  size="sm"
                  variant="secondary"
                  className="me-xl-1"
                  onClick={() => onViewMovements(plate)}
                >
                  Historico
                </Button>
                <Button size="sm" onClick={() => onRestorePlate(plate)}>
                  Reativar
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr className="text-center">
            <td colSpan={8}>Nenhuma placa inativa encontrada.</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
