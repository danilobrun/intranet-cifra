import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";

export function CardPortals({ portal }) {
  const portalName = portal.name || "Portal";
  const portalInitial = portalName.trim().charAt(0).toUpperCase() || "P";

  return (
    <PortalCard>
      <ImageLink
        to={`/portals/${portal._id}`}
        aria-label={`Acessar ${portalName}`}
      >
        {portal.image ? (
          <PortalImage src={portal.image} alt={portalName} loading="lazy" />
        ) : (
          <ImageFallback aria-hidden="true">{portalInitial}</ImageFallback>
        )}
      </ImageLink>
      <CardBody>
        <PortalTitle>{portalName}</PortalTitle>
        <PortalDescription>
          {portal.shortDescription || "Portal disponivel para o seu perfil."}
        </PortalDescription>
        <ActionButton forwardedAs={Link} to={`/portals/${portal._id}`}>
          Acessar
        </ActionButton>
      </CardBody>
    </PortalCard>
  );
}

const PortalCard = styled(Card)`
  height: 100%;
  overflow: hidden;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.08);
  transition: border-color 180ms ease-out, box-shadow 180ms ease-out,
    transform 180ms ease-out;

  &:hover {
    border-color: #ced4da;
    box-shadow: 0 16px 34px rgba(17, 24, 39, 0.12);
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const ImageLink = styled(Link)`
  display: grid;
  place-items: center;
  min-height: 9.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid rgba(13, 110, 253, 0.35);
    outline-offset: -3px;
  }
`;

const PortalImage = styled.img`
  width: 100%;
  height: 7.5rem;
  object-fit: contain;
`;

const ImageFallback = styled.span`
  width: 4rem;
  height: 4rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #dee2e6;
  color: #6c757d;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CardBody = styled(Card.Body)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  padding: 1rem;
`;

const PortalTitle = styled(Card.Title).attrs({
  as: "h2",
})`
  margin: 0;
  color: #212529;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.25;
`;

const PortalDescription = styled(Card.Text)`
  margin: 0;
  color: #6c757d;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ActionButton = styled(Button)`
  min-height: 44px;
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
