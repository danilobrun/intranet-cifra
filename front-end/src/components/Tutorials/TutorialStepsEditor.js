import { Button } from "react-bootstrap";
import styled from "styled-components";
import { TutorialStepFields } from "./TutorialStepFields";

export function TutorialStepsEditor({
  steps,
  onAddStep,
  onChangeStep,
  onMoveStep,
  onRemoveStep,
}) {
  return (
    <StepsWrapper>
      <SectionHeader>
        <div>
          <h2>Passos do tutorial</h2>
          <p>Organize o procedimento na ordem em que ele deve ser executado.</p>
        </div>
        <Button type="button" size="sm" onClick={onAddStep}>
          Adicionar passo
        </Button>
      </SectionHeader>

      {steps.map((step, index) => (
        <TutorialStepFields
          key={index}
          index={index}
          step={step}
          canMoveUp={index > 0}
          canMoveDown={index < steps.length - 1}
          onChange={onChangeStep}
          onMoveUp={() => onMoveStep(index, index - 1)}
          onMoveDown={() => onMoveStep(index, index + 1)}
          onRemove={() => onRemoveStep(index)}
        />
      ))}
    </StepsWrapper>
  );
}

const StepsWrapper = styled.div`
  display: grid;
  gap: 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;

  h2 {
    font-size: 1.125rem;
    margin: 0;
  }

  p {
    color: #6c757d;
    margin: 4px 0 0;
  }
`;
