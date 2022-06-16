import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

export function TablePortals ({ portals }) {
    const handleClick = (portal) => {
        console.log('oi', portal);
    }
    return (
        <Table striped hover responsive>
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
                        <td className="d-grid gap-1 d-sm-table-cell">
                            <Button
                                size="sm"
                                as={Link}
                                to={`/portal/portals/${portal.id}`}
                            >Editar</Button>
                            <Button
                                size="sm"
                                variant="danger"
                                className="ms-sm-1"
                                onClick={() => handleClick(portal)}
                            >Deletar</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )

}