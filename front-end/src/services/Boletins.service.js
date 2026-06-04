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

const getBoletinsQueryParams = (filters = {}) => ({
  numeroBm: filters.numeroBm || filters.search,
  cliente: filters.cliente,
  contratoId: filters.contratoId || filters.contrato,
  estado: filters.estado,
  gestorId: filters.gestorId || filters.gestor,
  mes: filters.mes,
  ano: filters.ano,
  statusFaturamento: filters.statusFaturamento,
  statusPagamento: filters.statusPagamento,
  sortBy:
    filters.sortBy ||
    filters.orderBy ||
    (filters.valorTotalBmOrder ? "valorTotalBm" : undefined),
  order: filters.order || filters.sortOrder || filters.valorTotalBmOrder,
  deleted: filters.deleted,
});

export const getBoletins = async (filters = {}) => {
  return requestJson(
    `${apiUrl}/boletins${getQueryString(getBoletinsQueryParams(filters))}`,
  );
};

export const getDeletedBoletins = async (filters = {}) => {
  return getBoletins({ ...filters, deleted: true });
};

export const getBoletimById = async (boletimId) => {
  return requestJson(`${apiUrl}/boletins/${boletimId}`);
};

export const createBoletim = async (boletimData) => {
  return requestJson(`${apiUrl}/boletins`, {
    method: "POST",
    body: JSON.stringify(boletimData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateBoletim = async (boletimId, boletimData) => {
  return requestJson(`${apiUrl}/boletins/${boletimId}`, {
    method: "PUT",
    body: JSON.stringify(boletimData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const deleteBoletim = async (boletimId) => {
  return requestJson(`${apiUrl}/boletins/${boletimId}`, {
    method: "DELETE",
  });
};
