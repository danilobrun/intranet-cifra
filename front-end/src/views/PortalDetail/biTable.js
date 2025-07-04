import { Alert, Table } from "react-bootstrap";

export function BiTable({
  url,
  nameBi,
  baseLink,
  updateSchedule,
  responsible,
  emailResponsible,
}) {
  return (
    <>
      <h2>Links / Horários</h2>
      {url ||
      nameBi ||
      baseLink ||
      responsible ||
      emailResponsible ||
      updateSchedule ? (
        <Table striped responsive>
          <thead>
            <tr>
              <th>BI</th>
              <th>Link para acessar o BI</th>
              <th>Link da Base</th>
              <th>Horários de Atualização</th>
              <th>Responsável</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{nameBi}</td>
              <td>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Acessar BI
                </a>
              </td>
              <td>
                <a href={baseLink} target="_blank" rel="noopener noreferrer">
                  Acessar Base
                </a>
              </td>
              <td>{updateSchedule}</td>
              <td>{responsible}</td>
              <td>{emailResponsible}</td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">Não existe links e horários disponíveis.</Alert>
      )}
    </>
  );
}
