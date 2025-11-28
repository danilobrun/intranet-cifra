import { Table } from "react-bootstrap";
import { contractsData } from "./data";

export function SergipeContractTab() {
  const pernamubucoData = contractsData.filter(
    (data) => data.state === "Sergipe"
  );
  return (
    <div>
      <Table striped hover>
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Gerente</th>
            <th>Vigência</th>
            <th>Cliente</th>
          </tr>
        </thead>
        <tbody>
          {pernamubucoData.map((contract, index) =>
            contract.projects.map((project, idx) => (
              <tr key={`${index}-${idx}`}>
                <td>{project.name}</td>
                <td>{project.manager}</td>
                <td>{project.validity}</td>
                <td>{project.client}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
