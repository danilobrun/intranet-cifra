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

const getQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const getContracts = async (filters = {}) => {
  return requestJson(
    `${apiUrl}/contratos${getQueryString({
      q: filters.search,
      codigo: filters.codigo,
      cliente: filters.cliente,
      estado: filters.estado,
      gestorId: filters.gestorId,
      status: filters.status,
    })}`,
  );
};

export const getContractById = async (contractId) => {
  return requestJson(`${apiUrl}/contratos/${contractId}`);
};

export const createContract = async (contractData) => {
  return requestJson(`${apiUrl}/contratos`, {
    method: "POST",
    body: JSON.stringify(contractData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateContract = async (contractId, contractData) => {
  return requestJson(`${apiUrl}/contratos/${contractId}`, {
    method: "PUT",
    body: JSON.stringify(contractData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateContractStatus = async (contractId, status) => {
  return requestJson(`${apiUrl}/contratos/${contractId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const getContractManagers = async () => {
  return requestJson(`${apiUrl}/contratos/gestores`);
};
