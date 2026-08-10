import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faCircleNotch,
  faRobot,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";

export function BiAssistantPanel({
  draft,
  isAnswering,
  isConfigured,
  messages,
  onClear,
  onDraftChange,
  onSelectPrompt,
  onSubmit,
  quickPrompts,
}) {
  const messagesRef = useRef(null);
  const hasStartedConversation = messages.some(
    (message) => message.sender === "user",
  );

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isAnswering]);

  const handleComposerKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (draft.trim() && !isAnswering && isConfigured) {
        onSubmit();
      }
    }
  };

  return (
    <AssistantPanel id="bi-assistant-panel" aria-labelledby="bi-assistant-title">
      <PanelHeader>
        <HeaderCopy>
          <TitleRow>
            <TitleIcon icon={faRobot} aria-hidden="true" />
            <PanelTitle id="bi-assistant-title">Assistente do BI</PanelTitle>
          </TitleRow>
          <PanelDescription>
            Pergunte sobre o relatório BI Corte Sergipe.
          </PanelDescription>
        </HeaderCopy>
      </PanelHeader>

      {!isConfigured ? (
        <ConfigurationAlert role="alert">
          O webhook do assistente ainda não foi configurado neste ambiente.
        </ConfigurationAlert>
      ) : null}

      <MessagesArea ref={messagesRef} aria-live="polite">
        {messages.map((message) => (
          <MessageRow key={message.id} $sender={message.sender}>
            <MessageBubble $sender={message.sender}>
              <MessageAuthor>
                {message.sender === "assistant" ? "Assistente do BI" : "Você"}
              </MessageAuthor>
              {message.sender === "assistant" ? (
                <MarkdownContent>
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </MarkdownContent>
              ) : (
                <p>{message.text}</p>
              )}
            </MessageBubble>
          </MessageRow>
        ))}

        {isAnswering ? (
          <MessageRow $sender="assistant" role="status">
            <MessageBubble $sender="assistant">
              <MessageAuthor>Assistente do BI</MessageAuthor>
              <TypingLine>
                <FontAwesomeIcon icon={faCircleNotch} spin aria-hidden="true" />
                <span>Analisando o relatório...</span>
              </TypingLine>
            </MessageBubble>
          </MessageRow>
        ) : null}
      </MessagesArea>

      <ComposerSection>
        {!hasStartedConversation ? (
          <PromptList aria-label="Sugestões de perguntas">
            {quickPrompts.map((prompt) => (
              <PromptButton
                key={prompt}
                type="button"
                onClick={() => onSelectPrompt(prompt)}
                disabled={!isConfigured || isAnswering}
              >
                {prompt}
              </PromptButton>
            ))}
          </PromptList>
        ) : null}

        <ComposerForm onSubmit={onSubmit}>
          <ComposerLabel htmlFor="bi-corte-sergipe-message">
            Digite sua pergunta
          </ComposerLabel>
          <ComposerRow>
            <ComposerInput
              id="bi-corte-sergipe-message"
              rows={3}
              placeholder="Pergunte sobre os indicadores deste BI"
              value={draft}
              onChange={onDraftChange}
              onKeyDown={handleComposerKeyDown}
              disabled={!isConfigured || isAnswering}
            />
            <SendButton
              type="submit"
              aria-label="Enviar pergunta"
              disabled={!isConfigured || !draft.trim() || isAnswering}
            >
              <FontAwesomeIcon icon={faArrowUp} aria-hidden="true" />
            </SendButton>
          </ComposerRow>
        </ComposerForm>

        <ClearButton type="button" onClick={onClear}>
          <FontAwesomeIcon icon={faTrashCan} aria-hidden="true" />
          Limpar conversa
        </ClearButton>
      </ComposerSection>
    </AssistantPanel>
  );
}

const AssistantPanel = styled.aside`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  width: 100%;
  min-height: 620px;
  overflow: hidden;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 28px oklch(18% 0.018 245 / 0.1);

  @media (max-width: 1199.98px) {
    min-height: 560px;
  }
`;

const PanelHeader = styled.header`
  grid-row: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid oklch(90% 0.009 245);
`;

const HeaderCopy = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`;

const TitleIcon = styled(FontAwesomeIcon)`
  color: oklch(54% 0.19 253);
  font-size: 1rem;
`;

const PanelTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.2rem;
  font-weight: 760;
`;

const PanelDescription = styled.p`
  margin: 0;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  line-height: 1.45;
`;

const ConfigurationAlert = styled.div`
  grid-row: 2;
  margin: 14px 20px 0;
  padding: 12px 14px;
  border: 1px solid oklch(86% 0.075 80);
  border-radius: 9px;
  background: oklch(96% 0.03 80);
  color: oklch(39% 0.07 70);
  font-size: 0.9rem;
  line-height: 1.45;
`;

const MessagesArea = styled.div`
  grid-row: 3;
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 0;
  padding: 18px 20px;
  overflow-y: auto;
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${(props) =>
    props.$sender === "assistant" ? "flex-start" : "flex-end"};
`;

const MessageBubble = styled.div`
  width: min(100%, 340px);
  padding: 13px 14px;
  border: 1px solid
    ${(props) =>
      props.$sender === "assistant"
        ? "oklch(89% 0.009 245)"
        : "oklch(27% 0.018 245)"};
  border-radius: 14px;
  background: ${(props) =>
    props.$sender === "assistant"
      ? "oklch(98% 0.004 245)"
      : "oklch(27% 0.018 245)"};
  color: ${(props) =>
    props.$sender === "assistant"
      ? "oklch(24% 0.018 245)"
      : "oklch(98% 0.004 245)"};

  p {
    margin: 0;
  }
`;

const MessageAuthor = styled.small`
  display: block;
  margin-bottom: 7px;
  font-weight: 700;
`;

const MarkdownContent = styled.div`
  overflow-wrap: anywhere;

  p,
  ul,
  ol {
    margin-bottom: 0.7rem;
  }

  p:last-child,
  ul:last-child,
  ol:last-child {
    margin-bottom: 0;
  }

  ul,
  ol {
    padding-left: 1.2rem;
  }
`;

const TypingLine = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.92rem;
`;

const ComposerSection = styled.footer`
  grid-row: 4;
  display: grid;
  gap: 12px;
  padding: 14px 20px 18px;
  border-top: 1px solid oklch(90% 0.009 245);
  background: oklch(99% 0.004 245);
`;

const PromptList = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
`;

const PromptButton = styled.button`
  width: 100%;
  padding: 7px 10px;
  border: 1px solid oklch(78% 0.08 253);
  border-radius: 8px;
  background: oklch(98% 0.018 253);
  color: oklch(45% 0.17 253);
  font-size: 0.82rem;
  font-weight: 650;
  text-align: left;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    border-color: oklch(58% 0.16 253);
    background: oklch(95% 0.035 253);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const ComposerForm = styled.form`
  display: grid;
  gap: 7px;
`;

const ComposerLabel = styled.label`
  color: oklch(30% 0.018 245);
  font-size: 0.88rem;
  font-weight: 700;
`;

const ComposerRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 9px;
  align-items: end;
`;

const ComposerInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  resize: vertical;
  padding: 11px 12px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 9px;
  background: oklch(99% 0.004 245);
  color: oklch(24% 0.018 245);
  line-height: 1.45;

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.14);
    outline: none;
  }

  &:disabled {
    background: oklch(94% 0.006 245);
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 9px;
  background: oklch(54% 0.19 253);
  color: oklch(98% 0.004 245);

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    background: oklch(48% 0.2 253);
  }

  &:disabled {
    background: oklch(72% 0.045 250);
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  border: 1px solid oklch(87% 0.012 245);
  border-radius: 8px;
  background: oklch(98% 0.004 245);
  color: oklch(39% 0.018 245);
  font-size: 0.88rem;
  font-weight: 650;

  &:hover,
  &:focus-visible {
    border-color: oklch(77% 0.018 245);
    background: oklch(95% 0.006 245);
  }
`;
