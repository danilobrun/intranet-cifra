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

export function PlatesTable({
  plates,
  onViewMovements,
  onEditPlate,
  onDeactivatePlate,
  canDeactivatePlate = false,
}) {
  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>Placa</th>
          <th>Condutor</th>
          <th>Contrato</th>
          <th>Estado</th>
          <th>CRLV</th>
          <th>Status</th>
          <th>Última atualização</th>
          <th>Responsável</th>
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
              <td>{plate.crlv || "-"}</td>
              <td>{plate.status || "-"}</td>
              <td>{formatDate(plate.updatedAt)}</td>
              <td>{getUserLabel(plate.responsavel)}</td>
              <td className="d-grid gap-1 d-xl-table-cell">
                <Button
                  size="sm"
                  variant="secondary"
                  className="me-xl-1"
                  onClick={() => onViewMovements(plate)}
                >
                  Histórico
                </Button>
                <Button
                  size="sm"
                  className="me-xl-1"
                  onClick={() => onEditPlate(plate)}
                >
                  Editar
                </Button>
                {canDeactivatePlate ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => onDeactivatePlate(plate)}
                  >
                    Inativar
                  </Button>
                ) : null}
              </td>
            </tr>
          ))
        ) : (
          <tr className="text-center">
            <td colSpan={9}>Nenhuma placa ativa encontrada.</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
