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
    throw new Error(data.msg || "Response not ok.");
  }

  return data;
};

export const getFaturamentosByBoletim = async (boletimId) => {
  return requestJson(`${apiUrl}/boletins/${boletimId}/faturamentos`);
};

export const createFaturamento = async (boletimId, faturamentoData) => {
  return requestJson(`${apiUrl}/boletins/${boletimId}/faturamentos`, {
    method: "POST",
    body: JSON.stringify(faturamentoData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const deleteFaturamento = async (faturamentoId) => {
  return requestJson(`${apiUrl}/faturamentos/${faturamentoId}`, {
    method: "DELETE",
  });
};
