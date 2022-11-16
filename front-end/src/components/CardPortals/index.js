import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

export function CardPortals({ portal }) {
  return (
    <Card className="text-center shadow h-100">
      <Card.Link href={portal.url} target="_blank">
        <CardImgStyled variant="top" src={portal.image} alt={portal.name} />
      </Card.Link>
      <Card.Body className="d-flex flex-column align-items-center">
        <Card.Title as="h2" className="h5">
          {portal.name}
        </Card.Title>
        <Card.Text>{portal.shortDescription}</Card.Text>
        <Button as={Link} to={`/portals/${portal._id}`} className="mt-auto">
          Sobre
        </Button>
      </Card.Body>
    </Card>
  );
}

const CardImgStyled = styled(Card.Img)`
  width: 100%;
  height: 15vw;
  object-fit: contain;
`;
