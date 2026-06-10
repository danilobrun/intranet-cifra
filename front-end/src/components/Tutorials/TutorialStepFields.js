import { Button, Form } from "react-bootstrap";
import styled from "styled-components";

export function TutorialStepFields({
  canMoveDown,
  canMoveUp,
  index,
  step,
  onChange,
  onMoveDown,
  onMoveUp,
  onRemove,
}) {
  return (
    <StepBox>
      <StepHeader>
        <h3>Passo {index + 1}</h3>
        <ButtonRow>
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            Subir
          </Button>
          <Button
            type="button"
            variant="outline-secondary"
            size="sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            Descer
          </Button>
          <Button
            type="button"
            variant="outline-danger"
            size="sm"
            onClick={onRemove}
          >
            Remover
          </Button>
        </ButtonRow>
      </StepHeader>

      <Form.Group className="mb-3" controlId={`step-title-${index}`}>
        <Form.Label className="mb-0">Título do passo</Form.Label>
        <Form.Control
          name="title"
          placeholder="Ex: Limpar cache de imagens"
          value={step.title}
          onChange={(event) => onChange(index, event)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId={`step-description-${index}`}>
        <Form.Label className="mb-0">Descrição</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          placeholder="Descreva exatamente o que deve ser feito"
          value={step.description}
          onChange={(event) => onChange(index, event)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId={`step-youtube-${index}`}>
        <Form.Label className="mb-0">Link do YouTube</Form.Label>
        <Form.Control
          name="youtubeUrl"
          placeholder="https://www.youtube.com/watch?v=..."
          value={step.youtubeUrl}
          onChange={(event) => onChange(index, event)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId={`step-note-${index}`}>
        <Form.Label className="mb-0">Observação</Form.Label>
        <Form.Control
          name="note"
          placeholder="Informação complementar opcional"
          value={step.note}
          onChange={(event) => onChange(index, event)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId={`step-warning-${index}`}>
        <Form.Label className="mb-0">Alerta</Form.Label>
        <Form.Control
          name="warning"
          placeholder="Ex: Não apague dados antes de validar as fotos"
          value={step.warning}
          onChange={(event) => onChange(index, event)}
        />
      </Form.Group>

      <Form.Group className="mb-0" controlId={`step-result-${index}`}>
        <Form.Label className="mb-0">Resultado esperado</Form.Label>
        <Form.Control
          name="expectedResult"
          placeholder="Ex: Aplicativo abre as fotos sem fechar"
          value={step.expectedResult}
          onChange={(event) => onChange(index, event)}
        />
      </Form.Group>
    </StepBox>
  );
}

const StepBox = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 16px;
  background: #ffffff;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  h3 {
    font-size: 1rem;
    margin: 0;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
