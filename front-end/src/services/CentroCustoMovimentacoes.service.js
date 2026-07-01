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

export const listarMovimentacoes = async (filters = {}) => {
  return requestJson(
    buildUrlWithQuery("/centro-custo-movimentacoes", filters),
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
