import { Button, Card, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEllipsisVertical,
  faPencil,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { TutorialStatusBadge } from "./TutorialStatusBadge";

const formatDate = (value) => {
  if (!value) {
    return "Sem atualiza\u00e7\u00e3o";
  }

  return new Date(value).toLocaleDateString("pt-BR");
};

const getStepsLabel = (stepsCount) => {
  const count = stepsCount || 0;

  if (count === 1) {
    return "1 passo";
  }

  return `${count} passos`;
};

export function TutorialCard({
  tutorial,
  isAdmin,
  onArchive,
  onDeletePermanently,
}) {
  const isArchived = tutorial.status === "arquivado";

  return (
    <TutorialCardStyled>
      <Card.Body>
        <HeaderRow>
          <TutorialStatusBadge status={tutorial.status} />
          {tutorial.hasVideo ? (
            <VideoText>
              <FontAwesomeIcon icon={faVideo} />V{"\u00ed"}deo
            </VideoText>
          ) : null}
        </HeaderRow>

        <Title>{tutorial.title}</Title>
        {tutorial.summary ? (
          <SummaryText>{tutorial.summary}</SummaryText>
        ) : (
          <SummaryText>Sem resumo cadastrado.</SummaryText>
        )}

        <MetaRow>
          <span>{getStepsLabel(tutorial.stepsCount)}</span>
          <span>Atualizado em {formatDate(tutorial.updatedAt)}</span>
        </MetaRow>
      </Card.Body>

      <Card.Footer>
        <ActionsRow>
          <Button
            size="sm"
            variant="primary"
            as={Link}
            to={`/portal/tutorials/${tutorial._id}`}
            className="primary-action"
          >
            Ver tutorial
            <FontAwesomeIcon icon={faArrowRight} />
          </Button>

          {isAdmin ? (
            <AdminActions>
              <Button
                size="sm"
                variant="outline-light"
                as={Link}
                to={`/portal/tutorials/${tutorial._id}/edit`}
                className="secondary-action"
              >
                <FontAwesomeIcon icon={faPencil} />
                Editar
              </Button>

              <Dropdown align="end">
                <Dropdown.Toggle
                  as={MoreActionsButton}
                  id={`tutorial-actions-${tutorial._id}`}
                  aria-label="A\u00e7\u00f5es do tutorial"
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    className="text-danger"
                    onClick={() =>
                      isArchived
                        ? onDeletePermanently(tutorial)
                        : onArchive(tutorial)
                    }
                  >
                    {isArchived ? "Excluir definitivo" : "Arquivar"}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </AdminActions>
          ) : null}
        </ActionsRow>
      </Card.Footer>
    </TutorialCardStyled>
  );
}

const TutorialCardStyled = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 12px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 12px 28px oklch(22% 0.018 245 / 0.07);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: oklch(84% 0.018 245);
    box-shadow: 0 16px 34px oklch(22% 0.018 245 / 0.1);
    transform: translateY(-1px);
  }

  .card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 18px;
  }

  .card-footer {
    background: oklch(98% 0.004 245);
    border-top: 1px solid oklch(91% 0.008 245);
    flex-shrink: 0;
    padding: 12px 18px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Title = styled.h2`
  display: -webkit-box;
  min-height: 30px;
  margin: 18px 0 0;
  color: oklch(22% 0.018 245);
  font-size: 1.05rem;
  font-weight: 760;
  line-height: 1.35;
  letter-spacing: 0;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SummaryText = styled.p`
  display: -webkit-box;
  min-height: 70px;
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.96rem;
  line-height: 1.45;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VideoText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: oklch(43% 0.15 253);
  font-size: 0.83rem;
  font-weight: 760;
  white-space: nowrap;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
  color: oklch(49% 0.018 245);
  font-size: 0.86rem;
  flex-wrap: wrap;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;

  .primary-action,
  .secondary-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 36px;
    border-radius: 9px;
    font-weight: 720;
  }

  .primary-action {
    border-color: oklch(54% 0.19 253);
    background: oklch(54% 0.19 253);
    box-shadow: 0 8px 18px oklch(42% 0.18 253 / 0.17);
  }

  .primary-action:hover,
  .primary-action:focus {
    border-color: oklch(48% 0.2 253);
    background: oklch(48% 0.2 253);
  }

  .secondary-action {
    border: 1px solid oklch(86% 0.012 245);
    background: oklch(99% 0.004 245);
    color: oklch(35% 0.018 245);
  }

  .secondary-action:hover,
  .secondary-action:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
  }
`;

const AdminActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const MoreActionsButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 9px;
  background: oklch(99% 0.004 245);
  color: oklch(38% 0.018 245);
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;

  &::after {
    display: none;
  }

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    outline: none;
  }
`;
