import { Badge, Card, Spinner } from "react-bootstrap";
import styled from "styled-components";

export function ChatbotConversation({
  children,
  isAnswering,
  messages,
  messagesRef,
  userName,
}) {
  return (
    <ChatCard>
      <CardHeader>
        <div>
          <strong>Assistente</strong>
          <HeaderText>Atendimento interno da frota</HeaderText>
        </div>
        <Badge bg="secondary">Em fase de testes</Badge>
      </CardHeader>

      <MessagesArea ref={messagesRef}>
        {messages.map((message) => (
          <MessageRow
            key={message.id}
            $sender={message.sender}
            className="mb-3"
          >
            <MessageBubble $sender={message.sender}>
              <MessageAuthor>
                {message.sender === "assistant"
                  ? "Assistente"
                  : userName || "Usuario"}
              </MessageAuthor>
              <p className="mb-0">{message.text}</p>
            </MessageBubble>
          </MessageRow>
        ))}

        {isAnswering && (
          <MessageRow $sender="assistant">
            <MessageBubble $sender="assistant">
              <MessageAuthor>Assistente</MessageAuthor>
              <TypingLine>
                <Spinner animation="border" size="sm" />
                <span>Preparando resposta...</span>
              </TypingLine>
            </MessageBubble>
          </MessageRow>
        )}
      </MessagesArea>

      {children}
    </ChatCard>
  );
}

const ChatCard = styled(Card)`
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.08);
  padding: 1.5rem;
  height: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 575px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const HeaderText = styled.small`
  display: block;
  color: #6c757d;
  margin-top: 0.25rem;
`;

const MessagesArea = styled.div`
  min-height: 420px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-bottom: 1.5rem;
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${(props) =>
    props.$sender === "assistant" ? "flex-start" : "flex-end"};
`;

const MessageBubble = styled.div`
  width: min(100%, 460px);
  padding: 1rem 1.1rem;
  border-radius: 18px;
  border: 1px solid
    ${(props) => (props.$sender === "assistant" ? "#d9d9d9" : "#212529")};
  background: ${(props) =>
    props.$sender === "assistant" ? "#ffffff" : "#212529"};
  color: ${(props) => (props.$sender === "assistant" ? "#212529" : "#ffffff")};
`;

const MessageAuthor = styled.small`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const TypingLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;
