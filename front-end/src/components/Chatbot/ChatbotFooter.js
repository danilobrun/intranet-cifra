import { Button, Form } from "react-bootstrap";
import styled from "styled-components";

export function ChatbotFooter({ draft, isAnswering, onDraftChange, onSubmit }) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (draft.trim() && !isAnswering) {
        onSubmit();
      }
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group controlId="chatbot-message">
        <Form.Label className="fw-semibold">Envie uma mensagem</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Digite aqui sua pergunta sobre a frota"
          value={draft}
          onChange={onDraftChange}
          onKeyDown={handleKeyDown}
        />
      </Form.Group>
      <ActionsRow>
        <Button
          type="submit"
          variant="dark"
          disabled={!draft.trim() || isAnswering}
        >
          Enviar
        </Button>
      </ActionsRow>
    </Form>
  );
}

const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 575px) {
    flex-direction: column;
    align-items: stretch;
  }
`;
