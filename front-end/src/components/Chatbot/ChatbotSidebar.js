import { Button, Card } from "react-bootstrap";
import styled from "styled-components";

export function ChatbotSidebar({
  onClearConversation,
  onSelectPrompt,
  quickPrompts,
}) {
  return (
    <SupportCard>
      <h2 className="h5 mb-3">Sugestões de uso</h2>
      <PromptList>
        {quickPrompts.map((prompt) => (
          <Button
            key={prompt}
            type="button"
            variant="outline-dark"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </PromptList>
      <Divider />
      <Button type="button" variant="dark" onClick={onClearConversation}>
        Limpar conversa
      </Button>
    </SupportCard>
  );
}

const SupportCard = styled(Card)`
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.08);
  padding: 1.5rem;
`;

const PromptList = styled.div`
  display: grid;
  gap: 0.75rem;

  button {
    text-align: left;
  }
`;

const Divider = styled.hr`
  margin: 1.5rem 0;
  color: #ced4da;
`;
