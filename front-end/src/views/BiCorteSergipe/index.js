import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsToEye,
  faChartBar,
  faExternalLinkAlt,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import styled, { keyframes } from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import {
  BI_CORTE_SERGIPE_RECOMMENDED_QUESTIONS,
  getBiCorteSergipeMockedAnswer,
} from "./BiCorteSergipeChatbot.mock";
import { BiAssistantPanel } from "./BiAssistantPanel";

export const BI_CORTE_SERGIPE_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiMGM5MTkxY2UtMGJjMC00MmJhLTgxNTQtMzMxOTA2NmI0YjdiIiwidCI6IjNlNWViODEwLTc2ZjctNGM1ZS1iMmEyLTcxZDQ0NjIwNzY1NiJ9";

const quickPrompts = BI_CORTE_SERGIPE_RECOMMENDED_QUESTIONS;

const FRAME_LOAD_TIMEOUT_MS = 30000;

const initialMessages = [
  {
    id: "assistant-welcome",
    sender: "assistant",
    text: "Olá! Sou o assistente do BI Corte Sergipe. Posso ajudar a interpretar os indicadores apresentados neste relatório.",
  },
];

export function BiCorteSergipeView() {
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const [hasFrameError, setHasFrameError] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const frameContainerRef = useRef(null);
  const requestAbortRef = useRef(null);

  useEffect(() => {
    return () => {
      requestAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isFrameLoading || hasFrameError) return undefined;

    const timeoutId = window.setTimeout(() => {
      setIsFrameLoading(false);
      setHasFrameError(true);
    }, FRAME_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [frameKey, hasFrameError, isFrameLoading]);

  const handleRetryFrame = () => {
    setHasFrameError(false);
    setIsFrameLoading(true);
    setFrameKey((currentKey) => currentKey + 1);
  };

  const handleFullscreen = async () => {
    const frameContainer = frameContainerRef.current;

    if (!frameContainer) return;

    if (frameContainer.requestFullscreen) {
      try {
        await frameContainer.requestFullscreen();
        return;
      } catch {
        // O fallback abaixo mantem o relatorio acessivel quando o navegador bloqueia fullscreen.
      }
    }

    window.open(BI_CORTE_SERGIPE_URL, "_blank", "noopener,noreferrer");
  };

  const handleClearConversation = () => {
    requestAbortRef.current?.abort();
    requestAbortRef.current = null;
    setMessages(initialMessages);
    setDraft("");
    setIsAnswering(false);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    const content = draft.trim();

    if (!content || isAnswering) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: content,
      },
    ]);
    setDraft("");
    setIsAnswering(true);

    const requestController = new AbortController();
    requestAbortRef.current = requestController;

    try {
      // Integração com o n8n temporariamente pausada para a demonstração.
      // const answer = await sendBiCorteSergipeMessage(...);
      const answer = await getBiCorteSergipeMockedAnswer(
        content,
        requestController.signal,
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          sender: "assistant",
          text: answer,
        },
      ]);
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: `assistant-error-${Date.now()}`,
            sender: "assistant",
            text:
              error.message ||
              "Não foi possível consultar o assistente no momento.",
          },
        ]);
      }
    } finally {
      if (requestAbortRef.current === requestController) {
        requestAbortRef.current = null;
        setIsAnswering(false);
      }
    }
  };

  return (
    <LayoutPortal>
      <PageShell>
        <PageHeader>
          <HeaderCopy>
            <Eyebrow>
              <FontAwesomeIcon icon={faChartBar} aria-hidden="true" />
              Business Intelligence
            </Eyebrow>
            <PageTitle>BI Corte Sergipe</PageTitle>
            <PageDescription>
              Acompanhe o relatório e consulte o assistente para interpretar os
              indicadores apresentados.
            </PageDescription>
          </HeaderCopy>

          <HeaderActions>
            <SecondaryAction type="button" onClick={handleFullscreen}>
              <FontAwesomeIcon icon={faArrowsToEye} aria-hidden="true" />
              Tela cheia
            </SecondaryAction>
          </HeaderActions>
        </PageHeader>

        <ReportWorkspace>
          <ReportFrameContainer ref={frameContainerRef}>
            {isFrameLoading && !hasFrameError ? (
              <FrameSkeleton
                role="status"
                aria-label="Carregando BI Corte Sergipe"
              >
                <SkeletonToolbar />
                <SkeletonMetrics>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonMetric key={index} />
                  ))}
                </SkeletonMetrics>
                <SkeletonCharts>
                  <SkeletonChart />
                  <SkeletonChart />
                </SkeletonCharts>
              </FrameSkeleton>
            ) : null}

            {hasFrameError ? (
              <FrameError role="alert">
                <ErrorIcon icon={faChartBar} aria-hidden="true" />
                <ErrorTitle>Não foi possível carregar o relatório.</ErrorTitle>
                <ErrorText>
                  Tente novamente ou abra o Power BI em uma nova aba.
                </ErrorText>
                <ErrorActions>
                  <SecondaryAction type="button" onClick={handleRetryFrame}>
                    <FontAwesomeIcon icon={faRotateRight} aria-hidden="true" />
                    Tentar novamente
                  </SecondaryAction>
                  <ExternalAction
                    href={BI_CORTE_SERGIPE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      aria-hidden="true"
                    />
                    Abrir relatório em nova aba
                  </ExternalAction>
                </ErrorActions>
              </FrameError>
            ) : (
              <ReportFrame
                key={frameKey}
                title="BI Corte Sergipe"
                src={BI_CORTE_SERGIPE_URL}
                frameBorder="0"
                allowFullScreen
                onLoad={() => setIsFrameLoading(false)}
                onError={() => {
                  setIsFrameLoading(false);
                  setHasFrameError(true);
                }}
              />
            )}
          </ReportFrameContainer>

          <BiAssistantPanel
            draft={draft}
            isAnswering={isAnswering}
            isConfigured
            messages={messages}
            onClear={handleClearConversation}
            onDraftChange={(event) => setDraft(event.target.value)}
            onSelectPrompt={setDraft}
            onSubmit={handleSubmit}
            quickPrompts={quickPrompts}
          />
        </ReportWorkspace>
      </PageShell>
    </LayoutPortal>
  );
}

const PageShell = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: calc(100dvh - 56px);
  padding: 18px 0 24px;
`;

const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
`;

const HeaderCopy = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
  color: oklch(48% 0.018 245);
  font-size: 0.78rem;
  font-weight: 760;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const PageTitle = styled.h1`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: clamp(1.65rem, 2.4vw, 2.15rem);
  font-weight: 720;
  line-height: 1.15;
`;

const PageDescription = styled.p`
  max-width: 68ch;
  margin: 7px 0 0;
  color: oklch(48% 0.018 245);
  font-size: 0.95rem;
  line-height: 1.5;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 575.98px) {
    width: 100%;

    > * {
      flex: 1;
    }
  }
`;

const actionStyles = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 15px;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
`;

const SecondaryAction = styled.button`
  ${actionStyles}
  border: 1px solid oklch(85% 0.012 245);
  background: oklch(99% 0.004 245);
  color: oklch(32% 0.018 245);

  &:hover,
  &:focus-visible {
    border-color: oklch(76% 0.018 245);
    background: oklch(96% 0.006 245);
  }
`;

const ReportWorkspace = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
  gap: 16px;
  align-items: stretch;
  height: 75vh;
  min-height: 620px;

  @media (max-width: 1199.98px) {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 0;
  }
`;

const ReportFrameContainer = styled.div`
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid oklch(88% 0.009 245);
  border-radius: 10px;
  background: oklch(98% 0.004 245);

  &:fullscreen {
    border: 0;
    border-radius: 0;
  }

  @media (max-width: 1199.98px) {
    height: 75vh;
    min-height: 620px;
  }
`;

const ReportFrame = styled.iframe`
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: oklch(98% 0.004 245);
`;

const skeletonPulse = keyframes`
  0%, 100% { opacity: 0.58; }
  50% { opacity: 1; }
`;

const FrameSkeleton = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  grid-template-rows: 52px 120px minmax(0, 1fr);
  gap: 14px;
  padding: 16px;
  background: oklch(98% 0.004 245);

  @media (prefers-reduced-motion: no-preference) {
    animation: ${skeletonPulse} 1.6s ease-in-out infinite;
  }
`;

const SkeletonBlock = styled.div`
  border: 1px solid oklch(90% 0.008 245);
  border-radius: 8px;
  background: oklch(93% 0.008 245);
`;

const SkeletonToolbar = styled(SkeletonBlock)``;

const SkeletonMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 767.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SkeletonMetric = styled(SkeletonBlock)``;

const SkeletonCharts = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 12px;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const SkeletonChart = styled(SkeletonBlock)``;

const FrameError = styled.div`
  display: grid;
  place-items: center;
  align-content: center;
  height: 100%;
  min-height: 0;
  padding: 32px;
  text-align: center;
`;

const ErrorIcon = styled(FontAwesomeIcon)`
  margin-bottom: 14px;
  color: oklch(54% 0.19 253);
  font-size: 2rem;
`;

const ErrorTitle = styled.h2`
  margin: 0;
  color: oklch(24% 0.018 245);
  font-size: 1.25rem;
`;

const ErrorText = styled.p`
  margin: 8px 0 20px;
  color: oklch(49% 0.018 245);
`;

const ErrorActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ExternalAction = styled.a`
  ${actionStyles}
  border: 1px solid oklch(54% 0.19 253);
  background: oklch(54% 0.19 253);
  color: oklch(98% 0.004 245);

  &:hover,
  &:focus-visible {
    background: oklch(48% 0.2 253);
    color: oklch(98% 0.004 245);
  }
`;
