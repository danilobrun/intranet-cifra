const REQUEST_TIMEOUT_MS = 60000;

const getWebhookUrl = () =>
  String(process.env.REACT_APP_BI_CORTE_SERGIPE_WEBHOOK_URL || "").trim();

export const isBiCorteSergipeChatbotConfigured = () => Boolean(getWebhookUrl());

const parseResponse = async (response) => {
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    throw new Error("O webhook retornou uma resposta vazia.");
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("O webhook retornou uma resposta invalida.");
  }
};

export const sendBiCorteSergipeMessage = async (
  { message, sessionId },
  externalSignal,
) => {
  const webhookUrl = getWebhookUrl();

  if (!webhookUrl) {
    throw new Error("O webhook do assistente ainda nao foi configurado.");
  }

  const requestController = new AbortController();
  const handleExternalAbort = () => requestController.abort();
  let didTimeout = false;

  if (externalSignal?.aborted) {
    requestController.abort();
  } else {
    externalSignal?.addEventListener("abort", handleExternalAbort, {
      once: true,
    });
  }

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    requestController.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId,
        report: "BI Corte Sergipe",
      }),
      signal: requestController.signal,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        typeof data?.message === "string" && data.message.trim()
          ? data.message
          : "Nao foi possivel consultar o assistente no momento.",
      );
    }

    if (typeof data?.answer !== "string" || !data.answer.trim()) {
      throw new Error("O webhook nao retornou uma resposta para exibir.");
    }

    return data.answer.trim();
  } catch (error) {
    if (didTimeout) {
      throw new Error("A consulta demorou mais que o esperado. Tente novamente.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", handleExternalAbort);
  }
};
