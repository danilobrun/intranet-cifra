import { Alert, Table } from "react-bootstrap";

export function BiTable({ url, baseLink, updateSchedule }) {
  return (
    <>
      <h2>Links / Horários</h2>
      {url && baseLink && updateSchedule ? (
        <Table striped responsive>
          <thead>
            <tr>
              <th>Link para acessar o BI</th>
              <th>Link da Base</th>
              <th>Horários de Atualização</th>
            </tr>
          </thead>
          <tbody>
            <tr>
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
            </tr>
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">Não existe links e horários disponíveis.</Alert>
      )}
    </>
  );
}
