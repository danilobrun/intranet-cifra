import { Button, Table } from "react-bootstrap";

export function TablePortals ({ portals }) {
    return (
        <Table>
            <thead>
                <tr>
                    <th>*</th>
                    <th>Nome</th>
                    <th>Responável</th>
                    <th />
                </tr>
            </thead>
            <tbody>
                {portals.map(portal => (
                    <tr key={portal.id}>
                        <td>{portal.id}</td>
                        <td>{portal.name}</td>
                        <td>{portal.responsible}</td>
                        <td>
                            <Button>Editar</Button>
                            <Button>Deletar</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )

}