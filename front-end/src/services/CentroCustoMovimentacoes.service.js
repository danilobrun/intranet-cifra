import { apiUrl, getAuthorizationHeaders } from "./Api.service";
import { removeStorageItem } from "./Storage.service";

const buildUrlWithQuery = (path, query = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.append(key, value);
  });

  const queryString = searchParams.toString();

  return `${apiUrl}${path}${queryString ? `?${queryString}` : ""}`;
};

const redirectToLoginIfUnauthorized = (response) => {
  if (response.status !== 401) {
    return false;
  }

  alert("Acesso expirado, favor efetuar login novamente!");
  removeStorageItem("user");
  window.location.href = "https://intranet-cifra.netlify.app/";

  return true;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthorizationHeaders(),
      ...options.headers,
    },
  });

  if (redirectToLoginIfUnauthorized(response)) {
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.msg || "Response not ok.");
    error.data = data;
    throw error;
  }

  return data;
};

const getFileNameFromContentDisposition = (contentDisposition = "") => {
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  return fileNameMatch?.[1];
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const requestBlob = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthorizationHeaders(),
      ...options.headers,
    },
  });

  if (redirectToLoginIfUnauthorized(response)) {
    return;
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : {};
    const error = new Error(
      data.msg || "Não foi possível baixar o arquivo CSV.",
    );

    error.data = data;
    throw error;
  }

  return {
    blob: await response.blob(),
    fileName: getFileNameFromContentDisposition(
      response.headers.get("content-disposition") || "",
    ),
  };
};

export const listarMovimentacoes = async (filters = {}) => {
  return requestJson(
    buildUrlWithQuery("/centro-custo-movimentacoes", filters),
  );
};

export const listarMinhasMovimentacoes = async (filters = {}) => {
  return requestJson(
    buildUrlWithQuery("/centro-custo-movimentacoes/minhas", filters),
  );
};

export const exportarMovimentacoes = async (filters = {}) => {
  const result = await requestBlob(
    buildUrlWithQuery("/centro-custo-movimentacoes/exportar", filters),
  );

  if (!result) {
    return;
  }

  downloadBlob(
    result.blob,
    result.fileName || "movimentacoes-centro-custo.csv",
  );
};

export const buscarMovimentacaoPorId = async (movimentacaoId) => {
  return requestJson(`${apiUrl}/centro-custo-movimentacoes/${movimentacaoId}`);
};

export const criarMovimentacao = async (payload) => {
  return requestJson(`${apiUrl}/centro-custo-movimentacoes`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const aplicarMovimentacaoNaFolha = async (movimentacaoId) => {
  return requestJson(
    `${apiUrl}/centro-custo-movimentacoes/${movimentacaoId}/aplicar-folha`,
    {
      method: "PATCH",
    },
  );
};
