import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BiCorteSergipeView, BI_CORTE_SERGIPE_URL } from ".";
import {
  isBiCorteSergipeChatbotConfigured,
  sendBiCorteSergipeMessage,
} from "../../services/BiCorteSergipeChatbot.service";

jest.mock("../../components/LayoutPortal", () => ({
  LayoutPortal: ({ children }) => <div>{children}</div>,
}));

jest.mock("react-markdown", () => ({ children }) => (
  <>{String(children).replace(/\*\*/g, "")}</>
));

jest.mock("../../services/BiCorteSergipeChatbot.service", () => ({
  isBiCorteSergipeChatbotConfigured: jest.fn(),
  sendBiCorteSergipeMessage: jest.fn(),
}));

describe("BiCorteSergipeView", () => {
  beforeEach(() => {
    isBiCorteSergipeChatbotConfigured.mockReturnValue(true);
    sendBiCorteSergipeMessage.mockResolvedValue("**Indicadores** analisados.");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renderiza o iframe correto e remove o skeleton apos carregar", () => {
    render(<BiCorteSergipeView />);

    const iframe = screen.getByTitle("BI Corte Sergipe");
    expect(iframe).toHaveAttribute("src", BI_CORTE_SERGIPE_URL);
    expect(iframe).toHaveAttribute("allowfullscreen");
    expect(
      screen.getByLabelText("Carregando BI Corte Sergipe"),
    ).toBeInTheDocument();

    fireEvent.load(iframe);

    expect(
      screen.queryByLabelText("Carregando BI Corte Sergipe"),
    ).not.toBeInTheDocument();
  });

  it("mantem o assistente visivel ao lado do relatorio", () => {
    render(<BiCorteSergipeView />);

    expect(screen.getByText(/Sou o assistente do BI Corte Sergipe/)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Fechar assistente do BI" }),
    ).not.toBeInTheDocument();
  });

  it("preenche uma sugestao, envia ao n8n e exibe a resposta", async () => {
    render(<BiCorteSergipeView />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Resuma os principais indicadores do período.",
      }),
    );

    expect(screen.getByLabelText("Digite sua pergunta")).toHaveValue(
      "Resuma os principais indicadores do período.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));

    expect(
      screen.queryByRole("button", {
        name: "Resuma os principais indicadores do período.",
      }),
    ).not.toBeInTheDocument();

    await waitFor(() => expect(sendBiCorteSergipeMessage).toHaveBeenCalled());
    expect(await screen.findByText("Indicadores analisados.")).toBeInTheDocument();

    const [payload] = sendBiCorteSergipeMessage.mock.calls[0];
    expect(payload.message).toBe(
      "Resuma os principais indicadores do período.",
    );
    expect(payload.sessionId).toEqual(expect.any(String));

    fireEvent.click(screen.getByRole("button", { name: "Limpar conversa" }));
    expect(
      screen.getByRole("button", {
        name: "Resuma os principais indicadores do período.",
      }),
    ).toBeInTheDocument();
  });

  it("mostra a configuracao ausente e bloqueia o envio", () => {
    isBiCorteSergipeChatbotConfigured.mockReturnValue(false);
    render(<BiCorteSergipeView />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "webhook do assistente ainda não foi configurado",
    );
    expect(screen.getByLabelText("Digite sua pergunta")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Enviar pergunta" })).toBeDisabled();
  });

  it("exibe alternativas quando o iframe falha", () => {
    jest.useFakeTimers();
    render(<BiCorteSergipeView />);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(
      screen.getByText("Não foi possível carregar o relatório."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Abrir relatório em nova aba" }),
    ).toHaveAttribute("href", BI_CORTE_SERGIPE_URL);
  });
});
