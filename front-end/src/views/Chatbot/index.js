import { useEffect, useRef, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  ChatbotConversation,
  ChatbotFooter,
  ChatbotHeader,
  ChatbotSidebar,
} from "../../components/Chatbot";
import { LayoutPortal } from "../../components/LayoutPortal";
import { sendChatbotMessage } from "../../services/Chatbot.service";
import { selectUser } from "../../store/User/User.selectors";

const initialMessages = [
  {
    id: "assistant-welcome",
    sender: "assistant",
    text: "Olá! Bem-vindo ao Assistente de frota. Como posso ajudar?",
  },
];

const quickPrompts = [
  "Quais placas tiveram mais problema hoje?",
  "Quantos checklists tivemos hoje?",
  "Quais placas tiveram status critico hoje?",
];

export function ChatbotView() {
  const user = useSelector(selectUser);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const messagesRef = useRef(null);
  const requestAbortRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isAnswering]);

  useEffect(() => {
    return () => {
      if (requestAbortRef.current) {
        requestAbortRef.current.abort();
      }
    };
  }, []);

  const handleClearConversation = () => {
    if (requestAbortRef.current) {
      requestAbortRef.current.abort();
      requestAbortRef.current = null;
    }

    setMessages(initialMessages);
    setDraft("");
    setIsAnswering(false);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();

    const content = draft.trim();

    if (!content || isAnswering) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: content,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setDraft("");
    setIsAnswering(true);

    const controller = new AbortController();
    requestAbortRef.current = controller;

    try {
      const assistantText = await sendChatbotMessage(
        userMessage,
        controller.signal,
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text:
            assistantText ||
            "Recebi sua solicitacao, mas o webhook nao retornou um texto para exibir.",
        },
      ]);
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: `assistant-error-${Date.now()}`,
            sender: "assistant",
            text: "Não foi possível consultar o chatbot no momento.",
          },
        ]);
      }
    } finally {
      if (requestAbortRef.current === controller) {
        requestAbortRef.current = null;
      }
      setIsAnswering(false);
    }
  };

  return (
    <LayoutPortal>
      <Row className="g-4 py-4">
        <Col xs={12}>
          <ChatbotHeader userName={user?.name} />
        </Col>

        <Col xl={8}>
          <ChatbotConversation
            isAnswering={isAnswering}
            messages={messages}
            messagesRef={messagesRef}
            userName={user?.name}
          >
            <ChatbotFooter
              draft={draft}
              isAnswering={isAnswering}
              onDraftChange={(event) => setDraft(event.target.value)}
              onSubmit={handleSubmit}
            />
          </ChatbotConversation>
        </Col>

        <Col xl={4}>
          <ChatbotSidebar
            onClearConversation={handleClearConversation}
            quickPrompts={quickPrompts}
            onSelectPrompt={(prompt) => setDraft(prompt)}
          />
        </Col>
      </Row>
    </LayoutPortal>
  );
}
