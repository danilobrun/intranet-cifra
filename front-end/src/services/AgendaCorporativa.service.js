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

export const listarEventos = async (params = {}, options = {}) =>
  requestJson(buildUrlWithQuery("/agenda-corporativa/eventos", params), {
    method: "GET",
    ...options,
  });

export const criarAgendaCorporativaEvento = async (payload) =>
  requestJson(`${apiUrl}/agenda-corporativa/eventos`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
  });

export const atualizarEvento = async (eventoId, payload) =>
  requestJson(`${apiUrl}/agenda-corporativa/eventos/${eventoId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
  });

export const excluirEvento = async (eventoId) =>
  requestJson(`${apiUrl}/agenda-corporativa/eventos/${eventoId}`, {
    method: "DELETE",
  });
