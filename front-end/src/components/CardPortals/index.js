import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

export function CardPortals ({ portal }) {
    return (
        <Card className="text-center shadow h-100">
            <CardImgStyled variant="top" src={ portal.image } alt={ portal.name } />
            <Card.Body className="d-flex flex-column align-items-center">
                <Card.Title as='h2' className='h5'>{portal.name}</Card.Title>
                <Card.Text>{portal.shortDescription}</Card.Text>
                <Button as={Link} to={`/portals/${portal.id}`} className='mt-auto'>Acessar</Button>
            </Card.Body>
        </Card>
    )
}

const CardImgStyled = styled(Card.Img)`
    width: 100%;
    height: 15vw;
    object-fit: contain;
` 