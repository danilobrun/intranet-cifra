import {
  isBiCorteSergipeChatbotConfigured,
  sendBiCorteSergipeMessage,
} from "./BiCorteSergipeChatbot.service";

const originalWebhookUrl =
  process.env.REACT_APP_BI_CORTE_SERGIPE_WEBHOOK_URL;

const createResponse = (body, ok = true) => ({
  ok,
  text: jest.fn().mockResolvedValue(body),
});

describe("BiCorteSergipeChatbot.service", () => {
  beforeEach(() => {
    process.env.REACT_APP_BI_CORTE_SERGIPE_WEBHOOK_URL =
      "https://n8n.example/webhook/bi-corte-sergipe";
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalWebhookUrl === undefined) {
      delete process.env.REACT_APP_BI_CORTE_SERGIPE_WEBHOOK_URL;
    } else {
      process.env.REACT_APP_BI_CORTE_SERGIPE_WEBHOOK_URL = originalWebhookUrl;
    }
  });

  it("envia apenas a pergunta, sessao e relatorio", async () => {
    global.fetch.mockResolvedValue(
      createResponse(JSON.stringify({ answer: "Resposta do BI" })),
    );

    await expect(
      sendBiCorteSergipeMessage({
        message: "Resuma os indicadores",
        sessionId: "session-123",
      }),
    ).resolves.toBe("Resposta do BI");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://n8n.example/webhook/bi-corte-sergipe",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: "Resuma os indicadores",
          sessionId: "session-123",
          report: "BI Corte Sergipe",
        }),
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("identifica quando o webhook nao esta configurado", async () => {
    delete process.env.REACT_APP_BI_CORTE_SERGIPE_WEBHOOK_URL;

    expect(isBiCorteSergipeChatbotConfigured()).toBe(false);
    await expect(
      sendBiCorteSergipeMessage({ message: "Teste", sessionId: "session" }),
    ).rejects.toThrow("ainda nao foi configurado");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["", "resposta vazia"],
    ["nao-e-json", "resposta invalida"],
    [JSON.stringify({ output: "campo errado" }), "nao retornou uma resposta"],
  ])("rejeita uma resposta fora do contrato", async (body, message) => {
    global.fetch.mockResolvedValue(createResponse(body));

    await expect(
      sendBiCorteSergipeMessage({ message: "Teste", sessionId: "session" }),
    ).rejects.toThrow(message);
  });

  it("propaga o cancelamento externo para o fetch", async () => {
    global.fetch.mockImplementation((_, options) =>
      new Promise((resolve, reject) => {
        options.signal.addEventListener("abort", () => {
          const error = new Error("Cancelado");
          error.name = "AbortError";
          reject(error);
        });
      }),
    );

    const controller = new AbortController();
    const request = sendBiCorteSergipeMessage(
      { message: "Teste", sessionId: "session" },
      controller.signal,
    );
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
  });
});
