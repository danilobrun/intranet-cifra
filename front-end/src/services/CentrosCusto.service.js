import { apiUrl, getAuthorizationHeaders } from "./Api.service";
import { removeStorageItem } from "./Storage.service";

const redirectToLoginIfUnauthorized = (response) => {
  if (response.status !== 401) {
    return false;
  }

  alert("Acesso expirado, favor efetuar login novamente!");
  removeStorageItem("user");
  window.location.href = "https://intranet-cifra.netlify.app/";

  return true;
};

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

export const listarCentrosCusto = async (filters = {}) => {
  return requestJson(buildUrlWithQuery("/centros-custo", filters));
};

export const criarCentroCusto = async (payload) => {
  return requestJson(`${apiUrl}/centros-custo`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const atualizarCentroCusto = async (centroCustoId, payload) => {
  return requestJson(`${apiUrl}/centros-custo/${centroCustoId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const excluirCentroCusto = async (centroCustoId) => {
  return requestJson(`${apiUrl}/centros-custo/${centroCustoId}`, {
    method: "DELETE",
  });
};
