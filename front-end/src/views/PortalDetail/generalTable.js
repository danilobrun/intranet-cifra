import { Table } from "react-bootstrap";

export function GeneralTable({
  name,
  acessUrl,
  responsible,
  emailResponsible,
}) {
  return (
    <>
      <h2>Links</h2>
      <Table striped responsive>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Link</th>
            <th>Responsável</th>
            <th>E-mail</th>
          </tr>
        </thead>
        {name || acessUrl || responsible || emailResponsible ? (
          <tbody>
            <tr>
              <td>{name}</td>
              <td>
                <a href={acessUrl}>Acessar formulário</a>
              </td>
              <td>{responsible}</td>
              <td>{emailResponsible}</td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            <tr>
              <td colSpan="4">Nenhum dado encontrado.</td>
            </tr>
          </tbody>
        )}
      </Table>
    </>
  );
}
