import { Alert, Table } from "react-bootstrap";

export function Inscriptions({ inscriptions }) {
  console.log(inscriptions);
  return (
    <>
      <h2>Solicitações de acesso</h2>
      {inscriptions.length > 0 ? (
        <Table striped responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            {inscriptions.map((inscriptions) => (
              <tr key={inscriptions._id}>
                <td>{inscriptions._id}</td>
                <td>{inscriptions.name}</td>
                <td>{inscriptions.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Alert variant="info">Não existe solicitação aberta.</Alert>
      )}
    </>
  );
}
