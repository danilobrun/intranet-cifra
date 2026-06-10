import { Alert } from "react-bootstrap";
import styled from "styled-components";

const getEmbedUrl = (step) => {
  if (!step?.youtubeVideoId) {
    return "";
  }

  return `https://www.youtube.com/embed/${step.youtubeVideoId}`;
};

export function TutorialStepTimeline({ steps = [] }) {
  const tutorialSteps = Array.isArray(steps) ? steps : [];

  if (!tutorialSteps.length) {
    return <EmptyText>Nenhum passo cadastrado.</EmptyText>;
  }

  return (
    <TimelineList>
      {tutorialSteps.map((step, index) => {
        const embedUrl = getEmbedUrl(step);

        return (
          <TimelineItem key={`${step.title}-${index}`}>
            <StepNumber>{index + 1}</StepNumber>
            <StepContent>
              <StepTitle>{step.title}</StepTitle>
              <p>{step.description}</p>

              {embedUrl ? (
                <VideoFrame
                  title={step.title}
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}

              {step.note ? <Alert variant="info">{step.note}</Alert> : null}
              {step.warning ? (
                <Alert variant="warning">{step.warning}</Alert>
              ) : null}
              {step.expectedResult ? (
                <ExpectedResult>
                  <strong>Resultado esperado:</strong> {step.expectedResult}
                </ExpectedResult>
              ) : null}
            </StepContent>
          </TimelineItem>
        );
      })}
    </TimelineList>
  );
}

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  align-items: flex-start;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d6efd;
  color: #ffffff;
  font-weight: 700;
`;

const StepContent = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 16px;
  background: #ffffff;

  p:last-child {
    margin-bottom: 0;
  }
`;

const StepTitle = styled.h2`
  font-size: 1rem;
  margin: 0 0 8px;
`;

const VideoFrame = styled.iframe`
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: 0.5rem;
  margin: 8px 0 16px;
`;

const ExpectedResult = styled.p`
  padding: 12px;
  border: 1px solid #d1e7dd;
  border-radius: 0.5rem;
  background: #f0f9f4;
`;

const EmptyText = styled.p`
  color: #6c757d;
`;
