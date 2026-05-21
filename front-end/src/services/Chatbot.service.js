const chatbotUrl =
  "https://rabid-yeah-unrest.ngrok-free.dev/webhook/chatbot-frota";

const parseResponseBody = async (response) => {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
};

const extractErrorMessage = (data) => {
  if (!data) {
    return "";
  }

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return extractErrorMessage(data[0]);
  }

  if (typeof data === "object") {
    const possibleFields = ["message", "msg", "error", "hint"];

    for (const field of possibleFields) {
      if (typeof data[field] === "string" && data[field].trim()) {
        return data[field];
      }
    }
  }

  return "";
};

const extractAssistantText = (data) => {
  if (!data) {
    return "";
  }

  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    for (const item of data) {
      const text = extractAssistantText(item);

      if (text) {
        return text;
      }
    }

    return "";
  }

  if (typeof data === "object") {
    const possibleFields = [
      "text",
      "message",
      "response",
      "answer",
      "output",
      "content",
      "result",
      "data",
      "body",
    ];

    for (const field of possibleFields) {
      const text = extractAssistantText(data[field]);

      if (text) {
        return text;
      }
    }
  }

  return "";
};

export const sendChatbotMessage = async (message, signal) => {
  const response = await fetch(chatbotUrl, {
    method: "POST",
    body: JSON.stringify(message),
    headers: {
      "content-type": "application/json",
    },
    signal,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data) ||
        "Falha ao processar a solicitacao do chatbot.",
    );
  }

  return extractAssistantText(data);
};
