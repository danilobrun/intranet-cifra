import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { forwardRef } from "react";
import { Dropdown, Table } from "react-bootstrap";

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

const ActionMenuToggle = forwardRef(
  ({ onClick, "aria-label": ariaLabel }, ref) => (
    <button
      type="button"
      ref={ref}
      className="btn btn-sm btn-light border-0"
      aria-label={ariaLabel}
      onClick={(event) => {
        event.preventDefault();
        onClick(event);
      }}
    >
      <FontAwesomeIcon icon={faEllipsisVertical} />
    </button>
  ),
);

export function PlatesTable({
  plates,
  onViewMovements,
  onEditPlate,
  onDeactivatePlate,
  canDeactivatePlate = false,
}) {
  return (
    <Table striped hover responsive style={{ tableLayout: "fixed" }}>
      <colgroup>
        <col style={{ width: "96px" }} />
        <col />
        <col />
        <col style={{ width: "120px" }} />
        <col style={{ width: "72px" }} />
        <col style={{ width: "80px" }} />
        <col style={{ width: "175px" }} />
        <col style={{ width: "120px" }} />
        <col />
      </colgroup>
      <thead style={{ borderTop: 0 }}>
        <tr>
          <th className="text-nowrap">Placa</th>
          <th>Condutor</th>
          <th>Contrato</th>
          <th>Estado</th>
          <th>CRLV</th>
          <th>Status</th>
          <th>Última atualização</th>
          <th>Responsável</th>
          <th>
            <span className="visually-hidden">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {plates.length ? (
          plates.map((plate) => (
            <tr key={plate._id}>
              <td className="text-nowrap">{plate.placa}</td>
              <td>{plate.condutor || "-"}</td>
              <td>{plate.contrato || "-"}</td>
              <td>{plate.estado || "-"}</td>
              <td>{plate.crlv || "-"}</td>
              <td>{plate.status || "-"}</td>
              <td>{formatDate(plate.updatedAt)}</td>
              <td>{getUserLabel(plate.responsavel)}</td>
              <td className="text-end">
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as={ActionMenuToggle}
                    aria-label={`Abrir acoes da placa ${plate.placa}`}
                  />

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => onViewMovements(plate)}>
                      Histórico
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => onEditPlate(plate)}>
                      Editar
                    </Dropdown.Item>
                    {canDeactivatePlate ? (
                      <Dropdown.Item
                        className="text-danger"
                        onClick={() => onDeactivatePlate(plate)}
                      >
                        Inativar
                      </Dropdown.Item>
                    ) : null}
                  </Dropdown.Menu>
                </Dropdown>
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
