import { Alert, Table } from "react-bootstrap";

export function BiTable({ responsible, portal }) {
  return (
    <>
      <h2>Links / Horários</h2>
      {responsible || portal ? (
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
            {portal.map((item, index) => (
              <tr key={index}>
                <td>{item.nameForm || ""}</td>
                <td>
                  <a
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Acessar BI
                  </a>
                </td>
                <td>
                  <a
                    href={item.baseLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Acessar Base
                  </a>
                </td>
                <td>{item.updateSchedule || ""}</td>
                <td>{responsible || ""}</td>
                <td>{item.emailResponsible || ""}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">Não existe links e horários disponíveis.</Alert>
      )}
    </>
  );
}
