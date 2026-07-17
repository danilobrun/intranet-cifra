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

export const getClientes = async () => {
  return requestJson(`${apiUrl}/clientes`);
};

export const getInactiveClientes = async () => {
  return requestJson(`${apiUrl}/clientes/inactive`);
};

export const createCliente = async (clienteData) => {
  return requestJson(`${apiUrl}/clientes`, {
    method: "POST",
    body: JSON.stringify(clienteData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateCliente = async (clienteId, clienteData) => {
  return requestJson(`${apiUrl}/clientes/${clienteId}`, {
    method: "PUT",
    body: JSON.stringify(clienteData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const deleteCliente = async (clienteId) => {
  return requestJson(`${apiUrl}/clientes/${clienteId}`, {
    method: "DELETE",
  });
};

export const reactivateCliente = async (clienteId) => {
  return requestJson(`${apiUrl}/clientes/${clienteId}/reactivate`, {
    method: "PATCH",
  });
};
