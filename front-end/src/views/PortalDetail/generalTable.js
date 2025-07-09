import { Table } from "react-bootstrap";

export function GeneralTable({ portal }) {
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
        {portal ? (
          <tbody>
            {portal.details.map((item, index) => (
              <tr key={index}>
                <td>{item.nameForm}</td>
                <td>
                  <a href={item.url}>Acessar formulário</a>
                </td>
                <td>{portal.responsible}</td>
                <td>{item.emailResponsible}</td>
              </tr>
            ))}
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
