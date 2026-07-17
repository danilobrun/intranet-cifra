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

export const getResumoContratos = async ({ ano } = {}) => {
  return requestJson(
    `${apiUrl}/resumo-contratos${getQueryString({ ano })}`,
  );
};

export const getInactiveResumoContratos = async () => {
  return requestJson(`${apiUrl}/resumo-contratos/inactive`);
};

export const getResumoContratoById = async (contratoId, { ano } = {}) => {
  return requestJson(
    `${apiUrl}/resumo-contratos/${contratoId}${getQueryString({ ano })}`,
  );
};

export const getResumoContratosMacroExport = async ({ clienteId, ano } = {}) => {
  return requestJson(
    `${apiUrl}/resumo-contratos/exportacao-macro${getQueryString({
      clienteId,
      ano,
    })}`,
  );
};

export const createResumoContrato = async (contratoData) => {
  return requestJson(`${apiUrl}/resumo-contratos`, {
    method: "POST",
    body: JSON.stringify(contratoData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateResumoContrato = async (contratoId, contratoData) => {
  return requestJson(`${apiUrl}/resumo-contratos/${contratoId}`, {
    method: "PUT",
    body: JSON.stringify(contratoData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateResumoContratoBms = async (contratoId, bmsData) => {
  return requestJson(`${apiUrl}/resumo-contratos/${contratoId}/bms`, {
    method: "PUT",
    body: JSON.stringify(bmsData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const createResumoContratoBm = async (contratoId, bmData) => {
  return requestJson(`${apiUrl}/resumo-contratos/${contratoId}/bms`, {
    method: "POST",
    body: JSON.stringify(bmData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const updateResumoContratoBm = async (contratoId, bmId, bmData) => {
  return requestJson(`${apiUrl}/resumo-contratos/${contratoId}/bms/${bmId}`, {
    method: "PUT",
    body: JSON.stringify(bmData),
    headers: {
      "content-type": "application/json",
    },
  });
};

export const deleteResumoContratoBm = async (contratoId, bmId) => {
  return requestJson(`${apiUrl}/resumo-contratos/${contratoId}/bms/${bmId}`, {
    method: "DELETE",
  });
};

export const deleteResumoContrato = async (contratoId) => {
  return requestJson(`${apiUrl}/resumo-contratos/${contratoId}`, {
    method: "DELETE",
  });
};

export const reactivateResumoContrato = async (contratoId) => {
  return requestJson(`${apiUrl}/resumo-contratos/${contratoId}/reactivate`, {
    method: "PATCH",
  });
};
