import { Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { TutorialStatusBadge } from "./TutorialStatusBadge";

const formatDate = (value) => {
  if (!value) {
    return "Sem atualizacao";
  }

  return new Date(value).toLocaleDateString("pt-BR");
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
          {tutorial.hasVideo ? <VideoText>Vídeo</VideoText> : null}
        </HeaderRow>

        <Card.Title as="h2" className="h5 mt-3">
          {tutorial.title}
        </Card.Title>
        {tutorial.summary ? (
          <SummaryText>{tutorial.summary}</SummaryText>
        ) : (
          <SummaryText>Sem resumo cadastrado.</SummaryText>
        )}

        <MetaRow>
          <span>{tutorial.stepsCount || 0} passo(s)</span>
          <span>Atualizado em {formatDate(tutorial.updatedAt)}</span>
        </MetaRow>
      </Card.Body>

      <Card.Footer>
        <ActionsRow>
          <Button
            size="sm"
            variant="outline-primary"
            as={Link}
            to={`/portal/tutorials/${tutorial._id}`}
          >
            Ver tutorial
          </Button>

          {isAdmin ? (
            <>
              <Button
                size="sm"
                variant="outline-secondary"
                as={Link}
                to={`/portal/tutorials/${tutorial._id}/edit`}
              >
                Editar
              </Button>
              {isArchived ? (
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => onDeletePermanently(tutorial)}
                >
                  Excluir definitivo
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => onArchive(tutorial)}
                >
                  Arquivar
                </Button>
              )}
            </>
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
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.06);

  .card-body {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .card-footer {
    background: #ffffff;
    border-top: 1px solid #edf0f2;
    flex-shrink: 0;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SummaryText = styled.p`
  color: #6c757d;
  min-height: 48px;
`;

const VideoText = styled.span`
  color: #0d6efd;
  font-size: 0.875rem;
  font-weight: 600;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  color: #6c757d;
  font-size: 0.875rem;
  flex-wrap: wrap;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
