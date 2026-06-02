import { Card } from "react-bootstrap";
import styled from "styled-components";

export function TutorialPreview({ formData }) {
  const filledSteps = formData.steps.filter(
    (step) => step.title || step.description,
  );

  return (
    <PreviewCard>
      <Card.Body>
        <h2>Pre-visualização</h2>
        <PreviewTitle>{formData.title || "Título do tutorial"}</PreviewTitle>
        <PreviewSummary>
          {formData.summary || "Resumo do tutorial ainda não informado."}
        </PreviewSummary>

        <StepList>
          {filledSteps.length ? (
            filledSteps.map((step, index) => (
              <PreviewStep key={index}>
                <StepNumber>{index + 1}</StepNumber>
                <div>
                  <strong>{step.title || "Passo sem titulo"}</strong>
                  <p>{step.description || "Descrição ainda não informada."}</p>
                  {step.youtubeUrl ? <small>Vídeo vinculado</small> : null}
                </div>
              </PreviewStep>
            ))
          ) : (
            <PreviewSummary>Nenhum passo preenchido.</PreviewSummary>
          )}
        </StepList>
      </Card.Body>
    </PreviewCard>
  );
}

const PreviewCard = styled(Card)`
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  position: sticky;
  top: 16px;

  h2 {
    font-size: 1.125rem;
    margin-bottom: 16px;
  }
`;

const PreviewTitle = styled.h3`
  font-size: 1rem;
  margin: 0 0 8px;
`;

const PreviewSummary = styled.p`
  color: #6c757d;
`;

const StepList = styled.div`
  display: grid;
  gap: 12px;
`;

const PreviewStep = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;

  p {
    color: #6c757d;
    margin: 4px 0;
  }

  small {
    color: #0d6efd;
    font-weight: 600;
  }
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d6efd;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
`;
